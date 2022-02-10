const { response } = require('express');
const { validationResult } = require('express-validator');
const messageFile = require('../data/messages.json');
const { selectLanguage } = require('../helpers/selectLanguage');

const index = selectLanguage(process.env.APP_LANGUAGE);


const fieldValidation = (req, res = response, next) => {
    // Error handle
    const errors = validationResult(req);
    if( !errors.isEmpty() ) {
        let errorsArray = errors.array();
        let errorMessage = '';

        for (let i=0; i < errorsArray; i++) {
            i > 0 ? errorMessage = `${ errorMessage }, ${ errorsArray[i].msg }` : errorMessage = `${ errorMessage } ${ errorsArray[i].msg }`
        }
        return res.status(400).json({
            ok: false,
            msg: `${ messageFile[index].validationError } ${ errorMessage }`,
            errors: errors.mapped()
        });
    }
    next();
}

module.exports = {
    fieldValidation
}