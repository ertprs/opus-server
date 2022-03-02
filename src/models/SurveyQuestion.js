const Sequelize = require('sequelize');
const { sequelize } = require('../database/connection');
const Question = require('./Question');
const Survey = require('./Survey');

const SurveyQuestion = sequelize.define('surveyQuestion', {
    surveyQuestionId: {
        type: Sequelize.INTEGER,
        primaryKey: true
    },
    isActive: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
    },
    createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
    },
    updatedAt: {
        type: Sequelize.DATE
    },
    deletedAt: {
        type: Sequelize.DATE 
    },
    questionId: {
        type: Sequelize.INTEGER,
        references: {
            model: 'question',
            key: 'questionId'
        }
    },
    surveyId: {
        type: Sequelize.INTEGER,
        references: {
            model: 'survey',
            key: 'surveyId'
        }
    }
}, {
    timestamps: false,
    freezeTableName: true
});

Survey.hasMany( SurveyQuestion, { foreignKey: { name: 'surveyId', targetKey: 'surveyId' } } );
SurveyQuestion.belongsTo( Survey, { foreignKey: { name: 'surveyId', targetKey: 'surveyId' } } );

Question.hasMany( SurveyQuestion, { foreignKey: { name: 'questionId', targetKey: 'questionId' } } );
SurveyQuestion.belongsTo( Question, { foreignKey: { name: 'questionId', targetKey: 'questionId' } } );

module.exports = SurveyQuestion;