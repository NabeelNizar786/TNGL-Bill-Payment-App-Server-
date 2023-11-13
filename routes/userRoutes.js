const express = require("express");
const { securePassword } = require("../config/bcryptConfig");
const router = express.Router();
const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const authMiddleware = require("../middlewares/authMiddleware");
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: "djc5wnfyy",
  api_key: "142765546452766",
  api_secret: "uiKiJNLSkjoDvwTLTuHBhkx21wQ",
});

const opts = {
  overwrite: true,
  invalidate: true,
  resource_type: "auto",
};

router.post("/register", async (req, res) => {
  try {
    const userExists = await User.findOne({ email: req.body.email });
    if (userExists) {
      return res
        .status(200)
        .send({ message: "User already exist", success: false });
    }
    const user = new User({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
    });
    await user.save();
    res
      .status(200)
      .send({ message: "User created successfully", success: true });
  } catch (error) {
    res.status(500).send({
      message: "There was an error while creating the user",
      error,
      success: false,
    });
    console.log(error);
  }
});

router.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res
        .status(200)
        .send({ message: "User does not exist", success: false });
    }
    if (req.body.password !== user.password){
      return res.status(200).send({ message: "Password is incorrect", success: false });
    } else {
      const token = jwt.sign({ id: user._id }, 'USERAPP', {
        expiresIn: "1d",
      });
      res
        .status(200)
        .send({ message: "User logged in successfully", success: true, token });
    }
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .send({ message: "error while logging in", success: false, error });
  }
});

router.post("/get-user-info-by-id", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.body.userId);
    if (!user) {
      return res
        .status(200)
        .send({ message: "User not found", success: false });
    } else {
      res.status(200).send({
        success: true,
        data: {
          name: user.name,
          email: user.email,
          profile: user.profile,
        },
      });
    }
  } catch (error) {
    res
      .status(500)
      .send({ message: "Error getting user info", success: false, error });
  }
});

router.post("/edit-user-profile", authMiddleware, async (req, res) => {
  try {
    const result = await User.findByIdAndUpdate(req.body.userId, {
      name: req.body.name,
      email: req.body.email,
    });
    if (result) {
      res
        .status(200)
        .send({ message: "User profile updated successfully", success: true });
    } else {
      res
        .status(200)
        .send({ message: "User profile not updated", success: false });
    }
  } catch (error) {
    res
      .status(500)
      .send({ message: "Error getting user info", success: false, error });
  }
});

// Fetch bill details for the authenticated user
router.post('/bills', authMiddleware, async (req, res) => {
  try {
    // Assuming your user model has a reference to bills or a similar structure
    const user = await User.findById(req.body.userId).populate('monthlyBills');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    console.log(user);

    const billDetails = user.monthlyBills.map((bill) => ({
      id: bill._id,
      month: bill.month,
      paymentStatus: bill.paymentStatus,
      amount: bill.amount,
      unitsConsumed: bill.unitsConsumed
    }));

    res.status(200).json({ success: true, bills: billDetails });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Assuming you have a router defined, such as const router = express.Router();
// Make sure to include the necessary imports and middleware

// Endpoint to mark a bill as paid
router.post('/mark-as-paid', authMiddleware, async (req, res) => {
  try {
    const { billId } = req.body;

    // Find the user by ID and populate the monthlyBills
    const user = await User.findById(req.body.userId).populate('monthlyBills');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Find the specific bill by its unique identifier
    const billToUpdate = user.monthlyBills.find(bill => bill._id.equals(billId));

    if (!billToUpdate) {
      return res.status(404).json({ success: false, message: 'Bill not found' });
    }

    // Update the paymentStatus to 'paid'
    billToUpdate.paymentStatus = 'paid';
    await user.save(); // Save the user, which will also save the updated bill

    res.status(200).json({ success: true, message: 'Bill marked as paid successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});



router.post("/uploadImage", authMiddleware, async (req, res) => {
  try {
    const image = req.body.image;
    const imageUpload = await cloudinary.uploader.upload(image, opts)
    await User.findByIdAndUpdate(req.body.userId , {
      profile: imageUpload.secure_url
    })
    res.status(200).send({message: "Profile updated succesfully " , success: true })
  } catch (error) {
    res.status(500).send({
      message: "Error updating profile picture",
      success: false,
      error,
    });
  }
});

module.exports = router;
