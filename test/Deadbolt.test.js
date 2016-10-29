"use strict";

process.env.NODE_ENV = "test";

const assert = require("assert");
const { Deadbolt } = require("../src/Deadbolt.js");

describe("Test Deadbolt", _ => {
    describe("Test fundamental methods on Deadbolt.prototype", _ => {
        it("Deadbolt.prototype.parser:", done => {
            done();
        });

        it("Deadbolt.prototype.transformer:", done => {
            done();
        });

        it("Deadbolt.prototype.judgerGenerator:", done => {
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
            it("Deadbolt.prototype.subjectPresent: Subject has identifier, subjectPresent -> pass", done => {
                subject.identifier = "has";
                const judger = filter.compile(filter.subjectPresent());
                const result = judger(subject.identifier, [], []);
                assert.deepStrictEqual(result, true);
                done();
            });

            it("Deadbolt.prototype.subjectPresent: Subject has no identifier, subjectPresent -> failure", done => {
                subject.identifier = "";
                const judger = filter.compile(filter.subjectPresent());
                const result = judger(subject.identifier, [], []);
                assert.deepStrictEqual(result, false);
                done();
            });

            it("Subject has identifier, subjectNotPresent -> pass", done => {
                subject.identifier = "has";
                const judger = filter.compile(filter.subjectNotPresent());
                const result = judger(subject.identifier, [], []);
                assert.deepStrictEqual(result, true);
                done();
            });

            it("Subject has no identifier, subjectNotPresent -> pass", done => {
                subject.identifier = "";
                const judger = filter.compile(filter.subjectNotPresent());
                const result = judger(subject.identifier, [], []);
                assert.deepStrictEqual(result, true);
                done();
            });

            it("Subject has correct role, role -> pass", done => {
                subject.roles = ["correct"];
                const judger = filter.compile(filter.role("correct"));
                const result = judger("", subject.roles, []);
                assert.deepStrictEqual(result, true);
                done();
            });

            it("Subject has no role, role -> failure", done => {
                subject.roles = [];
                const judger = filter.compile(filter.role("correct"));
                const result = judger("", subject.roles, []);
                assert.deepStrictEqual(result, false);
                done();
            });

            it("Subject has no correct role, role -> failure", done => {
                subject.roles = ["nocorrect"];
                const judger = filter.compile(filter.role("correct"));
                const result = judger("", subject.roles, []);
                assert.deepStrictEqual(result, false);
                done();
            });

            it("Subject")
        });

        describe("AdvancedNode Test", _ => {

        });
    });

    describe("Test and expression", _ => {
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
            assert.deepStrictEqual(result, true);

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
            assert.deepStrictEqual(result, false);

            done();
        });
    });
});

