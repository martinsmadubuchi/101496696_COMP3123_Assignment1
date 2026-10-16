// HTTP layer for employees. The owner is ALWAYS req.user.id (from the JWT).
const { matchedData } = require('express-validator');
const employeeService = require('../services/employeeService');

exports.getAll = async (req, res) => {
  const employees = await employeeService.listEmployees(req.user.id);
  res.status(200).json({ status: 'success', count: employees.length, employees });
};

exports.create = async (req, res) => {
  const data = matchedData(req, { locations: ['body'] });
  const employee = await employeeService.createEmployee(req.user.id, data);
  res.status(201).json({ status: 'success', message: 'Employee created successfully', employee });
};

exports.getOne = async (req, res) => {
  const employee = await employeeService.getEmployee(req.user.id, req.params.eid);
  res.status(200).json({ status: 'success', employee });
};

exports.update = async (req, res) => {
  const data = matchedData(req, { locations: ['body'] });
  const employee = await employeeService.updateEmployee(req.user.id, req.params.eid, data);
  res.status(200).json({ status: 'success', message: 'Employee updated successfully', employee });
};

exports.remove = async (req, res) => {
  await employeeService.deleteEmployee(req.user.id, req.query.eid);
  res.status(204).send();
};