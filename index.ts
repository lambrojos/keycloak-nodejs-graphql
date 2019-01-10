import { defaultFieldResolver, DirectiveLocation, GraphQLDirective,
   GraphQLField, GraphQLObjectType, GraphQLString } from 'graphql'
import { SchemaDirectiveVisitor } from 'graphql-tools'
import AccessToken from './AccessToken'

import jwt from 'jsonwebtoken'

const formatPublicKey = (key: string) =>
  `-----BEGIN PUBLIC KEY-----\n${key}\n-----END PUBLIC KEY-----\n`

interface IOpts {
  jwtKey: string,
  clientId: string,
  authenticationError: string,
  authorizationError: string
}

export default ({
  jwtKey,
  clientId,
  authenticationError = 'not authenticated',
  authorizationError = 'Unauthorized'
}: IOpts) =>
class KeyCloakDirective extends SchemaDirectiveVisitor {

  public static getDirectiveDeclaration () {
    return new GraphQLDirective({
      args: {
        group: {
          type: GraphQLString
        },
        role: {
          type: GraphQLString
        }
      },
      locations: [DirectiveLocation.FIELD_DEFINITION, DirectiveLocation.OBJECT],
      name: 'protect'
    })
  }

  private authenticationError: string
  private authorizationError: string

  constructor (config: any) {
    super(config)
    this.authenticationError = config.args.authenticationError || authenticationError
    this.authorizationError = config.args.authorizationError || authorizationError
  }

  public visitObject (type: GraphQLObjectType) {
    return Object.values(type.getFields()).forEach(this.visitFieldDefinition.bind(this))
  }

  public visitFieldDefinition (field: GraphQLField<any, any>) {
    const { resolve = defaultFieldResolver } = field
    field.resolve = (root: any, args: any, ctx: any, info: any) => {
      let ok = true
      if (! ctx.accessToken) {
        ctx.accessToken = new AccessToken(this.verifyKey(ctx.token) as token, clientId)
      }
      if (this.args.group) {
        ok = ctx.accessToken.hasGroup(this.args.group)
      }
      if (this.args.role) {
        ok = ctx.accessToken.hasRole(this.args.role)
      }
      if (!ok) {
        throw new Error(this.authorizationError)
      }
      return resolve.call(this, root, args, ctx, info)
    }
  }

  private verifyKey (token: string) {
    try {
      return jwt.verify(token, formatPublicKey(jwtKey))
    } catch (e) {
      throw new Error(this.authenticationError)
    }
  }
}
