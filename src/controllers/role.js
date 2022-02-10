const Rol = require('../models/Role');
const { response } = require('express');
const { sequelize } = require('../database/connection');

const getRole = async(req, res = response) => {
    return res.status(200).json({
        ok: true,
        msg: 'Hello world'
    });
}

module.exports = {
    getRole
}