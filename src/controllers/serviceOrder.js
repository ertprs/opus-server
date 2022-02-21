const { response } = require('express');
const { sequelize } = require('../database/connection');

const ServiceOrder = require('../models/ServiceOrder');
const Client = require('../models/Client');
const User = require('../models/User');
const ServiceStatus = require('../models/ServiceStatus');
const Model = require('../models/Model');

const { getUuid } = require('../helpers/uuidGenerator');
const { opusLog } = require('../helpers/log4js');
const { capitalize, lowerCase } = require('../helpers/stringHandling');
const { getRoleName } = require('../middlewares/roleValidation');
const { opusCrypt } = require('../helpers/crypto');

// Language and messages import
const { selectLanguage } = require('../helpers/selectLanguage');
const index = selectLanguage(process.env.APP_LANGUAGE);
const messageFile = require('../data/messages.json');
const entityFile = require('../data/entities.json');

// Create a new serviceStatus of a device
const createServiceOrder = async(req, res = response) => {
    const {
        observation,
        lockPatron,
        receptionDate,
        receptionHour,
        serialNumber,
        color,
        isRepair,
        techSpecifications,
        problemDescription,
        lockPass,
        advancePayment,
        clientId,
        modelId,
        statusId,
    } = req.body;
    const companyId = req.user.companyId;
    let uuid = getUuid();
    let number = await getOrderNumber();
    console.log(number);
    console.log('uuid:', uuid);
    try {
        // Validate if the client belongs to company
        const findClient = await Client.findOne({
            where: {
                clientId,
                companyId,
                isActive: true
            }
        });
        if( !findClient ) {
            return res.status(400).json({
                ok: false,
                msg: messageFile[index].notFound + entityFile[index].clientLow + messageFile[index].registerInCompany
            });
        }
        // Validate if the status belongs to company
        const findService = await ServiceStatus.findOne({
            where: {
                statusId,
                companyId,
                isActive: true
            }
        });
        if( !findService ) {
            return res.status(400).json({
                ok: false,
                msg: messageFile[index].notFound + entityFile[index].serviceStatusLow + messageFile[index].registerInCompany
            });
        }
        // Validate model
        const findModel = await Model.findOne({
            where: {
                isActive: true
            }
        });
        if( !findModel ) {
            return res.status(400).json({
                ok: false,
                msg: messageFile[index].notFound + entityFile[index].modelLow
            })
        }
        // Create a new service order
        const newServiceOrder = await ServiceOrder.create({
            uuid,
            number,
            observation,
            lockPatron: lockPatron ? opusCrypt(lockPatron) : undefined,
            receptionDate,
            receptionHour,
            serialNumber,
            color,
            isRepair,
            techSpecifications,
            problemDescription,
            lockPass: lockPass ? opusCrypt( lockPass ) : undefined,
            advancePayment,
            clientId,
            modelId,
            statusId,
        }, {
            fields: ['uuid', 'number', 'observation', 'lockPatron', 'receptionDate', 'receptionHour', 'serialNumber', 'color', 'isRepair', 'techSpecifications', 'problemDescription', 'lockPass', 'advancePayment', 'clientId', 'statusId', 'modelId'],
            returning: [ 'serviceOrderId', 'uuid', 'number', 'observation', 'lockPatron', 'receptionDate', 'receptionHour', 'serialNumber', 'color', 'isRepair', 'techSpecifications', 'problemDescription', 'lockPass', 'advancePayment', 'clientId', 'statusId', 'modelId', 'isActive', 'createdAt']
        })
        return res.status(200).json({
            ok: true,
            msg: entityFile[index].serviceOrderUp + messageFile[index].okCreateMale,
            serviceOrder: newServiceOrder
        });
    } catch (error) {
        console.log('Error:', error);
        opusLog(`Creating serviceStatus [Client:${ clientId }, Model: ${ modelId }]: ${ error }`, 'error');
        return res.status(500).json({
            ok: false,
            msg: messageFile[index].errorCreating + entityFile[index].serviceOrderLow,
            error
        });
    }
}

// Get order number
const getOrderNumber = async() => {
    try {
        const findOrderNumber = await ServiceOrder.count();
        return Number(findOrderNumber) + 1;
    } catch (error) {
        console.log('Error:', error);
        opusLog(`Getting order number [#]: ${ error }`, 'error');
        return res.status(500).json({
            ok: false,
            msg: messageFile[index].errorCreating + ' order number',
            error
        });
    }
}

module.exports = {
    createServiceOrder
}