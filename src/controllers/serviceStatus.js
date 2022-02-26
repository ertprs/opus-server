const { response } = require('express');
const { sequelize } = require('../database/connection');

const ServiceStatus = require('../models/ServiceStatus');
const Company = require('../models/Company');
const User = require('../models/User');

const { getUuid } = require('../helpers/uuidGenerator');
const { opusLog } = require('../helpers/log4js');
const { capitalize, lowerCase } = require('../helpers/stringHandling');
const { getRoleName } = require('../middlewares/roleValidation');

// Language and messages import
const { selectLanguage } = require('../helpers/selectLanguage');
const index = selectLanguage(process.env.APP_LANGUAGE);
const messageFile = require('../data/messages.json');
const entityFile = require('../data/entities.json');

// Create a new serviceStatus of a device
const createServiceStatus = async(req, res = response) => {
    const {
        name,
        details,
        cost,
        options
    } = req.body;
    let uuid = getUuid();
    let companyId = req.user.companyId;
    let order = await assignOrderNumber(companyId);
    try {
        // Validate if the company is the user's company
        const validateCompany = await User.findOne({
            where: {
                userId: req.user.userId,
                companyId
            }
        });
        if( !validateCompany ) {
            return res.status(403).json({
                ok: false,
                msg: messageFile[index].forbiddenUserAction
            });
        }
        const newServiceStatus = await ServiceStatus.create({
            uuid,
            name: capitalize(name),
            details,
            order,
            cost,
            options,
            companyId
        }, {
            fields: ['uuid', 'name', 'details', 'order', 'cost', 'options', 'companyId' ],
            returning: ['statusId', 'uuid', 'name', 'details', 'order', 'cost', 'options', 'isActive', 'createdAt', 'companyId']
        });
        return res.status(200).json({
            ok: true,
            msg: entityFile[index].serviceStatusUp + messageFile[index].okCreateMale,
            serviceStatus: newServiceStatus
        });
    } catch (error) {
        console.log('Error:', error);
        opusLog(`Creating serviceStatus [${ name }]: ${ error }`, 'error');
        return res.status(500).json({
            ok: false,
            msg: messageFile[index].errorCreating + entityFile[index].serviceStatusLow,
            error
        });
    }
}

// Get active company serviceStatus
const getActiveServiceStatus = async(req, res = response) => {
    const companyId = req.user.companyId;
    const limit = req.query.limit || 20;
    const offset = req.query.offset || 0;
    try {
        const activeServiceStatus = await ServiceStatus.findAndCountAll({
            where: {
                isActive: true,
                companyId
            },
            limit,
            offset,
            order: [ ['order', 'ASC'] ]
        });
        if (activeServiceStatus.count > 0) {
            return res.status(200).json({
                ok: true,
                msg: entityFile[index].serviceStatusPluralUp + messageFile[index].okGotMalePlural,
                serviceStatus: activeServiceStatus
            });
        } else {
            return res.status(404).json({
                ok: false,
                msg: messageFile[index].notFound + entityFile[index].serviceStatusPluralLow
            });
        }
    } catch (error) {
        console.log('Error:', error);
        opusLog(`Getting active serviceStatus: ${ error }`, 'error');
        return res.status(500).json({
            ok: false,
            msg: messageFile[index].errorGetting + entityFile[index].serviceStatusPluralLow,
            error
        });
    }
}

// Get active company serviceStatus
const getAllServiceStatus = async(req, res = response) => {
    const limit = req.query.limit || 20;
    const offset = req.query.offset || 0;
    try {
        const allServiceStatus = await ServiceStatus.findAndCountAll({
            include: [
                {
                    model: Company,
                    attributes: ['uuid', 'name', 'shortName', 'logo', 'isActive']
                }
            ],
            limit,
            offset,
            order: [ ['companyId', 'ASC'], ['statusId', 'ASC'] ]
        });
        if (allServiceStatus.count > 0) {
            return res.status(200).json({
                ok: true,
                msg: entityFile[index].serviceStatusPluralUp + messageFile[index].okGotMalePlural,
                serviceStatus: allServiceStatus
            });
        } else {
            return res.status(404).json({
                ok: false,
                msg: messageFile[index].notFound + entityFile[index].serviceStatusPluralLow
            });
        }
    } catch (error) {
        console.log('Error:', error);
        opusLog(`Getting all serviceStatus: ${ error }`, 'error');
        return res.status(500).json({
            ok: false,
            msg: messageFile[index].errorGetting + entityFile[index].serviceStatusPluralLow,
            error
        });
    }
}

// Update a service status
const updateServiceStatus = async(req, res = response) => {
    const companyId = req.user.companyId;
    const roleId = req.user.roleId;
    const statusId = req.params.id;
    const {
        name,
        details,
        order,
        cost,
        options
    } = req.body;
    let searchCondition = {};

    try {
        // If the user is an administrator, cannot validate the company
        const roleName = await getRoleName(roleId);
        if (lowerCase(roleName) !== lowerCase(process.env.USR_ADMIN)) {
            searchCondition = {
                statusId,
                companyId
            }
        } else {
            searchCondition = {
                statusId
            }
        }
        const findServiceStatus = await ServiceStatus.findOne({ where: searchCondition });
        if (findServiceStatus === undefined || findServiceStatus === null) {
            return res.status(400).json({
                ok: false,
                msg: messageFile[index].notFound + entityFile[index].serviceStatusLow +  messageFile[index].registerInCompany
            });
        }
        // Update the client information
        await ServiceStatus.update({
            name: capitalize(name),
            details,
            order,
            cost,
            options,
            //companyId,
            updatedAt: sequelize.literal('CURRENT_TIMESTAMP')
        }, {
            where: searchCondition
        });
        return res.status(200).json({
            ok: true,
            msg: entityFile[index].serviceStatusUp + messageFile[index].okUpdateMale
        });
    } catch (error) {
        console.log('Error:', error);
        opusLog(`Updating service status [${ statusId }]: ${ error }`, 'error');
        return res.status(500).json({
            ok: false,
            msg: messageFile[index].errorUpdating + entityFile[index].serviceStatusLow,
            error
        });
    }
}

// Change status of a serviceStatus
const changeStatusOfServiceStatus = async(req, res = response) => {
    const statusId = req.params.id;
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
        action = entityFile[index].serviceStatusUp + messageFile[index].changeStatusActionOnMale
        changeAction = {
            isActive: true,
            updatedAt: sequelize.literal('CURRENT_TIMESTAMP'),
            deletedAt: null
        }
    } else {
        if (type.toLowerCase() === 'off') {
            activation = false;
            action = entityFile[index].serviceStatusUp + messageFile[index].changeStatusActionOffMale
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
                statusId,
                companyId,
                isActive: !activation
            }
        } else {
            searchCondition = {
                statusId,
                isActive: !activation
            }
        }
    } catch (error) {
        console.log('Error:', error);
        opusLog(`Changing status of a service status  [${ statusId }/${ activation }] role not found: ${ error }`, 'error');
        return res.status(500).json({
            ok: false,
            msg: `${ messageFile[index].errorChangeStatus } ${ entityFile[index].roleLow }`
        });
    }
    try {
        const findServiceStatus = await ServiceStatus.findOne({
            where: searchCondition
        });
        if (!findServiceStatus) {
            return res.status(404).json({
                ok: false,
                msg: `${ messageFile[index].notFound }${ entityFile[index].serviceStatusLow }${ activation ? messageFile[index].alreadyActive : messageFile[index].alreadyInctive}`
            });
        } else {
            await ServiceStatus.update(
                changeAction, {
                    where: {
                        statusId
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
        opusLog(`Changing status of a service status  [${ statusId }/${ activation }]: ${ error }`, 'error');
        return res.status(500).json({
            ok: false,
            msg: messageFile[index].errorChangeStatus
        });
    }
}

// Delete phisically a serviceStatus
const deleteServiceStatus = async(req, res = reponse) => {
    const statusId = req.params.id;
    try {
        const deletedServiceStatus = await ServiceStatus.destroy({
            where: {
                statusId
            }
        });
        if (deletedServiceStatus > 0) {
            return res.status(200).json({
                ok: true,
                msg: entityFile[index].serviceStatusUp + messageFile[index].okDeletMale
            });
        } else {
            return res.status(404).json({
                ok: false,
                msg: messageFile[index].notFound + entityFile[index].serviceStatusLow
            })
        }
    } catch (error) {
        console.log('Error:', error);
        opusLog(`Deleting serviceStatus [${ statusId }]: ${ error }`, 'error');
        return res.status(500).json({
            ok: false,
            msg: messageFile[index].errorDeleting + entityFile[index].serviceStatusLow
        });
    }
}

// Assing an order number for a status
const assignOrderNumber = async(companyId) => {
    let number = 0;
    if( !companyId ) {
        return -1;
    }
    const order = await sequelize.query(`
        SELECT coalesce(max("order"), 0) "number"
        FROM "serviceStatus"
        WHERE "companyId" = ${ companyId }
            AND "isActive" = true;
    `);
    number = Number(order[0][0].number);
    return number + 1;
}

module.exports = {
    createServiceStatus,
    getActiveServiceStatus,
    getAllServiceStatus,
    updateServiceStatus,
    changeStatusOfServiceStatus,
    deleteServiceStatus
}