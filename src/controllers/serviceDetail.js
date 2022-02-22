const { response } = require('express');
const { sequelize } = require('../database/connection');

const ServiceOrder = require('../models/ServiceOrder');
const Client = require('../models/Client');
const Service = require('../models/Service');
const ServiceDetail = require('../models/ServiceDetail');

const { getUuid } = require('../helpers/uuidGenerator');
const { opusLog } = require('../helpers/log4js');
const { lowerCase } = require('../helpers/stringHandling');
const { getRoleName } = require('../middlewares/roleValidation');

// Language and messages import
const { selectLanguage } = require('../helpers/selectLanguage');
const index = selectLanguage(process.env.APP_LANGUAGE);
const messageFile = require('../data/messages.json');
const entityFile = require('../data/entities.json');

// Create a service detail for a service order
const createServiceDetail = async(req, res = response) => {
    const companyId = req.user.companyId;
    const {
        cost,
        details,
        serviceId,
        serviceOrderId
    } = req.body;
    let uuid = getUuid();
    try {
        // Validate if the service belongs to the company
        const findService = await Service.findOne({
            where: {
                serviceId,
                isActive: true,
                companyId
            }
        });
        if( !findService ) {
            return res.status(404).json({
                ok: false,
                msg: messageFile[index].notFound + entityFile[index].serviceLow
            });
        }
        // Validate if the order exists and if it belongs to a company's client
        const findServiceOrder = await ServiceOrder.findOne({
            where: {
                serviceOrderId,
                isActive: true
            }
        });
        if( !findServiceOrder ) {
            return res.status(404).json({
                ok: false,
                msg: messageFile[index].notFound + entityFile[index].serviceOrderLow
            });
        }
        const clientId = findServiceOrder.clientId;
        // Validate if the order belongs a client of the company
        const findClient = await Client.findOne({
            where: {
                clientId,
                isActive: true,
                companyId
            }
        });
        if( !findClient ) {
            return res.status(404).json({
                ok: false,
                msg: messageFile[index].notFound + entityFile[index].serviceOrderLow + '/' + entityFile[index].clientLow
            });
        }
        // Create the new service order detail
        const newServiceDetail = await ServiceDetail.create({
            uuid,
            cost,
            details,
            serviceId,
            serviceOrderId
        }, {
            fields: ['uuid', 'cost', 'details', 'serviceId', 'serviceOrderId'],
            returning: ['serviceDetailId', 'uuid', 'cost', 'details', 'serviceId', 'serviceOrderId', 'isActive', 'createdAt']
        });
        return res.status(200).json({
            ok: true,
            msg: entityFile[index].serviceDetailUp + messageFile[index].okCreateMale,
            serviceOrderDetail: newServiceDetail
        });
    } catch (error) {
        console.log('Error:', error);
        opusLog(`Creating service order detail [${ serviceOrderId }]: ${ error }`, 'error');
        return res.status(500).json({
            ok: false,
            msg: messageFile[index].errorCreating + entityFile[index].serviceDetailLow,
            error
        });
    }
}

// Update a service order detail
const updateServiceDetail = async(req, res = response) => {
    const serviceDetailId = req.params.id;
    const companyId = req.user.companyId;
    const {
        cost,
        details,
        serviceId,
    } = req.body;
    if( cost < 0 || details === '' || serviceId === 0 || serviceId === undefined ) {
        return res.status(400).json({
            ok: false,
            msg: messageFile[index].mandatoryMissing
        });
    }
    try {
        // Validate if the service detail exists
        const findServiceDetail = await ServiceDetail.findOne({
            where: {
                serviceDetailId,
                isActive: true
            }
        });
        if( !findServiceDetail ) {
            return res.status(404).json({
                ok: false,
                msg: messageFile[index].notFound + entityFile[index].serviceDetailLow
            });
        }
        // Validate the service order owner (must be the company)
        const findServiceOrder = await ServiceOrder.findOne({
            where: {
                isActive: true,
                serviceOrderId: findServiceDetail.serviceOrderId,
            },
            include: [
                {
                    model: Client,
                    where: {
                        isActive: true,
                        companyId
                    }
                }
            ]
        });
        if( !findServiceOrder ) {
            return res.status(404).json({
                ok: false,
                msg: messageFile[index].notFound + entityFile[index].serviceOrderLow
            });
        }
        // Validate if the service belongs to the company
        const findService = await Service.findOne({
            where: {
                serviceId,
                isActive: true,
                companyId
            }
        });
        if( !findService ) {
            return res.status(404).json({
                ok: false,
                msg: messageFile[index].notFound + entityFile[index].serviceLow
            });
        }
        // Update the service detail
        await ServiceDetail.update({
            cost,
            details,
            serviceId,
        }, {
            where: {
                serviceDetailId
            }
        });
        return res.status(200).json({
            ok: true,
            msg: entityFile[index].serviceDetailUp +  messageFile[index].okUpdateMale
        });
    } catch (error) {
        console.log('Error:', error);
        opusLog(`Updating service order detail [${ serviceDetailId }]: ${ error }`, 'error');
        return res.status(500).json({
            ok: false,
            msg: messageFile[index].errorUpdating + entityFile[index].serviceDetailLow,
            error
        });
    }
}

const changeStatusServiceDetail = async(req, res = response) => {
    const serviceDetailId = req.params.id;
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
        action = entityFile[index].serviceDetailUp + messageFile[index].changeStatusActionOnMale
        changeAction = {
            isActive: true,
            updatedAt: sequelize.literal('CURRENT_TIMESTAMP'),
            deletedAt: null
        }
    } else {
        if (type.toLowerCase() === 'off') {
            activation = false;
            action = entityFile[index].serviceDetailUp + messageFile[index].changeStatusActionOffMale
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
                    serviceDetailId,
                    isActive: !activation,
                },
                include: [
                    {
                        model: ServiceOrder,
                        include: [
                            {
                                model: Client,
                                where: {
                                    companyId
                                }
                            }
                        ]
                    }
                ]
            }
        } else {
            searchCondition = {
                where: {
                    serviceDetailId,
                    isActive: !activation
                }
            }
        }
    } catch (error) {
        console.log('Error:', error);
        opusLog(`Changing service order detail status  [${ serviceDetailId }/${ activation }] role not found: ${ error }`, 'error');
        return res.status(500).json({
            ok: false,
            msg: `${ messageFile[index].errorChangeStatus } ${ entityFile[index].serviceDetailLow }`
        });
    }
    try {
        const findServiceDetail = await ServiceDetail.findOne(searchCondition);
        console.log('ServiceDetail:', findServiceDetail);
        if (!findServiceDetail) {
            return res.status(404).json({
                ok: false,
                msg: `${ messageFile[index].notFound }${ entityFile[index].serviceDetailLow }${ activation ? messageFile[index].alreadyActive : messageFile[index].alreadyInctive}`
            });
        }
        await ServiceDetail.update(
            changeAction, searchCondition
        );
        return res.status(200).json({
            ok: true,
            msg: action,
        });
    } catch (error) {
        console.log('Error:', error);
        opusLog(`Changing service order  [${ serviceDetailId }/${ activation }]: ${ error }`, 'error');
        return res.status(500).json({
            ok: false,
            msg: messageFile[index].errorChangeStatus
        });
    }
}

const deleteServiceDetail = async(req, res = response) => {
    const serviceDetailId = req.params.id;
    try {
        const deletedServiceDetail = await ServiceDetail.destroy({
            where: {
                serviceDetailId
            }
        });
        if( deletedServiceDetail > 0 ) {
            return res.status(200).json({
                ok: true,
                msg: entityFile[index].serviceDetailUp + messageFile[index].okDeletMale
            });
        } else {
            return res.status(404).json({
                ok: false,
                msg: messageFile[index].notFound + entityFile[index].serviceDetailLow
            });
        }
    } catch (error) {
        console.log('Error:', error);
        opusLog(`Deleting service order detail [${ serviceDetailId }]: ${ error }`, 'error');
        return res.status(500).json({
            ok: false,
            msg: messageFile[index].errorDeleting + entityFile[index].serviceDetailLow
        });
    }
}

module.exports = {
    createServiceDetail,
    updateServiceDetail,
    changeStatusServiceDetail,
    deleteServiceDetail,
}