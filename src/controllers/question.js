const { response } = require('express');
const { sequelize } = require('../database/connection');

const Question = require('../models/Question');
const Survey = require('../models/Survey');
const SurveyQuestion = require('../models/SurveyQuestion');

const { getUuid } = require('../helpers/uuidGenerator');
const { opusLog } = require('../helpers/log4js');

// Language and messages import
const { selectLanguage } = require('../helpers/selectLanguage');
const index = selectLanguage(process.env.APP_LANGUAGE);
const messageFile = require('../data/messages.json');
const entityFile = require('../data/entities.json');
const { getRoleName } = require('../middlewares/roleValidation');
const { lowerCase } = require('../helpers/stringHandling');
const Company = require('../models/Company');

// Create a new survey for the company
const createQuestion = async (req, res = response) => {
    const {
        question,
        answer,
        surveyId
    } = req.body;
    const uuid = getUuid();
    if( !surveyId ) {
        return res.status(400).json({
            ok: false,
            msg: entityFile[index].surveyUp + messageFile[index].notParam
        });
    }
    try {
        // Find a survey by id to create the question
        const findSurvey = await Survey.findOne({
            where: {
                surveyId
            }
        });
        if( findSurvey ) {
            // Create the question
            const newQuestion = await Question.create({
                uuid,
                question,
                answer
            }, {
                fields: ['uuid', 'question', 'answer'],
                returning: ['questionId', 'uuid', 'question', 'answer', 'isActive', 'createdAt']
            });
            // Populate the question and surveys table
            const newSurveyQuestion = await SurveyQuestion.create({
                surveyId,
                questionId: newQuestion.questionId
            }, {
                fields: ['surveyId', 'questionId'],
                returning: ['surveyQuestionId', 'isActive', 'createdAt', 'surveyId', 'questionId']
            })
            return res.status(200).json({
                ok: true,
                msg: entityFile[index].surveyUp + messageFile[index].okCreateMale,
                question: {
                    question: newQuestion,
                    questionSurvey: newSurveyQuestion
                }

            });
        } else {
            return res.status(400).json({
                ok: false,
                msg: messageFile[index].notFound + entityFile[index].surveyLow
            });
        }
    } catch (error) {
        console.log('Error:', error);
        opusLog(`Creating question [${ surveyId }]: ${ error }`, 'error');
        return res.status(500).json({
            ok: false,
            msg: messageFile[index].errorCreating + entityFile[index].questionLow,
            error
        });
    }
}

// Get active questions
const getActiveQuestions = async(req, res = response) => {
    const companyId = req.user.companyId;
    try {
        const findQuestions = await Question.findAndCountAll({
            include: [{
                model: SurveyQuestion,
                include: [{
                    model: Survey,
                    where: {
                        companyId
                    }
                }]
            }]
        });
        if( !findQuestions ) {
            return res.status(404).json({
                ok: true,
                msg: messageFile[index].notFound + entityFile[index].questionLow
            })
        } else {
            return res.status(200).json({
                ok: true,
                msg: entityFile[index].questionUp + messageFile[index].okGotFemalePlural,
                questions: findQuestions
            });
        }
    } catch (error) {
        console.log('Error:', error);
        opusLog(`Getting active questions [${ companyId }]: ${ error }`, 'error');
        return res.status(500).json({
            ok: false,
            msg: messageFile[index].errorGetting + entityFile[index].questionPluralLow,
            error
        });
    }
}

// Get all questions for administration
const getAllQuestions = async(req, res = response) => {
    try {
        const findQuestions = await Question.findAndCountAll({
            include: [{
                model: SurveyQuestion,
                include: [{
                    model: Survey,
                    include: [{
                        model: Company,
                        attributes: ['uuid', 'name', 'shortName', 'logo']
                    }]
                }]
            }]
        });
        if( !findQuestions ) {
            return res.status(404).json({
                ok: true,
                msg: messageFile[index].notFound + entityFile[index].questionLow
            })
        } else {
            return res.status(200).json({
                ok: true,
                msg: entityFile[index].questionUp + messageFile[index].okGotFemalePlural,
                questions: findQuestions
            });
        }
    } catch (error) {
        console.log('Error:', error);
        opusLog(`Getting all questions [all]: ${ error }`, 'error');
        return res.status(500).json({
            ok: false,
            msg: messageFile[index].errorGetting + entityFile[index].questionPluralLow,
            error
        });
    }
}

// Update a question
const updateQuestion = async(req, res = response) => {
    const questionId = req.params.id;
    const companyId = req.user.companyId;
    const roleId = req.user.roleId;
    const {
        question,
        answer,
        details
    } = req.body;
    let searchCondition = {};
    console.log('companyID:', companyId);
    try {
        // If the user is an administrator, cannot validate the company
        const roleName = await getRoleName(roleId);
        if (lowerCase(roleName) !== lowerCase(process.env.USR_ADMIN)) {
            searchCondition = {
                where: {
                    questionId,
                    isActive: true,
                },
                include: [{
                    model: SurveyQuestion,
                    include: [{
                        model: Survey,
                        where: {
                            companyId
                        }
                    }]
                }]
            }
        } else {
            searchCondition = {
                where: {
                    questionId
                },
                include: [{
                    model: SurveyQuestion,
                    include: [{
                        model: Survey,
                    }]
                }]
            }
        }
        console.log(JSON.stringify(searchCondition, null, 5));
        // Find the question and validate if it belongs to user's company
        const findQuestion = await Question.findOne( searchCondition );
        if (findQuestion === undefined || findQuestion === null) {
            return res.status(400).json({
                ok: false,
                msg: entityFile[index].questionUp + messageFile[index].notFound + messageFile[index].registerInCompany
            });
        }
        if( findQuestion.surveyQuestions.length > 0 ){
            // Update a question
            await Question.update({
                question,
                answer,
                details,
                updatedAt: sequelize.literal('CURRENT_TIMESTAMP')
            }, searchCondition);
        } else {
            return res.status(400).json({
                ok: false,
                msg: messageFile[index].notFound + messageFile[index].questionLow + messageFile[index].registerInCompany
            });
        }
        return res.status(200).json({
            ok: true,
            msg: entityFile[index].questionUp + messageFile[index].okUpdateFemale
        });
    } catch (error) {
        console.log('Error:', error);
        opusLog(`Updating a question [${ questionId }]: ${ error }`, 'error');
        return res.status(500).json({
            ok: false,
            msg: messageFile[index].errorUpdating + entityFile[index].questionLow,
            error
        });
    }
}

// Change the status of a question
const changeQuestionStatus = async(req, res = response) => {
    const questionId = req.params.id;
    const type = req.query.type || false;
    const roleId = req.user.roleId;
    const companyId = req.user.companyId;
    let changeAction;
    let action;
    let activation;
    let searchCondition;
    let changeActionSurveyQuestion;
    if (!type) {
        return res.status(400).json({
            ok: false,
            msg: entityFile[index].typeUp + messageFile[index].notParam
        });
    }
    if (type.toLowerCase() === 'on') {
        activation = true;
        action = entityFile[index].questionUp + messageFile[index].changeStatusActionOnFemale
        changeAction = {
            isActive: true,
            updatedAt: sequelize.literal('CURRENT_TIMESTAMP'),
            deletedAt: null
        }
    } else {
        if (type.toLowerCase() === 'off') {
            activation = false;
            action = entityFile[index].questionUp + messageFile[index].changeStatusActionOffFemale
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
                where: {
                    questionId,
                    isActive: !activation,
                },
                include: [{
                    model: SurveyQuestion,
                    include: [{
                        model: Survey,
                        where: {
                            companyId
                        }
                    }]
                }]
            };
        } else {
            searchCondition = {
                where: {
                    questionId,
                    isActive: !activation
                }
            }
        }
    } catch (error) {
        console.log('Error:', error);
        opusLog(`Changing question status  [${ questionId }/${ activation }] role not found: ${ error }`, 'error');
        return res.status(500).json({
            ok: false,
            msg: `${ messageFile[index].errorChangeStatus } ${ entityFile[index].questionLow }`
        });
    }
    try {
        const findQuestion = await Question.findOne(searchCondition);
        if (!findQuestion) {
            return res.status(404).json({
                ok: false,
                msg: `${ messageFile[index].notFound }${ entityFile[index].questionLow }${ activation ? messageFile[index].alreadyActive : messageFile[index].alreadyInctive}`
            });
        } else {
            // Update the Question with the new changes
            await Question.update(changeAction, searchCondition);
            // Update the surveyQuestion table with the value of on or off for the question
            if( type.toLowerCase() === 'on' ){
                changeActionSurveyQuestion = {
                    isActive: activation,
                    updatedAt: sequelize.literal('CURRENT_TIMESTAMP'),
                    deletedAt: null
                }
            } else {
                changeActionSurveyQuestion = {
                    isActive: activation,
                    updatedAt: sequelize.literal('CURRENT_TIMESTAMP'),
                    deletedAt: sequelize.literal('CURRENT_TIMESTAMP')
                }
            }
           await SurveyQuestion.update(changeActionSurveyQuestion, {
               where: {
                   questionId
               }
           });
           // Return te results to the client
            return res.status(200).json({
                ok: true,
                msg: action,
            });
        }
    } catch(error) {
        console.log('Error:', error);
        opusLog(`Changing question status [${ questionId }/${ activation }]: ${ error }`, 'error');
        return res.status(500).json({
            ok: false,
            msg: messageFile[index].errorChangeStatus
        });
    }
}

// Physically deletion of a question
const deleteQuestion = async(req, res = response) => {
    const questionId = req.params.id;
    try {
        // To avoid FK validation the order for deletion is: first survey-question table, then question table
        // Deletion of the survey question table registry
        await SurveyQuestion.destroy({
            where: {
                questionId
            }
        });
        // Deleting question table
        const deletedQuestion = await Question.destroy({
            where: {
                questionId
            }
        });
        if (deletedQuestion > 0) {
            return res.status(200).json({
                ok: true,
                msg: entityFile[index].questionUp + messageFile[index].okDeleteFemale
            });
        } else {
            return res.status(404).json({
                ok: false,
                msg: messageFile[index].notFound + entityFile[index].questionLow
            })
        }
    } catch (error) {
        console.log('Error:', error);
        opusLog(`Deleting question [${ questionId }]: ${ error }`, 'error');
        return res.status(500).json({
            ok: false,
            msg: messageFile[index].errorDeleting + entityFile[index].questionLow
        });
    }
}

module.exports = {
    createQuestion,
    getActiveQuestions,
    getAllQuestions,
    updateQuestion,
    changeQuestionStatus,
    deleteQuestion
}