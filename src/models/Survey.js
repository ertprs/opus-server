const Sequelize = require('sequelize');
const { sequelize } = require('../database/connection');
const Company = require('./Company');

const Survey = sequelize.define('survey', {
    surveyId: {
        type: Sequelize.INTEGER,
        primaryKey: true
    },
    uuid: {
        type: Sequelize.STRING(10),
        allowNull: false,
        unique: true
    },
    name: {
        type: Sequelize.STRING(100),
        allowNull: false
    },
    details: {
        type: Sequelize.TEXT
    },
    startDate: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: sequelize.literal('CURRENT_DATE') 
    },
    endDate: {
        type: Sequelize.DATE
    },
    startHour: {
        type: Sequelize.TIME,
        allowNull: false,
        defaultValue: sequelize.literal('CURRENT_TIME')
    },
    endHour: {
        type: Sequelize.TIME,
        allowNull: false,
        defaultValue: '00:00:00'
    },
    isActive: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
    },
    createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
    },
    updatedAt: {
        type: Sequelize.DATE
    },
    deletedAt: {
        type: Sequelize.DATE
    },
    companyId: {
        type: Sequelize.INTEGER,
        references: {
            model: 'company',
            key: 'companyId'
        }
    },
}, {
    timestamps: false,
    freezeTableName: true
});

Company.hasMany( Survey, { foreignKey: { name: 'companyId', targetKey: 'companyId' } } );
Survey.belongsTo( Company, { foreignKey: { name: 'companyId', targetKey: 'companyId' } } );

module.exports = Survey;