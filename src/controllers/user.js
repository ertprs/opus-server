const { response } = require('express');
const { sequelize } = require('../database/connection');
const bcrypt = require('bcryptjs');

const User = require('../models/User');
const Role = require('../models/Role');
const { getUuid } = require('../helpers/uuidGenerator');
const { opusLog } = require('../helpers/log4js');

// Language and messages import
const { selectLanguage } = require('../helpers/selectLanguage');
const index = selectLanguage(process.env.APP_LANGUAGE);
const messageFile = require('../data/messages.json');
const entityFile = require('../data/entities.json');
const Company = require('../models/Company');
const Person = require('../models/Person');
const { opusDecrypt } = require('../helpers/crypto');

// Create an user
const createUser = async(req, res = response) => {
    const {
        email,
        password,
        roleId,
        companyId,
        personId
    } = req.body;
    let uuid = getUuid();
    // Validate if the role was sent or assign a default role
    let role;
    if( roleId === undefined || roleId === null || roleId === '' ) {
        try {
            const dbRole = await Role.findOne({
                where: {
                    name: 'User'
                }
            });
            if( dbRole ) {
                role = dbRole.roleId;
            } else {
                role = 0;
            }
        } catch (error) {
            console.log('Error:', error);
            opusLog(`Creating user (get role) [${ email }]: ${ error }`, 'error');
            return res.status(500).json({
                ok: false,
                msg: messageFile[index].errorCreating + entityFile[index].userLow + '/' + messageFile[index].errorGetting + entityFile[index].roleLow,
                error
            });
        }
    } else {
        role = roleId
    }

    // Creating the user
    try {
        // Validate the email info, if exists, don't create
        const user = await User.findOne({
            where: {
                email
            }
        });
        if( user ) {
            return res.status(400).json({
                ok: false,
                msg: entityFile[index].userUp + messageFile[index].alreadyExists
            });
        }

        // Code password to crypt
        const salt = bcrypt.genSaltSync();
        let cipherPass = bcrypt.hashSync( password, salt );
        
        // Store the new user
        const newUser = await User.create({
            uuid,
            email,
            password: cipherPass,
            roleId: role,
            companyId,
            personId
        }, {
            fields: ['uuid', 'email', 'password', 'roleId', 'companyId', 'personId'],
            returning: ['userId', 'uuid', 'email', 'password', 'isActive', 'createdAt', 'roleId', 'companyId', 'personId']
        });
        return res.status(200).json({
            ok: true,
            msg: entityFile[index].userUp + messageFile[index].okCreateFemale,
            user: {
                userId: newUser.userId,
                uuid: newUser.uuid,
                email: newUser.email,
                password: '**********',
                isActive: newUser.isActive,
                createdAt: newUser.createdAt,
                roleId: newUser.roleId,
                companyId: newUser.companyId,
                personId: newUser.personId
            }
        });

    } catch (error) {
        console.log('Error:', error);
        opusLog(`Creating user [${ email }]: ${ error }`, 'error');
        return res.status(500).json({
            ok: false,
            msg: messageFile[index].errorCreating + entityFile[index].userLow,
            error
        });
    }
}

// Get active users
const getActiveUsers = async(req, res = response) => {
    const limit = req.query.limit || 20;
    const offset = req.query.offset || 0;
    try {
        const activeUsers = await User.findAndCountAll({
            include: [
                {
                    model: Person,
                    attributes: [ 'uuid', 'names', 'lastNames', 'dni', 'email', 'mobilePhone']
                },
                {
                    model: Company,
                    attributes: ['uuid', 'name', 'shortName']
                },
                {
                    model: Role,
                    attributes: ['uuid', 'name' ]
                }
            ],
            where: {
                isActive: true
            },
            limit,
            offset
        }); 
        if (activeUsers.count > 0) {
            let usersFinded = activeUsers.rows;
            let userToReturn = [];
            // Decipher the information of the people
            for (let i = 0; i < usersFinded.length; i++) {
                userToReturn[i] = {
                    userId: usersFinded[i].userId,
                    uuid: usersFinded[i].uuid ,
                    nick: usersFinded[i].nick,
                    email: usersFinded[i].email,
                    password: usersFinded[i].password,
                    details: usersFinded[i].details,
                    isActive: usersFinded[i].isActive,
                    createdAt: usersFinded[i].createdAt,
                    updatedAt: usersFinded[i].updatedAt,
                    deletedAt: usersFinded[i].deletedAt,
                    roleId: usersFinded[i].roleId,
                    companyId: usersFinded[i].companyId,
                    personId: usersFinded[i].personId,
                    person: {
                        uuid: usersFinded[i].person.uuid,
                        names: opusDecrypt(usersFinded[i].person.names),
                        lastNames: opusDecrypt(usersFinded[i].person.lastNames),
                        dni: opusDecrypt(usersFinded[i].person.dni),
                        email: opusDecrypt(usersFinded[i].person.email),
                        mobilePhone: opusDecrypt(usersFinded[i].person.mobilePhone)
                    },
                    company: {
                        uuid: usersFinded[i].company.uuid,
                        name: usersFinded[i].company.name,
                        shortName: usersFinded[i].company.shortName
                    },
                    role: {
                        uuid: usersFinded[i].role.uuid,
                        name: usersFinded[i].role.name
                    }
                }
            }
            return res.status(200).json({
                ok: true,
                msg: entityFile[index].userPluralUp + messageFile[index].okGotMalePlural,
                users: {
                    count: activeUsers.count,
                    rows: userToReturn
                }
            });
        } else {
            return res.status(404).json({
                ok: false,
                msg: messageFile[index].notFound + entityFile[index].userPluralLow
            });
        }
    } catch (error) {
        console.log('Error:', error);
        opusLog(`Getting active users: ${ error }`, 'error');
        return res.status(500).json({
            ok: false,
            msg: messageFile[index].errorGetting + entityFile[index].userPluralLow,
            error
        });
    }
}

// Get all users
const getAllUsers = async(req, res = response) => {
    const limit = req.query.limit || 20;
    const offset = req.query.offset || 0;
    try {
        const activeUsers = await User.findAndCountAll({
            include: [
                {
                    model: Person,
                    attributes: [ 'uuid', 'names', 'lastNames', 'dni', 'email', 'mobilePhone']
                },
                {
                    model: Company,
                    attributes: ['uuid', 'name', 'shortName']
                },
                {
                    model: Role,
                    attributes: ['uuid', 'name' ]
                }
            ],
            limit,
            offset
        });
        if (activeUsers.count > 0) {
            let usersFinded = activeUsers.rows;
            let userToReturn = [];
            // Decipher the information of the people
            for (let i = 0; i < usersFinded.length; i++) {
                userToReturn[i] = {
                    userId: usersFinded[i].userId,
                    uuid: usersFinded[i].uuid ,
                    nick: usersFinded[i].nick,
                    email: usersFinded[i].email,
                    password: usersFinded[i].password,
                    details: usersFinded[i].details,
                    isActive: usersFinded[i].isActive,
                    createdAt: usersFinded[i].createdAt,
                    updatedAt: usersFinded[i].updatedAt,
                    deletedAt: usersFinded[i].deletedAt,
                    roleId: usersFinded[i].roleId,
                    companyId: usersFinded[i].companyId,
                    personId: usersFinded[i].personId,
                    person: {
                        uuid: usersFinded[i].person.uuid,
                        names: opusDecrypt(usersFinded[i].person.names),
                        lastNames: opusDecrypt(usersFinded[i].person.lastNames),
                        dni: opusDecrypt(usersFinded[i].person.dni),
                        email: opusDecrypt(usersFinded[i].person.email),
                        mobilePhone: opusDecrypt(usersFinded[i].person.mobilePhone)
                    },
                    company: {
                        uuid: usersFinded[i].company.uuid,
                        name: usersFinded[i].company.name,
                        shortName: usersFinded[i].company.shortName
                    },
                    role: {
                        uuid: usersFinded[i].role.uuid,
                        name: usersFinded[i].role.name
                    }
                }
            }
            return res.status(200).json({
                ok: true,
                msg: entityFile[index].userPluralUp + messageFile[index].okGotMalePlural,
                users: {
                    count: activeUsers.count,
                    rows: userToReturn
                }
            });
        } else {
            return res.status(404).json({
                ok: false,
                msg: messageFile[index].notFound + entityFile[index].userPluralLow
            });
        }
    } catch (error) {
        console.log('Error:', error);
        opusLog(`Getting active users: ${ error }`, 'error');
        return res.status(500).json({
            ok: false,
            msg: messageFile[index].errorGetting + entityFile[index].userPluralLow,
            error
        });
    }
}

// Update an user
const updateUser = async( req, res = response ) => {
    const userId = req.params.id;
    const {
        email,
        nick,
        companyId,
        personId
    } = req.body;
    try {
        const findUser = await User.findOne({
            where: {
                userId,
                isActive: true
            }
        });
        if (findUser === undefined || findUser === null) {
            return res.status(404).json({
                ok: false,
                msg: messageFile[index].notFound + entityFile[index].userLow
            });
        }
        await User.update({
            email,
            nick,
            companyId,
            personId,
            updatedAt: sequelize.literal('CURRENT_TIMESTAMP')
        }, {
            where: {
                userId
            }
        });
        return res.status(200).json({
            ok: true,
            msg: entityFile[index].userUp + messageFile[index].okUpdateMale
        });
    } catch (error) {
        console.log('Error:', error);
        opusLog(`Updating user [${ userId }]: ${ error }`, 'error');
        return res.status(500).json({
            ok: false,
            msg: messageFile[index].errorUpdating + entityFile[index].userLow,
            error
        });
    }
}

// Change the status of an user
const changeUserStatus = async(req, res = response) => {
    const userId = req.params.id;
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
        action = entityFile[index].userUp + messageFile[index].changeStatusActionOnFemale
        changeAction = {
            isActive: true,
            updatedAt: sequelize.literal('CURRENT_TIMESTAMP'),
            deletedAt: null
        }
    } else {
        if (type.toLowerCase() === 'off') {
            activation = false;
            action = entityFile[index].userUp + messageFile[index].changeStatusActionOffFemale
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
        const findUser = await User.findOne({
            where: {
                userId,
                isActive: !activation
            }
        });
        if (!findUser) {
            return res.status(404).json({
                ok: false,
                msg: `${ messageFile[index].notFound }${ entityFile[index].userLow }${ activation ? messageFile[index].alreadyActive : messageFile[index].alreadyInctive}`
            });
        }
        await User.update(
            changeAction, {
                where: {
                    userId
                }
            }
        );

        return res.status(200).json({
            ok: true,
            msg: action,
        });
    } catch (error) {
        console.log('Error:', error);
        opusLog(`Changing user status  [${ userId }/${ activation }]: ${ error }`, 'error');
        return res.status(500).json({
            ok: false,
            msg: messageFile[index].errorChangeStatus
        });
    }
}

module.exports = {
    createUser,
    getActiveUsers,
    getAllUsers,
    updateUser,
    changeUserStatus
}