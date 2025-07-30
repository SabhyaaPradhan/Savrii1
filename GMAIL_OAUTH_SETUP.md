# Gmail OAuth Setup Instructions

## Current Status: 500 Error on Google Consent Screen

### Root Cause
The Google OAuth consent screen is not properly configured, causing a 500 error when users try to authorize the Gmail integration.

### Required Fix - Google Cloud Console Configuration

1. **Navigate to OAuth Consent Screen**
   - Go to: https://console.cloud.google.com/apis/credentials/consent
   - Select project with Client ID: `285787968853-k0j1s7kkjljprjpphekoohikrrc49k18`

2. **Complete Required Fields**
   ```
   App name: Savrii Gmail Integration
   User support email: pradhansabhyaa@gmail.com
   Developer contact information: pradhansabhyaa@gmail.com
   App domain: www.savrii.com
   ```

3. **Add Test Users** (CRITICAL)
   ```
   Test users section:
   - pradhansabhyaa@gmail.com
   ```

4. **Configure Scopes**
   ```
   Required scopes:
   - https://www.googleapis.com/auth/gmail.modify
   - https://www.googleapis.com/auth/gmail.send  
   - https://www.googleapis.com/auth/userinfo.email
   ```

5. **Authorized Redirect URIs**
   ```
   In OAuth 2.0 Client credentials:
   - https://63fdb543-6b9f-4796-92d9-980d5a2c95a1-00-2r8z5z1khoka3.janeway.replit.dev/api/email/auth/gmail/callback
   ```

### Current OAuth Configuration
- **Client ID**: 285787968853-k0j1s7kkjljprjpphekoohikrrc49k18.apps.googleusercontent.com
- **Environment**: Replit development
- **App Domain**: 63fdb543-6b9f-4796-92d9-980d5a2c95a1-00-2r8z5z1khoka3.janeway.replit.dev

### Expected Result
After completing the configuration:
1. Gmail OAuth will work without 500 errors
2. User can authorize Gmail access
3. Integration will be stored in database
4. AI-powered email replies will be available for Pro/Enterprise users

### Testing Steps
1. Complete Google Cloud Console configuration
2. Wait 5-10 minutes for changes to propagate
3. Try Gmail connection again from Integrations page
4. Should redirect to proper Google consent screen
5. After authorization, should redirect back to app successfully