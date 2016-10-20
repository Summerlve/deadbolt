"use strict";

class Node {
    constructor(type, name) {
        this.type = type;
        this.name = name;
    }
};

class RelationshipNode extends Node {
    constructor(type, name, params) {
        super(type, name);
        this.params = params;
    }
};

class AdvancedNode extends Node {
    constructor(type, name, value) {
        super(type, name);
        this.value = value;
    }
};

class

class Deadbolt {
    constructor(deadboltHandler) {
        this.deadboltHandler = deadboltHandler;
    }

    restrict(desc) {
        const ast = parser(desc);
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

    parser(tokens) {
        if (type)
        const result = ownPrivilege => {

        };

        return result.bind(void 0, something);
    }

    reducer(ast, visitor) {

    }

    subjectPresent() {
        return {
            type:
        }
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
