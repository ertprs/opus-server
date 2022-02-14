const { response } = require('express');
const bcrypt = require('bcryptjs');

const User = require('../models/User');
const { jwtGenerate } = require('../helpers/jwt');
const { opusLog } = require('../helpers/log4js');

// Language and messages import
const { selectLanguage } = require('../helpers/selectLanguage');
const index = selectLanguage(process.env.APP_LANGUAGE);
const messageFile = require('../data/messages.json');

const authenticateUser = async( req, res = response ) => {
    const { email, password } = req.body;
    
    try {
        // Find the user by the provided email
        let user = await User.findOne({
            where: {
                email,
                isActive: true
            }
        });
        if ( !user ) {
            return res.status(400).json({
                ok: false,
                msg: messageFile[index].authenticationWrong
            })
        }
        // Compare and validate passwords
        const validatedPassword = bcrypt.compareSync( password, user.password );
        if ( !validatedPassword ) {
            return res.status(400).json({
                ok: false,
                msg: messageFile[index].authenticationWrong
            });
        }
        user.password = `\m/(◣_◢)\m/`;
        const token = await jwtGenerate(user);
        return res.status(200).json({
            ok: true,
            msg: messageFile[index].authenticationOK,
            user,
            token
        })

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
