const { response } = require('express');
const { sequelize } = require('../database/connection');
const { Op } = require('sequelize');
const Client = require('../models/Client');

const { getUuid } = require('../helpers/uuidGenerator');
const { opusLog } = require('../helpers/log4js');

// Language and messages import
const { selectLanguage } = require('../helpers/selectLanguage');
const index = selectLanguage(process.env.APP_LANGUAGE);
const messageFile = require('../data/messages.json');
const entityFile = require('../data/entities.json');
const { getRoleName } = require('../middlewares/roleValidation');
const { lowerCase } = require('../helpers/stringHandling');
const Service = require('../models/Service');

// Create a new service for a company
const createService = async(req, res = response) => {
    const {
        name,
        detail,
        price,
    } = req.body;
    let companyId = req.user.companyId;
    let uuid = getUuid();
    try {
        // Find a service by name
        const findService = await Service.findOne({
            where: {
                [Op.and]: [
                    { companyId },
                    sequelize.where(
                        sequelize.fn('lower', sequelize.col('name')),
                        sequelize.fn('lower', name))
                ]
            }
        });
        if (!findService) {
            // Create a new service for the company
            const newService = await Service.create({
                name,
                uuid,
                detail,
                price,
                companyId
            }, {
                fields: ['name', 'uuid', 'detail', 'price', 'companyId'],
                returning: ['serviceId', 'uuid', 'name', 'detail', 'price', 'createdAt', 'isActive', 'companyId']
            });
            return res.status(200).json({
                ok: true,
                msg: entityFile[index].sericeUp + messageFile[index].okCreateMale,
                client: newService
            });
        } else {
            // If the service exists, send a error message
            return res.status(400).json({
                ok: false,
                msg: entityFile[index].sericeUp + messageFile[index].alreadyExists
            });
        }
    } catch (error) {
        console.log('Error:', error);
        opusLog(`Creating client [${ personId }]: ${ error }`, 'error');
        return res.status(500).json({
            ok: false,
            msg: messageFile[index].errorCreating + entityFile[index].clientLow,
            error
        });
    }
}


module.exports = {
    createService
}