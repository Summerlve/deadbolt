"use strict";

class Deadbolt {
    constructor(deadboltHandler) {
        this.deadboltHandler = deadboltHandler;
    }

    restrict(desc) {
        const tokens = tokenizer(desc);
        const ast = parser(tokens);
        const result = reducer(ast, {

        });

        return (req, res, next) => {
            let subject = this.privilegeHandler.getSubject(req, res, next);

            if (subject === null)
            {
                this.privilegeHandler.onAuthFailure(req, res, next);
            }

        };
    }

    tokenizer(input) {

    }

    parser(tokens) {
        if (type)
        const result = ownPrivilege => {

        };

        return result.bind(void 0, something);
    }

    reducer(ast, visitor) {

    }

    subjectPresent() {

    }

    subjectNotPresent() {

    }

    role() {

    }

    permission() {

    }

    regEx() {

    }

    dynamic(fn) {

    }
};

module.exports.Deadbolt = Deadbolt;
