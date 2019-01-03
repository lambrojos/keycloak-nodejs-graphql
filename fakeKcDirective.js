const jwt = require('jsonwebtoken')
const keycloakDirective = require('keycloak-nodejs-graphql').default

module.exports = ({ settings }) => {
  const KeyCloakDirective = keycloakDirective(
    {
      jwtKey: settings.jwtKey,
      clientId: settings.sso.connect.resource
    }
  )

  return class FakeKeyCloakDirective extends KeyCloakDirective {
    verifyKey (token, opts = {}) {
      return jwt.verify(token, 'notsosecret', opts)
    }
  }
}

