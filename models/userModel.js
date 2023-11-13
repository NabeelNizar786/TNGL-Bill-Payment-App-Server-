const mongoose = require("mongoose");

const monthlyBillSchema = mongoose.Schema({
  month: {
    type: String,
    required: true,
  },
  unitsConsumed: {
    type: Number,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  paymentStatus: {
    type: String,
    enum: ["paid", "unpaid"],
    default: "unpaid",
  },
  // Add other fields related to the monthly bill as needed
});

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    profile: {
      type: String,
      default: "https://bootdey.com/img/Content/avatar/avatar7.png",
    },
    monthlyBills: [monthlyBillSchema], // Array of monthly bills
  },
  {
    timestamps: true,
  }
);

const userModel = mongoose.model("users", userSchema);

module.exports = userModel;

