// Import of dependencies
const Role = require('../models/Role');
const { response } = require('express');
const { sequelize } = require('../database/connection');
const { getUuid } = require('../helpers/uuidGenerator');
const { opusLog } = require('../helpers/log4js');

// Language and messages import
const messageFile = require('../data/messages.json');
const entityFile = require('../data/entities.json');
const { selectLanguage } = require('../helpers/selectLanguage');
const index = selectLanguage(process.env.APP_LANGUAGE);

// Creating a role
const createRole = async(req, res = response) => {
    const {
        name,
        description,
        elevation,
        options,
        details
    } = req.body;
    let uuid = getUuid();
    try {
        const newRole = await Role.create({
            uuid,
            name,
            description,
            elevation: elevation ? elevation : 0,
            details,
            options
        }, {
            fields: ['uuid', 'name', 'description', 'elevation', 'details'],
            returning: ['roleId', 'uuid', 'name', 'description', 'elevation', 'details', 'isActive', 'createdAt']
        });
        if (newRole) {
            return res.status(200).json({
                ok: true,
                msg: entityFile[index].roleUp + messageFile[index].okCreateMale,
                role: newRole
            });
        }
    } catch (error) {
        console.log('Error:', error);
        opusLog(`Creating role [${ name }]: ${ error }`, 'error');
        return res.status(500).json({
            ok: false,
            msg: messageFile[index].errorCreating + entityFile[idex].roleLow,
            error
        });
    }
}

// Getting all roles
const getActiveRoles = async(req, res = response) => {
    const limit = req.query.limit || 20;
    const offset = req.query.offset || 0;
    try {
        const activeRoles = await Role.findAndCountAll({
            attributes: ['roleId', 'uuid', 'name', 'description', 'elevation', 'options', 'details', 'createdAt', 'updatedAt'],
            where: {
                isActive: true
            },
            limit,
            offset
        });
        if (activeRoles.count > 0) {
            return res.status(200).json({
                ok: false,
                msg: entityFile[index].rolePluralUp + messageFile[index].okGotMalePlural,
                roles: activeRoles
            });
        } else {
            return res.status(404).json({
                ok: false,
                msg: messageFile[index].notFound + entityFile[index].rolePluralLow
            });
        }
    } catch (error) {
        opusLog(`Getting active roles: ${ error }`, 'error');
        console.log('Error:', error);
        return res.status(500).json({
            ok: false,
            msg: messageFile[index].errorGetting + entityFile[index].rolePluralLow,
            error
        });
    }
}

// Get all roles for administrative management
const getAllRoles = async(req, res = response) => {
    const limit = req.query.limit || 20;
    const offset = req.query.offset || 0;
    try {
        const roles = await Role.findAndCountAll({
            attributes: ['roleId', 'uuid', 'name', 'description', 'elevation', 'options', 'details', 'createdAt', 'updatedAt', 'deletedAt'],
            limit,
            offset
        });
        if (roles.count > 0) {
            return res.status(200).json({
                ok: false,
                msg: entityFile[index].rolePluralUp + messageFile[index].okGotMalePlural,
                roles
            });
        } else {
            return res.status(404).json({
                ok: false,
                msg: messageFile[index].notFound + entityFile[index].rolePluralLow
            });
        }
    } catch (error) {
        console.log('Error:', error);
        opusLog(`Getting all roles: ${ error }`, 'error');
        return res.status(500).json({
            ok: false,
            msg: messageFile[index].errorGetting + "roles",
            error
        });
    }
}

// Update a role
const updateRole = async(req, res = response) => {
    const roleId = req.params.id;
    const {
        name,
        description,
        elevation,
        details,
        options
    } = req.body;
    try {
        const findRole = await Role.findOne({
            where: {
                roleId
            }
        });
        if (findRole === undefined || findRole === null) {
            return res.status(404).json({
                ok: false,
                msg: messageFile[index].notFound + entityFile[index].roleLow
            });
        }
        await Role.update({
            name,
            description,
            elevation,
            details,
            options,
            updatedAt: sequelize.literal('CURRENT_TIMESTAMP')
        }, {
            where: {
                roleId
            }
        });
        return res.status(200).json({
            ok: true,
            msg: entityFile[index].roleUp + messageFile[index].okUpdateMale
        });
    } catch (error) {
        console.log('Error:', error);
        opusLog(`Updating role [${ name }]: ${ error }`, 'error');
        return res.status(500).json({
            ok: false,
            msg: messageFile[index].errorUpdating + entityFile[index].roleLow,
            error
        });
    }
}

// Change the status of a role
const changeRoleStatus = async(req, res = response) => {
    const roleId = req.params.id;
    const type = req.query.type || false;
    let changeAction;
    let action;
    let activation;

    if (!type) {
        return res.status(400).json({
            ok: false,
            msg: entityFile[index].typeUp + messageFile[index].notParam
        });
    }

    if (type.toLowerCase() === 'on') {
        activation = true;
        action = entityFile[index].roleUp + messageFile[index].changeStatusActionOnMale
        changeAction = {
            isActive: true,
            updatedAt: sequelize.literal('CURRENT_TIMESTAMP'),
            deletedAt: null
        }
    } else {
        if (type.toLowerCase() === 'off') {
            activation = false;
            action = entityFile[index].roleUp + messageFile[index].changeStatusActionOffMale
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
        const findRole = await Role.findOne({
            where: {
                roleId,
                isActive: !activation
            }
        });
        if (!findRole) {
            return res.status(404).json({
                ok: false,
                msg: `${ messageFile[index].notFound }${ entityFile[index].roleLow }${ activation ? messageFile[index].alreadyActive : messageFile[index].alreadyInctive}`
            });
        }
        await Role.update(
            changeAction, {
                where: {
                    roleId
                }
            }
        );

        return res.status(200).json({
            ok: true,
            msg: action,
        });
    } catch (error) {
        console.log('Error:', error);
        opusLog(`Changing role status  [${ roleId }/${ activation }]: ${ error }`, 'error');
        return res.status(500).json({
            ok: false,
            msg: messageFile[index].errorChangeStatus
        })
    }
}

// Physical deletion of a role
const deleteRole = async(req, res = response) => {
    const roleId = req.params.id;
    try {
        const deletedRole = await Role.destroy({
            where: {
                roleId
            }
        });
        if (deletedRole > 0) {
            return res.status(200).json({
                ok: true,
                msg: entityFile[index].roleUp + messageFile[index].okDeletMale
            });
        } else {
            return res.status(404).json({
                ok: false,
                msg: messageFile[index].notFound + entityFile[index].roleLow
            })
        }
    } catch (error) {
        console.log('Error:', error);
        opusLog(`Deleting role [${ roleId }]: ${ error }`, 'error');
        return res.status(500).json({
            ok: false,
            msg: messageFile[index].errorDeleting + entityFile[index].roleLow
        });
    }
}

module.exports = {
    createRole,
    getActiveRoles,
    getAllRoles,
    updateRole,
    changeRoleStatus,
    deleteRole
}