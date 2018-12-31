"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const apollo_errors_1 = require("apollo-errors");
const graphql_1 = require("graphql");
const graphql_tools_1 = require("graphql-tools");
const AuthError = apollo_errors_1.createError('AuthError', {
    message: 'Access denied'
});
class KeyCloakDirective extends graphql_tools_1.SchemaDirectiveVisitor {
    static getDirectiveDeclaration() {
        return new graphql_1.GraphQLDirective({
            locations: [graphql_1.DirectiveLocation.FIELD_DEFINITION, graphql_1.DirectiveLocation.OBJECT],
            name: 'protect'
        });
    }
    visitObject(type) {
        this.ensureFieldsWrapped(type);
        type._requiredAuthRole = this.args.requires;
    }
    // Visitor methods for nested types like fields and arguments
    // also receive a details object that provides information about
    // the parent and grandparent types.
    visitFieldDefinition(field, details) {
        this.ensureFieldsWrapped(details.objectType);
        field._requiredAuthRole = this.args.requires;
    }
    ensureFieldsWrapped(objectType) {
        // Mark the GraphQLObjectType object to avoid re-wrapping:
        if (objectType._authFieldsWrapped)
            return;
        objectType._authFieldsWrapped = true;
        const fields = objectType.getFields();
        Object.keys(fields).forEach(fieldName => {
            const field = fields[fieldName];
            const { resolve = graphql_1.defaultFieldResolver } = field;
            field.resolve = async function (...args) {
                // Get the required Role from the field first, falling back
                // to the objectType if no Role is required by the field:
                const requiredRole = field._requiredAuthRole ||
                    objectType._requiredAuthRole;
                if (!requiredRole) {
                    return resolve.apply(this, args);
                }
                const context = args[3];
                console.log(context);
                return resolve.apply(this, args);
            };
        });
    }
}
