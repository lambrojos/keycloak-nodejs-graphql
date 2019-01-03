type token = {
  jti: string,
  exp: number,
  nbf: number,
  iat: number,
  iss: string,
  aud: string,
  sub: string,
  typ: string,
  azp: string,
  auth_time: number,
  session_state: string,
  acr: string,
  'allowed-origins': [string],
  realm_access: { roles: [ string ] },
  resource_access: { [appName: string]: { roles: [string] } },
  groups: [string],
  [k: string]: any
 }