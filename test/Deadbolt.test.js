"use strict";

const { Deadbolt } = require("../src/Deadbolt.js");

class DeadboltHandler {
    constructor() {
    }

    getSubject() {
        return new Subject();
    }

    beforeAuthCheck() {

    }

    onAuthFailure() {

    }
};

class Subject {
    constructor() {
        if (new.target === Subject) throw new Error("Subject can not be instanced");
    }

    getRoles() {
        return [];
    }

    getPermissions() {
        return [];
    }
};

const filter = new Deadbolt(new DeadboltHandler());
filter.restrict({
    or: [
        filter.role("admin"),
        filter.role("myself"),
        filter.dynamic(_ => {

        });
    ]
});
