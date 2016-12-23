"use strict";

module.exports = function driver(deadboltHandler, judger) {
    return (req, res, next) => {
        // beforeAuthCheck hook
        deadboltHandler.beforeAuthCheck(req, res, next);

        let subject = deadboltHandler.getSubject(req, res, next);

        let collect = {};

        let cbGen = key => {
            return result => {
                collect[key] = result;
            };
        };

        subject.getIdentifier(cbGen("identifier"));
        subject.getRoles(cbGen("roles"));
        subject.getPermissions(cbGen("permissions"));

        let {identifier, roles, permissions} = collect;

        const result = judger(identifier, roles, permissions);

        if (!result)
        {
            // onAuthFailure hook
            return deadboltHandler.onAuthFailure(req, res, next);
        }

        next();
    };
};
