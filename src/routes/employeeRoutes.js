const express = require('express');
const authenticate = require('../middleware/auth');
const validate = require('../middleware/validate');
const ctrl = require('../controllers/employeeController');
const v = require('../validators/employeeValidators');

const router = express.Router();

// Every employee route requires a valid JWT
router.use(authenticate);

router.get('/employees', ctrl.getAll);
router.post('/employees', v.rejectUnknownFields, v.createEmployeeRules, validate, ctrl.create);
router.get('/employees/:eid', v.eidParamRule, validate, ctrl.getOne);
router.put('/employees/:eid', v.eidParamRule, v.rejectUnknownFields, v.requireNonEmptyBody,
  v.updateEmployeeRules, validate, ctrl.update);
router.delete('/employees', v.eidQueryRule, validate, ctrl.remove);

module.exports = router;