// Import of dependencies
const Role = require('../models/Role');
const { response } = require('express');
const { sequelize } = require('../database/connection');

// Language and messages import
const messageFile = require('../data/messages.json');
const { selectLanguage } = require('../helpers/selectLanguage');
const { getUuid } = require('../helpers/uuidGenerator');
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
                msg: 'Role' + messageFile[index].okCreateMale,
                role: newRole
            });
        }
    } catch (error) {
        console.log('Error:', error);
        return res.status(500).json({
            ok: false,
            msg: messageFile[index].errorCreating + "role",
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
                msg: 'Roles' + messageFile[index].okGotMalePlural,
                roles: activeRoles
            });
        } else {
            return res.status(404).json({
                ok: false,
                msg: messageFile[index].notFound + "roles"
            });
        }
    } catch (error) {
        console.log('Error:', error);
        return res.status(500).json({
            ok: false,
            msg: messageFile[index].errorGetting + "roles",
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
                msg: 'Roles' + messageFile[index].okGotMalePlural,
                roles
            });
        } else {
            return res.status(404).json({
                ok: false,
                msg: messageFile[index].notFound + "roles"
            });
        }
    } catch (error) {
        console.log('Error:', error);
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
                msg: messageFile[index].notFound + 'role'
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
            msg: messageFile[index].okUpdateMale + 'role'
        });
    } catch (error) {
        console.log('Error:', error);
        return res.status(500).json({
            ok: false,
            msg: messageFile[index].errorUpdating + 'role',
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
            msg: 'Type' + messageFile[index].notParam
        });
    }

    if (type.toLowerCase() === 'on') {
        activation = true;
        action = 'Role' + messageFile[index].changeStatusActionOnMale
        changeAction = {
            isActive: true,
            updatedAt: sequelize.literal('CURRENT_TIMESTAMP'),
            deletedAt: null
        }
    } else {
        if (type.toLowerCase() === 'off') {
            activation = false;
            action = 'Role' + messageFile[index].changeStatusActionOffMale
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
                msg: `${ messageFile[index].notFound }role${ activation ? messageFile[index].alreadyActive : messageFile[index].alreadyInctive}`
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
                msg: 'Role' + messageFile[index].okDeletMale
            });
        } else {
            return res.status(404).json({
                ok: false,
                msg: messageFile[index].notFound + 'role'
            })
        }
    } catch (error) {
        console.log('Error:', error);
        return res.status(500).json({
            ok: false,
            msg: messageFile[index].errorDeleting + 'role'
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