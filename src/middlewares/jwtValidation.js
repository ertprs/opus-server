const { response } = require('express');
const jwt = require('jsonwebtoken');

// Language and messages import
const { selectLanguage } = require('../helpers/selectLanguage');
const index = selectLanguage(process.env.APP_LANGUAGE);
const messageFile = require('../data/messages.json');
const { opusLog } = require('../helpers/log4js');

const tokenValidation = (req, res = response, next) => {
    // Read header's token information
    const token = req.header('opts');
    if(!token) {
        return res.status(401).json({
            ok: false,
            msg: messageFile[index].noToken
        });
    }
    try {
        const payload = jwt.verify( token, process.env.JWT_SEED );
        const { user } = payload;
        req.user = user;
    } catch (error) {
        opusLog(`Error while validating token: [${ error }]`, 'error');
        return res.status(401).json({
            ok: false,
            msg: messageFile[index].invalidToken
        });
    }
    next();
}

module.exports = {
    tokenValidation
};