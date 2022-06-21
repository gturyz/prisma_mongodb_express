"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
        while (_) try {
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var express_1 = __importDefault(require("express"));
var dotenv_1 = __importDefault(require("dotenv"));
var bcrypt = __importStar(require("bcrypt"));
var joi_1 = __importDefault(require("joi"));
var client_1 = require("@prisma/client");
var jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
var cors_1 = __importDefault(require("cors"));
dotenv_1["default"].config();
if (!process.env.JWT_PRIVATE_KEY) {
    console.log("Vous devez créer un fichier .env qui contient la variable JWT_PRIVATE_KEY");
    process.exit(1);
}
var prisma = new client_1.PrismaClient();
var app = (0, express_1["default"])();
var port = process.env.PORT;
var SECRET_KEY = process.env.JWT_PRIVATE_KEY;
var allowedOrigins = ['http://localhost:3000'];
var options = {
    origin: allowedOrigins
};
// Then pass these options to cors:
app.use((0, cors_1["default"])(options));
app.use(express_1["default"].json());
function authGuard(req, res, next) {
    var _this = this;
    var authHeader = req.headers["authorization"];
    var token = authHeader && authHeader.split(" ")[1];
    if (!token)
        return res.status(401).json({ erreur: "Vous devez vous connecter" });
    jsonwebtoken_1["default"].verify(token, SECRET_KEY, function (err, data) { return __awaiter(_this, void 0, void 0, function () {
        var user;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (err)
                        return [2 /*return*/, res.status(400).json({ erreur: "Token Invalide" })];
                    return [4 /*yield*/, prisma.user.findUnique({ where: { id: data.jti } })];
                case 1:
                    user = _a.sent();
                    req.user = user;
                    next();
                    return [2 /*return*/];
            }
        });
    }); });
}
app.post("/signup", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var payload, schema, _a, account, error, user, salt, passwordHashed;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                payload = req.body;
                schema = joi_1["default"].object({
                    email: joi_1["default"].string().required().email(),
                    username: joi_1["default"].string().required(),
                    password: joi_1["default"].string().required()
                });
                _a = schema.validate(payload), account = _a.value, error = _a.error;
                if (error)
                    return [2 /*return*/, res.status(400).send({ erreur: error.details[0].message })];
                return [4 /*yield*/, prisma.user.findUnique({ where: { email: account.email } })];
            case 1:
                user = _b.sent();
                if (user)
                    return [2 /*return*/, res.status(400).send("Please signin instead of signup")];
                return [4 /*yield*/, bcrypt.genSalt(10)];
            case 2:
                salt = _b.sent();
                return [4 /*yield*/, bcrypt.hash(account.password, salt)];
            case 3:
                passwordHashed = _b.sent();
                account.password = passwordHashed;
                return [4 /*yield*/, prisma.user.create({
                        data: account
                    })];
            case 4:
                _b.sent();
                res.status(201).json({
                    username: account.username,
                    email: account.email
                });
                return [2 /*return*/];
        }
    });
}); });
app.post("/signin", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var payload, schema, _a, connexion, error, user, passwordIsValid, token;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                payload = req.body;
                schema = joi_1["default"].object({
                    email: joi_1["default"].string().required().email(),
                    password: joi_1["default"].string().required()
                });
                _a = schema.validate(payload), connexion = _a.value, error = _a.error;
                if (error)
                    return [2 /*return*/, res.status(400).send({ erreur: error.details[0].message })];
                return [4 /*yield*/, prisma.user.findUnique({ where: { email: payload.email } })];
            case 1:
                user = _b.sent();
                if (!user)
                    return [2 /*return*/, res.status(400).send({ erreur: "Email Invalide" })];
                return [4 /*yield*/, bcrypt.compare(req.body.password, user.password)];
            case 2:
                passwordIsValid = _b.sent();
                if (!passwordIsValid)
                    return [2 /*return*/, res.status(400).send({ erreur: "Mot de Passe Invalide" })];
                token = jsonwebtoken_1["default"].sign({ jti: user.id }, SECRET_KEY);
                res
                    .status(200)
                    .send({ username: user.username, token: token });
                return [2 /*return*/];
        }
    });
}); });
app.get('/', function (req, res) {
    res.send('Express + TypeScript Server');
});
app.get("/api/tasks", authGuard, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var user, tasks;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                user = req.user;
                return [4 /*yield*/, prisma.task.findMany({
                        where: { by: user.id }
                    })];
            case 1:
                tasks = _a.sent();
                res.json(tasks);
                return [2 /*return*/];
        }
    });
}); });
app.get("/api/task/:id", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, task;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                id = req.params.id;
                return [4 /*yield*/, prisma.task.findUnique({
                        where: { id: id }
                    })];
            case 1:
                task = _a.sent();
                res.json(task);
                return [2 /*return*/];
        }
    });
}); });
app.post("/api/tasks", authGuard, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var payload, schema, _a, value, error, user, task;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                payload = req.body;
                schema = joi_1["default"].object({
                    description: joi_1["default"].string().required()
                });
                _a = schema.validate(payload), value = _a.value, error = _a.error;
                if (error)
                    return [2 /*return*/, res.status(400).send({ erreur: error.details[0].message })];
                user = req.user;
                return [4 /*yield*/, prisma.task.create({
                        data: {
                            description: value.description,
                            faite: true,
                            author: { connect: { email: user.email } }
                        }
                    })];
            case 1:
                task = _b.sent();
                res.json(task);
                return [2 /*return*/];
        }
    });
}); });
app.put("/api/task/:id", authGuard, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, payload, schema, _a, value, error, post;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                id = req.params.id;
                payload = req.body;
                schema = joi_1["default"].object({
                    description: joi_1["default"].string(),
                    faite: joi_1["default"].boolean()
                }).or('description', 'faite');
                _a = schema.validate(payload), value = _a.value, error = _a.error;
                if (error)
                    return [2 /*return*/, res.status(400).send({ erreur: error.details[0].message })];
                return [4 /*yield*/, prisma.task.update({
                        where: { id: id },
                        data: value
                    })];
            case 1:
                post = _b.sent();
                res.status(204).send();
                return [2 /*return*/];
        }
    });
}); });
app["delete"]("/api/task/:id", authGuard, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, user, task, t;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                id = req.params.id;
                user = req.user;
                return [4 /*yield*/, prisma.task.findUnique({
                        where: { id: id }
                    })];
            case 1:
                task = _a.sent();
                if (user.id !== (task === null || task === void 0 ? void 0 : task.by)) {
                    return [2 /*return*/, res.status(400).send({ erreur: "Cette tâche ne vous appartient pas" })];
                }
                return [4 /*yield*/, prisma.task["delete"]({ where: { id: id } })];
            case 2:
                t = _a.sent();
                res.status(204).send();
                return [2 /*return*/];
        }
    });
}); });
app.listen(port, function () {
    console.log("\u26A1\uFE0F[server]: Server is running at https://localhost:".concat(port));
});
//# sourceMappingURL=index.js.map