// Employee model. "user" links each employee to the user who created it.
const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema(
  {
    first_name: {
      type: String,
      required: [true, 'first_name is required'],
      trim: true,
      maxlength: [50, 'first_name must be at most 50 characters'],
    },
    last_name: {
      type: String,
      required: [true, 'last_name is required'],
      trim: true,
      maxlength: [50, 'last_name must be at most 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'email is required'],
      trim: true,
      lowercase: true,
      maxlength: [254, 'email is too long'],
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'email format is invalid'],
    },
    position: {
      type: String,
      required: [true, 'position is required'],
      trim: true,
      maxlength: [100, 'position must be at most 100 characters'],
    },
    salary: {
      type: Number,
      required: [true, 'salary is required'],
      min: [0.01, 'salary must be a positive number'],
    },
    date_of_joining: {
      type: Date,
      required: [true, 'date_of_joining is required'],
    },
    department: {
      type: String,
      required: [true, 'department is required'],
      trim: true,
      maxlength: [100, 'department must be at most 100 characters'],
    },
    // Owner of this employee (reference to the User collection)
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Employee must have an owner'],
      index: true,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    versionKey: false,
  }
);

module.exports = mongoose.model('Employee', employeeSchema);