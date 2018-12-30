import { AuthenticationError } from 'apollo-errors'
import { DirectiveLocation, GraphQLDirective } from 'graphql'
import { SchemaDirectiveVisitor } from 'graphql-tools'

class KeyCloakDirective extends SchemaDirectiveVisitor {

  public static getDirectiveDeclaration () {
    return new GraphQLDirective({
      locations: [DirectiveLocation.FIELD_DEFINITION, DirectiveLocation.OBJECT],
      name: 'protect'
    })
  }
  public visitFieldDefinition (field) {
    field.resolve = (ctx, args, context, info) => {
      if (!ctx || ! ctx.kauth) {
        throw new AuthenticationError()
      }
    }
  }
}
