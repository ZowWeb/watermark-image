const express = require("express");
const dotenv = require("dotenv");
const colors = require("colors");
const morgan = require("morgan");

dotenv.config({ path: "./config/config.env" });

// Bring the routes
const upload = require("./routes/api/upload");

// Start app
const app = express();

// Bodyparser Middleware to send data
app.use(express.json());

// Morgan Middleware
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}
// Serve assets folder
app.use("/assets", express.static("assets"));

// Use Routes
app.use("/api/upload", upload);

const PORT = process.env.PORT || 5000;

app.listen(
  PORT,
  console.log(
    `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold
  )
);
