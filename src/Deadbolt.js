"use strict";

class Node {
    constructor(type, name) {
        this.type = type;
        this.name = name;
    }
};

class RootNode extends Node {
    constructor(body = []) {
        super("RootNode", "RootNode");
        this.body = body;
    }
}

class RelationshipNode extends Node {
    constructor(name, params = []) {
        super("Relationship", name);
        this.params = params;
    }
};

class AdvancedNode extends Node {
    constructor(name, value) {
        super("AdvancedNode", name);
        this.value = value;
    }
};

class SingleNode extends Node {
    constructor(name, value) {
        super("SingleNode" ,name);
        this.value = value;
    }
};

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

    parser(desc) {
        if (desc instanceof Node)
        {
            // simple situation , only single restrict.
            if (desc.type === "AdvancedNode")
            {
                switch (desc.name) {
                    case "dynamic":
                        const rootNode = new RootNode();
                        rootNode.body.push({

                        });
                        return rootNode;
                    case "regEx":
                        return rootNode;
                    default:

                }
            }
            else if (desc.type === "SingleNode")
            {

            }
        }

        const result = ownPrivilege => {

        };

        return result.bind(void 0, something);
    }

    reducer(ast, visitor) {

    }

    subjectPresent() {
        const node = new SingleNode("subjectPresent", "subjectPresent");
        return node;
    }

    subjectNotPresent() {
        const node = new SingleNode("subjectNotPresent", "subjectNotPresent");
        return node;
    }

    role(value) {
        const node = new SingleNode("role", value);
        return role;
    }

    permission(value) {
        const node = new SingleNode("permission", value);
        return node;
    }

    regEx(value) {
        const node = new AdvancedNode("regEx", value);
        return node;
    }

    dynamic(fn) {
        const node = new AdvancedNode("dynamic", value);
    }
};

module.exports.Deadbolt = Deadbolt;
