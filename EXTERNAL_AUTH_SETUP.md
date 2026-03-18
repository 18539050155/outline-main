# External Authentication Setup Guide

## Overview
This guide explains how to integrate your external user system with Outline's authentication system.

## Prerequisites
1. Your external system must support OAuth 2.0 protocol
2. You need client ID and client secret from your external auth provider
3. You need to know the authorization URL, token URL, and user info URL of your external system

## Installation

### 1. Enable External Auth Plugin
Add the following environment variables to your Outline configuration:

```bash
EXTERNAL_AUTH_CLIENT_ID=your_client_id
EXTERNAL_AUTH_CLIENT_SECRET=your_client_secret
EXTERNAL_AUTH_AUTHORIZATION_URL=https://your-external-auth.com/oauth2/authorize
EXTERNAL_AUTH_TOKEN_URL=https://your-external-auth.com/oauth2/token
EXTERNAL_AUTH_USER_INFO_URL=https://your-external-auth.com/oauth2/userinfo
```

### 2. Configure Callback URL
In your external auth provider, add the following callback URL:
```
https://your-outline-domain.com/auth/external-auth.callback
```

### 3. Restart Outline
Restart your Outline server to load the new plugin.

## Customization

### Modify Scopes
Edit `plugins/external-auth/server/auth/external-auth.ts` to change the requested scopes:

```typescript
const scopes = ["openid", "profile", "email"];
```

### Custom User Info Mapping
If your external system returns user info in a different format, update the mapping in the strategy callback:

```typescript
const result = await accountProvisioner({
  teamId: team?.id,
  email: userInfo.email || profile.email,
  name: userInfo.name || profile.displayName,
  avatarUrl: userInfo.picture || profile.photos?.[0]?.value,
  authenticationProvider: config.id,
  authenticationId: profile.id,
  existingUser,
  client,
});
```

## Testing

1. Go to your Outline login page
2. You should see "External Authentication" as an option
3. Click on it to be redirected to your external system's login page
4. After successful authentication, you should be redirected back to Outline and logged in

## Troubleshooting

### Check Logs
Enable debug logs to see detailed authentication flow:

```bash
DEBUG="auth,passport"
```

### Verify Environment Variables
Make sure all required environment variables are set correctly:

```bash
printenv | grep EXTERNAL_AUTH
```

### Check Plugin Status
The plugin should be loaded automatically when enabled. You can verify by checking the server logs for:
```
Plugin(type=authProvider) registered External Authentication
```

## Advanced Options

### Group Sync
If you want to sync user groups from your external system, you can implement a GroupSyncProvider:

```typescript
PluginManager.add([
  {
    type: Hook.GroupSyncProvider,
    value: { id: config.id, provider: new ExternalGroupSyncProvider() },
  },
]);
```

### Custom Strategy
If your external system uses a different authentication protocol (e.g., SAML), you can replace the OAuth2Strategy with a different passport strategy.

## Security Considerations

1. Always use HTTPS in production
2. Keep client ID and client secret secure
3. Limit the scope of access requested from the external system
4. Validate all user data returned from the external system
5. Implement proper error handling and logging

## Support

If you encounter issues during setup, please check:
- Outline documentation: https://www.getoutline.com/docs
- GitHub issues: https://github.com/outline/outline/issues
- Community forum: https://discuss.getoutline.com/
