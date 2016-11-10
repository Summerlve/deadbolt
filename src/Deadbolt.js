"use strict";

const log = require("loglevel");
const util = require("util");
const { Node, RootNode, RelationshipNode, AdvancedNode, SingleNode } = require("./ASTNode.js");
const ExpressDriver = require("../driver/express.driver.js");

// set log level by env.
switch (process.env.NODE_ENV) {
    case "production":
        log.setLevel("error");
        break;
    case "test":
        log.setLevel("silent");
        break;
    default:
        log.setLevel("debug");
}

class Deadbolt {
    constructor(deadboltHandler, driver = ExpressDriver) {
        this.deadboltHandler = deadboltHandler;
        this.driver = driver;
    }

    setCustomDriver(driver) {
        this.driver = driver;
    }

    restrict(desc) {
        const judger = this.compile(desc);
        return this.driver(this.deadboltHandler, judger);
    }

    compile(desc) {
        // desc -> parser -> transformer -> judgerGenerator -> judger
        const originalAST = this.parser(desc);
        const transformedAST = this.transformer(originalAST);
        const judger = this.judgerGenerator(transformedAST);
        return judger;
    }

    parser(desc) {
        const rootNode = new RootNode();

        // simple situation , only single restrict.
        // if [or, and ,not] passed in, it's not instanceof Node.
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

    transformer(originalAST) {
        if (!(originalAST instanceof RootNode))
        {
            throw new Error("transformer's first arg must be RootNode");
        }

        const body = originalAST.body;
        const transformedAST = body[0];

        return transformedAST;
    }

    judgerGenerator(node) {
        return this.reducer(node);
    }

    reducer(node) {
        if (node instanceof AdvancedNode)
        {
            switch (node.name) {
                case "dynamic": {
                    const value = node.value;
                    return (identifier, roles, permissions) => {
                        const result = value(identifier, roles, permissions);

                        if (typeof result !== "boolean")
                        {
                            throw new Error("Deadbolt.prototype.dynamic's callback function must return boolean value");
                        }

                        return result;
                    };
                }

                case "regEx": {
                    const value = node.value;
                    const [kind, regex] = value;

                    return (identifier, roles, permissions) => {
                        let result = false;

                        switch (kind) {
                            case "identifier":
                                result = regex.test(identifier);
                                break;

                            case "role":
                                roles.forEach(role => {
                                    if (regex.test(role))
                                    {
                                        result = true;
                                    }
                                });
                                break;

                            case "permission":
                                permissions.forEach(permission => {
                                    if (regex.test(permission))
                                    {
                                        result = true;
                                    }
                                });
                                break;

                            default:
                                throw new Error ("Deadbolt.protptype.regEx()'s kind must in [identifier, role, permission]");
                        }

                        return result;
                    };
                }

                default:
                    throw new Error("AdvancedNode's name must in [dynamic, regEx]");
            }
        }

        if (node instanceof SingleNode)
        {
            switch (node.name) {
                case "subjectPresent": {
                    return (identifier, roles, permissions) => {
                        if (identifier) return true;
                        else return false;
                    };
                }

                case "subjectNotPresent": {
                    return (identifier, roles, permissions) => true;
                }

                case "role": {
                    const value = node.value;
                    return (identifier, roles, permissions) => {
                        return roles.includes(value);
                    };
                }

                case "permission": {
                    const value = node.value;
                    return (identifier, roles, permissions) => {
                        return permissions.includes(value);
                    };
                }

                default:
                    throw new Error("SingleNode's name must in [subjectPresent, subjectNotPresent, role, permission]");
            }
        }

        if (node instanceof RelationshipNode)
        {
            switch (node.name) {
                case "or": {
                    const params = node.params;
                    log.debug(params.length);
                    const judgeFns = params.map(param => this.reducer(param));
                    const result = false;

                    return (identifier, roles, permissions) => {
                        return judgeFns.reduce((pv, cv) => {
                            return pv || cv(identifier, roles, permissions);
                        }, result);
                    };
                }

                case "and": {
                    const params = node.params;
                    const judgeFns = params.map(param => this.reducer(param));
                    const result = true;

                    return (identifier, roles, permissions) => {
                        return judgeFns.reduce((pv, cv) => {
                            return pv && cv(identifier, roles, permissions);
                        }, result);
                    };
                }

                case "not": {
                    const params = node.params;
                    const judgeFns = params.map(param => this.reducer(param));
                    const result = true;

                    return (identifier, roles, permissions) => {
                        return judgeFns.reduce((pv, cv) => {
                            return pv && !cv(identifier, roles, permissions);
                        }, result);
                    };
                }
            }
        }
    }

    and(value) {
    }

    or(value) {

    }

    not(value) {

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
}

module.exports = Deadbolt;
