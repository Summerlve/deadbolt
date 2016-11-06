"use strict";
var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/login', function(req, res, next) {
  req.session.access = true;
  res.send('login');
});

module.exports = router;
