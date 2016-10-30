"use strict";

process.env.NODE_ENV = "test";

const { Node, RootNode, RelationshipNode, AdvancedNode, SingleNode } = require("../src/ASTNode.js");
const assert = require("assert");
const Deadbolt = require("../src/Deadbolt.js");

describe("Test Deadbolt", _ => {
    describe("Test fundamental methods on Deadbolt.prototype", _ => {
        it("Deadbolt.prototype.parser", done => {
            const proto = Deadbolt.prototype;
            const deadbolt = new Deadbolt();
            const desc = {
                and: [
                    deadbolt.role("admin"),
                    deadbolt.permission("anything"),
                    {
                        or: [
                            deadbolt.dynamic(_ => true),
                            {
                                and: [
                                    deadbolt.regEx(["identifier", /admin/])
                                ]
                            },
                            deadbolt.subjectPresent(),
                            {
                                not: [
                                    deadbolt.subjectNotPresent()
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
            const deadbolt = new Deadbolt();
            const originalAST = new RootNode([

            ]);
            const expectedAST = ;
            const expectedASTJSON = JSON.stringify(expectedAST);
            const transformedAST = ;
            const transformedASTJSON = JSON.stringify(originalAST);
            assert.strictEqual(originalASTJSON, expectedASTJSON);
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

    describe("Test Relation Use Cases", _ => {
        it("Meet the conditions, -> true", done => {
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

        it("Not meets the conditions, -> false", done => {
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
    });
});

