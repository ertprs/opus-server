const { Router } = require('express');
const { check } = require('express-validator');
const { createModel, getActiveModels, getAllModels, getActiveModelsByBrand, updateModel, changeModelStatus, deleteModel } = require('../controllers/model');
const { fieldValidation } = require('../middlewares/fieldValidation');
const { tokenValidation } = require('../middlewares/jwtValidation');
const { adminValidation, userValidation } = require('../middlewares/roleValidation');

const router = Router();

// Create a model
// POST: /api/{v}/model
router.post('/', [
        check('name', 'Name is required').not().isEmpty(),
        check('url', 'URL must be valid').isURL(),
        check('brandId', 'Brand is required').not().isEmpty(),
        fieldValidation,
        tokenValidation,
        adminValidation
    ],
    createModel);

// Get active models
// GET: /api/{v}/model
router.get('/', [tokenValidation, userValidation], getActiveModels);

// Get all models
// GET: /api/{v}/model/all
router.get('/all', [tokenValidation, adminValidation], getAllModels);

// Get all models by brand
// GET: /api/{v}/model/all/brand/:id
router.get('/all/brand/:id', [tokenValidation, userValidation], getActiveModelsByBrand);

// Update a mode
// PUT: /api/{v}/model/:id
router.put('/:id', [tokenValidation, adminValidation], updateModel);

// Change the status of a model
// PUT: /api/{v}/model/status/:id?type
router.put('/status/:id', [tokenValidation, adminValidation], changeModelStatus);

// Delete physically a model
// DELETE: /api/{v}/model/:id
router.delete('/:id', [tokenValidation, adminValidation], deleteModel);

module.exports = router;    