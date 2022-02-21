const Sequelize = require('sequelize');
const { sequelize } = require('../database/connection');

const ServiceDetail = sequelize.define('serviceDetail', {
    serviceDetailId: {
        type: Sequelize.INTEGER,
        primaryKey: true
    },
    uuid: {
        type: Sequelize.STRING(10),
        allowNull: false,
        unique: true
    },
    cost: {
        type: Sequelize.NUMBER,
        allowNull: false
    },
    balance: {
        type: Sequelize.NUMBER,
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

module.exports = ServiceDetail;