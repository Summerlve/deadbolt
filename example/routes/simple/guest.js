"use strict";
var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/guest', function(req, res, next) {
  res.myContent = 'guest';
  res.render('guest', { title: res.myContent });
});

module.exports = router;
