import { createError } from 'apollo-errors'
import { defaultFieldResolver, DirectiveLocation, GraphQLDirective, GraphQLObjectType, GraphQLField } from 'graphql'
import { SchemaDirectiveVisitor } from 'graphql-tools'

type AuthObjectType = GraphQLObjectType & {
  _requiredAuthRole: string | undefined
  _authFieldsWrapped: boolean | undefined
}
type AuthField = GraphQLField<any, any> & {
  _requiredAuthRole: string | undefined
}

const AuthError = createError('AuthError', {
  message: 'Access denied'
})

class KeyCloakDirective extends SchemaDirectiveVisitor {

  public static getDirectiveDeclaration () {
    return new GraphQLDirective({
      locations: [DirectiveLocation.FIELD_DEFINITION, DirectiveLocation.OBJECT],
      name: 'protect'
    })
  }

  visitObject(type: AuthObjectType) {
    this.ensureFieldsWrapped(type);
    type._requiredAuthRole = this.args.requires;
  }
  // Visitor methods for nested types like fields and arguments
  // also receive a details object that provides information about
  // the parent and grandparent types.
  visitFieldDefinition(field: AuthField, details: { objectType : AuthObjectType}) {
    this.ensureFieldsWrapped(details.objectType);
    field._requiredAuthRole = this.args.requires;
  }

  ensureFieldsWrapped(objectType: AuthObjectType) {
    // Mark the GraphQLObjectType object to avoid re-wrapping:
    if (objectType._authFieldsWrapped) return;
    objectType._authFieldsWrapped = true;

    const fields = objectType.getFields();

    Object.keys(fields).forEach(fieldName => {
      const field = <AuthField> fields[fieldName];
      const { resolve = defaultFieldResolver } = field;
      field.resolve = async function (...args) {
        // Get the required Role from the field first, falling back
        // to the objectType if no Role is required by the field:
        const requiredRole =
          field._requiredAuthRole ||
          objectType._requiredAuthRole;

        if (! requiredRole) {
          return resolve.apply(this, args);
        }

        const context = args[3];
        console.log(context);
        return resolve.apply(this, args);
      };
    });
  }
}