const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const { securePassword } = require("../config/bcryptConfig");


//Admin Login
router.post("/admin-login", (req, res) => {
  const adminEmail = "admin@gmail.com";
  const adminPassword = "12345";

  if (req.body.email === adminEmail && req.body.password === adminPassword) {
    const adminKey = jwt.sign({ id: "thisIsAdmin" }, 'USERAPP', {
      expiresIn: "1d",
    });
    res.status(200).send({
      message: "Admin logged in successfully",
      success: true,
      adminKey,
    });
  } else {
    res
      .status(200)
      .send({ message: "Username or password is incorrect", success: false });
  }
});

//get users list
router.post("/users-list", async (req, res) => {
  try {
    const users = await User.find();
    res
      .status(200)
      .send({ message: "Users fetched successsfully", success: true, users });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Something went wrong on server side" });
  }
});

//delete user by id
router.post("/delete-user-by-id", async (req, res) => {
  try {
    const data = await User.findOneAndDelete(req.body.id);
    if (data) {
      res
        .status(200)
        .send({ message: "User deleted successfully", success: true });
    } else {
      res.status(200).send({ message: "User not found", success: false });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Server side error", success: false });
  }
});

//get user data
router.post("/get-user-data", async (req, res) => {
  try {
    const data = await User.findOne({ _id: req.body.id });
    if (data) {
      res
        .status(200)
        .send({
          message: "User data fetched successfully",
          success: true,
          data,
        });
    } else {
      res.status(200).send({ message: "User not found", success: false });
    }
  } catch (error) {
    res.status(500).send({ message: "Server Side Error", success: false });
  }
});

//edit user info
router.post("/edit-user-info", async (req, res) => {
  try {
    const data = await User.findByIdAndUpdate(req.body.id, {
      name: req.body.name,
      email: req.body.email,
    });
    if(data){
      res.status(200).send({message: "User updated succesfully" , success: true})
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "server side error", success: false });
  }
});

//add new user
router.post('/add-user', async (req, res) => {
  try {
    const { name, email, password, billDetails } = req.body;

    // Check if the user already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create a new user
    const newUser = new User({
      name,
      email,
      password,
    });

    // Add user details to the new user object
    newUser.monthlyBills.push(billDetails);

    await newUser.save();

    res.status(201).json({ message: 'User created successfully with the specified bill', success:true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});


router.post('/add-monthly-bill', async (req, res) => {
  try {
    const { userId, month, unitsConsumed, amount } = req.body;

    // Find the user by ID
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Create a new monthly bill
    const newMonthlyBill = {
      month,
      unitsConsumed,
      amount,
      paymentStatus: 'unpaid', // Set the default payment status here if needed
    };

    // Add the new bill to the user's monthlyBills array
    user.monthlyBills.push(newMonthlyBill);

    // Save the changes to the user
    await user.save();

    res.status(201).json({ success: true, message: 'Monthly bill added successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});


module.exports = router;
