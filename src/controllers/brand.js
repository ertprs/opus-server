// Import of dependencies
const  Brand = require('../models/Brand');
const { response } = require('express');
const { sequelize } = require('../database/connection');
const { getUuid } = require('../helpers/uuidGenerator');
const { opusLog } = require('../helpers/log4js');

// Language and messages import
const messageFile = require('../data/messages.json');
const entityFile = require('../data/entities.json');
const { selectLanguage } = require('../helpers/selectLanguage');
const index = selectLanguage(process.env.APP_LANGUAGE);

// Create a new brand
const createBrand = async(req, res = response) => {
    const {
        name,
        shortName,
        description,
        url
    } = req.body;
    let uuid = getUuid();
    try {
        const newBrand = await Brand.create({
            uuid, name, shortName, description, url
        }, {
            fields: ['uuid', 'name', 'shortName', 'description', 'url'],
            returning: ['brandId', 'uuid', 'name', 'shortName', 'description', 'url', 'isActive', 'createdAt']
        });
        if( newBrand ) {
            return res.status(200).json({
                ok: true,
                msg: entityFile[index].brandUp + messageFile[index].okCreateFemale,
                brand: newBrand
            });
        }
    } catch (error) {
        console.log('Error:', error);
        opusLog(`Creating brand [${ name }]: ${ error }`, 'error');
        return res.status(500).json({
            ok: false,
            msg: messageFile[index].errorCreating + entityFile[index].brandLow,
            error
        });
    }
}

// Get active brands
const getActiveBrands = async(req, res = response) => {
    const limit = req.query.limit || 20;
    const offset = req.query.offset || 0;
    try {
        const activeBrands = await Brand.findAndCountAll({
            where: {
                isActive: true
            },
            limit,
            offset,
            order: [ ['shortName', 'ASC'] ]
        });
        if (activeBrands.count > 0) {
            return res.status(200).json({
                ok: true,
                msg: entityFile[index].brandPluralUp + messageFile[index].okGotFemalePlural,
                brands: activeBrands
            });
        } else {
            return res.status(404).json({
                ok: false,
                msg: messageFile[index].notFound + entityFile[index].brandPluralLow
            });
        }
    } catch (error) {
        console.log('Error:', error);
        opusLog(`Getting active brands: ${ error }`, 'error');
        return res.status(500).json({
            ok: false,
            msg: messageFile[index].errorGetting + entityFile[index].brandPluralLow,
            error
        });
    }
}

// Get all brands
const getAllBrands = async(req, res = response) => {
    const limit = req.query.limit || 20;
    const offset = req.query.offset || 0;
    try {
        const activeBrands = await Brand.findAndCountAll({
            limit,
            offset,
            order: [ ['shortName', 'ASC'] ]
        });
        if (activeBrands.count > 0) {
            return res.status(200).json({
                ok: true,
                msg: entityFile[index].brandPluralUp + messageFile[index].okGotFemalePlural,
                brands: activeBrands
            });
        } else {
            return res.status(404).json({
                ok: false,
                msg: messageFile[index].notFound + entityFile[index].brandPluralLow
            });
        }
    } catch (error) {
        console.log('Error:', error);
        opusLog(`Getting all brands: ${ error }`, 'error');
        return res.status(500).json({
            ok: false,
            msg: messageFile[index].errorGetting + entityFile[index].brandPluralLow,
            error
        });
    }
}

// Update a brand
const updateBrand = async(req, res = response) => {
    const brandId = req.params.id;
    const {
        name,
        shortName,
        description,
        url
    } = req.body;

    if(name === '') {
        return res.status(400).json({
            ok: false,
            msg: messageFile[index].mandatoryMissing
        });
    }

    try {
        const findBrand = await Brand.findOne({
            where: {
                brandId
            }
        });
        if (findBrand === undefined || findBrand === null) {
            return res.status(404).json({
                ok: false,
                msg: messageFile[index].notFound + entityFile[index].brandLow
            });
        }
        await Brand.update({
            name,
            shortName,
            description,
            url,
            updatedAt: sequelize.literal('CURRENT_TIMESTAMP')
        }, {
            where: {
                brandId
            }
        });
        return res.status(200).json({
            ok: true,
            msg: entityFile[index].brandUp + messageFile[index].okUpdateFemale
        });
    } catch (error) {
        console.log('Error:', error);
        opusLog(`Updating brand [${ name }/${ brandId }]: ${ error }`, 'error');
        return res.status(500).json({
            ok: false,
            msg: messageFile[index].errorUpdating + entityFile[index].brandLow,
            error
        });
    }
}

// Change the status of a brand
const changeBrandStatus = async(req, res = response) => {
    const brandId = req.params.id;
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
        action = entityFile[index].brandUp + messageFile[index].changeStatusActionOnFemale
        changeAction = {
            isActive: true,
            updatedAt: sequelize.literal('CURRENT_TIMESTAMP'),
            deletedAt: null
        }
    } else {
        if (type.toLowerCase() === 'off') {
            activation = false;
            action = entityFile[index].brandUp + messageFile[index].changeStatusActionOffFemale
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
        const findBrand = await Brand.findOne({
            where: {
                brandId,
                isActive: !activation
            }
        });
        if (!findBrand) {
            return res.status(404).json({
                ok: false,
                msg: `${ messageFile[index].notFound }${ entityFile[index].brandLow }${ activation ? messageFile[index].alreadyActive : messageFile[index].alreadyInctive}`
            });
        }
        await Brand.update(
            changeAction, {
                where: {
                    brandId
                }
            }
        );

        return res.status(200).json({
            ok: true,
            msg: action,
        });
    } catch (error) {
        console.log('Error:', error);
        opusLog(`Changing brand status  [${ brandId }/${ activation }]: ${ error }`, 'error');
        return res.status(500).json({
            ok: false,
            msg: messageFile[index].errorChangeStatus
        });
    }
}

// Physical deletion of a brand
const deleteBrand = async(req, res = response) => {
    const brandId = req.params.id;
    try {
        const deletedBrand = await Brand.destroy({
            where: {
                brandId
            }
        });
        if (deletedBrand > 0) {
            return res.status(200).json({
                ok: true,
                msg: entityFile[index].brandUp + messageFile[index].okDeleteFemale
            });
        } else {
            return res.status(404).json({
                ok: false,
                msg: messageFile[index].notFound + entityFile[index].brandLow
            })
        }
    } catch (error) {
        console.log('Error:', error);
        opusLog(`Deleting brand [${ brandId }]: ${ error }`, 'error');
        return res.status(500).json({
            ok: false,
            msg: messageFile[index].errorDeleting + entityFile[index].brandLow
        });
    }
}

module.exports = {
    createBrand,
    getActiveBrands,
    getAllBrands,
    updateBrand,
    changeBrandStatus,
    deleteBrand
}