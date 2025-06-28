import mongoose from 'mongoose'


const leaveSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  relievingEId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', },
  leave: { type: String, required: true },
  reason: { type: String, required: true },
  from: { type: Date, required: true },
  to: { type: Date, required: true },
  appliedAt: { type: Date, default: Date.now },
  hodStatus: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
  resumeStatus: { type: Boolean, default: false  },
  createdAt: { type: Date, default: Date.now },
  resumeDate: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});


const Leave = mongoose.model('Leave', leaveSchema)

export default Leave