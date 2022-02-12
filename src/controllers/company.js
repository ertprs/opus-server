// Import of dependencies
const Company = require('../models/Company');
const { response } = require('express');
const { sequelize } = require('../database/connection');
const { getUuid } = require('../helpers/uuidGenerator');
const { opusLog } = require('../helpers/log4js');

// Language and messages import
const messageFile = require('../data/messages.json');
const entityFile = require('../data/entities.json');
const { selectLanguage } = require('../helpers/selectLanguage');
const index = selectLanguage(process.env.APP_LANGUAGE);

// Create a new company
const createCompany = async(req, res = response) => {
    const {
        name,
        shortName,
        logo,
        slogan,
        description,
        details,
        options
    } = req.body;
    let uuid = getUuid();
    try {
        const newCompany = await Company.create({
            uuid,
            name,
            shortName,
            logo,
            slogan,
            description,
            details,
            options
        }, {
            fields: ['uuid', 'name', 'shortName', 'logo', 'slogan', 'description', 'details', 'options'],
            returning: ['companyId', 'uuid', 'name', 'shortName', 'logo', 'slogan', 'description', 'details', 'isActive', 'createdAt']
        });
        if (newCompany) {
            return res.status(200).json({
                ok: true,
                msg: entityFile[index].companyUp + messageFile[index].okCreateFemale,
                company: newCompany
            });
        }
    } catch (error) {
        console.log('Error:', error);
        opusLog(`Creating company [${ name }]: ${ error }`, 'error');
        return res.status(500).json({
            ok: false,
            msg: messageFile[index].errorCreating + entityFile[index].companyLow,
            error
        });
    }
}

// Get active companies
const getActiveCompanies = async(req, res = response) => {
    const limit = req.query.limit || 20;
    const offset = req.query.offset || 0;
    try {
        const activeCompanies = await Company.findAndCountAll({
            where: {
                isActive: true
            },
            limit,
            offset
        });
        if (activeCompanies.count > 0) {
            return res.status(200).json({
                ok: true,
                msg: entityFile[index].compnayPluralUp + messageFile[index].okGotFemalePlural,
                companies: activeCompanies
            });
        } else {
            return res.status(404).json({
                ok: false,
                msg: messageFile[index].notFound + entityFile[index].companyPluralLow
            });
        }
    } catch (error) {
        console.log('Error:', error);
        opusLog(`Getting active companies: ${ error }`, 'error');
        return res.status(500).json({
            ok: false,
            msg: messageFile[index].errorGetting + entityFile[index].companyPluralLow,
            error
        });
    }
}

// Get all companies
const getAllCompanies = async(req, res = response) => {
    const limit = req.query.limit || 20;
    const offset = req.query.offset || 0;
    try {
        const activeCompanies = await Company.findAndCountAll({
            limit,
            offset
        });
        if (activeCompanies.count > 0) {
            return res.status(200).json({
                ok: true,
                msg: entityFile[index].compnayPluralUp + messageFile[index].okGotFemalePlural,
                companies: activeCompanies
            });
        } else {
            return res.status(404).json({
                ok: false,
                msg: messageFile[index].notFound + entityFile[index].companyPluralLow
            });
        }
    } catch (error) {
        console.log('Error:', error);
        opusLog(`Getting active companies: ${ error }`, 'error');
        return res.status(500).json({
            ok: false,
            msg: messageFile[index].errorGetting + entityFile[index].companyPluralLow,
            error
        });
    }
}

// Update a company
const updateCompany = async(req, res = response) => {
    const companyId = req.params.id;
    const {
        name,
        shortName,
        logo,
        slogan,
        description,
        details,
        options
    } = req.body;
    try {
        const findCompany = await Company.findOne({
            where: {
                companyId,
                isActive: true
            }
        });
        if (findCompany === undefined || findCompany === null) {
            return res.status(404).json({
                ok: false,
                msg: messageFile[index].notFound + entityFile[index].companyLow
            });
        }
        await Company.update({
            name,
            shortName,
            logo,
            slogan,
            description,
            details,
            options,
            updatedAt: sequelize.literal('CURRENT_TIMESTAMP')
        }, {
            where: {
                companyId
            }
        });
        return res.status(200).json({
            ok: true,
            msg: entityFile[index].companyUp + messageFile[index].okUpdateFemale
        });
    } catch (error) {
        console.log('Error:', error);
        opusLog(`Updating Company [${ name }]: ${ error }`, 'error');
        return res.status(500).json({
            ok: false,
            msg: messageFile[index].errorUpdating + entityFile[index].companyLow,
            error
        });
    }
}

// Change the status of a company
const changeCompanyStatus = async(req, res = response) => {
    const companyId = req.params.id;
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
        action = entityFile[index].companyUp + messageFile[index].changeStatusActionOnFemale
        changeAction = {
            isActive: true,
            updatedAt: sequelize.literal('CURRENT_TIMESTAMP'),
            deletedAt: null
        }
    } else {
        if (type.toLowerCase() === 'off') {
            activation = false;
            action = entityFile[index].companyUp + messageFile[index].changeStatusActionOffFemale
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
        const findCompany = await Company.findOne({
            where: {
                companyId,
                isActive: !activation
            }
        });
        if (!findCompany) {
            return res.status(404).json({
                ok: false,
                msg: `${ messageFile[index].notFound }${ entityFile[index].companyLow }${ activation ? messageFile[index].alreadyActive : messageFile[index].alreadyInctive}`
            });
        }
        await Company.update(
            changeAction, {
                where: {
                    companyId
                }
            }
        );

        return res.status(200).json({
            ok: true,
            msg: action,
        });
    } catch (error) {
        console.log('Error:', error);
        opusLog(`Changing company status  [${ companyId }/${ activation }]: ${ error }`, 'error');
        return res.status(500).json({
            ok: false,
            msg: messageFile[index].errorChangeStatus
        });
    }
}

// Physical deletion of a company
const deleteCompany = async(req, res = response) => {
    const companyId = req.params.id;
    try {
        const deletedCompany = await Company.destroy({
            where: {
                companyId
            }
        });
        if (deletedCompany > 0) {
            return res.status(200).json({
                ok: true,
                msg: entityFile[index].companyUp + messageFile[index].okDeleteFemale
            });
        } else {
            return res.status(404).json({
                ok: false,
                msg: messageFile[index].notFound + entityFile[index].companyLow
            })
        }
    } catch (error) {
        console.log('Error:', error);
        opusLog(`Deleting company [${ companyId }]: ${ error }`, 'error');
        return res.status(500).json({
            ok: false,
            msg: messageFile[index].errorDeleting + entityFile[index].companyLow
        });
    }
}

module.exports = {
    createCompany,
    getActiveCompanies,
    getAllCompanies,
    updateCompany,
    changeCompanyStatus,
    deleteCompany
}