"use strict";
const Deadbolt = require("express-deadbolt");
const mySimpleDeadboltHandler = {
    getSubject(req, res, next) {
        return {
            getIdentifier() {
                const { access } = req.session;
                if (access !== true) return "";
                else return "lzsb";
            },
            getRoles() {
                const { access } = req.session;
                if (access !== true) return [];
                else return ["admin", "root"];
            },
            getPermissions() {
                const { access } = req.session;
                if (access !== true) return [];
                return ["anything", "everything"];
            }
        };
    },
    beforeAuthCheck(req, res, next) {
        res.myContent = "beforeAuthCheck ";
    },
    onAuthFailure(req, res, next) {
        res.myContent += "onAuthFailure ";
        res.send(res.myContent);
    }
};

const simpleDeadbolt = new Deadbolt(mySimpleDeadboltHandler);

module.exports = simpleDeadbolt;
