import mongoose from 'mongoose'

const salarySchema = new mongoose.Schema({
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  basicSalary: { type: Number, required: true },
  transportAllowance: { type: Number },
  mealAllowance: { type: Number },
  pension: { type: Number },
  paye: { type: Number },
  growthSalary: { type: Number },
  loan: { type: Number },
  overTime: { type: Number },
  netSalary:{ type: Number },
  month:{ type: String, required: true },
  year:{ type: String, required: true },
  payDate:{ type: Date, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});




const Salary = mongoose.model('Salary', salarySchema)

export default Salary