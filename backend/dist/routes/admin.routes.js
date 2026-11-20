"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const admin_controller_1 = require("../controllers/admin.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const role_middleware_1 = require("../middlewares/role.middleware");
const validate_1 = require("../middlewares/validate");
const schemas_1 = require("../validations/schemas");
const router = (0, express_1.Router)();
// All admin routes require authentication + ADMIN role
router.use(auth_middleware_1.authenticate, (0, role_middleware_1.authorize)('ADMIN'));
router.get('/dashboard', admin_controller_1.getDashboard);
router.get('/users', admin_controller_1.getUsers);
router.post('/users', (0, validate_1.validate)(schemas_1.createUserSchema), admin_controller_1.createUser);
router.get('/stores', admin_controller_1.getStores);
router.post('/stores', (0, validate_1.validate)(schemas_1.createStoreSchema), admin_controller_1.createStore);
exports.default = router;
