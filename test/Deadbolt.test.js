"use strict";

class Subject {
    constructor() {

    }

    getRoles() {

    }

    getPermissions() {

    }
};

class PrivilegeHandler {
    getSubject(req, res, next) {
        return Subject();
    }
};

class HandlerCollection {
    constructor() {
        this.handlers = new Map();
        this.defaultHandler = new PrivilegeHandler();
        this.handlers.set("default", this.defaultHandler);
    }

    getHandler(key) {
        return this.handlers.get(key);
    }

    getDefaultHandler() {
        return this.defaultHandler;
    }
};
