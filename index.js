"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const graphql_1 = require("graphql");
const graphql_tools_1 = require("graphql-tools");
const AccessToken_1 = __importDefault(require("./AccessToken"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const formatPublicKey = (key) => `-----BEGIN PUBLIC KEY-----\n${key}\n-----END PUBLIC KEY-----\n`;
exports.default = ({ jwtKey, clientId, authenticationError = 'not authenticated', authorizationError = 'Unauthorized' }) => class KeyCloakDirective extends graphql_tools_1.SchemaDirectiveVisitor {
    static getDirectiveDeclaration() {
        return new graphql_1.GraphQLDirective({
            args: {
                group: {
                    type: graphql_1.GraphQLString
                },
                role: {
                    type: graphql_1.GraphQLString
                }
            },
            locations: [graphql_1.DirectiveLocation.FIELD_DEFINITION, graphql_1.DirectiveLocation.OBJECT],
            name: 'protect'
        });
    }
    constructor(config) {
        super(config);
        this.authenticationError = config.args.authenticationError || authenticationError;
        this.authorizationError = config.args.authorizationError || authorizationError;
    }
    visitObject(type) {
        return Object.values(type.getFields()).forEach(this.visitFieldDefinition.bind(this));
    }
    visitFieldDefinition(field) {
        const { resolve = graphql_1.defaultFieldResolver } = field;
        field.resolve = (root, args, ctx, info) => {
            let ok = true;
            if (!ctx.accessToken) {
                ctx.accessToken = new AccessToken_1.default(this.verifyKey(ctx.token), clientId);
            }
            if (this.args.group) {
                ok = ctx.accessToken.hasGroup(this.args.group);
            }
            if (this.args.role) {
                ok = ctx.accessToken.hasRole(this.args.role);
            }
            if (!ok) {
                throw new Error(this.authorizationError);
            }
            return resolve.call(this, root, args, ctx, info);
        };
    }
    verifyKey(token) {
        try {
            return jsonwebtoken_1.default.verify(token, formatPublicKey(jwtKey));
        }
        catch (e) {
            throw new Error(this.authenticationError);
        }
    }
};
