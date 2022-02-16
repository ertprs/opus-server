const Sequelize = require('sequelize');
const { sequelize } = require('../database/connection');
const Company = require('./Company');
const Person = require('./Person');

const Client = sequelize.define('client', {
    clientId: {
        type: Sequelize.INTEGER,
        primaryKey: true
    },
    uuid: {
        type: Sequelize.STRING(10),
        allowNull: false,
        unique: true
    },
    servicesNumber: {
        type: Sequelize.SMALLINT,
        allowNull: false
    },
    details: {
        type: Sequelize.TEXT
    },
    hasWhatsapp: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    hasEmail: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
    },
    isActive: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
    },
    needsSurvey: {
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
    personId: {
        type: Sequelize.INTEGER,
        references: {
            model: 'person',
            key: 'personId'
        }
    }
}, {
    timestamps: false,
    freezeTableName: true
});

Company.hasMany(Client, { foreignKey: { name: 'companyId', targetKey: 'companyId' } });
Client.belongsTo(Company, { foreignKey: { name: 'companyId', targetKey: 'companyId' } });

Person.hasMany(Client, { foreignKey: { name: 'personId', targetKey: 'personId' } });
Client.belongsTo(Person, { foreignKey: { name: 'personId', targetKey: 'personId' } });

module.exports = Client;