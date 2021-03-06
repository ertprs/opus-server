const jwt = require('jsonwebtoken');
const { opusLog } = require('./log4js');

const jwtGenerate = (user) => {
    return new Promise((resolve, reject) => {
        const payload = { user };
        jwt.sign(payload, process.env.JWT_SEED, {
            expiresIn: process.env.JWT_EXPIRES
        }, (err, token) => {
            if (err) {
                opusLog(`Generating token [${ user.email }]: ${ err }`, 'error');
                reject('Can not generate the token');
            }
            resolve(token);
        });
    });
}

module.exports = {
    jwtGenerate
}