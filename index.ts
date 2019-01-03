import { defaultFieldResolver, DirectiveLocation, GraphQLDirective, GraphQLField, GraphQLObjectType } from 'graphql'
import { SchemaDirectiveVisitor } from 'graphql-tools'
import AccessToken from './AccessToken'

import jwt from 'jsonwebtoken'

const formatPublicKey = (key: string) =>
  `-----BEGIN PUBLIC KEY-----\n${key}\n-----END PUBLIC KEY-----\n`

interface IOpts { jwtKey: string, clientId: string}

export default (opts: IOpts) => class KeyCloakDirective extends SchemaDirectiveVisitor {

  public static getDirectiveDeclaration () {
    return new GraphQLDirective({
      locations: [DirectiveLocation.FIELD_DEFINITION, DirectiveLocation.OBJECT],
      name: 'protect'
    })
  }

  public visitObject (type: GraphQLObjectType) {
    Object.values(type.getFields()).forEach(this.visitFieldDefinition.bind(this))
  }

  public visitFieldDefinition (field: GraphQLField<any, any>) {
    const { resolve = defaultFieldResolver } = field

    field.resolve = (root: any, args: any, ctx: any, info: any) => {
      if (! ctx.accessToken) {
        ctx.accessToken = new AccessToken(this.verifyKey(ctx.token) as token, args.clientId)
      }

      return resolve.call(this, root, args, ctx, info)
    }
  }

  private verifyKey (token: string) {
    return jwt.verify(token, formatPublicKey(opts.jwtKey))
  }
}
