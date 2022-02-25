const Sequelize = require('sequelize');
const { sequelize } = require('../database/connection');
const Client = require('./Client');
const ServiceStatus = require('./ServiceStatus');
const Model = require('./Model');

const ServiceOrder = sequelize.define('serviceOrder', {
    serviceOrderId: {
        type: Sequelize.INTEGER,
        primaryKey: true
    },
    uuid: {
        type: Sequelize.STRING(10),
        allowNull: false,
        unique: true
    },
    number: {
        type: Sequelize.NUMBER,
        allowNull: false,
        unique: true
    },
    observation: {
        type: Sequelize.TEXT,
        allowNull: false,
    },
    lockPatron: {
        type: Sequelize.STRING(100)
    },
    isFinished: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false
    },
    receptionDate: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: sequelize.literal('CURRENT_DATE')
    },
    receptionHour: {
        type: Sequelize.TIME,
        allowNull: false,
        defaultValue: sequelize.literal('CURRENT_TIME')
    },
    serialNumber: {
        type: Sequelize.STRING(80)
    },
    color: {
        type: Sequelize.STRING(20)
    },
    isRepair: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false
    },
    techSpecifications: {
        type: Sequelize.STRING(400)
    },
    problemDescription: {
        type: Sequelize.TEXT,
        allowNull: false
    },
    lockPass: {
        type: Sequelize.STRING(200)
    },
    hasSurvey: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
    advancePayment: {
        type: Sequelize.NUMBER,
        defaultValue: 0
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
    clientId: {
        type: Sequelize.INTEGER,
        references: {
            model: 'client',
            key: 'clientId'
        }
    },
    modelId: {
        type: Sequelize.INTEGER,
        references: {
            model: 'model',
            key: 'modelId'
        }
    }
}, {
    timestamps: false,
    freezeTableName: true
});

Client.hasMany(ServiceOrder, { foreignKey: { name: 'clientId', targetKey: 'clientId' } });
ServiceOrder.belongsTo(Client, { foreignKey: { name: 'clientId', targetKey: 'clientId' } });

Model.hasMany(ServiceOrder, { foreignKey: { name: 'modelId', targetKey: 'modelId' } });
ServiceOrder.belongsTo(Model, { foreignKey: { name: 'modelId', targetKey: 'modelId' } });

module.exports = ServiceOrder;