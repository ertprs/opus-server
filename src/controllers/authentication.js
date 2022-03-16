const { response } = require('express');
const bcrypt = require('bcryptjs');

const User = require('../models/User');
const { jwtGenerate } = require('../helpers/jwt');
const { opusLog } = require('../helpers/log4js');

// Language and messages import
const { selectLanguage } = require('../helpers/selectLanguage');
const index = selectLanguage(process.env.APP_LANGUAGE);
const messageFile = require('../data/messages.json');
const entityFile = require('../data/entities.json');
const Session = require('../models/Session');
const { getUuid } = require('../helpers/uuidGenerator');
const { sequelize } = require('../database/connection');
const Role = require('../models/Role');
const { upperCase } = require('../helpers/stringHandling');
const adminRole = process.env.USR_ADMIN;
const adminArray = adminRole.split(',');

const authenticateUser = async(req, res = response) => {
    const { email, password } = req.body;

    try {
        // Find the user by the provided email
        let user = await User.findOne({
            where: {
                email,
                isActive: true
            }
        });
        if (!user) {
            return res.status(400).json({
                ok: false,
                msg: messageFile[index].authenticationWrong
            })
        }
        // Compare and validate passwords
        const validatedPassword = bcrypt.compareSync(password, user.password);
        if (!validatedPassword) {
            return res.status(400).json({
                ok: false,
                msg: messageFile[index].authenticationWrong
            });
        }
        user.password = 'ლ(ಠ益ಠლ)╯';
        const token = await jwtGenerate(user);

        // Find the a session for the user
        const findSession = await Session.findOne({
            where: {
                userId: user.userId
            }
        });

        if (!findSession) {
            // Registering user's session
            const registerSession = await Session.create({
                uuid: getUuid(),
                opts: token,
                userId: user.userId,
                details: `+ Session created from ${ req.socket.remoteAddress }`
            }, {
                fields: ['uuid', 'opts', 'userId', 'details'],
                returning: ['sessionId', 'uuid', 'opts', 'userId', 'isRenewed', 'activeSince', 'details']
            });
        } else {
            // Actualiza la sesión actual
            await Session.update({
                isRenewed: true,
                renewedSince: sequelize.literal('CURRENT_TIMESTAMP'),
                details: findSession.details + `\n- Renewed session from ${ req.socket.remoteAddress }`,
                opts: token
            }, {
                where: {
                    sessionId: findSession.sessionId
                }
            });
        }

        return res.status(200).json({
            ok: true,
            msg: messageFile[index].authenticationOK,
            user,
            token
        });

    } catch (error) {
        console.log('Error:', error);
        opusLog(`Authenticating a user [${ email }]: ${ error }`, 'error');
        return res.status(500).json({
            ok: false,
            msg: messageFile[index].authenticationError
        });
    }
}

const renewToken = async(req, res = response) => {
    const token = await jwtGenerate(req.user);
    // Find the user session for update
    try {
        const findSession = await Session.findOne({
            where: {
                userId: req.user.userId
            }
        });
        if (findSession) {
            // Update the session of the user
            await Session.update({
                isRenewed: true,
                renewedSince: sequelize.literal('CURRENT_TIMESTAMP'),
                details: findSession.details + `\n- Renewed session by token from ${ req.socket.remoteAddress }`,
                opts: token
            }, {
                where: {
                    userId: req.user.userId
                }
            });
        }
    } catch (error) {
        console.log('Error while managing session:', error);
        opusLog(`Error managing session renewing [${ req.user.userId }]`, 'error');
    }
    return res.status(200).json({
        ok: true,
        msg: messageFile[index].authenticationRenew,
        user: req.user,
        token
    });
}

// Logout for close the session
const logoutUser = async(req, res = response) => {
    const userId = req.user.userId;
    // Find the session
    try {
        const findSession = await Session.findOne({
            while: {
                userId
            }
        });
        if (findSession) {
            await Session.destroy({
                where: {
                    userId
                }
            });
        }
        return res.status(200).json({
            ok: true,
            msg: messageFile[index].logoutOk
        });
    } catch (error) {
        console.log('Error:', error);
        opusLog(`Logging out user [${ userId }]: ${ error }`);
        return res.status(500).json({
            ok: false,
            msg: messageFile[index].logoutError
        })
    }
}

// Get the role of the authenticated user
const getAuthRole = async(req, res = response) => {
    const userId = req.user.userId;
    const roleId = req.user.roleId;
    try {
        const getAuthRole = await Role.findOne({
            where: {
                roleId
            }
        });
        if( !getAuthRole ){
            return res.status(400).json({
                ok: false,
                msg: messageFile[index].notFound + entityFile[index].roleLow
            })
        }
        const opus = true;
        const opusec = adminArray.includes(upperCase(getAuthRole.name)) ? true : false;
        return res.status(200).json({
            ok: true,
            msg: entityFile[index].roleUp + messageFile[index].okGotMale,
            role: {
                role: {
                    roleId:getAuthRole.roleId,
                    uuid: getAuthRole.uuid,
                    name: getAuthRole.name,
                    description: getAuthRole.description,
                },
                opus,
                opusec
            }
        });
    } catch (error) {
        console.log('Error:', error);
        opusLog(`Get authenticated user role [${ userId }]: ${ error }`);
        return res.status(500).json({
            ok: false,
            msg: messageFile[index].errorGetting + entityFile[index].roleLow
        });
    }
}

module.exports = {
    authenticateUser,
    renewToken,
    logoutUser,
    getAuthRole
}