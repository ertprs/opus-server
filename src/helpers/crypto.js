const crypto = require('crypto');
const algorithm = 'aes-256-cbc';
const initVector = crypto.scryptSync( process.env.CPT_VECTOR, 'salt', 16 );
const securityKey =  crypto.scryptSync( process.env.CPT_SECRET, 'salt', 32 );

const opusCrypt = (text) => {
    try {
        const cipher = crypto.createCipheriv(algorithm, securityKey, initVector);
        let encryptedData = cipher.update( text, 'utf-8', 'hex' );
        encryptedData += cipher.final('hex');
        return encryptedData;
    } catch (error) {
        return '';
    }
}

const opusDecrypt = (text) => {
    try {
        const decipher = crypto.createDecipheriv(algorithm, securityKey, initVector);
        let decryptedData = decipher.update(text, 'hex', 'utf-8');
        decryptedData += decipher.final('utf-8');
        return decryptedData;
    } catch (error) {
        return '';
    }
}

module.exports = {
    opusCrypt,
    opusDecrypt
}