const { response } = require('express');
const { sequelize } = require('../database/connection');

const Client = require('../models/Client');
const Company = require('../models/Company');
const Person = require('../models/Person');

const { getUuid } = require('../helpers/uuidGenerator');
const { opusLog } = require('../helpers/log4js');
const { opusDecrypt } = require('../helpers/crypto');

// Language and messages import
const { selectLanguage } = require('../helpers/selectLanguage');
const index = selectLanguage(process.env.APP_LANGUAGE);
const messageFile = require('../data/messages.json');
const entityFile = require('../data/entities.json');
const { getRoleName } = require('../middlewares/roleValidation');
const { lowerCase } = require('../helpers/stringHandling');

// Create a new client (If client exists, don't create)
const createClient = async(req, res = response) => {
    const {
        details,
        hasWhatsapp,
        hasEmail,
        needsSurvey,
        personId
    } = req.body;
    let companyId = req.user.companyId;
    let uuid = getUuid();
    try {
        // Find a client by personId
        const findClient = await Client.findOne({
            where: {
                personId,
                companyId
            }
        });
        if (!findClient) {
            // Create a client
            const newClient = await Client.create({
                uuid,
                servicesNumber: 0,
                details,
                hasWhatsapp,
                hasEmail,
                needsSurvey,
                personId,
                companyId
            }, {
                fields: ['uuid', 'servicesNumber', 'details', 'hasWhatsapp', 'hasEmail', 'needsSurvey', 'personId', 'companyId'],
                returning: ['clientId', 'uuid', 'servicesNumber', 'details', 'hasWhatsapp', 'hasEmail', 'needsSurvey', 'isActive', 'createdAt', 'personId', 'companyId']
            });
            return res.status(200).json({
                ok: true,
                msg: entityFile[index].clientUp + messageFile[index].okCreateMale,
                client: newClient
            });
        } else {
            return res.status(200).json({
                ok: true,
                msg: entityFile[index].clientUp + messageFile[index].alreadyExists,
                client: findClient
            });
        }
    } catch (error) {
        console.log('Error:', error);
        opusLog(`Creating client [${ personId }]: ${ error }`, 'error');
        return res.status(500).json({
            ok: false,
            msg: messageFile[index].errorCreating + entityFile[index].clientLow,
            error
        });
    }
}

// Get active clients
const getActiveClients = async(req, res = response) => {
    const limit = req.query.limit || 20;
    const offset = req.query.offset || 0;
    const companyId = req.user.companyId;
    try {
        const activeClients = await Client.findAndCountAll({
            include: [{
                model: Person,
                attributes: ['uuid', 'names', 'lastNames', 'dni', 'mobilePhone', 'email']
            }, {
                model: Company,
                attributes: ['uuid', 'name', 'shortName']
            }],
            where: {
                isActive: true,
                companyId
            },
            limit,
            offset
        });
        if (activeClients.count > 0) {
            // Clients finded
            let clientsFinded = activeClients.rows;
            let clientsToReturn = [];
            // Decipher the information of the people
            for (let i = 0; i < clientsFinded.length; i++) {
                clientsToReturn[i] = {
                    clientId: clientsFinded[i].clientId,
                    uuid: clientsFinded[i].uuid,
                    servicesNumber: clientsFinded[i].servicesNumber,
                    details: clientsFinded[i].details,
                    hasWhatsapp: clientsFinded[i].hasWhatsapp,
                    hasEmail: clientsFinded[i].hasEmail,
                    isActive: clientsFinded[i].isActive,
                    needsSurvey: clientsFinded[i].needsSurvey,
                    createdAt: clientsFinded[i].createdAt,
                    updatedAt: clientsFinded[i].updatedAt,
                    deletedAt: clientsFinded[i].deletedAt,
                    companyId: clientsFinded[i].companyId,
                    personId: clientsFinded[i].personId,
                    person: {
                        uuid: clientsFinded[i].person.uuid,
                        names: opusDecrypt(clientsFinded[i].person.names),
                        lastNames: opusDecrypt(clientsFinded[i].person.lastNames),
                        dni: opusDecrypt(clientsFinded[i].person.dni),
                        email: opusDecrypt(clientsFinded[i].person.email),
                        mobilePhone: opusDecrypt(clientsFinded[i].person.mobilePhone)
                    },
                    company: {
                        uuid: clientsFinded[i].company.uuid,
                        name: clientsFinded[i].company.name,
                        shortName: clientsFinded[i].company.shortName
                    }
                }
            }
            return res.status(200).json({
                ok: true,
                msg: entityFile[index].clientPluralUp + messageFile[index].okGotMalePlural,
                clients: clientsToReturn
            });
        } else {
            return res.status(404).json({
                ok: false,
                msg: messageFile[index].notFound + entityFile[index].clientPluralLow
            });
        }
    } catch (error) {
        console.log('Error:', error);
        opusLog(`Getting active clients: ${ error }`, 'error');
        return res.status(500).json({
            ok: false,
            msg: messageFile[index].errorGetting + entityFile[index].clientPluralLow,
            error
        });
    }
}

// Get all clients for administration
const getAllClients = async(req, res = response) => {
    const limit = req.query.limit || 20;
    const offset = req.query.offset || 0;
    try {
        const activeClients = await Client.findAndCountAll({
            include: [{
                model: Person,
                attributes: ['uuid', 'names', 'lastNames', 'dni', 'mobilePhone', 'email']
            }, {
                model: Company,
                attributes: ['uuid', 'name', 'shortName']
            }],
            limit,
            offset
        });
        console.log('count:', activeClients.count);
        if (activeClients.count > 0) {
            // Clients finded
            let clientsFinded = activeClients.rows;
            let clientsToReturn = [];
            // Decipher the information of the people
            for (let i = 0; i < clientsFinded.length; i++) {
                clientsToReturn[i] = {
                    clientId: clientsFinded[i].clientId,
                    uuid: clientsFinded[i].uuid,
                    servicesNumber: clientsFinded[i].servicesNumber,
                    details: clientsFinded[i].details,
                    hasWhatsapp: clientsFinded[i].hasWhatsapp,
                    hasEmail: clientsFinded[i].hasEmail,
                    isActive: clientsFinded[i].isActive,
                    needsSurvey: clientsFinded[i].needsSurvey,
                    createdAt: clientsFinded[i].createdAt,
                    updatedAt: clientsFinded[i].updatedAt,
                    deletedAt: clientsFinded[i].deletedAt,
                    companyId: clientsFinded[i].companyId,
                    personId: clientsFinded[i].personId,
                    person: {
                        uuid: clientsFinded[i].person.uuid,
                        names: opusDecrypt(clientsFinded[i].person.names),
                        lastNames: opusDecrypt(clientsFinded[i].person.lastNames),
                        dni: opusDecrypt(clientsFinded[i].person.dni),
                        email: opusDecrypt(clientsFinded[i].person.email),
                        mobilePhone: opusDecrypt(clientsFinded[i].person.mobilePhone)
                    },
                    company: {
                        uuid: clientsFinded[i].company.uuid,
                        name: clientsFinded[i].company.name,
                        shortName: clientsFinded[i].company.shortName
                    }
                }
            }
            return res.status(200).json({
                ok: true,
                msg: entityFile[index].clientPluralUp + messageFile[index].okGotMalePlural,
                clients: clientsToReturn
            });
        } else {
            return res.status(404).json({
                ok: false,
                msg: messageFile[index].notFound + entityFile[index].clientPluralLow
            });
        }
    } catch (error) {
        console.log('Error:', error);
        opusLog(`Getting active clients: ${ error }`, 'error');
        return res.status(500).json({
            ok: false,
            msg: messageFile[index].errorGetting + entityFile[index].clientPluralLow,
            error
        });
    }
}

// Update the information of a client
const updateClient = async(req, res = response) => {
    const companyId = req.user.companyId;
    const roleId = req.user.roleId;
    const clientId = req.params.id;
    const {
        details,
        hasWhatsapp,
        hasEmail,
        needsSurvey,
        personId,
        servicesNumber
    } = req.body;
    let searchCondition = {};

    if (personId === '' || personId === 0) {
        return res.status(400).json({
            ok: false,
            msg: messageFile[index].mandatoryMissing
        });
    }

    try {
        // If the user is an administrator, cannot validate the company
        const roleName = await getRoleName(roleId);
        if (lowerCase(roleName) !== lowerCase(process.env.USR_ADMIN)) {
            searchCondition = {
                clientId,
                companyId
            }
        } else {
            searchCondition = {
                clientId
            }
        }
        const findClient = await Client.findOne({ where: searchCondition });
        if (findClient === undefined || findClient === null) {
            return res.status(400).json({
                ok: false,
                msg: entityFile[index].clientUp + messageFile[index].notFound + messageFile[index].registerInCompany
            });
        }
        // Update the client information
        await Client.update({
            details,
            hasWhatsapp,
            hasEmail,
            needsSurvey,
            personId,
            servicesNumber,
            updatedAt: sequelize.literal('CURRENT_TIMESTAMP')
        }, {
            where: searchCondition
        });
        return res.status(200).json({
            ok: true,
            msg: entityFile[index].clientUp + messageFile[index].okUpdateMale
        });
    } catch (error) {
        console.log('Error:', error);
        opusLog(`Updating client [${ clientId }]: ${ error }`, 'error');
        return res.status(500).json({
            ok: false,
            msg: messageFile[index].errorUpdating + entityFile[index].clientLow,
            error
        });
    }
}

// Change the status of a client
const changeClientStatus = async(req, res = response) => {
    const clientId = req.params.id;
    const type = req.query.type || false;
    const roleId = req.user.roleId;
    const companyId = req.user.companyId;
    let changeAction;
    let action;
    let activation;
    let searchCondition;


    if (!type) {
        return res.status(400).json({
            ok: false,
            msg: entityFile[index].typeUp + messageFile[index].notParam
        });
    }

    if (type.toLowerCase() === 'on') {
        activation = true;
        action = entityFile[index].clientUp + messageFile[index].changeStatusActionOnMale
        changeAction = {
            isActive: true,
            updatedAt: sequelize.literal('CURRENT_TIMESTAMP'),
            deletedAt: null
        }
    } else {
        if (type.toLowerCase() === 'off') {
            activation = false;
            action = entityFile[index].clientUp + messageFile[index].changeStatusActionOffMale
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
        const roleName = await getRoleName(roleId);
        if (lowerCase(roleName) !== lowerCase(process.env.USR_ADMIN)) {
            searchCondition = {
                clientId,
                companyId,
                isActive: !activation
            }
        } else {
            searchCondition = {
                clientId,
                isActive: !activation
            }
        }
    } catch (error) {
        console.log('Error:', error);
        opusLog(`Changing client status  [${ clientId }/${ activation }] role not found: ${ error }`, 'error');
        return res.status(500).json({
            ok: false,
            msg: `${ messageFile[index].errorChangeStatus } ${ entityFile[index].roleLow }`
        });
    }
    try {
        const findClient = await Client.findOne({
            where: searchCondition
        });
        if (!findClient) {
            return res.status(404).json({
                ok: false,
                msg: `${ messageFile[index].notFound }${ entityFile[index].clientLow }${ activation ? messageFile[index].alreadyActive : messageFile[index].alreadyInctive}`
            });
        }
        await Client.update(
            changeAction, {
                where: {
                    clientId
                }
            }
        );

        return res.status(200).json({
            ok: true,
            msg: action,
        });
    } catch (error) {
        console.log('Error:', error);
        opusLog(`Changing client status  [${ clientId }/${ activation }]: ${ error }`, 'error');
        return res.status(500).json({
            ok: false,
            msg: messageFile[index].errorChangeStatus
        });
    }
}

// Delete phisically a client
const deleteClient = async(req, res = reponse) => {
    const clientId = req.params.id;
    try {
        const deletedClient = await Client.destroy({
            where: {
                clientId
            }
        });
        if (deletedClient > 0) {
            return res.status(200).json({
                ok: true,
                msg: entityFile[index].clientUp + messageFile[index].okDeletMale
            });
        } else {
            return res.status(404).json({
                ok: false,
                msg: messageFile[index].notFound + entityFile[index].clientLow
            })
        }
    } catch (error) {
        console.log('Error:', error);
        opusLog(`Deleting client [${ clientId }]: ${ error }`, 'error');
        return res.status(500).json({
            ok: false,
            msg: messageFile[index].errorDeleting + entityFile[index].clientLow
        });
    }
}

module.exports = {
    createClient,
    getActiveClients,
    getAllClients,
    updateClient,
    changeClientStatus,
    deleteClient
}