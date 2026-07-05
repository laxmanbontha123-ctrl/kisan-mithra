"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
const client_1 = require("../generated/prisma/client");
const prismaClient = new client_1.PrismaClient({
    datasourceUrl: process.env.DATABASE_URL,
});
exports.prisma = prismaClient;
exports.default = exports.prisma;
//# sourceMappingURL=prisma.js.map