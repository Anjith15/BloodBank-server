const exp = require("express")
const userApp = exp.Router()
const UserModel = require("../models/userModel")
const expressAsyncHandler = require("express-async-handler")
const bcryptjs = require("bcryptjs")
const jwt = require("jsonwebtoken")
const verifyToken = require("../middlewares/verifyToken")

// add body parser middleware
userApp.use(exp.json())

// API to get all users
userApp.get(
  "/users",
  expressAsyncHandler(async (req, res) => {
    // get all users from user collection
    const usersList = await UserModel.find()
    // send res
    res.send({ message: "All users", payload: usersList })
  })
)

// users based on Blood group
userApp.get(
  "/users/:bloodGroup",
  expressAsyncHandler(async (req, res) => {
    const givenBloodGroup = req.params.bloodGroup
    // find all users with required blood group
    const usersList = await UserModel.find({ bloodGroup: givenBloodGroup })
    // send res
    if (usersList === null) {
      res.send({ message: "No user with given blood group" })
    } else {
      res.send({ message: "Users found", payload: usersList })
    }
  })
)

// create a user
userApp.post(
  "/user",
  expressAsyncHandler(async (req, res) => {
    try {
      // get new user object
      const newUser = req.body
      // hash the password
      const hashedPassword = await bcryptjs.hash(newUser.password, 5)
      // replace plain password with hashed password
      newUser.password = hashedPassword
      // create doc for new user
      const userDocument = new UserModel(newUser)
      // save to db
      let dbRes = await userDocument.save()
      // send res
      res.status(201).send({ message: "New user created", error: false, payload: dbRes })
    } catch (err) {
      // Handle validation errors
      if (err.name === 'ValidationError') {
        const validationErrors = Object.values(err.errors).map(error => error.message);
        let errorMessage = "Validation failed: " + validationErrors.join(", ");
        
        return res.status(400).send({ 
          error: true, 
          message: errorMessage
        });
      }
      
      // Handle duplicate key errors
      if (err.code === 11000) {
        const field = Object.keys(err.keyPattern)[0];
        return res.status(400).send({
          error: true,
          message: `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`
        });
      }
      
      // Handle other errors
      res.status(500).send({ 
        error: true, 
        message: "Server error occurred"
      });
    }
  })
)

// user authentication(user login)
userApp.post(
  "/login",
  expressAsyncHandler(async (req, res) => {
    try {
      // get userCredObj
      const userCredObj = req.body
      // check if user is present(verify username)
      let userInDB = await UserModel.findOne({ email: userCredObj.email })
      // if user is not present
      if (userInDB === null) {
        return res.status(400).send({ error: true, message: "Invalid email" })
      }
      // if user is present,compare passwords
      else {
        let result = await bcryptjs.compare(
          userCredObj.password,
          userInDB.password
        )
        if (result === false) {
          return res.status(400).send({ error: true, message: "Invalid password" })
        } else {
          // create JWT token with user ID and email
          const tokenPayload = { 
            userId: userInDB._id, 
            email: userInDB.email,
            role: userInDB.role || 'user'
          };
          
          let signedToken = jwt.sign(
            tokenPayload, 
            process.env.JWT_SECRET || "abcdef", 
            { expiresIn: "1d" }
          )
          
          // send res
          res.send({
            message: "login success",
            error: false,
            token: signedToken,
            payload: userInDB,
          })
        }
      }
    } catch (err) {
      res.status(500).send({ error: true, message: "Server error occurred" });
    }
  })
)

// update a user
userApp.put(
  "/user",
  verifyToken,
  expressAsyncHandler(async (req, res) => {
    try {
      // Get user data from request body
      const userData = req.body;
      
      // Ensure user can only update their own profile
      if (userData._id !== req.userId && req.userRole !== 'admin') {
        return res.status(403).send({
          error: true,
          message: "You are not authorized to update this profile"
        });
      }
      
      // If password is being updated, hash it
      if (userData.password) {
        userData.password = await bcryptjs.hash(userData.password, 5);
      }
      
      // Update user in database
      const updatedUser = await UserModel.findByIdAndUpdate(
        userData._id,
        userData,
        { new: true, runValidators: true }
      );
      
      // Check if user exists
      if (!updatedUser) {
        return res.status(404).send({
          error: true,
          message: "User not found"
        });
      }
      
      // Send response
      res.send({
        message: "User updated successfully",
        error: false,
        payload: updatedUser
      });
    } catch (err) {
      // Handle validation errors
      if (err.name === 'ValidationError') {
        const validationErrors = Object.values(err.errors).map(error => error.message);
        let errorMessage = "Validation failed: " + validationErrors.join(", ");
        
        return res.status(400).send({ 
          error: true, 
          message: errorMessage
        });
      }
      
      // Handle duplicate key errors
      if (err.code === 11000) {
        const field = Object.keys(err.keyPattern)[0];
        return res.status(400).send({
          error: true,
          message: `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`
        });
      }
      
      // Handle other errors
      res.status(500).send({ 
        error: true, 
        message: "Server error occurred while updating user"
      });
    }
  })
);

// Get user profile
userApp.get(
  "/profile",
  verifyToken,
  expressAsyncHandler(async (req, res) => {
    try {
      // Find user by id from token
      const user = await UserModel.findById(req.userId);
      
      // If user not found
      if (!user) {
        return res.status(404).send({
          error: true,
          message: "User not found"
        });
      }
      
      // Send response with user data
      res.send({
        message: "User profile fetched successfully",
        error: false,
        payload: user
      });
    } catch (err) {
      res.status(500).send({
        error: true,
        message: "Server error occurred while fetching user profile"
      });
    }
  })
);

module.exports = userApp
