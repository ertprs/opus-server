const Sequelize = require('sequelize');
const { sequelize } = require('../database/connection');

const Role = sequelize.define('role', {
    roleId: {
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
        type: Sequelize.STRING(100),
        required: true,
        allowNull: false
    },
    description: {
        type: Sequelize.TEXT,
        required: true,
        allowNull: false
    },
    elevation: {
        type: Sequelize.SMALLINT,
        allowNull: false,
        defaultValue: 0
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
    options: {
        type: Sequelize.JSON
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

module.exports = Role;