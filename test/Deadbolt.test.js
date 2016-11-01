"use strict";

process.env.NODE_ENV = "test";

const { Node, RootNode, RelationshipNode, AdvancedNode, SingleNode } = require("../src/ASTNode.js");
const assert = require("assert");
const Deadbolt = require("../src/Deadbolt.js");

describe("Test Deadbolt", _ => {
    describe("Test ASTNode", _ => {
        it("SingleNode: [subjectPresent, subjectNotPresent, role, permission]", done => {
            const subjectPresent = new SingleNode("subjectPresent", "subjectPresent");
            assert.strictEqual(subjectPresent.name, "subjectPresent");
            assert.strictEqual(subjectPresent.value, "subjectPresent");
            assert.strictEqual(subjectPresent.type, "SingleNode");

            const subjectNotPresent = new SingleNode("subjectNotPresent", "subjectNotPresent");
            assert.strictEqual(subjectNotPresent.name, "subjectNotPresent");
            assert.strictEqual(subjectNotPresent.value, "subjectNotPresent");
            assert.strictEqual(subjectNotPresent.type, "SingleNode");

            const role = new SingleNode("role", "admin");
            assert.strictEqual(role.name, "role");
            assert.strictEqual(role.value, "admin");
            assert.strictEqual(role.type, "SingleNode");

            const permission = new SingleNode("permission", "anything");
            assert.strictEqual(permission.name, "permission");
            assert.strictEqual(permission.value, "anything");
            assert.strictEqual(permission.type, "SingleNode");
            done();
        });

        it("AdvancedNode: [dynamic, regEx]", done => {
            const dynamic = new AdvancedNode("dynamic", _ => true);
            assert.strictEqual(dynamic.name, "dynamic");
            assert.strictEqual(dynamic.value.toString(), (_ => true).toString());
            assert.strictEqual(dynamic.type, "AdvancedNode");

            const regEx = new AdvancedNode("regEx", ["identifier", /identifier/]);
            assert.strictEqual(regEx.name, "regEx");
            assert.strictEqual(regEx.value[0], "identifier");
            assert.strictEqual(regEx.value[1].toString(), "/identifier/");
            assert.strictEqual(dynamic.type, "AdvancedNode");
            done();
        });

        it("RelationshipNode: [and, or, not]", done => {
            const and = new RelationshipNode("and", []);
            assert.strictEqual(and.name, "and");
            assert.strictEqual(and.params.length, 0);
            assert.strictEqual(and.params instanceof Array, true);
            assert.strictEqual(and.type, "RelationshipNode");

            const or = new RelationshipNode("or", []);
            assert.strictEqual(or.name, "or");
            assert.strictEqual(or.params.length, 0);
            assert.strictEqual(and.params instanceof Array, true);
            assert.strictEqual(and.type, "RelationshipNode");

            const not = new RelationshipNode("not", []);
            assert.strictEqual(not.name, "not");
            assert.strictEqual(not.params.length, 0);
            assert.strictEqual(not.params instanceof Array, true);
            assert.strictEqual(not.type, "RelationshipNode");
            done();
        });
    });

    describe("Test fundamental methods on Deadbolt.prototype", _ => {
        it("Deadbolt.prototype.parser", done => {
            const proto = Deadbolt.prototype;
            const desc = {
                and: [
                    new SingleNode("role", "admin"),
                    new SingleNode("permission", "anything"),
                    {
                        or: [
                            new AdvancedNode("dynamic", _ => true),
                            {
                                and: [
                                    new AdvancedNode("regEx", ["identifier", /admin/])
                                ]
                            },
                            new SingleNode("subjectPresent", "subjectPresent"),
                            {
                                not: [
                                    new SingleNode("subjectNotPresent", "subjectNotPresent")
                                ]
                            }
                        ]
                    }
                ]
            };

            const expectedAST = new RootNode();
            expectedAST.body.push(new RelationshipNode("and", [
                proto.role("admin"),
                proto.permission("anything"),
                new RelationshipNode("or", [
                    proto.dynamic(_ => true),
                    new RelationshipNode ("and", [
                        proto.regEx(["identifier", /admin/])
                    ]),
                    proto.subjectPresent(),
                    new RelationshipNode("not", [
                        proto.subjectNotPresent()
                    ])
                ])
            ]));
            const expectedASTJSON = JSON.stringify(expectedAST);
            const originalAST = proto.parser(desc);
            const originalASTJSON = JSON.stringify(originalAST);
            assert.strictEqual(originalASTJSON, expectedASTJSON);
            done();
        });

        it("Deadbolt.prototype.transformer", done => {
            const proto = Deadbolt.prototype;
            const originalAST = new RootNode([
                new RelationshipNode("and", [
                    new SingleNode("subjectPresent", "subjectPresent")
                ])
            ]);
            const expectedAST = new RelationshipNode("and", [
                new SingleNode("subjectPresent", "subjectPresent")
            ]);
            const expectedASTJSON = JSON.stringify(expectedAST);
            const transformedAST = proto.transformer(originalAST);
            const transformedASTJSON = JSON.stringify(transformedAST);
            assert.strictEqual(transformedASTJSON, expectedASTJSON);
            done();
        });

        it("Deadbolt.prototype.judgerGenerator", done => {
            const proto = Deadbolt.prototype;
            const deadbolt = new Deadbolt();
            done();
        });
    });

    class DeadboltHandler {
        getSubject(req, res, next) {
            return this.subject;
        }

        beforeAuthCheck(req, res, next) {
            console.log("beforeAuthCheck");
        }

        onAuthFailure(req, res, next) {
            console.log("onAuthFailure");
        }

        set subject(subject) {
            this._subject = subject;
        }

        get subject() {
            return this._subject;
        }
    };

    class Subject {
        set identifier(identifier) {
            this._identifier = identifier;
        }

        get identifier() {
            return this._identifier;
        }

        set roles(roles) {
            this._roles = roles;
        }
        get roles() {
            return this._roles;
        }

        set permissions(permissions) {
            this._permissions = permissions;
        }

        get permissions() {
            return this._permissions;
        }
    };

    const subject = new Subject();
    const deadboltHandler = new DeadboltHandler();
    deadboltHandler.subject = subject;
    const filter = new Deadbolt(deadboltHandler);

    describe("Test Simple Use Cases", _ => {
        describe("SingleNode Test", _ => {
            describe("Deadbolt.prototype.subjectPresent", _ => {
                it("Subject has identifier, subjectPresent -> pass", done => {
                    subject.identifier = "has";
                    const judger = filter.compile(filter.subjectPresent());
                    const result = judger(subject.identifier, [], []);
                    assert.strictEqual(result, true);
                    done();
                });

                it("Subject has no identifier, subjectPresent -> failure", done => {
                    subject.identifier = "";
                    const judger = filter.compile(filter.subjectPresent());
                    const result = judger(subject.identifier, [], []);
                    assert.strictEqual(result, false);
                    done();
                });
            });

            describe("Deadbolt.prototype.subjectNotPresent", _ => {
                it("Subject has identifier, subjectNotPresent -> pass", done => {
                    subject.identifier = "has";
                    const judger = filter.compile(filter.subjectNotPresent());
                    const result = judger(subject.identifier, [], []);
                    assert.strictEqual(result, true);
                    done();
                });

                it("Subject has no identifier, subjectNotPresent -> pass", done => {
                    subject.identifier = "";
                    const judger = filter.compile(filter.subjectNotPresent());
                    const result = judger(subject.identifier, [], []);
                    assert.strictEqual(result, true);
                    done();
                });
            });

            describe("Deadbolt.prototype.role", _ => {
                it("Subject has correct role, role -> pass", done => {
                    subject.roles = ["correct"];
                    const judger = filter.compile(filter.role("correct"));
                    const result = judger("", subject.roles, []);
                    assert.strictEqual(result, true);
                    done();
                });

                it("Subject has no role, role -> failure", done => {
                    subject.roles = [];
                    const judger = filter.compile(filter.role("correct"));
                    const result = judger("", subject.roles, []);
                    assert.strictEqual(result, false);
                    done();
                });

                it("Subject has no correct role, role -> failure", done => {
                    subject.roles = ["nocorrect"];
                    const judger = filter.compile(filter.role("correct"));
                    const result = judger("", subject.roles, []);
                    assert.strictEqual(result, false);
                    done();
                });
            });
        });

        describe("AdvancedNode Test", _ => {
            describe("Deadbolt.prototype.dynamic", _ => {
                it("Subject's identifier correspond to dynamic(that callback function return true), dynamic -> pass", done => {
                    subject.identifier = "correspond";
                    const judger = filter.compile(filter.dynamic((identifier, roles, permissions) => {
                        if (identifier === "correspond") return true;
                        else return false;
                    }));
                    const result = judger(subject.identifier, [], []);
                    assert.strictEqual(result, true);
                    done();
                });

                it("Subject's identifier not correspond to dynamic(that callback function return false), dynamic -> failure", done => {
                    subject.identifier = "wrong";
                    const judger = filter.compile(filter.dynamic((identifier, roles, permissions) => {
                        if (identifier === "correspond") return true;
                        else return false;
                    }));
                    const result = judger(subject.identifier, [], []);
                    assert.strictEqual(result, false);
                    done();
                });

                it("when dynamic's callback function return non-boolean value, dynamic -> error", done => {
                    assert.throws(
                        _ => {
                            const judger = filter.compile(filter.dynamic(_ => {
                                return null;
                            }));

                            const result = judger("", [], []);
                        }
                    )
                    done();
                });
            });

            describe("Deadbolt.prototype.regEx", _ => {
                it("Subject's identifier correspond to regEx(that callback function return true), regEx -> pass", done => {
                    subject.identifier = "pass";
                    const judger = filter.compile(filter.regEx(["identifier", /pa/]));
                    const result = judger(subject.identifier, [], []);
                    assert.strictEqual(result, true);
                    done();
                });

                it("Subject's identifier not correspond to regEx(that callback function return false), regEx -> failure", done => {
                    subject.identifier = "failure";
                    const judger = filter.compile(filter.regEx(["identifier", /pa/]));
                    const result = judger(subject.identifier, [], []);
                    assert.strictEqual(result, false);
                    done();
                });
            });
        });
    });

    describe("Test Relationship Use Cases", _ => {
        describe("and:", _ => {
            it("Correspond to such conditions: a layer of and -> pass", done => {
                subject.identifier = "root";
                subject.roles = ["admin", "test", "one", "two"];
                subject.permissions = ["delete_everything", "create_something", "do_anything", "do_one", "do_two"];

                const judger = filter.compile({
                    and: [
                        filter.role("admin"),
                        filter.role("test"),
                        filter.role("one"),
                        filter.dynamic((identifier, roles, permissions) => {
                            if (permissions.indexOf("do_anything")
                                && roles.indexOf(("two")))
                            {
                                return true;
                            }

                            return false;
                        }),
                        filter.permission("create_something")
                    ]
                });

                const result = judger(subject.identifier, subject.roles, subject.permissions);
                assert.strictEqual(result, true);

                done();
            });

            it("Not correspond to such conditions: a layer of and -> failure", done => {
                subject.identifier = "fail";
                subject.roles = ["mustFail", "failEveryTime"];
                subject.permissions = ["one", "two"];

                const judger = filter.compile({
                    and: [
                        filter.role("mustFail"),
                        filter.permission("thr")
                    ]
                });

                const result = judger(subject.identifier, subject.roles, subject.permissions);
                assert.strictEqual(result, false);

                done();
            });

            it("Correspond to such conditions: nested much layers of and -> pass", done => {
                subject.identifier = "pass";
                subject.roles = ["admin", "root"];
                subject.permissions = ["anything"];

                const judger = filter.compile({
                    and: [
                        filter.dynamic((identifier, roles, permissions) => {
                            return identifier === "pass";
                        }),
                        {
                            and: [
                                filter.role("admin"),
                                {
                                    and: [
                                        filter.role("root"),
                                        {
                                            and: [
                                                filter.permission("anything")
                                            ]
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                });

                const result = judger(subject.identifier, subject.roles, subject.permissions);
                assert.strictEqual(result, true);
                done();
            });

            it("Not correspond to such conditions: nested much layers of and -> failure", done => {
                subject.identifier = "pass";
                subject.roles = ["admin", "root"];
                subject.permissions = ["anything"];

                const judger = filter.compile({
                    and: [
                        filter.dynamic((identifier, roles, permissions) => {
                            return identifier === "pass";
                        }),
                        {
                            and: [
                                filter.role("admin"),
                                {
                                    and: [
                                        filter.role("root"),
                                        {
                                            and: [
                                                filter.permission("something")
                                            ]
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                });

                const result = judger(subject.identifier, subject.roles, subject.permissions);
                assert.strictEqual(result, false);
                done();
            });
        });

        describe("or:", _ => {
            it("Correspond to such conditions: one layer of or -> pass", done => {
                subject.identifier = "pass";
                subject.roles = ["admin", "root"];
                subject.permissions = ["anything"];

                const judger = filter.compile({
                    or: [
                        filter.role("guest"),
                        filter.regEx(["identifier", /failure/]),
                        filter.permission("anything")
                    ]
                });

                const result = judger(subject.identifier, subject.roles, subject.permissions);
                assert.strictEqual(result, true);
                done();
            });

            it("Not Correspond to such conditions: one layer of or -> failure", done => {
                subject.identifier = "failure";
                subject.roles = ["guest", "normal"];
                subject.permissions = ["something", "read"];

                const judger = filter.compile({
                    or: [
                        filter.dynamic((identifier, roles, permissions) => {
                            return identifier === "pass";
                        }),
                        filter.role("admin"),
                        filter.role("root"),
                        filter.permission("anything"),
                        filter.regEx(["permission", /any/])
                    ]
                });

                const result = judger(subject.identifier, subject.roles, subject.permissions);
                assert.strictEqual(result, false);
                done();
            });

            it("Correspond to such conditions: nested much layers of or -> pass", done => {
                subject.identifier = "failure";
                subject.roles = ["guest", "normal"];
                subject.permissions = ["something", "read"];

                const judger = filter.compile({
                    or: [
                        filter.role("root"),
                        {
                            or: [
                                filter.role("admin"),
                                filter.permission("anything"),
                                {
                                    or: [
                                        filter.permission("read")
                                    ]
                                }
                            ]
                        }
                    ]
                });

                const result = judger(subject.identifier, subject.roles, subject.permissions);
                assert.strictEqual(result, true);
                done();
            });

            it("Not correspond to such conditions: nested much layers of or -> failure", done => {
                subject.identifier = "failure";
                subject.roles = ["guest", "normal"];
                subject.permissions = ["something", "read"];

                const judger = filter.compile({
                    or: [
                        filter.role("root"),
                        {
                            or: [
                                filter.role("admin"),
                                filter.permission("anything"),
                                {
                                    or: [
                                        filter.permission("write")
                                    ]
                                }
                            ]
                        }
                    ]
                });

                const result = judger(subject.identifier, subject.roles, subject.permissions);
                assert.strictEqual(result, false);
                done();
            });
        });

        describe("not:", _ => {
            it("Correspond to such conditions: one layer of not -> pass", done => {
                subject.identifier = "pass";
                subject.roles = ["admin", "root"];
                subject.permissions = ["anything", "all"];

                const judger = filter.compile({
                    not: [
                        filter.dynamic((identifier, roles, permissions) => {
                            return identifier === "failure";
                        }),
                        filter.role("guest"),
                        filter.role("normal"),
                        filter.permission("something"),
                        filter.permission("none")
                    ]
                });

                const result = judger(subject.identifier, subject.roles, subject.permissions);
                assert.strictEqual(result, true);
                done();
            });

            it("Not correspond to such conditions: one layer of not -> failure", done => {
                subject.identifier = "pass";
                subject.roles = ["admin", "root"];
                subject.permissions = ["anything", "all"];

                const judger = filter.compile({
                    not: [
                        filter.dynamic((identifier, roles, permissions) => {
                            return identifier === "failure";
                        }),
                        filter.role("guest"),
                        filter.role("normal"),
                        filter.permission("something"),
                        filter.permission("all")
                    ]
                });

                const result = judger(subject.identifier, subject.roles, subject.permissions);
                assert.strictEqual(result, false);
                done();
            });

            it("Correspond to such conditions: nested much layers of not -> pass", done => {
                subject.identifier = "pass";
                subject.roles = ["admin", "root"];
                subject.permissions = ["anything", "all"];

                const judger = filter.compile({
                    not: [
                        filter.dynamic((identifier, roles, permissions) => {
                            return identifier === "failure";
                        }),
                        {
                            not: [
                                filter.role("guest"),
                                {
                                    not: [
                                        filter.permission("something")
                                    ]
                                }
                            ]
                        }
                    ]
                });

                const result = judger(subject.identifier, subject.roles, subject.permissions);
                assert.strictEqual(result, true);
                done();
            });

            it("Not correspond to such conditions: nested much layers of not -> failure", done => {
                subject.identifier = "pass";
                subject.roles = ["admin", "root"];
                subject.permissions = ["anything", "all"];

                const judger = filter.compile({
                    not: [
                        filter.dynamic((identifier, roles, permissions) => {
                            return identifier !== "failure";
                        }),
                        {
                            not: [
                                filter.role("guest"),
                                {
                                    not: [
                                        filter.permission("something"),
                                        {
                                            not: [
                                                filter.regEx(["permission", /all/])
                                            ]
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                });

                const result = judger(subject.identifier, subject.roles, subject.permissions);
                assert.strictEqual(result, false);
                done();
            });
        });
   });
});
