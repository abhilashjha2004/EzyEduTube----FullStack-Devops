const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Video = sequelize.define('Video', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    videoUrl: {
        type: DataTypes.STRING,
        allowNull: false
    },
    thumbnailUrl: {
        type: DataTypes.STRING,
        allowNull: true
    },
    duration: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    views: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    sourceType: {
        type: DataTypes.ENUM('upload', 'external'),
        defaultValue: 'upload'
    },
    subject: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: 'General'
    },
    orderIndex: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    }
}, {
    timestamps: true,
    tableName: 'videos',
    freezeTableName: true
});

module.exports = Video;