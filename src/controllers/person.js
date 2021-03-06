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
const { trimSpaces, onlyNumbers } = require('../helpers/stringHandling');
const index = selectLanguage(process.env.APP_LANGUAGE);

// Create a new person
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
    console.log('phone:', phone);
    try {
        // Cipher the information
        let personToCreate = {
            uuid,
            names: opusCrypt(names),
            lastNames: opusCrypt(lastNames),
            dni: opusCrypt(onlyNumbers(trimSpaces(dni))),
            phone: phone ? opusCrypt(trimSpaces(phone)) : null,
            mobilePhone: opusCrypt(onlyNumbers(trimSpaces(mobilePhone))),
            email: email ? opusCrypt(email) : null,
            address: address ? opusCrypt(address) : null,
            reference: reference ? opusCrypt(reference) : null,
            birthdate: birthdate ? birthdate : null,
            details
        };
        const newPerson = await Person.create(personToCreate, {
            fields: ['uuid', 'names', 'lastNames', 'dni', 'phone', 'mobilePhone', 'email', 'address', 'reference', 'birthdate', 'details'],
            returning: ['personId', 'uuid', 'names', 'lastNames', 'dni', 'phone', 'mobilePhone', 'email', 'address', 'reference', 'birthdate', 'details', 'isActive', 'createdAt']
        });
        if (newPerson) {
            return res.status(200).json({
                ok: true,
                msg: entityFile[index].personUp + messageFile[index].okCreateFemale,
                person: {
                    personId: newPerson.personId,
                    uuid,
                    names,
                    lastNames,
                    dni: trimSpaces(dni),
                    phone: trimSpaces(phone),
                    mobilePhone: trimSpaces(mobilePhone),
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

// Get active people
const getActivePeople = async(req, res = response) => {
    const limit = req.query.limit || 20;
    const offset = req.query.offset || 0;
    try {
        const activePeople = await Person.findAndCountAll({
            where: {
                isActive: true
            },
            limit,
            offset,
            order: [
                ['createdAt', 'ASC']
            ]
        });
        if (activePeople.count > 0) {
            let peopleFinded = activePeople.rows;
            let peopleToReturn = [];
            // Decipher the information of the people
            for (let i = 0; i < peopleFinded.length; i++) {
                peopleToReturn[i] = {
                    personId: peopleFinded[i].personId,
                    uuid: peopleFinded[i].uuid,
                    names: opusDecrypt(peopleFinded[i].names),
                    lastNames: opusDecrypt(peopleFinded[i].lastNames),
                    dni: opusDecrypt(peopleFinded[i].dni),
                    mobilePhone: opusDecrypt(peopleFinded[i].mobilePhone),
                    email: peopleFinded[i].email ? opusDecrypt(peopleFinded[i].email) : null,
                    address: peopleFinded[i].address ? opusDecrypt(peopleFinded[i].address) : null,
                    reference: peopleFinded[i].reference ? opusDecrypt(peopleFinded[i].reference) : null,
                    phone: peopleFinded[i].phone ? opusDecrypt(peopleFinded[i].phone) : null,
                    birthdate: peopleFinded[i].birthdate,
                    details: peopleFinded[i].details,
                    isActive: peopleFinded[i].isActive,
                    createdAt: peopleFinded[i].createdAt,
                    updatedAt: peopleFinded[i].updatedAt,
                    deletedAt: peopleFinded[i].deletedAt
                }
            }
            return res.status(200).json({
                ok: true,
                msg: entityFile[index].personPluralUp + messageFile[index].okGotFemalePlural,
                people: {
                    count: activePeople.count,
                    rows: peopleToReturn
                }
            });
        } else {
            return res.status(404).json({
                ok: false,
                msg: messageFile[index].notFound + entityFile[index].personPluralLow
            });
        }
    } catch (error) {
        console.log('Error:', error);
        opusLog(`Getting active people: ${ error }`, 'error');
        return res.status(500).json({
            ok: false,
            msg: messageFile[index].errorGetting + entityFile[index].personPluralLow,
            error
        });
    }
}

// Get all people for administration
const getAllPeople = async(req, res = response) => {
    const limit = req.query.limit || 20;
    const offset = req.query.offset || 0;
    try {
        const activePeople = await Person.findAndCountAll({
            limit,
            offset,
            order: [
                ['createdAt', 'ASC']
            ]
        });
        if (activePeople.count > 0) {
            let peopleFinded = activePeople.rows;
            let peopleToReturn = [];
            // Decipher the information of the people
            for (let i = 0; i < peopleFinded.length; i++) {
                peopleToReturn[i] = {
                    personId: peopleFinded[i].personId,
                    uuid: peopleFinded[i].uuid,
                    names: opusDecrypt(peopleFinded[i].names),
                    lastNames: opusDecrypt(peopleFinded[i].lastNames),
                    dni: opusDecrypt(peopleFinded[i].dni),
                    mobilePhone: opusDecrypt(peopleFinded[i].mobilePhone),
                    email: peopleFinded[i].email ? opusDecrypt(peopleFinded[i].email) : null,
                    address: peopleFinded[i].address ? opusDecrypt(peopleFinded[i].address) : null,
                    reference: peopleFinded[i].reference ? opusDecrypt(peopleFinded[i].reference) : null,
                    phone: peopleFinded[i].phone ? opusDecrypt(peopleFinded[i].phone) : null,
                    birthdate: peopleFinded[i].birthdate,
                    details: peopleFinded[i].details,
                    isActive: peopleFinded[i].isActive,
                    createdAt: peopleFinded[i].createdAt,
                    updatedAt: peopleFinded[i].updatedAt,
                    deletedAt: peopleFinded[i].deletedAt
                }
            }
            return res.status(200).json({
                ok: true,
                msg: entityFile[index].personPluralUp + messageFile[index].okGotFemalePlural,
                people: {
                    count: activePeople.count,
                    rows: peopleToReturn
                }
            });
        } else {
            return res.status(404).json({
                ok: false,
                msg: messageFile[index].notFound + entityFile[index].personPluralLow
            });
        }
    } catch (error) {
        console.log('Error:', error);
        opusLog(`Getting all people: ${ error }`, 'error');
        return res.status(500).json({
            ok: false,
            msg: messageFile[index].errorGetting + entityFile[index].personPluralLow,
            error
        });
    }
}

// Update a person
const updatePerson = async(req, res = response) => {
    const personId = req.params.id;
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
    try {
        const findPerson = await Person.findOne({
            where: {
                personId,
                isActive: true
            }
        });
        if (findPerson === undefined || findPerson === null) {
            return res.status(404).json({
                ok: false,
                msg: messageFile[index].notFound + entityFile[index].personLow
            });
        }
        // Prepare object for update
        let personToUpdate = {
            names: names ? opusCrypt(names) : undefined,
            lastNames: lastNames ? opusCrypt(lastNames) : undefined,
            dni: dni ? opusCrypt(onlyNumbers(trimSpaces(dni))) : undefined,
            phone: phone ? opusCrypt(phone) : undefined,
            mobilePhone: mobilePhone ? opusCrypt(onlyNumbers(trimSpaces(mobilePhone))) : undefined,
            email: email ? opusCrypt(email) : undefined,
            address: address ? opusCrypt(address) : undefined,
            reference: reference ? opusCrypt(reference) : undefined,
            birthdate,
            details,
            updatedAt: sequelize.literal('CURRENT_TIMESTAMP')
        }
        await Person.update(personToUpdate, {
            where: {
                personId
            }
        });
        return res.status(200).json({
            ok: true,
            msg: entityFile[index].personUp + messageFile[index].okUpdateFemale
        });
    } catch (error) {
        console.log('Error:', error);
        opusLog(`Updating person [${ dni }]: ${ error }`, 'error');
        return res.status(500).json({
            ok: false,
            msg: messageFile[index].errorUpdating + entityFile[index].personLow,
            error
        });
    }
}

// Change person status
const changePersonStatus = async(req, res = response) => {
    const personId = req.params.id;
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
        action = entityFile[index].personUp + messageFile[index].changeStatusActionOnFemale
        changeAction = {
            isActive: true,
            updatedAt: sequelize.literal('CURRENT_TIMESTAMP'),
            deletedAt: null
        }
    } else {
        if (type.toLowerCase() === 'off') {
            activation = false;
            action = entityFile[index].personUp + messageFile[index].changeStatusActionOffFemale
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
        const findPerson = await Person.findOne({
            where: {
                personId,
                isActive: !activation
            }
        });
        if (!findPerson) {
            return res.status(404).json({
                ok: false,
                msg: `${ messageFile[index].notFound }${ entityFile[index].personLow }${ activation ? messageFile[index].alreadyActive : messageFile[index].alreadyInctive}`
            });
        } else {
            await Person.update(
                changeAction, {
                    where: {
                        personId
                    }
                }
            );
    
            return res.status(200).json({
                ok: true,
                msg: action,
            });
        }
    } catch (error) {
        console.log('Error:', error);
        opusLog(`Changing person status  [${ personId }/${ activation }]: ${ error }`, 'error');
        return res.status(500).json({
            ok: false,
            msg: messageFile[index].errorChangeStatus
        });
    }
}

// Physical deletion of a person
const deletePerson = async(req, res = response) => {
    const personId = req.params.id;
    try {
        const deletedPerson = await Person.destroy({
            where: {
                personId
            }
        });
        if (deletedPerson > 0) {
            return res.status(200).json({
                ok: true,
                msg: entityFile[index].personUp + messageFile[index].okDeleteFemale
            });
        } else {
            return res.status(404).json({
                ok: false,
                msg: messageFile[index].notFound + entityFile[index].personLow
            })
        }
    } catch (error) {
        console.log('Error:', error);
        opusLog(`Deleting person [${ personId }]: ${ error }`, 'error');
        return res.status(500).json({
            ok: false,
            msg: messageFile[index].errorDeleting + entityFile[index].personLow
        });
    }
}

// Get person by dni
const getPersonByDni = async(req, res = response) => {
    const dni = req.params.dni;
    if( !dni ) {
        return res.status(400).json({
            ok: false,
            msg: entityFile[index].dniPluralUp + messageFile[index].notParam
        });
    }
    try {
        // Find the person 
        const findPerson = await sequelize.query(`
                SELECT	prs."personId",
                        prs."uuid" "personUuid",
                        prs."dni",
                        prs."names",
                        prs."lastNames",
                        prs."phone",
                        prs."mobilePhone",
                        prs."email",
                        prs."address",
                        prs."reference",
                        prs."details" "personDetails",
                        prs."isActive" "personIsActive",
                        prs."createdAt" "personCreatedAt",
                        prs."updatedAt" "personUpdatedAt"
                FROM "person" prs
                WHERE prs."dni" LIKE '${ opusCrypt(dni) }'
                AND prs."isActive" = true
        `);
        const data = findPerson[0];
        if( data.length === 0 ) {
            return res.status(404).json({
                ok: false,
                msg: messageFile[index].notFound + entityFile[index].personLow
            });
        }
        // Contruct the JSON Object for send to person
        const person = {
            personId: data[0].personId,
            uuid: data[0].personUuid,
            names: opusDecrypt(data[0].names),
            lastNames: opusDecrypt(data[0].lastNames),
            phone: data[0].phone ? opusDecrypt(data[0].phone) : null,
            mobilePhone: opusDecrypt(data[0].mobilePhone),
            email: opusDecrypt(data[0].email),
            address: data[0].address ? opusDecrypt(data[0].address) : null,
            reference: data[0].reference ? opusDecrypt(data[0].reference) : null,
            details: data[0].personDetails,
            isActive: data[0].personIsActive,
            createdAt: data[0].personCreatedAt,
            updatedAt: data[0].personUpdatedAt
        };
        // Send information to the person
        return res.status(200).json({
            ok: true,
            msg: entityFile[index].personUp + messageFile[index].okGotFemale + messageFile[index].registerInCompany,
            person
        });
    } catch (error) {
        console.log('Error:', error);
        opusLog(`Getting person by DNI: ${ error }`, 'error');
        return res.status(500).json({
            ok: false,
            msg: messageFile[index].errorGetting + entityFile[index].personLow,
            error
        });
    }
}

module.exports = {
    createPerson,
    getActivePeople,
    getAllPeople,
    updatePerson,
    changePersonStatus,
    deletePerson,
    getPersonByDni
}