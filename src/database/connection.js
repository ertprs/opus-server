const Sequelize = require('sequelize');

let dialect;
let conection;

if (process.env.APP_ENV === 'prod') {
    dialect = {
        ssl: {
            require: true,
            rejectUnauthorized: false
        }
    }
    conection = process.env.DB_PGP
} else {
    dialect = {}
    conection = process.env.DB_PGD
}

// Pre-production
const sequelize = new Sequelize(conection, {
    dialect: 'postgres',
    protocol: 'postgres',
    dialectOptions: dialect,
    pool: {
        max: 5,
        min: 0,
        require: 30000,
        idle: 10000
    },
    logging: false
});


async function connection() {
    try {
        await sequelize.authenticate();
        console.log('Successful connection to database');
    } catch (error) {
        console.log('Cannot connect to database:', error);
    }
}

connection();

module.exports = {
    sequelize
}