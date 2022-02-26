const { response } = require('express');
const { sequelize } = require('../database/connection');

const Model = require('../models/Model');

const { getUuid } = require('../helpers/uuidGenerator');
const { opusLog } = require('../helpers/log4js');

// Language and messages import
const { selectLanguage } = require('../helpers/selectLanguage');
const index = selectLanguage(process.env.APP_LANGUAGE);
const messageFile = require('../data/messages.json');
const entityFile = require('../data/entities.json');
const Brand = require('../models/Brand');

// Create a new model of a device
const createModel = async(req, res = response) => {
    const {
        name,
        description,
        shortName,
        techSpecification,
        img,
        url,
        brandId
    } = req.body;
    let uuid = getUuid();
    try {
        // Find the brand to validate the cretion
        const findModel = await Brand.findOne({
            where: {
                brandId
            }
        });
        if( !findModel ) {
            return res.status(404).json({
                ok: false,
                msg: messageFile[index].notFound + entityFile[index].brandLow
            });
        }
        const newModel = await Model.create({
            uuid,
            name,
            description,
            shortName,
            techSpecification,
            img,
            url,
            brandId
        }, {
            fields: ['uuid', 'name', 'description', 'shortName', 'techSpecification', 'img', 'url', 'brandId'],
            returning: ['modelId', 'uuid', 'name', 'description', 'shortName', 'techSpecification', 'img', 'url', 'isActive', 'createdAt', 'brandId']
        });
        return res.status(200).json({
            ok: true,
            msg: entityFile[index].modelUp + messageFile[index].okCreateFemale,
            model: newModel
        });
    } catch (error) {
        console.log('Error:', error);
        opusLog(`Creating model [${ name }]: ${ error }`, 'error');
        return res.status(500).json({
            ok: false,
            msg: messageFile[index].errorCreating + entityFile[index].modelLow,
            error
        });
    }
}

// Get active models
const getActiveModels = async(req, res = response) => {
    const limit = req.query.limit || 20;
    const offset = req.query.offset || 0;
    try {
        const activeModels = await Model.findAndCountAll({
            where: {
                isActive: true
            },
            limit,
            offset,
            order: [ ['name', 'ASC'], [ 'brandId', 'ASC' ] ]
        });
        if (activeModels.count > 0) {
            return res.status(200).json({
                ok: true,
                msg: entityFile[index].modelPluralUp + messageFile[index].okGotMalePlural,
                models: activeModels
            });
        } else {
            return res.status(404).json({
                ok: false,
                msg: messageFile[index].notFound + entityFile[index].modelPluralLow
            });
        }
    } catch (error) {
        console.log('Error:', error);
        opusLog(`Getting active models: ${ error }`, 'error');
        return res.status(500).json({
            ok: false,
            msg: messageFile[index].errorGetting + entityFile[index].modelPluralLow,
            error
        });
    }
}

// Get all models
const getAllModels = async(req, res = response) => {
    const limit = req.query.limit || 20;
    const offset = req.query.offset || 0;
    try {
        const activeModels = await Model.findAndCountAll({
            include: [{
                model: Brand,
                attributes: ['uuid', 'name', 'shortName', 'url']
            }],
            limit,
            offset,
            order: [ ['name', 'ASC'], [ 'brandId', 'ASC' ] ]
        });
        if (activeModels.count > 0) {
            return res.status(200).json({
                ok: true,
                msg: entityFile[index].modelPluralUp + messageFile[index].okGotMalePlural,
                models: activeModels
            });
        } else {
            return res.status(404).json({
                ok: false,
                msg: messageFile[index].notFound + entityFile[index].modelPluralLow
            });
        }
    } catch (error) {
        console.log('Error:', error);
        opusLog(`Getting active models: ${ error }`, 'error');
        return res.status(500).json({
            ok: false,
            msg: messageFile[index].errorGetting + entityFile[index].modelPluralLow,
            error
        });
    }
}

// Get active models by brand
const getActiveModelsByBrand = async(req, res = response) => {
    const brandId = req.params.id;
    const limit = req.query.limit || 20;
    const offset = req.query.offset || 0;
    if(!brandId ) {
        return res.status(400).json({
            ok: false,
            msg: 'ID' + messageFile[index].invalidParam
        })
    }
    try {
        const activeModels = await Model.findAndCountAll({
            where: {
                isActive: true,
                brandId
            },
            limit,
            offset,
            order: [ ['name', 'ASC'] ]
        });
        if (activeModels.count > 0) {
            return res.status(200).json({
                ok: true,
                msg: entityFile[index].modelPluralUp + messageFile[index].okGotMalePlural,
                models: activeModels
            });
        } else {
            return res.status(404).json({
                ok: false,
                msg: messageFile[index].notFound + entityFile[index].modelPluralLow
            });
        }
    } catch (error) {
        console.log('Error:', error);
        opusLog(`Getting active models: ${ error }`, 'error');
        return res.status(500).json({
            ok: false,
            msg: messageFile[index].errorGetting + entityFile[index].modelPluralLow,
            error
        });
    }
}

// Update a model by id
const updateModel = async(req, res = response) => {
    const modelId = req.params.id;
    const {
        name,
        description,
        shortName,
        techSpecification,
        img,
        url,
        brandId
    } = req.body;
    if(name === '') {
        return res.status(400).json({
            ok: false,
            msg: messageFile[index].mandatoryMissing
        });
    }
    try {
        const findModel = await Model.findOne({
            where: {
                modelId,
                isActive: true
            }
        });
        if (findModel === undefined || findModel === null) {
            return res.status(404).json({
                ok: false,
                msg: messageFile[index].notFound + entityFile[index].modelLow
            });
        }
        await Model.update({
            name,
            description,
            shortName,
            techSpecification,
            img,
            url,
            brandId,
            updatedAt: sequelize.literal('CURRENT_TIMESTAMP')
        }, {
            where: {
                modelId
            }
        });
        return res.status(200).json({
            ok: true,
            msg: entityFile[index].modelUp + messageFile[index].okUpdateMale
        });
    } catch (error) {
        console.log('Error:', error);
        opusLog(`Updating model [${ name }]: ${ error }`, 'error');
        return res.status(500).json({
            ok: false,
            msg: messageFile[index].errorUpdating + entityFile[index].modelLow,
            error
        });
    }
}

// Change the status of a model
const changeModelStatus = async(req, res = response) => {
    const modelId = req.params.id;
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
        action = entityFile[index].modelUp + messageFile[index].changeStatusActionOnMale
        changeAction = {
            isActive: true,
            updatedAt: sequelize.literal('CURRENT_TIMESTAMP'),
            deletedAt: null
        }
    } else {
        if (type.toLowerCase() === 'off') {
            activation = false;
            action = entityFile[index].modelUp + messageFile[index].changeStatusActionOffMale
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
        const findModel = await Model.findOne({
            where: {
                modelId,
                isActive: !activation
            }
        });
        if (!findModel) {
            return res.status(404).json({
                ok: false,
                msg: `${ messageFile[index].notFound }${ entityFile[index].modelLow }${ activation ? messageFile[index].alreadyActive : messageFile[index].alreadyInctive}`
            });
        } else {
            await Model.update(
                changeAction, {
                    where: {
                        modelId
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
        opusLog(`Changing model status  [${ modelId }/${ activation }]: ${ error }`, 'error');
        return res.status(500).json({
            ok: false,
            msg: messageFile[index].errorChangeStatus
        });
    }
}

// Physical deletion of a model
const deleteModel = async(req, res = response) => {
    const modelId = req.params.id;
    try {
        const deletedModel = await Model.destroy({
            where: {
                modelId
            }
        });
        if (deletedModel > 0) {
            return res.status(200).json({
                ok: true,
                msg: entityFile[index].modelUp + messageFile[index].okDeletMale
            });
        } else {
            return res.status(404).json({
                ok: false,
                msg: messageFile[index].notFound + entityFile[index].modelLow
            })
        }
    } catch (error) {
        console.log('Error:', error);
        opusLog(`Deleting model [${ modelId }]: ${ error }`, 'error');
        return res.status(500).json({
            ok: false,
            msg: messageFile[index].errorDeleting + entityFile[index].modelLow
        });
    }
}

module.exports = {
    createModel,
    getActiveModels,
    getAllModels,
    getActiveModelsByBrand,
    updateModel,
    changeModelStatus,
    deleteModel
}