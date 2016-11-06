"use strict";
var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/simple/root', function(req, res, next) {
    res.myContent += 'root ';
    res.render('root', { title: res.myContent });
});

module.exports = router;
