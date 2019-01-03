"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const graphql_1 = require("graphql");
const AccessToken_1 = __importDefault(require("./AccessToken"));
const graphql_tools_1 = require("graphql-tools");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const formatPublicKey = (key) => `-----BEGIN PUBLIC KEY-----\n${key}\n-----END PUBLIC KEY-----\n`;
exports.default = (opts) => class KeyCloakDirective extends graphql_tools_1.SchemaDirectiveVisitor {
    static getDirectiveDeclaration() {
        return new graphql_1.GraphQLDirective({
            locations: [graphql_1.DirectiveLocation.FIELD_DEFINITION, graphql_1.DirectiveLocation.OBJECT],
            name: 'protect'
        });
    }
    visitObject(type) {
        Object.values(type.getFields()).forEach(this.visitFieldDefinition.bind(this));
    }
    visitFieldDefinition(field) {
        const { resolve = graphql_1.defaultFieldResolver } = field;
        console.log(field.name);
        field.resolve = (root, args, ctx, info) => {
            console.log('apperino');
            if (!ctx.accessToken) {
                ctx.accessToken = new AccessToken_1.default(this.verifyKey(ctx.token), args.clientId);
            }
            return resolve.call(this, root, args, ctx, info);
        };
    }
    verifyKey(token) {
        return jsonwebtoken_1.default.verify(token, formatPublicKey(opts.jwtKey));
    }
};
