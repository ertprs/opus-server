const { response } = require('express');
const bcrypt = require('bcryptjs');

const User = require('../models/User');
const { jwtGenerate } = require('../helpers/jwt');
const { opusLog } = require('../helpers/log4js');

// Language and messages import
const { selectLanguage } = require('../helpers/selectLanguage');
const index = selectLanguage(process.env.APP_LANGUAGE);
const messageFile = require('../data/messages.json');
const Session = require('../models/Session');
const { getUuid } = require('../helpers/uuidGenerator');
const { sequelize } = require('../database/connection');

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
        let session;
        const findSession = await Session.findOne({
            where: {
                userId: user.userId
            }
        });

        if( !findSession ) {
            // Registering user's session
            const registerSession = await Session.create({
                uuid: getUuid(),
                opts: token,
                userId: user.userId,
                details: `+ Session created from ${ req.socket.remoteAddress }`
            },{
                fields: ['uuid', 'opts', 'userId', 'details'],
                returning: ['sessionId', 'uuid', 'opts', 'userId', 'isRenewed', 'activeSince', 'details']
            });
            session = { uuid: registerSession.uuid, sessionId: registerSession.sessionId };
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
            session = { uuid: findSession.uuid, sessionId: findSession.sessionId };
        }

        return res.status(200).json({
            ok: true,
            msg: messageFile[index].authenticationOK,
            user,
            session,
            token
        });

    } catch (error) {
        console.log('Error:', error);
        opusLog(`Authenticating a user [${ email }]: ${ error }`);
        return res.status(500).json({
            ok: false,
            msg: messageFile[index].authenticationError
        })
    }
}

const renewToken = async(req, res = response) => {
    const token = await jwtGenerate(req.user);
    return res.status(200).json({
        ok: true,
        msg: messageFile[index].authenticationRenew,
        user: req.user,
        token
    });
}

module.exports = {
    authenticateUser,
    renewToken
}