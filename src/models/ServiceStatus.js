const Sequelize = require('sequelize');
const { sequelize } = require('../database/connection');
const Company = require('./Company');

const ServiceStatus = sequelize.define('serviceStatus', {
    statusId: {
        type: Sequelize.INTEGER,
        primaryKey: true
    },
    uuid: {
        type: Sequelize.STRING(10),
        allowNull: false,
        unique: true
    },
    name: {
        type: Sequelize.STRING(150),
        allowNull: false,
        unique: true
    },
    details: {
        type: Sequelize.TEXT
    },
    order: {
        type: Sequelize.SMALLINT
    },
    cost: {
        type: Sequelize.NUMBER
    },
    options: {
        type:Sequelize.JSON
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
    }
}, {
    timestamps: false,
    freezeTableName: true
});

Company.hasMany(ServiceStatus, { foreignKey: { name: 'companyId', targetKey: 'companyId' } });
ServiceStatus.belongsTo(Company, { foreignKey: { name: 'companyId', targetKey: 'companyId' } });

module.exports = ServiceStatus;