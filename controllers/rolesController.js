

const express = require('express');
const router = express.Router();
const registerController = require('../../controllers/registerController');
const authController = require('../../controllers/authController');
const userAccountController = require('../../controllers/userAccountController');
const roles_list = require('../../config/roles_list');
const verifyRoles = require('../../middleware/verifyRoles');

// Routes with role-based access control
/* router.route('/')
    .get(verifyRoles(roles_list.Admin, roles_list.Vendor, roles_list.User), userAccountController.getAllUsers) // Allow Admin, Vendor, and User
    .post(verifyRoles(roles_list.Admin), registerController.handleRegister) // Allow Admin to register new users
    .put(verifyRoles(roles_list.Admin), userAccountController.updateUser) // Allow Admin to update users
    .delete(verifyRoles(roles_list.Admin), userAccountController.deleteUser); // Allow Admin to delete users */

router.route('/')
    .get(verifyRoles(roles_list.Admin, roles_list.Vendor, roles_list.User), userAccountController.getAllUsers) // Allow Admin, Vendor, and User
    .post(verifyRoles(roles_list.Admin), authController.handleRegister) // Allow Admin to register new users
    .put(verifyRoles(roles_list.Admin), userAccountController.updateUser) // Allow Admin to update users
    .delete(verifyRoles(roles_list.Admin), userAccountController.deleteUser); // Allow Admin to delete users

router.route('/:id')
    .get(userAccountController.handleGetUser); // Allow Admin, Vendor, and User

module.exports = router;