const Sequelize = require('sequelize');
const { sequelize } = require('../database/connection');
const Service = require('./Service');
const ServiceOrder = require('./ServiceOrder');

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
    },
    serviceId: {
        type: Sequelize.INTEGER,
        references: {
            model: 'service',
            key: 'serviceId'
        }
    },
    serviceOrderId: {
        type: Sequelize.INTEGER,
        references: {
            model: 'serviceOrder',
            key: 'serviceOrderId'
        }
    }
}, {
    timestamps: false,
    freezeTableName: true
});

Service.hasMany( ServiceDetail, { foreignKey: { name: 'serviceId', targetKey: 'serviceId' } } );
ServiceDetail.belongsTo( Service, { foreignKey: { name: 'serviceId', targetKey: 'serviceId' } } );

ServiceOrder.hasMany( ServiceDetail, { foreignKey: { name: 'serviceId', targetKey: 'serviceId' } } );
ServiceDetail.belongsTo( ServiceOrder, { foreignKey: { name: 'serviceId', targetKey: 'serviceId' } } );

module.exports = ServiceDetail;