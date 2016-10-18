"use strict";

class Deadbolt {
    constructor(privilegeHandler) {
        this.privilegeHandler = privilegeHandler;
    }

    restrict(desc) {
        this._desc = desc;

        return (req, res, next) => {
            let subject = this.privilegeHandler.getSubject(req, res, next);

            if (subject === null)
            {
                this.privilegeHandler.onAuthFailure(req, res, next);
            }

        };
    }

    subjectPresent() {

    }

    subjectNotPresent() {

    }

    role() {

    }

    permission() {

    }

    dynamic(fn) {

    }

    parse(desc) {
        const result = ownPrivilege => {

        };

        return result.bind(void 0, something);
    }
};

class DeadboltCollection {
    constructor() {
        this.handlers = new Map();
    }

    setDefaultHandler(defaultHandler) {
        this.defaultHandler = defaultHandler;
    }

    getDefaultHandler() {
        return this.defaultHandler;
    }

    addHandler(key, handler) {
        this.handlers.set(key, handler);
    }

    getHandler(key) {
        return this.handlers.get(key);
    }
}
