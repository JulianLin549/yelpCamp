const express = require('express');
const router = express.Router();
const passport = require('passport');
//const User = require('../models/user')


router.get('/', (req, res) => {
    res.render("landing");
});

module.exports = router