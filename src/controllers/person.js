const Person = require('../models/Person');
const { response } = require("express");
const { sequelize } = require('../database/connection');
const { getUuid } = require('../helpers/uuidGenerator');
const { opusCrypt, opusDecrypt } = require("../helpers/crypto");
const { opusLog } = require('../helpers/log4js');

// Language and messages import
const messageFile = require('../data/messages.json');
const entityFile = require('../data/entities.json');
const { selectLanguage } = require('../helpers/selectLanguage');
const index = selectLanguage(process.env.APP_LANGUAGE);


const createPerson = async(req, res = response) => {
    const {
        names,
        lastNames,
        dni,
        phone,
        mobilePhone,
        email,
        address,
        reference,
        birthdate,
        details
    } = req.body;
    const uuid = getUuid();
    try {
        let personToCreate = {
            uuid,
            names: opusCrypt(names),
            lastNames: opusCrypt(lastNames),
            dni: opusCrypt(dni),
            phone: phone ? opusCrypt(phone): undefined,
            mobilePhone: opusCrypt(mobilePhone),
            email: email ? opusCrypt(email) : undefined,
            address: address ? opusCrypt(address) : undefined,
            reference: reference ? opusCrypt(reference) : undefined,
            birthdate,
            details
        };
        const newPerson = await Person.create(personToCreate, {
            fields: ['uuid', 'names', 'lastNames', 'dni', 'phone', 'mobilePhone', 'email', 'address', 'reference', 'birthdate', 'details'],
            returning: ['personId', 'uuid', 'names', 'lastNames', 'dni', 'phone', 'mobilePhone', 'email', 'address', 'reference', 'birthdate', 'details', 'isActive', 'createdAt']
        });
        if( newPerson ) {
            return res.status(200).json({
                ok: true,
                msg: entityFile[index].personUp + messageFile[index].okCreateFemale,
                person: {
                    personId: newPerson.personId,
                    uuid,
                    names,
                    lastNames,
                    dni,
                    phone,
                    mobilePhone,
                    email,
                    address,
                    reference,
                    birthdate,
                    details,
                    isActive: newPerson.isActive,
                    createdAt: newPerson.createdAt
                }
            });
        }
    } catch (error) {
        console.log('Error:', error);
        opusLog(`Creating person [${ dni }]: ${ error }`, 'error');
        return res.status(500).json({
            ok: false,
            msg: messageFile[index].errorCreating + entityFile[index].personLow,
            error
        });
    }
}

module.exports = {
    createPerson
}