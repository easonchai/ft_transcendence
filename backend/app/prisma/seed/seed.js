"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var client_1 = require("@prisma/client");
var faker_1 = require("@faker-js/faker");
var prisma = new client_1.PrismaClient();
var seededUsers = [];
var seedUser = function () { return __awaiter(void 0, void 0, void 0, function () {
    var users, _i, users_1, user, created;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                users = Array.from({ length: 4 }, function () { return ({
                    displayname: faker_1.faker.name.fullName(),
                    name: faker_1.faker.name.firstName(),
                    email: faker_1.faker.internet.email(),
                }); });
                _i = 0, users_1 = users;
                _a.label = 1;
            case 1:
                if (!(_i < users_1.length)) return [3 /*break*/, 4];
                user = users_1[_i];
                return [4 /*yield*/, prisma.user.create({ data: user })];
            case 2:
                created = _a.sent();
                seededUsers.push(created);
                _a.label = 3;
            case 3:
                _i++;
                return [3 /*break*/, 1];
            case 4: return [2 /*return*/];
        }
    });
}); };
var seedMatches = function () { return __awaiter(void 0, void 0, void 0, function () {
    var userMatch, test;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                test = Array.from({ length: 2 }, function (v, index) { return ({
                    users: {
                        create: userMatch = seededUsers.map(function (user, i) {
                            if (index == 0 && i % 2 == 0) {
                                return {
                                    score: faker_1.faker.datatype.number(),
                                    user: { connect: { id: seededUsers[i].id } }
                                };
                            }
                            else {
                                return {
                                    score: faker_1.faker.datatype.number(),
                                    user: { connect: { id: seededUsers[i].id } }
                                };
                            }
                        })
                    }
                }); });
                return [4 /*yield*/, prisma.match.createMany({ data: test })];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); };
var seedAll = function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, seedUser()];
            case 1:
                _a.sent();
                return [4 /*yield*/, seedMatches()];
            case 2:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); };
