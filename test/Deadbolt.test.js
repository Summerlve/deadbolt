"use strict";

const { Deadbolt } = require("../src/Deadbolt.js");

class DeadboltHandler {
    set subject(subject) {
        this._subject = subject;
    }

    get subject() {
        return this._subject;
    }

    beforeAuthCheck(req, res, next) {
        next();
    }

    onAuthFailure(req, res, next) {
        next();
    }
};

class Subject {
    set identifier(identifier) {
        this._identifier = identifier;
    }

    get identifier() {
        return this._identifier;
    }

    set roles(roles) {
        this._roles = roles;
    }
    get roles() {
        return this._roles;
    }

    set permissions(permissions) {
        this._permissions = permissions;
    }

    get permissions() {
        return this._permissions;
    }
};

const filter = new Deadbolt(new DeadboltHandler());
filter.restrict({
    or: [
        filter.role("admin"),
        filter.role("myself"),
        filter.dynamic((identifier, roles, permissions) => {
            if (permissions.indexOf("do_something_right")
                && roles.indexOf(("myself")))
            {
                return true;
            }

            return false;
        }),
        filter.regEx(["role", /a-z/]),
        {
            and: [
                filter.role("some"),
                {
                    not: [
                        filter.role("test")
                    ]
                }
            ]
        }
    ]
});
