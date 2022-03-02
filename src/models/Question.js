const Sequelize = require('sequelize');
const { sequelize } = require('../database/connection');

const Question = sequelize.define('question', {
    questionId: {
        type: Sequelize.INTEGER,
        primaryKey: true
    },
    uuid: {
        type: Sequelize.STRING(10),
        allowNull: false,
        unique: true
    },
    question: {
        type: Sequelize.TEXT,
        allowNull: false
    },
    answer: {
        type: Sequelize.ARRAY(Sequelize.TEXT),
        allowNull: false
    },
    details: {
        type: Sequelize.TEXT,
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
    }
}, {
    timestamps: false,
    freezeTableName: true
});

module.exports = Question;