const { response } = require('express');
const { sequelize } = require('../database/connection');

const ServiceOrder = require('../models/ServiceOrder');
const Client = require('../models/Client');
const ServiceStatus = require('../models/ServiceStatus');
const Role = require('../models/Role');
const Person = require('../models/Person');
const User = require('../models/User');
const Model = require('../models/Model');
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

// Get all order status by the order in the service flow
const getServiceOrderByStatusOrder = async(req, res = response) => {
    const companyId = req.user.companyId;
    const order = req.query.order;
    const limit = req.query.limit || 20;
    const offset = req.query.offset || 0;
    // Validate query params, if not be an order of status, return null
    if( !order ) {
        return res.status(400).json({
            ok: false,
            msg: 'Order' + messageFile[index].notParam
        });
    }
    try {
        // Validate if the server status belongs to the company, and its active
        const companyServiceStatus = await ServiceStatus.findOne({
            where: {
                isActive: true,
                companyId,
                order
            },
        });
        if( !companyServiceStatus ) {
            return res.status(404).json({
                ok: false,
                msg: messageFile[index].notFound + entityFile[index].serviceStatusPluralLow
            });
        }
        const findServiceOrderCount = await sequelize.query(`
            SELECT COUNT(*)
            FROM    "serviceOrder" srv, "statusChange" chg, "client" clt, "person" prs, "model" mdl, "brand" brd, "serviceStatus" sts
            WHERE srv."serviceOrderId" = chg."serviceOrderId"
                AND chg."statusId" = sts."statusId"
                AND srv."clientId" = clt."clientId"
                AND clt."personId" = prs."personId"
                AND srv."modelId" = mdl."modelId"
                AND brd."brandId" = mdl."brandId"
                AND clt."companyId" = ${ companyId } 
                AND srv."isActive" = true
                AND srv."isFinished" = false
                AND chg."isCompleted" = false
                AND chg."isActive" = true
                AND sts."statusId" = ${ companyServiceStatus.statusId }
        `);
        const count = Number(findServiceOrderCount[0][0].count);
        if( count > 0 ) {
            const findServiceOrders = await sequelize.query(`
                SELECT 	srv."serviceOrderId",
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
                FROM    "serviceOrder" srv, "statusChange" chg, "client" clt, "person" prs, "model" mdl, "brand" brd, "serviceStatus" sts
                WHERE srv."serviceOrderId" = chg."serviceOrderId"
                    AND chg."statusId" = sts."statusId"
                    AND srv."clientId" = clt."clientId"
                    AND clt."personId" = prs."personId"
                    AND srv."modelId" = mdl."modelId"
                    AND brd."brandId" = mdl."brandId"
                    AND clt."companyId" = ${ companyId } 
                    AND srv."isActive" = true
                    AND srv."isFinished" = false
                    AND chg."isCompleted" = false
                    AND chg."isActive" = true
                    AND sts."statusId" = ${ companyServiceStatus.statusId }
                ORDER BY srv."receptionDate"
                LIMIT ${ limit }
                OFFSET ${ offset };
            `);
            const resultArray = findServiceOrders[0];
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
                serviceOrders: {
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
        opusLog(`Getting service status changes for company [${ companyId }]: ${ error }`, 'error');
        return res.status(500).json({
            ok: false,
            msg: messageFile[index].errorGetting + entityFile[index].serviceStatusPluralLow
        });
    }
}

// Complete a fase of an order status
const completeAnStatus = async(req, res = response) => {
    const companyId = req.user.companyId;
    const userId = req.user.userId;
    const {
        details,
        serviceOrderId
    } = req.body;
    let statusChanged;
    try {
        // Validate if the order belongs to the company
        const getServiceOder = await ServiceOrder.findOne({
            where: {
                serviceOrderId,
                isActive: true
            },
            include: [{
                model: Client,
                where: {
                    companyId
                }
            }]
        });
        if( !getServiceOder ) {
            return res.status(404).json({
                ok: false,
                msg: messageFile[index].notFound + entityFile[index].serviceOrderLow
            });
        } 
        // 1. Get the order status in change status table
        const getCurrentStatusId = await StatusChange.max('statusId', {
            where: {
                serviceOrderId
            }
        });
        if( !getCurrentStatusId ) {
            return res.status(400).json({
                ok: false,
                msg: messageFile[index].notFound + entityFile[index].serviceOrderLow
            });
        }
        const getCurrentStatus = await ServiceStatus.findOne({
            where: {
                statusId: getCurrentStatusId,
                isActive: true
            }
        });
        // 2. Get the next order status in service status table (if doesn't exist then finish the flow)
        const getNextStatus = await ServiceStatus.findOne({
            where: {
                companyId,
                order: getCurrentStatus.order + 1,
                isActive: true
            }
        });
        // 3. Get the current status changed in the table
        const getCurrentStatusChanged = await StatusChange.findOne({
            where: {
                serviceOrderId,
                statusId: getCurrentStatusId,
                isCompleted: false
            }
        });
        // 4. Update the current state to finished
        await StatusChange.update({
            isCompleted: true
            }, {
            where: {
                statusChangeId: getCurrentStatusChanged.statusChangeId
            }
        });
        if( !getNextStatus ){
            // Update the service order
            await ServiceOrder.update({
                isFinished: true,
                updatedAt: sequelize.literal('CURRENT_TIMESTAMP')
            }, {
                where: {
                    serviceOrderId
                }
            });
            statusChanged = {};
            return res.status(200).json({
                ok: true,
                msg: messageFile[index].statusChangeFinished,
                change: statusChanged
            });
        } else {
            // Create a new state with the next stause data
            statusChanged = await StatusChange.create({
                uuid: getUuid(),
                details,
                sysDetail: messageFile[index].statusChangeUpdated + getNextStatus.name,
                statusId: getNextStatus.statusId,
                serviceOrderId,
                userId
            }, {
                fields: ['uuid', 'details', 'sysDetail', 'statusId', 'serviceOrderId', 'userId'],
                returning: ['statusChangeId', 'uuid', 'createdAt', 'details', 'sysDetail', 'statusId', 'serviceOrderId', 'userId']
            });
            return res.status(200).json({
                ok: true,
                msg: messageFile[index].statusChangeUpdated + getNextStatus.name ,
                change: statusChanged
            });
        }
    } catch (error) {
        console.log('Error:', error);
        opusLog(`Updating service order status [${ serviceOrderId }]: ${ error }`, 'error');
        return res.status(500).json({
            ok: false,
            msg: messageFile[index].errorUpdating + entityFile[index].serviceOrderLow,
            error
        });
    }
}

// Finishing an order status
const finishServiceOrder = async(req, res = response) => {
    const serviceOrderId = req.params.serviceOrder;
    const companyId = req.user.companyId;
    try {
        // Validate if the order belongs to the company
        const getServiceOder = await ServiceOrder.findOne({
            where: {
                serviceOrderId,
                isActive: true
            },
            include: [{
                model: Client,
                where: {
                    companyId
                }
            }]
        });
        if( !getServiceOder ) {
            return res.status(404).json({
                ok: false,
                msg: messageFile[index].notFound + entityFile[index].serviceOrderLow
            });
        }
        // Finishing order status in order status table -> Update
        await ServiceOrder.update({
            isFinished: true,
            updatedAt: sequelize.literal('CURRENT_TIMESTAMP'),
        }, {
            where: {
                serviceOrderId
            }
        })
        // Finishint order status in change status table --> Create
        await StatusChange.update({
            isCompleted: true,
            sysDetail: messageFile[index].statusChangeFinished + ` by [ ${ req.user.email }/${ req.user.userId } ]`
        }, {
            where: {
                isCompleted: false,
                serviceOrderId
            }
        });
        // Returning information
        return res.status(200).json({
            ok: true,
            msg: messageFile[index].statusChangeFinished
        });
    } catch (error) {
        console.log('Error:', error);
        opusLog(`Finishing service order and status [${ serviceOrderId }]: ${ error }`, 'error');
        return res.status(500).json({
            ok: false,
            msg: messageFile[index].errorUpdating + entityFile[index].serviceOrderLow,
            error
        });
    }
}

// Get the history of an order status
const getOrderStatusHistory = async(req, res = responser) => {
    const serviceOrderId = req.params.serviceOder;
    const companyId = req.user.companyId;
    try {
        // Validate if the order belongs to the company
        const getServiceOder = await ServiceOrder.findOne({
            where: {
                serviceOrderId,
                isActive: true
            },
            include: [{
                model: Client,
                where: {
                    companyId
                },
                include: [{
                    model: Person,
                }]
            },{
                model: Model,
                attributes: ['uuid', 'name', 'shortName', 'img', 'url'],
                include: [{
                    model: Brand,
                    attributes: ['uuid', 'name', 'shortName', 'url']
                }]
            }]
        });
        if( !getServiceOder ) {
            return res.status(404).json({
                ok: false,
                msg: messageFile[index].notFound + entityFile[index].serviceOrderLow
            });
        }
        // Construct the serviceOrder objecto to return
        const serviceOrder = {
            serviceOrderId: getServiceOder.serviceOrderId,
            uuid: getServiceOder.uuid,
            number: getServiceOder.number,
            observation: getServiceOder.observation,
            lockPatron: getServiceOder.lockPatron ? opusDecrypt(getServiceOder.lockPatron) : undefined,
            isFinished: getServiceOder.isFinished,
            receptionDate: getServiceOder.receptionDate,
            receptionHour: getServiceOder.receptionHour,
            serialNumber: getServiceOder.serialNumber,
            color: getServiceOder.color,
            isRepair: getServiceOder.isRepair,
            techSpecifications: getServiceOder.techSpecifications,
            problemDescription: getServiceOder.problemDescription,
            lockPass: getServiceOder.lockPass ? opusDecrypt(getServiceOder.lockPass) : undefined,
            hasSurvey: getServiceOder.hasSurvey,
            advancePayment: getServiceOder.advancePayment,
            isActive: getServiceOder.isActive,
            createdAt: getServiceOder.createdAt,
            updatedAt: getServiceOder.updatedAt,
            deletedAt: getServiceOder.deletedAt,
            clientId: getServiceOder.clientId,
            modelId: getServiceOder.modelId,
            client: {
                clientId: getServiceOder.client.clientId,
                uuid: getServiceOder.client.uuid,
                servicesNumber: getServiceOder.client.servicesNumber,
                details: getServiceOder.client.details,
                hasWhatsapp: getServiceOder.client.hasWhatsapp,
                hasEmail: getServiceOder.client.hasEmail,
                isActive: getServiceOder.client.isActive,
                needsSurvey: getServiceOder.client.needsSurvey,
                createdAt: getServiceOder.client.createdAt,
                updatedAt: getServiceOder.client.updatedAt,
                deletedAt: getServiceOder.client.deletedAt,
                companyId: getServiceOder.client.companyId,
                personId: getServiceOder.client.personId,
                person: {
                    personId: getServiceOder.client.person.personId,
                    uuid: getServiceOder.client.person.uuid,
                    names: getServiceOder.client.person.names ? opusDecrypt(getServiceOder.client.person.names) : undefined,
                    lastNames: getServiceOder.client.person.lastNames ? opusDecrypt(getServiceOder.client.person.lastNames) : undefined,
                    dni: getServiceOder.client.person.dni ? opusDecrypt(getServiceOder.client.person.dni) : undefined,
                    mobilePhone: getServiceOder.client.person.mobilePhone ? opusDecrypt(getServiceOder.client.person.mobilePhone) : undefined,
                    email: getServiceOder.client.person.email ? opusDecrypt(getServiceOder.client.person.email) : undefined,
                    address: getServiceOder.client.person.address ? opusDecrypt(getServiceOder.client.person.address) : undefined,
                    reference: getServiceOder.client.person.reference ? opusDecrypt(getServiceOder.client.person.reference) : undefined,
                    birthdate: getServiceOder.client.person.birthdate,
                    details: getServiceOder.client.person.details,
                    isActive: getServiceOder.client.person.isActive,
                    createdAt: getServiceOder.client.person.createdAt,
                    updatedAt: getServiceOder.client.person.updatedAt,
                    deletedAt: getServiceOder.client.person.deletedAt
                }
            },
            model: {
                uuid: getServiceOder.model.uuid,
                name: getServiceOder.model.name,
                shortName: getServiceOder.model.shortName,
                img: getServiceOder.model.img,
                url: getServiceOder.model.url,
                brand: {
                    uuid: getServiceOder.model.brand.uuid,
                    name: getServiceOder.model.brand.name,
                    shortName: getServiceOder.model.brand.shortName,
                    url: getServiceOder.model.brand.url
                }
            }
        }
        // Get all order status changes with details
        const getServiceHistory = await StatusChange.findAndCountAll({
            where: {
                serviceOrderId,
                isActive: true
            },
            include: [{
                model: ServiceStatus,
                attributes: ['statusId', 'uuid', 'name', 'order', 'cost']
            }, {
                model: User,
                attributes: ['uuid', 'nick', 'email'],
                include: [{
                    model: Role,
                    attributes: ['uuid', 'name']
                }]
            }]
        });
        return res.status(200).json({
            ok: true,
            msg: entityFile[index].serviceOrderUp + messageFile[index].okGotFemale,
            serviceOders: {
                serviceOrder,
                statusChanges: getServiceHistory
            }
        })
    } catch (error) {
        console.log('Error:', error);
        opusLog(`Getting service order history [${ serviceOrderId }]: ${ error }`, 'error');
        return res.status(500).json({
            ok: false,
            msg: messageFile[index].errorGetting + entityFile[index].serviceOrderLow,
            error
        });
    }
}

module.exports = {
    getServiceOrderByStatusOrder,
    completeAnStatus,
    finishServiceOrder,
    getOrderStatusHistory
}