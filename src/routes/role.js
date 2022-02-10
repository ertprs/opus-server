const { Router } = require('express');
const { getRole } = require('../controllers/role');

const router = Router();

router.get('/role', getRole);

module.exports = router;