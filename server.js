const express = require("express");
const app = express();
require("dotenv").config();
const mongoose = require("mongoose");
const cors = require("cors");

// Middleware
app.use(cors());
app.use(express.json()); // Handles JSON request bodies

// Import API routes
const userApp = require("./APIs/userApi");
const requestApp = require("./APIs/requestApi");
const donationApp = require("./APIs/donationApi");

// Use API routes
app.use("/user-api", userApp);
app.use("/request-api", requestApp);
app.use("/donation-api", donationApp);

// Root route
app.get("/", (req, res) => {
  res.send({
    message: "LifeDrop Blood Bank API is running",
    version: "1.0.0",
    endpoints: {
      users: "/user-api",
      requests: "/request-api",
      donations: "/donation-api"
    }
  });
});

// Port config
const port = process.env.PORT || 3000;

// DB connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log("✅ MongoDB connected successfully");

    app.listen(port, () =>
      console.log(`🚀 Server is running on http://localhost:${port}`)
    );
  })
  .catch((err) => {
    console.error("❌ Error connecting to MongoDB:", err);
  });
