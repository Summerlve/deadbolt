"use strict";
const Deadbolt = require("express-deadbolt");
const mySimpleDeadboltHandler = {
    getSubject(req, res, next) {
        return {
            getIdentifier() {
                return "root";
            },
            getRoles() {
                return ["admin", "root"];
            },
            getPermissions() {
                return ["anything", "everything"];
            }
        };
    },
    beforeAuthCheck(req, res, next) {
        res.myContent = "beforeAuthCheck ";
    },
    onAuthFailure(req, res, next) {
        res.myContent += "onAuthFailure "
        res.send(myContent);
    }
};

const simpleDeadbolt = new Deadbolt(mySimpleDeadboltHandler);

module.exports = simpleDeadbolt;


