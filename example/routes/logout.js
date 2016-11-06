"use strict";
var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/logout', function(req, res, next) {
  req.session.access = false;
  res.send('logout');
});

module.exports = router;
