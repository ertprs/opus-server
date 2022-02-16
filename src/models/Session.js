const Sequelize = require('sequelize');
const { sequelize } = require('../database/connection');
const User = require('./User');

const Session = sequelize.define('session', {
    sessionId: {
        type: Sequelize.INTEGER,
        primaryKey: true
    },
    uuid: {
        type: Sequelize.STRING(10),
        allowNull: false,
        unique: true
    },
    opts: {
        type: Sequelize.TEXT,
        allowNull: false,
    },
    isRenewed: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    activeSince: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
    },
    renewedSince: {
        type: Sequelize.DATE
    },
    details: {
        type: Sequelize.TEXT
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

User.hasMany( Session, { foreignKey: { name: 'userId', targetKey: 'userId' } } );
Session.belongsTo( User, { foreignKey: { name: 'userId', targetKey: 'userId' } } );

module.exports = Session;