// Employee business logic. EVERY query includes { user: userId },
// so a user can only ever touch their own employees.
const Employee = require('../models/Employee');
const AppError = require('../utils/AppError');
const logger = require('../utils/logger');

// Called only when the owner-scoped query found nothing:
// 403 if the employee exists but belongs to someone else, 404 if it doesn't exist
async function accessError(eid, userId, action) {
  const exists = await Employee.exists({ _id: eid });
  if (exists) {
    logger.warn(`AUTHZ forbidden: user=${userId} tried to ${action} employee=${eid} owned by another user`);
    return new AppError('Forbidden: this employee belongs to another user', 403);
  }
  return new AppError('Employee not found', 404);
}

exports.listEmployees = (userId) =>
  Employee.find({ user: userId }).sort({ created_at: -1 });

exports.createEmployee = async (userId, data) => {
  const employee = await Employee.create({ ...data, user: userId });
  logger.info(`EMP created: id=${employee._id} owner=${userId}`);
  return employee;
};

exports.getEmployee = async (userId, eid) => {
  const employee = await Employee.findOne({ _id: eid, user: userId });
  if (!employee) throw await accessError(eid, userId, 'view');
  return employee;
};

exports.updateEmployee = async (userId, eid, data) => {
  const employee = await Employee.findOneAndUpdate(
    { _id: eid, user: userId },
    { $set: data },
    { returnDocument: 'after', runValidators: true }
  );
  if (!employee) throw await accessError(eid, userId, 'update');
  logger.info(`EMP updated: id=${eid} owner=${userId}`);
  return employee;
};

exports.deleteEmployee = async (userId, eid) => {
  const employee = await Employee.findOneAndDelete({ _id: eid, user: userId });
  if (!employee) throw await accessError(eid, userId, 'delete');
  logger.info(`EMP deleted: id=${eid} owner=${userId}`);
};