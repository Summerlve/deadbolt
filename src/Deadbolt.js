"use strict";

const log = require("loglevel");
const util = require("util");

if (process.env.NODE_ENV === "production")
{
    log.setLevel("error");
}
else
{
    log.setLevel("debug");
}

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
        const ast = this.parser(desc);
        log.debug(util.inspect(ast, false, null));

        const result = this.reducer(ast);
        log.debug(result);

        return (req, res, next) => {
            let subject = this.privilegeHandler.getSubject(req, res, next);

            if (subject === null)
            {
                this.privilegeHandler.onAuthFailure(req, res, next);
            }

        };
    }

    parser(desc) {
        log.debug(util.inspect(desc, false, null));
        const rootNode = new RootNode();

        // simple situation , only single restrict.
        if (desc instanceof Node)
        {
            if (desc.type === "AdvancedNode")
            {
                switch (desc.name) {
                    case "dynamic":
                        rootNode.body.push(desc);
                        return rootNode;
                    case "regEx":
                        rootNode.body.push(desc);
                        return rootNode;
                    default:
                        throw new Error(`AdvancedNode have no ${desc.name} node type.`);
                }
            }
            else if (desc.type === "SingleNode")
            {
                switch (desc.name) {
                    case "subjectPresent":
                        rootNode.body.push(desc);
                        return rootNode;
                    case "subjectNotPresent":
                        rootNode.body.push(desc);
                        return rootNode;
                    case "role":
                        rootNode.body.push(desc);
                        return rootNode;
                    case "permission":
                        rootNode.body.push(desc);
                        return rootNode;
                    default:
                        throw new Error(`SingleNode have no ${desc.name} node type.`);
                }
            }
        }

        rootNode.body.push(this.walk(desc));
        return rootNode;
    }

    walk(desc) {
        let relationshipNode = {};
        let nodeArrayBody = [];

        if (desc.or) {
            relationshipNode = new RelationshipNode("or");
            nodeArrayBody = desc.or;
        }

        if (desc.and) {
            relationshipNode = new RelationshipNode("and");
            nodeArrayBody = desc.and;
        }

        if (desc.not) {
            relationshipNode = new RelationshipNode("not");
            nodeArrayBody = desc.not;
        }

        nodeArrayBody.forEach(param => {
            if (param instanceof Node)
            {
                relationshipNode.params.push(param);
            }
            else
            {
                relationshipNode.params.push(this.walk(param));
            }
        });

        return relationshipNode;
    }

    reducer(ast) {
        if (!(ast instanceof RootNode))
        {
            throw new Error("reducer's first arg must be RootNode");
        }

        const body = ast.body;
        const node = body[0];

        if (node instanceof AdvancedNode)
        {
            switch (node.name) {
                case "dynamic":
                    const value = node.value;

                    break;
                case "regEx":
                    break;
                default:

            }
        }

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
        return node;
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
        const node = new AdvancedNode("dynamic", fn);
        return node
    }
};

module.exports.Deadbolt = Deadbolt;
