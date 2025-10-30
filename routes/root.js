//Import express
const express = require("express");

//Define a router with express
const router = express.Router();

//Import common core modules
const path = require("path");

//Define Routes
router.get("^/$|/index(.html)?", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "views", "index.html"));
});

router.get("/login(.html)?", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "views", "login.html"));
});

router.get("/companyDivision(.html)?", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "views", "companyDivision.html"));
});

router.get("/inventory(.html)?", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "views", "inventory.html"));
});

router.get("/vendor(.html)?", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "views", "vendor.html"));
});

router.get("/agingInventory(.html)?", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "views", "agingInventory.html"));
});

router.get("/customer(.html)?", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "views", "customer.html"));
});

router.get("/order(.html)?", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "views", "order.html"));
});

router.get("/location(.html)?", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "views", "location.html"));
});

router.get("/orderItems(.html)?", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "views", "orderItems.html"));
});

router.get("/shipping(.html)?", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "views", "shipping.html"));
});

router.get("/worker(.js)?", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "js", "worker.js"));
});

module.exports = router;
