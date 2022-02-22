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
const { opusCrypt, opusDecrypt } = require('../helpers/crypto');

// Language and messages import
const { selectLanguage } = require('../helpers/selectLanguage');
const index = selectLanguage(process.env.APP_LANGUAGE);
const messageFile = require('../data/messages.json');
const entityFile = require('../data/entities.json');
const Person = require('../models/Person');

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
        if (!findClient) {
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
        if (!findService) {
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
        if (!findModel) {
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
            lockPass: lockPass ? opusCrypt(lockPass) : undefined,
            advancePayment,
            clientId,
            modelId,
            statusId,
        }, {
            fields: ['uuid', 'number', 'observation', 'lockPatron', 'receptionDate', 'receptionHour', 'serialNumber', 'color', 'isRepair', 'techSpecifications', 'problemDescription', 'lockPass', 'advancePayment', 'clientId', 'statusId', 'modelId'],
            returning: ['serviceOrderId', 'uuid', 'number', 'observation', 'lockPatron', 'receptionDate', 'receptionHour', 'serialNumber', 'color', 'isRepair', 'techSpecifications', 'problemDescription', 'lockPass', 'advancePayment', 'clientId', 'statusId', 'modelId', 'isActive', 'createdAt']
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

// Get company service orders
const getActiveServiceOrder = async(req, res = response) => {
    const companyId = req.user.companyId;
    const limit = req.params.limit;
    const offset = req.params.offset;
    try {
        const findServiceOrder = await ServiceOrder.findAndCountAll({
            where: {
                isActive: true
            },
            include: [{
                model: Client,
                attributes: ['clientId', 'personId', 'companyId'],
                where: {
                    companyId
                },
                include: [{
                    model: Person,
                    attributes: ['names', 'lastNames', 'dni', 'mobilePhone', 'email']
                }]
            }, {
                model: Model,
                attributes: ['name', 'shortName', 'img']
            }, {
                model: ServiceStatus,
                attributes: ['order', 'name', 'cost']
            }],
            limit,
            offset,
            order: [
                ['receptionDate', 'DESC']
            ]
        });
        console.log('result:', findServiceOrder)
        if (findServiceOrder.count > 0) {
            let serviceOrders = findServiceOrder.rows;
            let ordersToReturn = [];
            // Decipher the information of the people
            for (let i = 0; i < serviceOrders.length; i++) {
                ordersToReturn[i] = {
                    serviceOrderId: serviceOrders[i].serviceOrderId,
                    uuid: serviceOrders[i].uuid,
                    number: serviceOrders[i].number,
                    observation: serviceOrders[i].observation,
                    lockPatron: serviceOrders[i].lockPatron,
                    isFinished: serviceOrders[i].isFinished,
                    receptionDate: serviceOrders[i].receptionDate,
                    receptionHour: serviceOrders[i].receptionHour,
                    serialNumber: serviceOrders[i].serialNumber,
                    color: serviceOrders[i].color,
                    isRepair: serviceOrders[i].isRepair,
                    techSpecifications: serviceOrders[i].techSpecifications,
                    problemDescription: serviceOrders[i].problemDescription,
                    lockPass: serviceOrders[i].lockPass,
                    hasSurvey: serviceOrders[i].hasSurvey,
                    advancePayment: serviceOrders[i].advancePayment,
                    isActive: serviceOrders[i].isActive,
                    createdAt: serviceOrders[i].createdAt,
                    updatedAt: serviceOrders[i].updatedAt,
                    deletedAt: serviceOrders[i].deletedAt,
                    clientId: serviceOrders[i].clientId,
                    modelId: serviceOrders[i].modelId,
                    statusId: serviceOrders[i].statusId,
                    client: {
                        person: {
                            names: serviceOrders[i].client.person.names ? opusDecrypt(serviceOrders[i].client.person.names) : undefined,
                            lastNames: serviceOrders[i].client.person.lastNames ? opusDecrypt(serviceOrders[i].client.person.lastNames) : undefined,
                            dni: serviceOrders[i].client.person.dni ? opusDecrypt(serviceOrders[i].client.person.dni) : undefined,
                            mobilePhone: serviceOrders[i].client.person.mobilePhone ? opusDecrypt(serviceOrders[i].client.person.mobilePhone) : undefined,
                            email: serviceOrders[i].client.person.email ? opusDecrypt(serviceOrders[i].client.person.email) : undefined,
                        }
                    },
                    model: {
                        name: serviceOrders[i].model.name,
                        shortName: serviceOrders[i].model.shortName,
                        img: serviceOrders[i].model.img
                    },
                    serviceStatus: {
                        order: serviceOrders[i].serviceStatus.order,
                        name: serviceOrders[i].serviceStatus.name,
                        cost: serviceOrders[i].serviceStatus.cost
                    }

                }
            }
            return res.status(200).json({
                ok: true,
                msg: entityFile[index].serviceOrderPluralUp + messageFile[index].okGotMalePlural,
                serviceOrders: {
                    count: findServiceOrder.count,
                    rows: ordersToReturn
                }
            });
        } else {
            return res.status(404).json({
                ok: false,
                msg: messageFile[index].notFound + entityFile[index].serviceOrderPluralLow
            });
        }
    } catch (error) {
        console.log('Error:', error);
        opusLog(`Getting active service orders companay [${ companyId }]: ${ error }`, 'error');
        return res.status(500).json({
            ok: false,
            msg: messageFile[index].errorGetting + entityFile[index].serviceOrderPluralLow,
            error
        });
    }
}

// Get company service orders
const getAllActiveServices = async(req, res = response) => {
    const limit = req.params.limit;
    const offset = req.params.offset;
    try {
        const findServiceOrder = await ServiceOrder.findAndCountAll({
            include: [{
                model: Client,
                attributes: ['clientId', 'personId', 'companyId'],
                include: [{
                    model: Person,
                    attributes: ['names', 'lastNames', 'dni', 'mobilePhone', 'email']
                }]
            }, {
                model: Model,
                attributes: ['name', 'shortName', 'img']
            }, {
                model: ServiceStatus,
                attributes: ['order', 'name', 'cost']
            }],
            limit,
            offset,
            order: [
                ['receptionDate', 'DESC']
            ]
        });
        if (findServiceOrder.count > 0) {
            let serviceOrders = findServiceOrder.rows;
            let ordersToReturn = [];
            // Decipher the information of the people
            for (let i = 0; i < serviceOrders.length; i++) {
                ordersToReturn[i] = {
                    serviceOrderId: serviceOrders[i].serviceOrderId,
                    uuid: serviceOrders[i].uuid,
                    number: serviceOrders[i].number,
                    observation: serviceOrders[i].observation,
                    lockPatron: serviceOrders[i].lockPatron,
                    isFinished: serviceOrders[i].isFinished,
                    receptionDate: serviceOrders[i].receptionDate,
                    receptionHour: serviceOrders[i].receptionHour,
                    serialNumber: serviceOrders[i].serialNumber,
                    color: serviceOrders[i].color,
                    isRepair: serviceOrders[i].isRepair,
                    techSpecifications: serviceOrders[i].techSpecifications,
                    problemDescription: serviceOrders[i].problemDescription,
                    lockPass: serviceOrders[i].lockPass,
                    hasSurvey: serviceOrders[i].hasSurvey,
                    advancePayment: serviceOrders[i].advancePayment,
                    isActive: serviceOrders[i].isActive,
                    createdAt: serviceOrders[i].createdAt,
                    updatedAt: serviceOrders[i].updatedAt,
                    deletedAt: serviceOrders[i].deletedAt,
                    clientId: serviceOrders[i].clientId,
                    modelId: serviceOrders[i].modelId,
                    statusId: serviceOrders[i].statusId,
                    client: {
                        person: {
                            names: serviceOrders[i].client.person.names ? opusDecrypt(serviceOrders[i].client.person.names) : undefined,
                            lastNames: serviceOrders[i].client.person.lastNames ? opusDecrypt(serviceOrders[i].client.person.lastNames) : undefined,
                            dni: serviceOrders[i].client.person.dni ? opusDecrypt(serviceOrders[i].client.person.dni) : undefined,
                            mobilePhone: serviceOrders[i].client.person.mobilePhone ? opusDecrypt(serviceOrders[i].client.person.mobilePhone) : undefined,
                            email: serviceOrders[i].client.person.email ? opusDecrypt(serviceOrders[i].client.person.email) : undefined,
                        }
                    },
                    model: {
                        name: serviceOrders[i].model.name,
                        shortName: serviceOrders[i].model.shortName,
                        img: serviceOrders[i].model.img
                    },
                    serviceStatus: {
                        order: serviceOrders[i].serviceStatus.order,
                        name: serviceOrders[i].serviceStatus.name,
                        cost: serviceOrders[i].serviceStatus.cost
                    }

                }
            }
            return res.status(200).json({
                ok: true,
                msg: entityFile[index].serviceOrderPluralUp + messageFile[index].okGotMalePlural,
                serviceOrders: {
                    count: findServiceOrder.count,
                    rows: ordersToReturn
                }
            });
        } else {
            return res.status(404).json({
                ok: false,
                msg: messageFile[index].notFound + entityFile[index].serviceOrderPluralLow
            });
        }
    } catch (error) {
        console.log('Error:', error);
        opusLog(`Getting all service orders companay [${ companyId }]: ${ error }`, 'error');
        return res.status(500).json({
            ok: false,
            msg: messageFile[index].errorGetting + entityFile[index].serviceOrderPluralLow,
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
    createServiceOrder,
    getActiveServiceOrder,
    getAllActiveServices
}