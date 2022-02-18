const Sequelize = require('sequelize');
const { sequelize } = require('../database/connection');
const Brand = require('./Brand');

const Model = sequelize.define('model', {
    modelId: {
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
    description: {
        type: Sequelize.TEXT
    },
    shortName: {
        type: Sequelize.STRING(50)
    },
    techSpecification: {
        type: Sequelize.TEXT
    },
    img: {
        type: Sequelize.STRING(400)
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
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
    },
    updatedAt: {
        type: Sequelize.DATE
    },
    deletedAt: {
        type: Sequelize.DATE
    },
    brandId: {
        type: Sequelize.INTEGER,
        references: {
            model: 'brand',
            key: 'brandId'
        }
    },
}, {
    timestamps: false,
    freezeTableName: true
});

Brand.hasMany(Model, { foreighnKey: { name: 'brandId', targetKey: 'brandId' } });
Model.belongsTo(Brand, { foreignKey: { name: 'brandId', targetKey: 'brandId' } });

module.exports = Model;