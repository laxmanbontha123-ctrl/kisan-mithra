"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.profile = exports.login = exports.register = void 0;
const auth_service_1 = require("../services/auth.service");
const isNonEmptyString = (value) => typeof value === 'string' && value.trim().length > 0;
const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const register = async (req, res) => {
    const { fullName, email, password } = req.body ?? {};
    if (!isNonEmptyString(fullName) || !isNonEmptyString(email) || !isNonEmptyString(password)) {
        res.status(400).json({ success: false, message: 'fullName, email, and password are required.' });
        return;
    }
    if (!isValidEmail(email)) {
        res.status(400).json({ success: false, message: 'Please provide a valid email address.' });
        return;
    }
    if (password.length < 6) {
        res.status(400).json({ success: false, message: 'Password must be at least 6 characters long.' });
        return;
    }
    try {
        const result = await auth_service_1.authService.register({
            fullName: fullName.trim(),
            email: email.trim().toLowerCase(),
            password,
        });
        res.status(201).json(result);
    }
    catch (error) {
        const message = error instanceof Error ? error.message : 'Registration failed.';
        const statusCode = message === 'Email already exists' ? 409 : 500;
        res.status(statusCode).json({ success: false, message });
    }
};
exports.register = register;
const login = async (req, res) => {
    const { email, password } = req.body ?? {};
    if (!isNonEmptyString(email) || !isNonEmptyString(password)) {
        res.status(400).json({ success: false, message: 'email and password are required.' });
        return;
    }
    if (!isValidEmail(email)) {
        res.status(400).json({ success: false, message: 'Please provide a valid email address.' });
        return;
    }
    try {
        const result = await auth_service_1.authService.login({
            email: email.trim().toLowerCase(),
            password,
        });
        res.status(200).json(result);
    }
    catch (error) {
        const message = error instanceof Error ? error.message : 'Login failed.';
        const statusCode = message === 'Invalid email or password' ? 401 : 500;
        res.status(statusCode).json({ success: false, message });
    }
};
exports.login = login;
const profile = async (req, res) => {
    if (!req.user) {
        res.status(401).json({ success: false, message: 'Authentication required.' });
        return;
    }
    try {
        const result = await auth_service_1.authService.getProfile(req.user.id);
        res.status(200).json(result);
    }
    catch (error) {
        const message = error instanceof Error ? error.message : 'Unable to load profile.';
        res.status(404).json({ success: false, message });
    }
};
exports.profile = profile;
exports.default = { register: exports.register, login: exports.login, profile: exports.profile };
//# sourceMappingURL=auth.controller.js.map