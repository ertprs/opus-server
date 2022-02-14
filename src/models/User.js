const Sequelize = require('sequelize');
const { sequelize } = require('../database/connection');
const Company = require('./Company');
const Person = require('./Person');
const Role = require('./Role');

const User = sequelize.define('user', {
    userId: {
        type: Sequelize.INTEGER,
        primaryKey: true
    },
    uuid: {
        type: Sequelize.STRING(10),
        allowNull: false,
        unique: true
    },
    nick: {
        type: Sequelize.STRING(100)
    },
    email: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true
    },
    password: {
        type: Sequelize.STRING(200),
        allowNull: false
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
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
    },
    updatedAt: {
        type: Sequelize.DATE
    },
    deletedAt: {
        type: Sequelize.DATE
    },
    roleId: {
        type: Sequelize.INTEGER,
        references: {
            model: 'role',
            key: 'roleId'
        }
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

Role.hasMany( User, { foreignKey: { name: 'roleId', targetKey: 'roleId' } } );
User.belongsTo( Role, { foreignKey: { name: 'roleId', targetKey: 'roleId' } } );

Company.hasMany( User, {  foreignKey: { name: 'companyId', targetKey: 'companyId' } } );
User.belongsTo( Company, { foreignKey: { name: 'companyId', targetKey: 'companyId' } } );

Person.hasMany( User, { foreignKey: { name: 'personId', targetKey: 'personId' } } );
User.belongsTo( Person, { foreignKey: { name: 'personId', targetKey: 'personId' } } );

module.exports = User;