"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class AccessToken {
    constructor(content, clientId) {
        this.content = content;
        this.clientId = clientId;
    }
    hasRole(name) {
        if (!this.clientId) {
            return false;
        }
        const parts = name.split(':');
        if (parts.length === 1) {
            return this.hasApplicationRole(this.clientId, parts[0]);
        }
        if (parts[0] === 'realm') {
            return this.hasRealmRole(parts[1]);
        }
        return this.hasApplicationRole(parts[0], parts[1]);
    }
    hasRealmRole(roleName) {
        if (!this.content.realm_access || !this.content.realm_access.roles) {
            return false;
        }
        return (this.content.realm_access.roles.indexOf(roleName) >= 0);
    }
    hasPermission(resource, scope) {
        const permissions = this.content.authorization ? this.content.authorization.permissions : undefined;
        if (!permissions) {
            return false;
        }
        for (const permission of permissions) {
            if (permission.rsid === resource || permission.rsname === resource) {
                if (scope) {
                    if (permission.scopes && permission.scopes.length > 0) {
                        if (!permission.scopes.includes(scope)) {
                            return false;
                        }
                    }
                }
                return true;
            }
        }
        return false;
    }
    hasApplicationRole(appName, roleName) {
        const appRoles = this.content.resource_access[appName];
        if (!appRoles) {
            return false;
        }
        return (appRoles.roles.indexOf(roleName) >= 0);
    }
}
exports.default = AccessToken;
