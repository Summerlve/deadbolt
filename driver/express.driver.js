"use strict";

module.exports = function driver(deadboltHandler, judger) {
    return (req, res, next) => {
        // beforeAuthCheck hook
        deadboltHandler.beforeAuthCheck(req, res, next);

        let subject = deadboltHandler.getSubject(req, res, next);
        let identifier = subject.getIdentifier();
        let roles = subject.getRoles();
        let permissions = subject.getPermissions();

        const result = judger(identifier, roles, permissions);

        if (!result)
        {
            // onAuthFailure hook
            return deadboltHandler.onAuthFailure(req, res, next);
        }

        next();
    };
};
