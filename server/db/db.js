import mongoose from 'mongoose'

const connectToDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
  } catch (error) {
    
  }
}
export default connectToDatabase;