const Sequelize = require('sequelize');
const { sequelize } = require('../database/connection');
const Company = require('./Company');

const Service = sequelize.define('service', {
    serviceId: {
        type: Sequelize.INTEGER,
        primaryKey: true
    },
    uuid: {
        type: Sequelize.STRING(10),
        allowNull: false,
        unique: true
    },
    name: {
        type: Sequelize.STRING(200),
        allowNull: false,
    },
    detail: {
        type: Sequelize.TEXT
    },
    price: {
        type: Sequelize.NUMBER
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

Company.hasMany(Service, { foreignKey: { name: 'companyId', targetKey: 'companyId' } });
Service.belongsTo(Company, { foreignKey: { name: 'companyId', targetKey: 'companyId' } });

module.exports = Service;