const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');

dotenv.config({
    path: process.env.DOCKER_ENV ? '.env.docker' : '.env'
});

console.log('Using DB Host:', process.env.DB_HOST);

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER || 'root',
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT || 3306,
        dialect: 'mysql',
        logging: false,

        dialectOptions:
            process.env.DB_SSL === 'false'
                ? undefined
                : {
                    ssl: {
                        require: true,
                        rejectUnauthorized: false
                    }
                },

        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        }
    }
);

module.exports = sequelize;