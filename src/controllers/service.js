const { response } = require('express');
const { sequelize } = require('../database/connection');
const { Op } = require('sequelize');
const Service = require('../models/Service');

const { getUuid } = require('../helpers/uuidGenerator');
const { opusLog } = require('../helpers/log4js');

// Language and messages import
const { selectLanguage } = require('../helpers/selectLanguage');
const index = selectLanguage(process.env.APP_LANGUAGE);
const messageFile = require('../data/messages.json');
const entityFile = require('../data/entities.json');
const { getRoleName } = require('../middlewares/roleValidation');
const { lowerCase } = require('../helpers/stringHandling');

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
                msg: entityFile[index].serviceUp + messageFile[index].okCreateMale,
                service: newService
            });
        } else {
            // If the service exists, send a error message
            return res.status(400).json({
                ok: false,
                msg: entityFile[index].serviceUp + messageFile[index].alreadyExists
            });
        }
    } catch (error) {
        console.log('Error:', error);
        opusLog(`Creating service [${ name }]: ${ error }`, 'error');
        return res.status(500).json({
            ok: false,
            msg: messageFile[index].errorCreating + entityFile[index].serviceLow,
            error
        });
    }
}

// Get active services for a company
const getActiveServices = async(req, res = response) => {
    const limit = req.query.limit || 20;
    const offset = req.query.offset || 0;
    const companyId = req.user.companyId;
    try {
        const activeServices = await Service.findAndCountAll({
            where: {
                isActive: true,
                companyId
            },
            limit,
            offset
        });
        if( activeServices.count > 0 ) {
            return res.status(200).json({
                ok: true,
                msg: entityFile[index].servicePluralUp + messageFile[index].okGotMalePlural,
                services: activeServices
            });
        } else {
            return res.status(404).json({
                ok: false,
                msg: messageFile[index].notFound + entityFile[index].servicePluralLow
            });
        }
    } catch (error) {
        console.log('Error:', error);
        opusLog(`Getting active services: ${ error }`, 'error');
        return res.status(500).json({
            ok: false,
            msg: messageFile[index].errorGetting + entityFile[index].servicePluralLow,
            error
        });
    }
}

// Get all services in the system, for aministration
const getAllServices = async(req, res = response) => {
    const limit = req.query.limit || 20;
    const offset = req.query.offset || 0;
    try {
        const activeServices = await Service.findAndCountAll({
            limit,
            offset
        });
        if( activeServices.count > 0 ) {
            return res.status(200).json({
                ok: true,
                msg: entityFile[index].servicePluralUp + messageFile[index].okGotMalePlural,
                services: activeServices
            });
        } else {
            return res.status(404).json({
                ok: false,
                msg: messageFile[index].notFound + entityFile[index].servicePluralLow
            });
        }
    } catch (error) {
        console.log('Error:', error);
        opusLog(`Getting all services: ${ error }`, 'error');
        return res.status(500).json({
            ok: false,
            msg: messageFile[index].errorGetting + entityFile[index].servicePluralLow,
            error
        });
    }
}

// Update a service
const updateService = async(req, res = response ) => {
    const companyId = req.user.companyId;
    const roleId = req.user.roleId;
    const serviceId = req.params.id;
    const {
        name,
        detail,
        price,
    } = req.body;
    let searchCondition = {};

    if (name === '') {
        return res.status(400).json({
            ok: false,
            msg: messageFile[index].mandatoryMissing
        });
    }

    try {
        // If the user is an administrator, cannot validate the company
        const roleName = await getRoleName(roleId);
        if (lowerCase(roleName) !== lowerCase(process.env.USR_ADMIN)) {
            searchCondition = {
                serviceId,
                companyId
            }
        } else {
            searchCondition = {
                serviceId
            }
        }
        const findService = await Service.findOne({ where: searchCondition });
        if (findService === undefined || findService === null) {
            return res.status(404).json({
                ok: false,
                msg: entityFile[index].serviceUp + messageFile[index].notFound + messageFile[index].registerInCompany
            });
        }
        // Update the service information
        await Service.update({
            name,
            detail,
            price,
            updatedAt: sequelize.literal('CURRENT_TIMESTAMP')
        }, {
            where: searchCondition
        });
        return res.status(200).json({
            ok: true,
            msg: entityFile[index].serviceUp + messageFile[index].okUpdateMale
        });
    } catch (error) {
        console.log('Error:', error);
        opusLog(`Updating service [${ serviceId }]: ${ error }`, 'error');
        return res.status(500).json({
            ok: false,
            msg: messageFile[index].errorUpdating + entityFile[index].serviceLow,
            error
        });
    }
}

// Change a service status
const changeServiceStatus = async(req, res = response) => {
    const serviceId = req.params.id;
    const type = req.query.type || false;
    const roleId = req.user.roleId;
    const companyId = req.user.companyId;
    let changeAction;
    let action;
    let activation;
    let searchCondition;

    if (!type) {
        return res.status(400).json({
            ok: false,
            msg: entityFile[index].typeUp + messageFile[index].notParam
        });
    }

    if (type.toLowerCase() === 'on') {
        activation = true;
        action = entityFile[index].serviceUp + messageFile[index].changeStatusActionOnMale
        changeAction = {
            isActive: true,
            updatedAt: sequelize.literal('CURRENT_TIMESTAMP'),
            deletedAt: null
        }
    } else {
        if (type.toLowerCase() === 'off') {
            activation = false;
            action = entityFile[index].serviceUp + messageFile[index].changeStatusActionOffMale
            changeAction = {
                isActive: false,
                updatedAt: sequelize.literal('CURRENT_TIMESTAMP'),
                deletedAt: sequelize.literal('CURRENT_TIMESTAMP')
            }
        } else {
            return res.status(400).json({
                ok: false,
                msg: type + messageFile[index].invalidParam
            });
        }
    }
    try {
        const roleName = await getRoleName(roleId);
        if (lowerCase(roleName) !== lowerCase(process.env.USR_ADMIN)) {
            searchCondition = {
                serviceId,
                companyId,
                isActive: !activation
            }
        } else {
            searchCondition = {
                serviceId,
                isActive: !activation
            }
        }
    } catch (error) {
        console.log('Error:', error);
        opusLog(`Changing service status  [${ serviceId }/${ activation }] role not found: ${ error }`, 'error');
        return res.status(500).json({
            ok: false,
            msg: `${ messageFile[index].errorChangeStatus } ${ entityFile[index].roleLow }`
        });
    }
    try {
        const findService = await Service.findOne({
            where: searchCondition
        });
        if (!findService) {
            return res.status(404).json({
                ok: false,
                msg: `${ messageFile[index].notFound }${ entityFile[index].serviceLow }${ activation ? messageFile[index].alreadyActive : messageFile[index].alreadyInctive}`
            });
        } else {
            await Service.update(
                changeAction, {
                    where: {
                        serviceId
                    }
                }
            );
    
            return res.status(200).json({
                ok: true,
                msg: action,
            });
        }
    } catch (error) {
        console.log('Error:', error);
        opusLog(`Changing service status  [${ serviceId }/${ activation }]: ${ error }`, 'error');
        return res.status(500).json({
            ok: false,
            msg: messageFile[index].errorChangeStatus
        });
    }
}

// Delete phisically a service
const deleteService = async(req, res = reponse) => {
    const serviceId = req.params.id;
    try {
        const deltedService = await Service.destroy({
            where: {
                serviceId
            }
        });
        if (deltedService > 0) {
            return res.status(200).json({
                ok: true,
                msg: entityFile[index].serviceUp + messageFile[index].okDeletMale
            });
        } else {
            return res.status(404).json({
                ok: false,
                msg: messageFile[index].notFound + entityFile[index].serviceLow
            })
        }
    } catch (error) {
        console.log('Error:', error);
        opusLog(`Deleting service [${ serviceId }]: ${ error }`, 'error');
        return res.status(500).json({
            ok: false,
            msg: messageFile[index].errorDeleting + entityFile[index].serviceLow
        });
    }
}

module.exports = {
    createService,
    getActiveServices,
    getAllServices,
    updateService,
    changeServiceStatus,
    deleteService
}