const Sequelize = require('sequelize');
const { sequelize } = require('../database/connection');

const Company = sequelize.define('company', {
    companyId: {
        type: Sequelize.INTEGER,
        primaryKey: true
    },
    uuid: {
        type: Sequelize.STRING(10),
        required: true,
        allowNull: false,
        unique: true
    },
    name: {
        type: Sequelize.STRING(400),
        required: true,
        allowNull: false
    },
    shortName: {
        type: Sequelize.STRING(100)
    },
    logo: {
        type: Sequelize.STRING(500)
    },
    slogan: {
        type: Sequelize.STRING(500)
    },
    details: {
        type: Sequelize.TEXT
    },
    isActive: {
        type: Sequelize.BOOLEAN,
        required: true,
        allowNull: false,
        defaultValue: true
    },
    description: {
        type: Sequelize.TEXT
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
    options: {
        type: Sequelize.JSON
    },
},{
    timestamps: false,
    freezeTableName: true
});

module.exports = Company;