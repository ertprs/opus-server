const Sequelize = require('sequelize');
const { sequelize } = require('../database/connection');
const ServiceOrder = require('./ServiceOrder');
const ServiceStatus = require('./ServiceStatus');
const User = require('./User');

const StatusChange = sequelize.define('statusChange', {
    statusChangeId: {
        type: Sequelize.INTEGER,
        primaryKey: true
    },
    uuid: {
        type: Sequelize.STRING(10),
        allowNull: false,
        unique: true
    },
    details: {
        type: Sequelize.TEXT
    },
    isCompleted: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false
    },
    isActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        allowNull: false
    },
    createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
    },
    sysDetail: {
        type: Sequelize.TEXT
    },
    statusId: {
        type: Sequelize.INTEGER,
        references: {
            model: 'status',
            key: 'statusId'
        }
    },
    serviceOrderId: {
        type: Sequelize.INTEGER,
        references: {
            model: 'serviceOrder',
            key: 'serviceOrderId'
        }
    },
    userId: {
        type: Sequelize.INTEGER,
        references: {
            model: 'user',
            key: 'userId'
        }
    }
}, {
    timestamps: false,
    freezeTableName: true
});

ServiceStatus.hasMany(StatusChange, { foreignKey: { name: 'statusId', targetKey: 'statusId' } });
StatusChange.belongsTo(ServiceStatus, { foreignKey: { name: 'statusId', targetKey: 'statusId' } });

ServiceOrder.hasMany(StatusChange, { foreignKey: { name: 'serviceOrderId', targetKey: 'serviceOrderId' } });
StatusChange.belongsTo(ServiceOrder, { foreignKey: { name: 'serviceOrderId', targetKey: 'serviceOrderId' } });

User.hasMany(StatusChange, { foreignKey: { name: 'userId', targetKey: 'userId' } });
StatusChange.belongsTo(User, { foreignKey: { name: 'userId', targetKey: 'userId' } });

module.exports = StatusChange;