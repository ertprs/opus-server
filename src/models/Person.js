const Sequelize = require('sequelize');
const { sequelize } = require('../database/connection');

const Person = sequelize.define('person', {
    personId: {
        type: Sequelize.INTEGER,
        primaryKey: true
    },
    uuid: {
        type: Sequelize.STRING(10),
        allowNull: false,
        unique: true
    },
    names: {
        type: Sequelize.STRING(200),
        allowNull: false
    },
    lastNames: {
        type: Sequelize.STRING(200),
        allowNull: false
    },
    dni: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true
    },
    mobilePhone: {
        type: Sequelize.STRING(100),
        allowNull: false
    },
    email: {
        type: Sequelize.STRING(100),
    },
    address: {
        type: Sequelize.TEXT,
    },
    reference: {
        type: Sequelize.TEXT
    },
    birthdate: {
        type: Sequelize.DATE
    },
    details: {
        type: Sequelize.TEXT
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

module.exports = Person;