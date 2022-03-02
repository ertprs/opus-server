const { response } = require('express');
const { sequelize } = require('../database/connection');
const { Op } = require('sequelize');

const Survey = require('../models/Survey');
const Company = require('../models/Company');

const { getUuid } = require('../helpers/uuidGenerator');
const { opusLog } = require('../helpers/log4js');

// Language and messages import
const { selectLanguage } = require('../helpers/selectLanguage');
const index = selectLanguage(process.env.APP_LANGUAGE);
const messageFile = require('../data/messages.json');
const entityFile = require('../data/entities.json');
const { getRoleName } = require('../middlewares/roleValidation');
const { lowerCase } = require('../helpers/stringHandling');

// Create a new survey for the company
const createSurvey = async (req, res = response) => {
    const {
        name,
        details,
        startDate,
        endDate,
        startHour,
        endHour,
    } = req.body;
    const companyId = req.user.companyId;
    const uuid = getUuid();
    try {
        // Find a survey by name to avoid duplicate it
        const findSurvey = await Survey.findOne({
            where: {
                [Op.and]: [
                    { companyId },
                    sequelize.where(
                        sequelize.fn('lower', sequelize.col('name')),
                        sequelize.fn('lower', name))
                ]
            }
        });
        console.log('findSurvey:', findSurvey);
        if( !findSurvey ) {
            // Create the new survey
            const newSurvey = await Survey.create({
                uuid,
                name,
                details,
                startDate,
                endDate,
                startHour,
                endHour,
                companyId
            }, {
                fields: ['uuid', 'name', 'details', 'startDate', 'endDate', 'startHour', 'endHour', 'companyId'],
                returning: ['surveyId', 'uuid', 'name', 'details', 'startDate', 'endDate', 'startHour', 'endHour', 'companyId', 'isActive', 'createdAt']
            });
            return res.status(200).json({
                ok: true,
                msg: entityFile[index].surveyUp + messageFile[index].okCreateMale,
                survey: newSurvey
            });
        } else {
            return res.status(400).json({
                ok: false,
                msg: entityFile[index].surveyUp + messageFile[index].alreadyExists
            });
        }
    } catch (error) {
        console.log('Error:', error);
        opusLog(`Creating survey [${ companyId }]: ${ error }`, 'error');
        return res.status(500).json({
            ok: false,
            msg: messageFile[index].errorCreating + entityFile[index].surveyLow,
            error
        });
    }
}

// Get all active surveys for a company
const getActiveSurveys = async(req, res = response) => {
    const companyId = req.user.companyId;
    const limit = req.query.limit || 20;
    const offset = req.query.offset || 0;
    try {
        const activeSurveys = await Survey.findAndCountAll({
            where: {
                companyId,
                isActive: true
            },
            limit,
            offset
        });
        if ( activeSurveys.count > 0 ) {
            return res.status(200).json({
                ok: true,
                msg: entityFile[index].surveyPluralUp + messageFile[index].okGotFemalePlural,
                surveys: activeSurveys
            });
        } else {
            return res.status(404).json({
                ok: false,
                msg: messageFile[index].notFound + entityFile[index].surveyPluralLow
            });
        }
    } catch (error) {
        console.log('Error:', error);
        opusLog(`Getting active surveys [${ companyId }]: ${ error }`, 'error');
        return res.status(500).json({
            ok: false,
            msg: messageFile[index].errorGetting + entityFile[index].surveyPluralLow,
            error
        });
    }
}

// Get all surveys for administration
const getAllSurveys = async(req, res = response) => {
    const companyId = req.user.companyId;
    const limit = req.query.limit || 20;
    const offset = req.query.offset || 0;
    try {
        const activeSurveys = await Survey.findAndCountAll({
            where: {
                companyId,
                isActive: true
            },
            include:[{
                model: Company,
                attributes: ['uuid', 'name', 'shortName', 'isActive']
            }], 
            limit,
            offset
        });
        if ( activeSurveys.count > 0 ) {
            return res.status(200).json({
                ok: true,
                msg: entityFile[index].surveyPluralUp + messageFile[index].okGotFemalePlural,
                surveys: activeSurveys
            });
        } else {
            return res.status(404).json({
                ok: false,
                msg: messageFile[index].notFound + entityFile[index].surveyPluralLow
            });
        }
    } catch (error) {
        console.log('Error:', error);
        opusLog(`Getting all surveys [${ companyId }]: ${ error }`, 'error');
        return res.status(500).json({
            ok: false,
            msg: messageFile[index].errorGetting + entityFile[index].surveyPluralLow,
            error
        });
    }
}

// Update a survey
const updateSurvey = async(req, res = response) => {
    const surveyId = req.params.id;
    const companyId = req.user.companyId;
    const roleId = req.user.roleId;
    const {
        name,
        details,
        startDate,
        endDate,
        startHour,
        endHour,
    } = req.body;
    let searchCondition = {};
    try {
        // If the user is an administrator, cannot validate the company
        const roleName = await getRoleName(roleId);
        if (lowerCase(roleName) !== lowerCase(process.env.USR_ADMIN)) {
            searchCondition = {
                surveyId,
                companyId
            }
        } else {
            searchCondition = {
                surveyId
            }
        }
        const findSurvey = await Survey.findOne({ where: searchCondition });
        if (findSurvey === undefined || findSurvey === null) {
            return res.status(400).json({
                ok: false,
                msg: messageFile[index].notFound + entityFile[index].surveyLow + messageFile[index].registerInCompany
            });
        }
        await Survey.update({
            name,
            details,
            startDate,
            endDate,
            startHour,
            endHour,
            updatedAt: sequelize.literal('CURRENT_TIMESTAMP')
        }, {
            where: searchCondition
        });
        return res.status(200).json({
            ok: true,
            msg: entityFile[index].surveyUp + messageFile[index].okUpdateFemale
        })
    } catch (error) {
        console.log('Error:', error);
        opusLog(`Updating survey [${ surveyId }]: ${ error }`, 'error');
        return res.status(500).json({
            ok: false,
            msg: messageFile[index].errorUpdating + entityFile[index].surveyLow,
            error
        });
    }
}

// Change the status of a survey
const changeSurveyStatus = async(req, res = response) => {
    const surveyId = req.params.id;
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
        action = entityFile[index].surveyUp + messageFile[index].changeStatusActionOnFemale
        changeAction = {
            isActive: true,
            updatedAt: sequelize.literal('CURRENT_TIMESTAMP'),
            deletedAt: null
        }
    } else {
        if (type.toLowerCase() === 'off') {
            activation = false;
            action = entityFile[index].surveyUp + messageFile[index].changeStatusActionOffFemale
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
                surveyId,
                companyId,
                isActive: !activation
            }
        } else {
            searchCondition = {
                surveyId,
                isActive: !activation
            }
        }
    } catch (error) {
        console.log('Error:', error);
        opusLog(`Changing survey status  [${ surveyId }/${ activation }] role not found: ${ error }`, 'error');
        return res.status(500).json({
            ok: false,
            msg: `${ messageFile[index].errorChangeStatus } ${ entityFile[index].roleLow }`
        });
    }
    try {
        const findSurvey = await Survey.findOne({
            where: searchCondition
        });
        if (!findSurvey) {
            return res.status(404).json({
                ok: false,
                msg: `${ messageFile[index].notFound }${ entityFile[index].surveyLow }${ activation ? messageFile[index].alreadyActive : messageFile[index].alreadyInctive}`
            });
        } else {
            await Survey.update(
                changeAction, {
                    where: {
                        surveyId
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
        opusLog(`Changing survey status [${ surveyId }/${ activation }]: ${ error }`, 'error');
        return res.status(500).json({
            ok: false,
            msg: messageFile[index].errorChangeStatus
        });
    }
}

// Delete physically a survey
const deleteSurvey = async(req, res = response) => {
    const surveyId = req.params.id;
    try {
        const deletedSurvey = await Survey.destroy({
            where: {
                surveyId
            }
        });
        if (deletedSurvey > 0) {
            return res.status(200).json({
                ok: true,
                msg: entityFile[index].surveyUp + messageFile[index].okDeleteFemale
            });
        } else {
            return res.status(404).json({
                ok: false,
                msg: messageFile[index].notFound + entityFile[index].surveyLow
            })
        }
    } catch (error) {
        console.log('Error:', error);
        opusLog(`Deleting survey [${ surveyId }]: ${ error }`, 'error');
        return res.status(500).json({
            ok: false,
            msg: messageFile[index].errorDeleting + entityFile[index].surveyLow
        });
    }
}

module.exports = {
    createSurvey,
    getActiveSurveys,
    getAllSurveys,
    updateSurvey,
    changeSurveyStatus,
    deleteSurvey
}