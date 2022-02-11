// Import of dependencies
const Company = require('../models/Company');
const { express, response } = require('express')
const { sequelize } = require('../database/connection');
const { getUuid } = require('../helpers/uuidGenerator');
const { opusLog } = require('../helpers/log4js');

// Language and messages import
const messageFile = require('../data/messages.json');
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
        if( newCompany ) {
            return res.status(200).json({
                ok: true,
                msg: 'Company' + messageFile[index].okCreateFemale,
                company: newCompany
            });
        }
    } catch (error) {
        console.log('Error:', error);
        opusLog(`Creating company [${ name }]: ${ error }`, 'error');
        return res.status(500).json({
            ok: false,
            msg: messageFile[index].errorCreating + 'company',
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
            }
        });
        if( activeCompanies.count > 0 ) {
            return res.status(200).json({
                ok: true,
                msg: 'Companies' + messageFile[index].okGotFemalePlural,
                companies: activeCompanies
            });
        } else {
            return res.status(404).json({
                ok: false,
                msg: messageFile[index].notFound + 'companies'
            });
        }
    } catch (error) {
        console.log('Error:', error);
        opusLog(`Getting active companies: ${ error }`, 'error');
        return res.status(500).json({
            ok: false,
            msg: messageFile[index].errorGetting + 'companies',
            error
        });
    }
}


module.exports = {
    createCompany,
    getActiveCompanies
}


/*
const getActiveRoles = async(req, res = response) => {
    const limit = req.query.limit || 20;
    const offset = req.query.offset || 0;
    try {
        const activeRoles = await Role.findAndCountAll({
            attributes: ['roleId', 'uuid', 'name', 'description', 'elevation', 'options', 'details', 'createdAt', 'updatedAt'],
            where: {
                isActive: true
            },
            limit,
            offset
        });
        if (activeRoles.count > 0) {
            return res.status(200).json({
                ok: false,
                msg: 'Roles' + messageFile[index].okGotMalePlural,
                roles: activeRoles
            });
        } else {
            return res.status(404).json({
                ok: false,
                msg: messageFile[index].notFound + "roles"
            });
        }
    } catch (error) {
        opusLog(`Getting active roles: ${ error }`, 'error');
        console.log('Error:', error);
        return res.status(500).json({
            ok: false,
            msg: messageFile[index].errorGetting + "roles",
            error
        });
    }
}
*/