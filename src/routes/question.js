const { Router } = require('express');
const { check } = require('express-validator');
const { createQuestion, getActiveQuestions, getAllQuestions, updateQuestion, changeQuestionStatus, deleteQuestion } = require('../controllers/question');
const { fieldValidation } = require('../middlewares/fieldValidation');
const { tokenValidation } = require('../middlewares/jwtValidation');
const { adminValidation, userValidation } = require('../middlewares/roleValidation');

const router = Router();

// Create a question
// POST: /api/{v}/question
router.post('/', [
        check('question', 'Question is required').not().isEmpty(),
        check('answer', 'Answer is required').not().isEmpty(),
        fieldValidation,
        tokenValidation,
        userValidation
    ],
    createQuestion);

// Get active questions
// GET: /api/{v}/question
router.get('/', [tokenValidation, userValidation], getActiveQuestions);

// Get all questiona for administration
// GET: /api/{v}/question
router.get('/all', [tokenValidation, adminValidation], getAllQuestions);

// Update a question
// PUT: /api/{v}/question/:id
router.put('/:id', [tokenValidation, userValidation], updateQuestion);

// Change the status of a question
// PUT: /api/{v}/question/status/:id?type
router.put('/status/:id', [tokenValidation, userValidation], changeQuestionStatus);

// Delete physically a question
// DELETE: /api/{v}/question/:id
router.delete('/:id', [tokenValidation, adminValidation], deleteQuestion);

module.exports = router;