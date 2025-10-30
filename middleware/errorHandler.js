//This comes from the custom middleware file logEvents.js
const { logEvents } = require("./logEvents");

//add this to import path
const path = require("path");

const errorHandler = function (err, req, res, next) {
  logEvents(`${err.name}: ${err.message}`, "errLog.txt");
  res.status(404).sendFile(path.join(__dirname, "views", "404.html"));
  res.status(500).send(err.message);
};

module.exports = errorHandler;
