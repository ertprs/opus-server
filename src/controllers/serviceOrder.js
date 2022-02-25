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

// Create a new serviceStatus of a device
const createServiceOrder = async(req, res = response) => {
    const {
        observation,
        lockPatron,
        receptionDate,
        receptionHour,
        serialNumber,
        color,
        isRepair,
        techSpecifications,
        problemDescription,
        lockPass,
        advancePayment,
        clientId,
        modelId,
    } = req.body;
    const companyId = req.user.companyId;
    let uuid = getUuid();
    let number = await getOrderNumber();
    try {
        // Validate if the client belongs to company
        const findClient = await Client.findOne({
            where: {
                clientId,
                companyId,
                isActive: true
            }
        });
        if (!findClient) {
            return res.status(400).json({
                ok: false,
                msg: messageFile[index].notFound + entityFile[index].clientLow + messageFile[index].registerInCompany
            });
        }
        // Validate if the status belongs to company
        const findService = await ServiceStatus.findOne({
            where: {
                companyId,
                isActive: true
            }
        });
        if (!findService) {
            return res.status(400).json({
                ok: false,
                msg: messageFile[index].notFound + entityFile[index].serviceStatusLow + messageFile[index].registerInCompany
            });
        }
        // Validate model
        const findModel = await Model.findOne({
            where: {
                isActive: true
            }
        });
        if (!findModel) {
            return res.status(400).json({
                ok: false,
                msg: messageFile[index].notFound + entityFile[index].modelLow
            })
        }
        // Create a new service order
        const newServiceOrder = await ServiceOrder.create({
            uuid,
            number,
            observation,
            lockPatron: lockPatron ? opusCrypt(lockPatron) : undefined,
            receptionDate,
            receptionHour,
            serialNumber,
            color,
            isRepair,
            techSpecifications,
            problemDescription,
            lockPass: lockPass ? opusCrypt(lockPass) : undefined,
            advancePayment,
            clientId,
            modelId,
        }, {
            fields: ['uuid', 'number', 'observation', 'lockPatron', 'receptionDate', 'receptionHour', 'serialNumber', 'color', 'isRepair', 'techSpecifications', 'problemDescription', 'lockPass', 'advancePayment', 'clientId', 'modelId'],
            returning: ['serviceOrderId', 'uuid', 'number', 'observation', 'lockPatron', 'receptionDate', 'receptionHour', 'serialNumber', 'color', 'isRepair', 'techSpecifications', 'problemDescription', 'lockPass', 'advancePayment', 'clientId', 'modelId', 'isActive', 'createdAt']
        });
        // Create the flow in status change table
        await StatusChange.create({
            uuid: getUuid(),
            sysDetail: messageFile[index].statusChageCreated,
            statusId: await getServiceStatusId(companyId),
            serviceOrderId: newServiceOrder.serviceOrderId,
            userId: req.user.userId
        }, {
            fields: ['uuid', 'sysDetail', 'statusId', 'serviceOrderId', 'userId']
        });
        // Return the information
        return res.status(200).json({
            ok: true,
            msg: entityFile[index].serviceOrderUp + messageFile[index].okCreateFemale,
            serviceOrder: newServiceOrder
        });
    } catch (error) {
        console.log('Error:', error);
        opusLog(`Creating serviceStatus [Client:${ clientId }, Model: ${ modelId }]: ${ error }`, 'error');
        return res.status(500).json({
            ok: false,
            msg: messageFile[index].errorCreating + entityFile[index].serviceOrderLow,
            error
        });
    }
}

// Get company service orders
const getActiveServiceOrder = async(req, res = response) => {
    const companyId = req.user.companyId;
    const limit = req.query.limit;
    const offset = req.query.offset;
    try {
        const findServiceOrder = await ServiceOrder.findAndCountAll({
            where: {
                isActive: true
            },
            include: [{
                model: Client,
                attributes: ['uuid', 'clientId', 'personId', 'companyId'],
                where: {
                    companyId
                },
                include: [{
                    model: Person,
                    attributes: ['uuid', 'names', 'lastNames', 'dni', 'mobilePhone', 'email']
                }]
            }, {
                model: Model,
                attributes: ['uuid', 'name', 'shortName', 'img'],
                include: [{
                    model: Brand,
                    attributes: ['uuid', 'name', 'shortName', 'url']
                }]
            }],
            limit,
            offset,
            order: [
                ['receptionDate', 'DESC']
            ]
        });
        console.log('result:', findServiceOrder)
        if (findServiceOrder.count > 0) {
            let serviceOrders = findServiceOrder.rows;
            let ordersToReturn = [];
            // Decipher the information of the people
            for (let i = 0; i < serviceOrders.length; i++) {
                ordersToReturn[i] = {
                    serviceOrderId: serviceOrders[i].serviceOrderId,
                    uuid: serviceOrders[i].uuid,
                    number: serviceOrders[i].number,
                    observation: serviceOrders[i].observation,
                    lockPatron: serviceOrders[i].lockPatron,
                    isFinished: serviceOrders[i].isFinished,
                    receptionDate: serviceOrders[i].receptionDate,
                    receptionHour: serviceOrders[i].receptionHour,
                    serialNumber: serviceOrders[i].serialNumber,
                    color: serviceOrders[i].color,
                    isRepair: serviceOrders[i].isRepair,
                    techSpecifications: serviceOrders[i].techSpecifications,
                    problemDescription: serviceOrders[i].problemDescription,
                    lockPass: serviceOrders[i].lockPass,
                    hasSurvey: serviceOrders[i].hasSurvey,
                    advancePayment: serviceOrders[i].advancePayment,
                    isActive: serviceOrders[i].isActive,
                    createdAt: serviceOrders[i].createdAt,
                    updatedAt: serviceOrders[i].updatedAt,
                    deletedAt: serviceOrders[i].deletedAt,
                    clientId: serviceOrders[i].clientId,
                    modelId: serviceOrders[i].modelId,
                    statusId: serviceOrders[i].statusId,
                    client: {
                        person: {
                            uuid: serviceOrders[i].client.person.uuid,
                            names: serviceOrders[i].client.person.names ? opusDecrypt(serviceOrders[i].client.person.names) : undefined,
                            lastNames: serviceOrders[i].client.person.lastNames ? opusDecrypt(serviceOrders[i].client.person.lastNames) : undefined,
                            dni: serviceOrders[i].client.person.dni ? opusDecrypt(serviceOrders[i].client.person.dni) : undefined,
                            mobilePhone: serviceOrders[i].client.person.mobilePhone ? opusDecrypt(serviceOrders[i].client.person.mobilePhone) : undefined,
                            email: serviceOrders[i].client.person.email ? opusDecrypt(serviceOrders[i].client.person.email) : undefined,
                        }
                    },
                    model: {
                        uuid: serviceOrders[i].model.uuid,
                        name: serviceOrders[i].model.name,
                        shortName: serviceOrders[i].model.shortName,
                        img: serviceOrders[i].model.img,
                        brand: {
                            uuid: serviceOrders[i].model.brand.uuid,
                            name: serviceOrders[i].model.brand.name,
                            shortName: serviceOrders[i].model.brand.shortName,
                            url: serviceOrders[i].model.brand.url
                        }
                    }
                }
            }
            return res.status(200).json({
                ok: true,
                msg: entityFile[index].serviceOrderPluralUp + messageFile[index].okGotFemalePlural,
                serviceOrders: {
                    count: findServiceOrder.count,
                    rows: ordersToReturn
                }
            });
        } else {
            return res.status(404).json({
                ok: false,
                msg: messageFile[index].notFound + entityFile[index].serviceOrderPluralLow
            });
        }
    } catch (error) {
        console.log('Error:', error);
        opusLog(`Getting active service orders companay [${ companyId }]: ${ error }`, 'error');
        return res.status(500).json({
            ok: false,
            msg: messageFile[index].errorGetting + entityFile[index].serviceOrderPluralLow,
            error
        });
    }
}

// Get company service orders
const getAllActiveServiceOrders = async(req, res = response) => {
    const limit = req.query.limit;
    const offset = req.query.offset;
    try {
        const findServiceOrder = await ServiceOrder.findAndCountAll({
            include: [{
                model: Client,
                attributes: ['uuid', 'clientId', 'personId', 'companyId'],
                include: [{
                    model: Person,
                    attributes: ['uuid', 'names', 'lastNames', 'dni', 'mobilePhone', 'email']
                }]
            }, {
                model: Model,
                attributes: ['uuid', 'name', 'shortName', 'img'],
                include: [{
                    model: Brand,
                    attributes: ['uuid', 'name', 'shortName', 'url']
                }]
            }],
            limit,
            offset,
            order: [
                ['receptionDate', 'DESC']
            ]
        });
        if (findServiceOrder.count > 0) {
            let serviceOrders = findServiceOrder.rows;
            let ordersToReturn = [];
            // Decipher the information of the people
            for (let i = 0; i < serviceOrders.length; i++) {
                ordersToReturn[i] = {
                    serviceOrderId: serviceOrders[i].serviceOrderId,
                    uuid: serviceOrders[i].uuid,
                    number: serviceOrders[i].number,
                    observation: serviceOrders[i].observation,
                    lockPatron: serviceOrders[i].lockPatron,
                    isFinished: serviceOrders[i].isFinished,
                    receptionDate: serviceOrders[i].receptionDate,
                    receptionHour: serviceOrders[i].receptionHour,
                    serialNumber: serviceOrders[i].serialNumber,
                    color: serviceOrders[i].color,
                    isRepair: serviceOrders[i].isRepair,
                    techSpecifications: serviceOrders[i].techSpecifications,
                    problemDescription: serviceOrders[i].problemDescription,
                    lockPass: serviceOrders[i].lockPass,
                    hasSurvey: serviceOrders[i].hasSurvey,
                    advancePayment: serviceOrders[i].advancePayment,
                    isActive: serviceOrders[i].isActive,
                    createdAt: serviceOrders[i].createdAt,
                    updatedAt: serviceOrders[i].updatedAt,
                    deletedAt: serviceOrders[i].deletedAt,
                    clientId: serviceOrders[i].clientId,
                    modelId: serviceOrders[i].modelId,
                    statusId: serviceOrders[i].statusId,
                    client: {
                        person: {
                            uuid: serviceOrders[i].client.person.uuid,
                            names: serviceOrders[i].client.person.names ? opusDecrypt(serviceOrders[i].client.person.names) : undefined,
                            lastNames: serviceOrders[i].client.person.lastNames ? opusDecrypt(serviceOrders[i].client.person.lastNames) : undefined,
                            dni: serviceOrders[i].client.person.dni ? opusDecrypt(serviceOrders[i].client.person.dni) : undefined,
                            mobilePhone: serviceOrders[i].client.person.mobilePhone ? opusDecrypt(serviceOrders[i].client.person.mobilePhone) : undefined,
                            email: serviceOrders[i].client.person.email ? opusDecrypt(serviceOrders[i].client.person.email) : undefined,
                        }
                    },
                    model: {
                        uuid: serviceOrders[i].model.uuid,
                        name: serviceOrders[i].model.name,
                        shortName: serviceOrders[i].model.shortName,
                        img: serviceOrders[i].model.img,
                        brand: {
                            uuid: serviceOrders[i].model.brand.uuid,
                            name: serviceOrders[i].model.brand.name,
                            shortName: serviceOrders[i].model.brand.shortName,
                            url: serviceOrders[i].model.brand.url
                        }
                    }
                }
            }
            return res.status(200).json({
                ok: true,
                msg: entityFile[index].serviceOrderPluralUp + messageFile[index].okGotFemalePlural,
                serviceOrders: {
                    count: findServiceOrder.count,
                    rows: ordersToReturn
                }
            });
        } else {
            return res.status(404).json({
                ok: false,
                msg: messageFile[index].notFound + entityFile[index].serviceOrderPluralLow
            });
        }
    } catch (error) {
        console.log('Error:', error);
        opusLog(`Getting all service orders companay [${ companyId }]: ${ error }`, 'error');
        return res.status(500).json({
            ok: false,
            msg: messageFile[index].errorGetting + entityFile[index].serviceOrderPluralLow,
            error
        });
    }
}

// Update a service order
const updateServiceOrder = async(req, res = response) => {
    // Validate if is admin/user to update the service order only for their companies (user) of any (admin)
    let companyId = req.user.companyId;
    let serviceOrderId = req.params.id;
    let roleId = req.user.roleId;
    let searchCondition = {};
    const {
        observation,
        lockPatron,
        receptionDate,
        receptionHour,
        serialNumber,
        color,
        isRepair,
        techSpecifications,
        problemDescription,
        lockPass,
        advancePayment,
        clientId,
        modelId
    } = req.body;
    // Validate if a required value comes with nulled values
    if (observation === '' || problemDescription === '' || clientId === '' || modelId === '') {
        return res.status(400).json({
            ok: false,
            msg: messageFile[index].mandatoryMissing
        });
    }
    try {
        // If the user is an administrator, cannot validate the company
        const roleName = await getRoleName(roleId);
        if (lowerCase(roleName) !== lowerCase(process.env.USR_ADMIN)) {
            searchCondition = {
                where: {
                    isActive: true,
                    serviceOrderId,
                },
                include: [{
                    model: Client,
                    where: {
                        companyId
                    }
                }]
            }

        } else {
            searchCondition = {
                where: {
                    serviceOrderId
                }
            }
        }
        const findServiceOrder = await ServiceOrder.findOne(searchCondition);
        if (findServiceOrder === undefined || findServiceOrder === null || !findServiceOrder) {
            return res.status(400).json({
                ok: false,
                msg: messageFile[index].notFound + entityFile[index].serviceOrderLow + messageFile[index].registerInCompany
            });
        }
        // Update the service order
        await ServiceOrder.update({
            observation,
            lockPatron: lockPatron ? opusCrypt(lockPatron) : undefined,
            receptionDate,
            receptionHour,
            serialNumber,
            color,
            isRepair,
            techSpecifications,
            problemDescription,
            lockPass: lockPass ? opusCrypt(lockPass) : undefined,
            advancePayment,
            clientId,
            modelId,
            updatedAt: sequelize.literal('CURRENT_TIMESTAMP')
        }, {
            where: {
                serviceOrderId
            }
        });
        // Return successfully message
        return res.status(200).json({
            ok: true,
            msg: entityFile[index].serviceOrderUp + messageFile[index].okUpdateFemale
        });
    } catch (error) {
        console.log('Error:', error);
        opusLog(`Updating service order [${ serviceOrderId }]: ${ error }`, 'error');
        return res.status(500).json({
            ok: false,
            msg: messageFile[index].errorUpdating + entityFile[index].serviceOrderLow,
            error
        });
    }
}

// Change status of a service order
const changeServiceOrderStatus = async(req, res = response) => {
    const serviceOrderId = req.params.id;
    const type = req.query.type || false;
    const roleId = req.user.roleId;
    const companyId = req.user.companyId;
    let changeAction;
    let action;
    let activation;
    let searchCondition;
    if (!type) {
        return res.status(400).json({
            ok: false,
            msg: entityFile[index].typeUp + messageFile[index].notParam
        });
    }
    if (type.toLowerCase() === 'on') {
        activation = true;
        action = entityFile[index].serviceOrderUp + messageFile[index].changeStatusActionOnFemale
        changeAction = {
            isActive: true,
            updatedAt: sequelize.literal('CURRENT_TIMESTAMP'),
            deletedAt: null
        }
    } else {
        if (type.toLowerCase() === 'off') {
            activation = false;
            action = entityFile[index].serviceOrderUp + messageFile[index].changeStatusActionOffFemale
            changeAction = {
                isActive: false,
                updatedAt: sequelize.literal('CURRENT_TIMESTAMP'),
                deletedAt: sequelize.literal('CURRENT_TIMESTAMP')
            }
        } else {
            return res.status(400).json({
                ok: false,
                msg: type + messageFile[index].invalidParam
            });
        }
    }
    try {
        const roleName = await getRoleName(roleId);
        if (lowerCase(roleName) !== lowerCase(process.env.USR_ADMIN)) {
            searchCondition = {
                where: {
                    serviceOrderId,
                    isActive: !activation,
                },
                include: [{
                    model: Client,
                    where: {
                        companyId
                    }
                }]
            }
        } else {
            searchCondition = {
                where: {
                    serviceOrderId,
                    isActive: !activation
                }
            }
        }
    } catch (error) {
        console.log('Error:', error);
        opusLog(`Changing service order status  [${ serviceOrderId }/${ activation }] role not found: ${ error }`, 'error');
        return res.status(500).json({
            ok: false,
            msg: `${ messageFile[index].errorChangeStatus } ${ entityFile[index].serviceOrderLow }`
        });
    }
    try {
        const findServiceOrder = await ServiceOrder.findOne(searchCondition);
        if (!findServiceOrder) {
            return res.status(404).json({
                ok: false,
                msg: `${ messageFile[index].notFound }${ entityFile[index].serviceOrderLow }${ activation ? messageFile[index].alreadyActive : messageFile[index].alreadyInctive}`
            });
        }
        await ServiceOrder.update(
            changeAction, searchCondition
        );
        return res.status(200).json({
            ok: true,
            msg: action,
        });
    } catch (error) {
        console.log('Error:', error);
        opusLog(`Changing service order  [${ serviceOrderId }/${ activation }]: ${ error }`, 'error');
        return res.status(500).json({
            ok: false,
            msg: messageFile[index].errorChangeStatus
        });
    }
}

// Delete a service order (physical deletion)
const deleteServiceOrder = async(req, res = response) => {
    const serviceOrderId = req.params.id;
    try {
        const deletedServiceOder = await ServiceOrder.destroy({
            where: {
                serviceOrderId
            }
        });
        if (deletedServiceOder > 0) {
            return res.status(200).json({
                ok: true,
                msg: entityFile[index].serviceOrderUp + messageFile[index].okDeleteFemale
            });
        } else {
            return res.status(404).json({
                ok: false,
                msg: messageFile[index].notFound + entityFile[index].serviceOrderLow
            })
        }
    } catch (error) {
        console.log('Error:', error);
        opusLog(`Deleting service order [${ serviceOrderId }]: ${ error }`, 'error');
        return res.status(500).json({
            ok: false,
            msg: messageFile[index].errorDeleting + entityFile[index].serviceOrderLow
        });
    }
}

// Get the actual service order with details
const getPendingServiceOrders = async(req, res = response) => {
    const companyId = req.user.companyId;
    const limit = req.query.limit || 20;
    const offset = req.query.offset || 0;
    try {
        const findPendingCount = await sequelize.query(`
            SELECT COUNT(*)
            FROM "serviceOrder" srv, "client" clt, "person" prs, "model" mdl, "brand" brd
            WHERE srv."clientId" = clt."clientId"
                AND clt."personId" = prs."personId"
                AND srv."modelId" = mdl."modelId"
                AND brd."brandId" = mdl."brandId"
                AND clt."companyId" = ${ companyId }
                AND srv."isFinished" = false
                AND srv."isActive" = true;
        `);
        const count = Number(findPendingCount[0][0].count);
        if (count > 0) {
            const findingPending = await sequelize.query(`
                SELECT	srv."serviceOrderId",
                        srv."uuid" "serviceUuid",
                        srv."number",
                        srv."lockPatron",
                        srv."isFinished",
                        srv."receptionDate",
                        srv."receptionHour",
                        srv."serialNumber",
                        srv."color",
                        srv."isRepair",
                        srv."techSpecifications",
                        srv."problemDescription",
                        srv."lockPass",
                        srv."hasSurvey",
                        srv."isActive",
                        srv."createdAt",
                        srv."updatedAt",
                        srv."deletedAt",
                        srv."clientId",
                        srv."modelId",
                        srv."statusId",
                        clt."uuid" "clientUuid",
                        clt."servicesNumber",
                        clt."details",
                        clt."isActive",
                        clt."hasWhatsapp",
                        clt."hasEmail",
                        clt."personId",
                        prs."uuid" "personUuid",
                        prs."names",
                        prs."lastNames",
                        prs."dni",
                        prs."phone",
                        prs."mobilePhone",
                        prs."email",
                        prs."isActive",
                        mdl."name",
                        mdl."shortName",
                        mdl."img",
                        mdl."url",
                        brd."name" "brandName",
                        brd."shortName" "brandShortName",
                        brd."url" "brandUrl"
                FROM "serviceOrder" srv, "client" clt, "person" prs, "model" mdl, "brand" brd
                WHERE srv."clientId" = clt."clientId"
                    AND clt."personId" = prs."personId"
                    AND srv."modelId" = mdl."modelId"
                    AND brd."brandId" = mdl."brandId"
                    AND clt."companyId" = ${ companyId }
                    AND srv."isFinished" = false
                    AND srv."isActive" = true
                ORDER BY srv."receptionDate", srv."receptionHour" ASC
                LIMIT ${ limit }
                OFFSET ${ offset };
            `);
            const resultArray = findingPending[0];
            let serviceOrders = [];
            for (let i = 0; i < resultArray.length; i++) {
                serviceOrders[i] = {
                    serviceOrderId: resultArray[i].serviceOrderId,
                    uuid: resultArray[i].serviceUuid,
                    number: resultArray[i].number,
                    lockPatron: resultArray[i].lockPatron ? opusDecrypt(resultArray[i].lockPatron) : undefined,
                    isFinished: resultArray[i].isFinished,
                    receptionDate: resultArray[i].receptionDate,
                    receptionHour: resultArray[i].receptionHour,
                    serialNumber: resultArray[i].serialNumber,
                    color: resultArray[i].color,
                    isRepair: resultArray[i].isRepair,
                    techSpecifications: resultArray[i].techSpecifications,
                    problemDescription: resultArray[i].problemDescription,
                    lockPass: resultArray[i].lockPass ? opusDecrypt(resultArray[i].lockPass) : undefined,
                    hasSurvey: resultArray[i].hasSurvey,
                    isActive: resultArray[i].isActive,
                    createdAt: resultArray[i].createdAt,
                    updatedAt: resultArray[i].updatedAt,
                    deletedAt: resultArray[i].deletedAt,
                    clientId: resultArray[i].clientId,
                    modelId: resultArray[i].modelId,
                    statusId: resultArray[i].statusId,
                    model: {
                        name: resultArray[i].name,
                        shortName: resultArray[i].shortName,
                        img: resultArray[i].img,
                        url: resultArray[i].url,
                        brand: {
                            name: resultArray[i].brandName,
                            shortName: resultArray[i].brandShortName,
                            url: resultArray[i].brandUrl,
                        },
                    },
                    client: {
                        uuid: resultArray[i].clientUuid,
                        servicesNumber: resultArray[i].servicesNumber,
                        details: resultArray[i].details,
                        isActive: resultArray[i].isActive,
                        hasWhatsapp: resultArray[i].hasWhatsapp,
                        hasEmail: resultArray[i].hasEmail,
                        personId: resultArray[i].personId,
                        person: {
                            uuid: resultArray[i].personUuid,
                            names: resultArray[i].names ? opusDecrypt(resultArray[i].names) : undefined,
                            lastNames: resultArray[i].lastNames ? opusDecrypt(resultArray[i].lastNames) : undefined,
                            dni: resultArray[i].dni ? opusDecrypt(resultArray[i].dni) : undefined,
                            phone: resultArray[i].phone ? opusDecrypt(resultArray[i].phone) : undefined,
                            mobilePhone: resultArray[i].mobilePhone ? opusDecrypt(resultArray[i].mobilePhone) : undefined,
                            email: resultArray[i].email ? opusDecrypt(resultArray[i].email) : undefined,
                            isActive: resultArray[i].isActive,
                        }
                    }
                }
            }
            return res.status(200).json({
                ok: true,
                msg: entityFile[index].serviceOrderPluralUp + messageFile[index].okGotMalePlural,
                pending: {
                    count,
                    serviceOrders
                }
            });
        } else {
            return res.status(404).json({
                ok: false,
                msg: messageFile[index].notFound + entityFile[index].serviceOrderPluralLow
            });
        }
    } catch (error) {
        console.log('Error:', error);
        opusLog(`Getting pending service order [${ serviceOrderId }]: ${ error }`, 'error');
        return res.status(500).json({
            ok: false,
            msg: messageFile[index].errorGetting + entityFile[index].serviceOrderLow
        });
    }
}

// Get client service order with details (by order number)
const getCompleteServiceOrder = async(req, res = response) => {
    const order = req.query.order;
    const companyId = req.user.companyId;
    try {
        const findCompleteOrderCount = await sequelize.query(`
            SELECT COUNT(*)
            FROM "serviceOrder" srv, "client" clt, "person" prs, "model" mdl, "brand" brd
            WHERE srv."clientId" = clt."clientId"
                AND clt."personId" = prs."personId"
                AND srv."modelId" = mdl."modelId"
                AND brd."brandId" = mdl."brandId"
                AND clt."companyId" = ${ companyId }
                AND srv."isFinished" = false
                AND srv."isActive" = true
                AND srv."number" = ${ order }
        `);
        const count = Number(findCompleteOrderCount[0][0].count);
        if (count > 0) {
            const findServiceOrder = await sequelize.query(`
                SELECT	srv."serviceOrderId",
                        srv."uuid" "serviceUuid",
                        srv."number",
                        srv."lockPatron",
                        srv."isFinished",
                        srv."receptionDate",
                        srv."receptionHour",
                        srv."serialNumber",
                        srv."color",
                        srv."isRepair",
                        srv."techSpecifications",
                        srv."problemDescription",
                        srv."lockPass",
                        srv."hasSurvey",
                        srv."isActive",
                        srv."createdAt",
                        srv."updatedAt",
                        srv."deletedAt",
                        srv."clientId",
                        srv."modelId",
                        srv."statusId",
                        clt."uuid" "clientUuid",
                        clt."servicesNumber",
                        clt."details",
                        clt."isActive",
                        clt."hasWhatsapp",
                        clt."hasEmail",
                        clt."personId",
                        prs."uuid" "personUuid",
                        prs."names",
                        prs."lastNames",
                        prs."dni",
                        prs."phone",
                        prs."mobilePhone",
                        prs."email",
                        prs."isActive",
                        mdl."name",
                        mdl."shortName",
                        mdl."img",
                        mdl."url",
                        brd."name" "brandName",
                        brd."shortName" "brandShortName",
                        brd."url" "brandUrl"
                FROM "serviceOrder" srv, "client" clt, "person" prs, "model" mdl, "brand" brd
                WHERE srv."clientId" = clt."clientId"
                    AND clt."personId" = prs."personId"
                    AND srv."modelId" = mdl."modelId"
                    AND brd."brandId" = mdl."brandId"
                    AND clt."companyId" = ${ companyId } 
                    AND srv."isFinished" = false
                    AND srv."isActive" = true
                    AND srv."number" = ${ order };
            `);
            const result = findServiceOrder[0][0];
            const findDetails = await ServiceDetail.findAndCountAll({
                where: {
                    serviceOrderId: result.serviceOrderId
                },
                include: [{
                    model: Service
                }]
            });
            let serviceOrder = {
                serviceOrderId: result.serviceOrderId,
                uuid: result.serviceUuid,
                number: result.number,
                lockPatron: result.lockPatron ? opusDecrypt(result.lockPatron) : undefined,
                isFinished: result.isFinished,
                receptionDate: result.receptionDate,
                receptionHour: result.receptionHour,
                serialNumber: result.serialNumber,
                color: result.color,
                isRepair: result.isRepair,
                techSpecifications: result.techSpecifications,
                problemDescription: result.problemDescription,
                lockPass: result.lockPass ? opusDecrypt(result.lockPass) : undefined,
                hasSurvey: result.hasSurvey,
                isActive: result.isActive,
                createdAt: result.createdAt,
                updatedAt: result.updatedAt,
                deletedAt: result.deletedAt,
                clientId: result.clientId,
                modelId: result.modelId,
                statusId: result.statusId,
                model: {
                    name: result.name,
                    shortName: result.shortName,
                    img: result.img,
                    url: result.url,
                    brand: {
                        name: result.brandName,
                        shortName: result.brandShortName,
                        url: result.brandUrl,
                    },
                },
                client: {
                    uuid: result.clientUuid,
                    servicesNumber: result.servicesNumber,
                    details: result.details,
                    isActive: result.isActive,
                    hasWhatsapp: result.hasWhatsapp,
                    hasEmail: result.hasEmail,
                    personId: result.personId,
                    person: {
                        uuid: result.personUuid,
                        names: result.names ? opusDecrypt(result.names) : undefined,
                        lastNames: result.lastNames ? opusDecrypt(result.lastNames) : undefined,
                        dni: result.dni ? opusDecrypt(result.dni) : undefined,
                        phone: result.phone ? opusDecrypt(result.phone) : undefined,
                        mobilePhone: result.mobilePhone ? opusDecrypt(result.mobilePhone) : undefined,
                        email: result.email ? opusDecrypt(result.email) : undefined,
                        isActive: result.isActive,
                    }
                },
                details: findDetails.rows
            };
            return res.status(200).json({
                ok: true,
                msg: entityFile[index].serviceOrderUp + messageFile[index].okGotMale,
                serviceOrder: {
                    count,
                    serviceOrder
                }
            });
        } else {
            return res.status(404).json({
                ok: false,
                msg: messageFile[index].notFound + entityFile[index].serviceOrderLow
            });
        }
    } catch (error) {
        console.log('Error:', error);
        opusLog(`Getting complete service order [${ order }]: ${ error }`, 'error');
        return res.status(500).json({
            ok: false,
            msg: messageFile[index].errorGetting + entityFile[index].serviceOrderLow
        });
    }
}

// Get service order of a client (by dni)
const getClientServiceOrderByDni = async(req, res = response) => {
    const dni = req.query.dni;
    const companyId = req.user.companyId;
    const limit = req.query.limit || 20;
    const offset = req.query.offset || 0;
    if (!dni || dni === '' || dni.length < 10) {
        return res.status(400).json({
            ok: false,
            msg: entityFile[index].dniUp + messageFile[index].invalidParam
        });
    }
    try {
        console.log(opusCrypt(dni));
        console.log('companyId:', companyId);
        const findClientOrdersCount = await sequelize.query(`
            SELECT COUNT(*)
            FROM "serviceOrder" srv, "client" clt, "person" prs, "model" mdl, "brand" brd
                WHERE srv."clientId" = clt."clientId"
                    AND clt."personId" = prs."personId"
                    AND srv."modelId" = mdl."modelId"
                    AND brd."brandId" = mdl."brandId"
                    AND clt."companyId" = ${ companyId } 
                    AND srv."isFinished" = false
                    AND srv."isActive" = true
                    AND prs."dni" like '${ opusCrypt(onlyNumbers(trimSpaces(dni))) }'
        `);
        const count = Number(findClientOrdersCount[0][0].count);
        console.log('count:', count)
        if (count > 0) {
            const findClientOrders = await sequelize.query(`
                SELECT	srv."serviceOrderId",
                        srv."uuid" "serviceUuid",
                        srv."number",
                        srv."lockPatron",
                        srv."isFinished",
                        srv."receptionDate",
                        srv."receptionHour",
                        srv."serialNumber",
                        srv."color",
                        srv."isRepair",
                        srv."techSpecifications",
                        srv."problemDescription",
                        srv."lockPass",
                        srv."hasSurvey",
                        srv."isActive",
                        srv."createdAt",
                        srv."updatedAt",
                        srv."deletedAt",
                        srv."clientId",
                        srv."modelId",
                        srv."statusId",
                        clt."uuid" "clientUuid",
                        clt."servicesNumber",
                        clt."details",
                        clt."isActive",
                        clt."hasWhatsapp",
                        clt."hasEmail",
                        clt."personId",
                        prs."uuid" "personUuid",
                        prs."names",
                        prs."lastNames",
                        prs."dni",
                        prs."phone",
                        prs."mobilePhone",
                        prs."email",
                        prs."isActive",
                        mdl."name",
                        mdl."shortName",
                        mdl."img",
                        mdl."url",
                        brd."name" "brandName",
                        brd."shortName" "brandShortName",
                        brd."url" "brandUrl"
                FROM "serviceOrder" srv, "client" clt, "person" prs, "model" mdl, "brand" brd
                WHERE srv."clientId" = clt."clientId"
                    AND clt."personId" = prs."personId"
                    AND srv."modelId" = mdl."modelId"
                    AND brd."brandId" = mdl."brandId"
                    AND clt."companyId" = ${ companyId } 
                    AND srv."isFinished" = false
                    AND srv."isActive" = true
                    AND prs."dni" like '${ opusCrypt(onlyNumbers(trimSpaces(dni))) }'
                ORDER BY srv."receptionDate" DESC
                LIMIT ${ limit }
                OFFSET ${ offset };	
            `);
            const resultArray = findClientOrders[0];
            let client = {
                uuid: resultArray[0].clientUuid,
                servicesNumber: resultArray[0].servicesNumber,
                details: resultArray[0].details,
                isActive: resultArray[0].isActive,
                hasWhatsapp: resultArray[0].hasWhatsapp,
                hasEmail: resultArray[0].hasEmail,
                personId: resultArray[0].personId,
                person: {
                    uuid: resultArray[0].personUuid,
                    names: resultArray[0].names ? opusDecrypt(resultArray[0].names) : undefined,
                    lastNames: resultArray[0].lastNames ? opusDecrypt(resultArray[0].lastNames) : undefined,
                    dni: resultArray[0].dni ? opusDecrypt(resultArray[0].dni) : undefined,
                    phone: resultArray[0].phone ? opusDecrypt(resultArray[0].phone) : undefined,
                    mobilePhone: resultArray[0].mobilePhone ? opusDecrypt(resultArray[0].mobilePhone) : undefined,
                    email: resultArray[0].email ? opusDecrypt(resultArray[0].email) : undefined,
                    isActive: resultArray[0].isActive,
                }
            }
            let serviceOrders = [];
            for (let i = 0; i < resultArray.length; i++) {
                const findDetails = await ServiceDetail.findAndCountAll({
                    attributes: ['uuid', 'cost', 'balance', 'details', ],
                    where: {
                        serviceOrderId: resultArray[i].serviceOrderId
                    },
                    include: [{
                        model: Service,
                        attributes: ['uuid', 'name', 'price', 'detail']
                    }]
                });
                serviceOrders[i] = {
                    serviceOrderId: resultArray[i].serviceOrderId,
                    uuid: resultArray[i].serviceUuid,
                    number: resultArray[i].number,
                    lockPatron: resultArray[i].lockPatron ? opusDecrypt(resultArray[i].lockPatron) : undefined,
                    isFinished: resultArray[i].isFinished,
                    receptionDate: resultArray[i].receptionDate,
                    receptionHour: resultArray[i].receptionHour,
                    serialNumber: resultArray[i].serialNumber,
                    color: resultArray[i].color,
                    isRepair: resultArray[i].isRepair,
                    techSpecifications: resultArray[i].techSpecifications,
                    problemDescription: resultArray[i].problemDescription,
                    lockPass: resultArray[i].lockPass ? opusDecrypt(resultArray[i].lockPass) : undefined,
                    hasSurvey: resultArray[i].hasSurvey,
                    isActive: resultArray[i].isActive,
                    createdAt: resultArray[i].createdAt,
                    updatedAt: resultArray[i].updatedAt,
                    deletedAt: resultArray[i].deletedAt,
                    clientId: resultArray[i].clientId,
                    modelId: resultArray[i].modelId,
                    statusId: resultArray[i].statusId,
                    model: {
                        name: resultArray[i].name,
                        shortName: resultArray[i].shortName,
                        img: resultArray[i].img,
                        url: resultArray[i].url,
                        brand: {
                            name: resultArray[i].brandName,
                            shortName: resultArray[i].brandShortName,
                            url: resultArray[i].brandUrl,
                        },
                    },
                    serviceDetails: findDetails.rows
                }
            }
            return res.status(200).json({
                ok: true,
                msg: entityFile[index].serviceOrderPluralUp + messageFile[index].okGotMalePlural,
                serviceOrders: {
                    count,
                    client,
                    serviceOrders
                }
            });
        } else {
            return res.status(404).json({
                ok: false,
                msg: messageFile[index].notFound + entityFile[index].serviceOrderLow
            });
        }
    } catch (error) {
        console.log('Error:', error);
        opusLog(`Getting historical service order by client [${ dni }]: ${ error }`, 'error');
        return res.status(500).json({
            ok: false,
            msg: messageFile[index].errorGetting + entityFile[index].serviceOrderLow
        });
    }
}

// Get order number
const getOrderNumber = async() => {
    try {
        const findOrderNumber = await ServiceOrder.count();
        return Number(findOrderNumber) + 1;
    } catch (error) {
        console.log('Error:', error);
        opusLog(`Getting order number [#]: ${ error }`, 'error');
        return res.status(500).json({
            ok: false,
            msg: messageFile[index].errorCreating + ' order number',
            error
        });
    }
}

// Get the number of first service for a company
const getServiceStatusId = async(companyId) => {
    if( !companyId ){
        return -1;
    }
    try {
        const getFirstStatusId = await ServiceStatus.min('statusId', {
            where: {
                companyId,
                isActive: true
            }
        });
        return getFirstStatusId;
    } catch (error) {
        console.log('Error:', error);
        opusLog(`Getting service status [${ companyId }]: ${ error }`, 'error');
        return res.status(500).json({
            ok: false,
            msg: messageFile[index].errorGetting + entityFile[index].serviceStatusLow,
            error
        });
    }
}

module.exports = {
    createServiceOrder,
    getActiveServiceOrder,
    getAllActiveServiceOrders,
    updateServiceOrder,
    changeServiceOrderStatus,
    deleteServiceOrder,
    getPendingServiceOrders,
    getCompleteServiceOrder,
    getClientServiceOrderByDni
}