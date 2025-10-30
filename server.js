// server.js
const dotenv = require("dotenv");
dotenv.config(); // Loads environment variables from .env file

const express = require("express"); //Import express
const app = express(); //Call express and place it in the app variable

const path = require("path"); //Import common core modules

const cors = require("cors"); //Import Cors module -  Cross Origin Resource Sharing

const bodyParser = require("body-parser"); //Import body-parser module

//Import CorsOptions functions from the CorOptions.js in the config folder
const corsOptions = require("./config/corsOptions");

//Import custom log module
const { logger } = require("./middleware/logEvents");

//Import custom log module
const errorHandler = require("./middleware/errorHandler");

app.get("/register", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "register.html"));
});

const registerRoutes = require("./routes/registerRoutes"); // Import register routes
const authRoutes = require("./routes/authRoutes"); // Import auth routes

//Import JWT module
const verifyJWT = require("./middleware/verifyJWT");

// Exclude static assets from authentication
app.get("/favicon.ico", (req, res) => res.sendStatus(204)); // No Content

//Import cookie-parser module
const cookieParser = require("cookie-parser");

// Import credentials middleware
const credentials = require("./middleware/credentials");

//Define port for webserver
const PORT = process.env.PORT || 3444;

//Custom middleware logger
app.use(logger);

// Handle options credentials check - before CORS!
// and fetch cookies credentials requirement
app.use(credentials);

//Use CORS - Cross Origin Resource Sharing
app.use(cors(corsOptions));

//built-in middleware to handle urlencoded data, in other words, from :data
//‘content-type: application/x-www-form-urlencoded’
//This is used to handle you url encoded data
app.use(express.urlencoded({ extended: false }));

// Middleware to parse incoming JSON requests
app.use(express.json());

// Middleware for cookies
app.use(cookieParser());

//body-parser middleware
app.use(bodyParser.json());

//built-in middleware to to serve static files like CSS for the public directory
app.use("/", express.static(path.join(__dirname, "/public")));
app.use(express.static(path.join(__dirname, "views"))); // Serve files from the "views" directory

//Router for the root directory these are the files in the public folder
app.use("/", require("./routes/root"));

//Import router files
const refreshRoutes = require("./routes/refreshRoutes"); // Import refresh routes
const logoutRoutes = require("./routes/logoutRoutes"); // Import logout routes
const vendorRoutes = require("./routes/vendorRoutes"); // Import vendor routes
const companyDivisionRoutes = require("./routes/companyDivisionRoutes"); // Import companyDivision route
const locationRoutes = require("./routes/locationRoutes"); // Import location routes
const inventoryRoutes = require("./routes/inventoryRoutes"); // Import inventory routes
const agingInventoryRoutes = require("./routes/agingInventoryRoutes.js"); // Import aginginventory routes
const customerRoutes = require("./routes/customerRoutes"); // Import customerRoutes routes
const orderRoutes = require("./routes/orderRoutes"); // Import orderRoutes
const orderItemsRoutes = require("./routes/orderItemsRoutes"); // Import  routes
const alertRoutes = require("./routes/alertRoutes"); // Import alert routes
const userAccountRoutes = require("./routes/userAccountRoutes"); // Import userAccountRoutes
const shippingRoutes = require("./routes/shippingRoutes"); // Import shipping routes
const subscribeRoute = require("./routes/subscribeRoute"); //Import Subscriber route testing push notifications
const pool = require("./db"); // Assuming you have db.js set up to handle your PostgreSQL connection

/* // Sample endpoint to test the server
app.get("/", (req, res) => {
  res.send("API is working!");
}); */

//Define endpoints

// Use auth routes
app.use("/auth", authRoutes);

// Use register routes
app.use("/api/register", registerRoutes);

// Use refresh routes
app.use("/api/refresh", refreshRoutes);

// Use logout routes
app.use("/api/logout", logoutRoutes);

// Use verifyJWT middleware for protected routes
// app.use(verifyJWT);

// User alert routes
app.use("/api/alerts", alertRoutes);

// Use inventory routes
//app.use("/api/subscribe", subscribeRoute);

// Use inventory routes
app.use("/api/inventory", inventoryRoutes);

// Pavel - Use userAccountRoutes
app.use("/api/userAccounts", userAccountRoutes);

// Use vendor routes
app.use("/api/vendors", vendorRoutes);

// Pavel - Use companyDivisionRoutes
app.use("/api/companyDivisions", companyDivisionRoutes);

// Use location routes
app.use("/api/locations", locationRoutes);

// User aginginventory routes
app.use("/api/aginginventory", agingInventoryRoutes);

// Pavel - Use customerRoutes
app.use("/api/customers", customerRoutes);

// Pavel - Use orderRoutes
app.use("/api/orders", orderRoutes);

// User orderItemsRoutes
app.use("/api/orderItems", orderItemsRoutes);

// User shipping routes
app.use("/api/shippers", shippingRoutes);

//Redirect all incorrect traffic to a 404.html page
app.all("*", (req, res) => {
  res.status(404);
  if (req.accepts("html")) {
    res.sendFile(path.join(__dirname, "views", "404.html"));
  } else if (req.accepts("json")) {
    res.json({ error: "404 Not Found" });
  } else {
    res.type("txt").send("404 Not Found");
  }
});

//CORS Error handling
app.use(errorHandler);

//Server listen for request using express, remember we called express and set it to the variable app
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

//for sending emails commenting out until error can be fixed
//const emailRoutes = require('./routes/emailRoutes');
//app.use('/controller/emailController', emailRoutes);
require("./public/js/alertEmailJob");
