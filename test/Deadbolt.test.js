"use strict";

process.env.NODE_ENV = "test";

const assert = require("assert");
const { Deadbolt } = require("../src/Deadbolt.js");

describe("Deadbolt Test", _ => {
    class DeadboltHandler {
        set subject(subject) {
            this._subject = subject;
        }

        get subject() {
            return this._subject;
        }

        beforeAuthCheck(req, res, next) {
            console.log("beforeAuthCheck");
        }

        onAuthFailure(req, res, next) {
            console.log("onAuthFailure");
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

    describe("Test and expression", _ => {
        it("Meet the conditions, -> true", done => {
            subject.identifier = "root";
            subject.roles = ["admin", "test", "one", "two"];
            subject.permissions = ["delete_everything", "create_something", "do_anything", "do_one", "do_two"];

            const judger = filter.getJudger({
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

            const judger = filter.getJudger({
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

