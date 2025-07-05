import { request } from "express";
import mongoose, { Schema } from "mongoose";


const employeeSchema = new mongoose.Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  staffId: {type: String,required: true,unique: true,lowercase: true, index: true },
  name: {type: String, },
  gender: {type: String, },
  dob: { type: Date,},
  joinDate: { type: Date,},
  maritalStatus: { type: String},
  designation: { type: String },
  experience: { type: String},
  type: { type: String, enum: ["permanent", "locum", "consultant"], required: true },
  qualification: { type: String },
  address: { type: String },
  department: { type: Schema.Types.ObjectId, ref: 'Department', required: true  },
  state: { type: String, required: true },
  status: { type: Boolean, default: true },
  phone: { type: String, required: true },
  cv: { type: String }, // 🆕 CV attachment
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
}, { minimize: false })

const Employee = mongoose.model('Employee', employeeSchema)

export default Employee