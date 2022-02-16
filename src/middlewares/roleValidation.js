const { response } = require('express');
const Role = require('../models/Role');
const { upperCase } = require('../helpers/stringHandling');

// Language and messages import
const { selectLanguage } = require('../helpers/selectLanguage');
const index = selectLanguage(process.env.APP_LANGUAGE);
const messageFile = require('../data/messages.json');

// Roles: Administrator, User, Company, Test, QA, Development
const adminRole = process.env.USR_ADMIN;
const userRole = process.env.USR_USERS;
const companyRole = process.env.USR_COMPY;

const adminArray = adminRole.split(',');
const userArray = userRole.split(',');
const companyArray = companyRole.split(',');

const adminValidation = async(req, res = response, next) => {
    const roleId = req.user.roleId;
    const result = await validation(adminArray, roleId);
    result === 'DONE' ?
        next() :
        res.status(403).json({
            ok: false,
            msg: messageFile[index].forbiddenRoleAction
        });
}

const companyValidation = async(req, res = response, next) => {
    const roleId = req.user.roleId;
    const result = await validation(companyArray, roleId);
    result === 'DONE' ?
        next() :
        res.status(403).json({
            ok: false,
            msg: messageFile[index].forbiddenRoleAction
        });
}

const userValidation = async(req, res = response, next) => {
    const roleId = req.user.roleId;
    const result = await validation(userArray, roleId);
    result === 'DONE' ?
        next() :
        res.status(403).json({
            ok: false,
            msg: messageFile[index].forbiddenRoleAction
        });
}

const getRoleName = async(roleId) => {
    let roleName = '';
    const roleDB = await Role.findOne({
        where: {
            roleId
        }
    });
    if (roleDB) roleName = roleDB.name;
    return roleName;
}

const validation = async(array, roleId) => {
    let result = '';
    let roleName = await getRoleName(roleId);
    roleName = upperCase(roleName);
    array.includes(roleName) ? result = 'DONE' : result = 'FORBIDDEN';
    return result;
}

module.exports = {
    adminValidation,
    companyValidation,
    userValidation,
    getRoleName
}