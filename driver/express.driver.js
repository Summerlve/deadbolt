"use strict";

module.exports = function driver(judger) {
    return (req, res, next) => {
        // beforeAuthCheck hook
        this.deadboltHandler.beforeAuthCheck(req, res, next);

        let subject = this.deadboltHandler.getSubject(req, res, next);
        let identifier = subject.identifier;
        let roles = subject.roles;
        let permissions = subject.permissions;

        const result = judger(identifier, roles, permissions);

        if (!result)
        {
            // onAuthFailure hook
            return this.deadboltHandler.onAuthFailure(req, res, next);
        }

        next();
    };
};
