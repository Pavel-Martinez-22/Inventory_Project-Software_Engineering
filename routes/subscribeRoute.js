//Import Modules
const express = require("express");
const router = express.Router();
const webPush = require("web-push");
require('dotenv').config();


//VAPID keys (Type the following in terminal to generate VAPID keys : ./node_modules/.bin/web-push generate-vapid-keys)
//When deploying insert an a environment variable
const publicVapidKey = process.env.PUBLIC_VAPID_KEY;
const privateVapidKey = process.env.PRIVATE_VAPID_KEY;

webPush.setVapidDetails(
  "mailto:test@test.com",
  publicVapidKey,
  privateVapidKey
);

//Create Subscribe Route
router.post("/", (req, res) => {
  //Get pushSubscription Object
  const subscription = req.body;

  //Send back a status 201 - resource creates successfully
  res.status(201).json({});

  //Create payload optional, in this example we are going to put the title of the push notification as the payload
  const payload = JSON.stringify({ title: "Push Test" });

  //Pass object into sendNotification function
  webPush
    .sendNotification(subscription, payload)
    .catch((err) => console.error(err));
});

module.exports = router;
