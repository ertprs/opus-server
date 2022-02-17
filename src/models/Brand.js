const Sequelize = require('sequelize');
const { sequelize } = require('../database/connection');

const Brand = sequelize.define('brand', {
    brandId: {
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
        allowNull: false,
        unique: true
    },
    shortName: {
        type: Sequelize.STRING(50),
    },
    description: {
        type: Sequelize.TEXT
    },
    url: {
        type: Sequelize.STRING(400)
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
}, {
    timestamps: false,
    freezeTableName: true
});

module.exports = Brand;