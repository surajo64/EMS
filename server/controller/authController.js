import User from "../models/User.js"
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'


const login = async (req, res) => {
  try {
    const { email, password } = req.body
    const user = await User.findOne({ email })

    if (!user) {
      return res.json({ success: false, message: "User Does not Exist" })
    }
    const isMatch = await bcrypt.compare(password, user.password)
    if (isMatch) {
      const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET,)
      res.json({ success: true, token, user: {id: user._id, name: user.name, role: user.role},});
    } else {
      res.json({ success: false, message: "Invalid UserName Or Password!" });
    }



  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }

}





export{login}