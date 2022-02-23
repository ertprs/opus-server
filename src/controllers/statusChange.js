const { response } = require('express');
const { sequelize } = require('../database/connection');

const ServiceOrder = require('../models/ServiceOrder');
const Client = require('../models/Client');
const ServiceStatus = require('../models/ServiceStatus');
const Model = require('../models/Model');
const Person = require('../models/Person');
const ServiceDetail = require('../models/ServiceDetail');
const Service = require('../models/Service');
const Brand = require('../models/Brand');
const StatusChange = require('../models/StatusChange');

const { getUuid } = require('../helpers/uuidGenerator');
const { opusLog } = require('../helpers/log4js');
const { lowerCase, onlyNumbers, trimSpaces } = require('../helpers/stringHandling');
const { getRoleName } = require('../middlewares/roleValidation');
const { opusCrypt, opusDecrypt } = require('../helpers/crypto');

// Language and messages import
const { selectLanguage } = require('../helpers/selectLanguage');
const index = selectLanguage(process.env.APP_LANGUAGE);
const messageFile = require('../data/messages.json');
const entityFile = require('../data/entities.json');

const getServiceOrderByStatusOrder = async(req, res = response) => {
    const companyId = req.user.companyId;

}

module.exports = {
    getServiceOrderByStatusOrder
}