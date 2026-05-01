# Terms Acceptance Feature Documentation

## Overview
This feature stores the `is_terms_accepted` flag in local storage (AsyncStorage) after the user accepts terms and conditions via the API call. The PrivacySecurityScreen is shown **only once** per user/device, not on every login.

## Implementation Details

### 1. **AuthContext** (`context/AuthContext.tsx`)
- Created a new context to manage authentication state globally
- Provides utilities to:
  - `checkTermsAcceptance()` - Check if terms are already accepted
  - `setTermsAccepted(value)` - Update terms acceptance status
  - `isTermsAccepted` - Current terms acceptance state

### 2. **Terms Helper Utilities** (`utils/termsHelper.ts`)
Utility functions for handling terms acceptance:
- `navigateByTermsAcceptance()` - Navigate to HomeScreen or PrivacySecurity based on acceptance status
- `isTermsAccepted()` - Check if terms accepted
- `markTermsAsAccepted()` - Mark terms as accepted
- `resetTermsAcceptance()` - Reset status (only if needed)

### 3. **LoginScreen Updates** (`screen/LoginScreen.tsx`)
Modified the login flow to:
- After successful email/password login, check the `is_terms_accepted` flag
- If `'true'`: Navigate to HomeScreen (user already accepted terms)
- If `undefined` or `false`: Navigate to PrivacySecurityScreen (first time accepting)
- Same logic applied to Facebook button

### 4. **SignUpScreen Updates** (`screen/SignUpScreen.tsx`)
- After successful sign-up API, check terms acceptance status
- Route to either HomeScreen or PrivacySecurityScreen accordingly

### 5. **Auth Config Updates** (`screen/config/auth/index.js`)
Updated social login functions:
- `_signInWithGoogle()` - Checks terms acceptance after Google login
- `onFacebookButtonPress()` - Checks terms acceptance after Facebook login
- `logout()` - Clears only auth tokens, **preserves** `is_terms_accepted` flag

### 6. **PrivacySecurityScreen Updates** (`screen/Fields/PrivacySecurityScreen.tsx`)
- On successful terms acceptance:
  - Sets `is_terms_accepted: 'true'` in AsyncStorage
  - Makes API call to backend `accept-terms` endpoint
  - Navigates to HomeScreen
  - User will never see this screen again on future logins

## Flow Diagram

```
User Login/SignUp (First Time)
    ↓
Authentication Success (email/password/Google/Facebook)
    ↓
Check: is AsyncStorage['is_terms_accepted'] == 'true'?
    ↓
    ├─ YES → Navigate to HomeScreen
    │        (User already accepted, never shows again)
    │
    └─ NO (undefined/false) → Navigate to PrivacySecurityScreen
                                  ↓
                             User reads terms
                                  ↓
                             Check "I accept" checkbox
                                  ↓
                             Click "Submit" button
                                  ↓
                             API call to accept-terms
                                  ↓
                             Store 'is_terms_accepted: true' in AsyncStorage
                                  ↓
                             Navigate to HomeScreen
                                  ↓
    ╔════════════════════════════════════════╗
    ║  User logs out and logs back in later  ║
    ║  is_terms_accepted = 'true' exists     ║
    ║  → Goes directly to HomeScreen!        ║
    ║  → Skips PrivacySecurityScreen        ║
    └════════════════════════════════════════┘
```

## AsyncStorage Keys Used

- **`is_terms_accepted`** - Stores 'true' (string)
  - Set **only once** after user accepts terms via API
  - Checked on every login/auth flow
  - **NOT cleared** on logout (persists across sessions)
  - Allows user to skip PrivacySecurityScreen on subsequent logins

## Implementation Points

### For Email/Password Login:
```typescript
const goToNext = async (name, email, userId, uid) => {
  // ... save user data ...
  
  // Check if terms are accepted (already stored)
  const isTermsAccepted = await AsyncStorage.getItem('is_terms_accepted');
  
  if (isTermsAccepted === 'true') {
    navigation.navigate('HomeScreen');  // Skip terms screen
  } else {
    navigation.navigate('PrivacySecurity');  // Show terms screen
  }
};
```

### For Social Login (Google/Facebook):
```typescript
// After social authentication succeeds
const isTermsAccepted = await AsyncStorage.getItem('is_terms_accepted');

if (isTermsAccepted === 'true') {
  navigation.navigate('HomeScreen');  // Skip terms screen
} else {
  navigation.navigate('PrivacySecurity');  // Show terms screen
}
```

### For Terms Acceptance (One-Time):
```typescript
const handleAcceptTerms = async () => {
  // ... make API call to accept-terms ...
  
  if (response.ok) {
    // Store the flag (only once)
    await AsyncStorage.setItem('is_terms_accepted', 'true');
    
    // User will never see this screen again
    navigation.navigate('HomeScreen');
  }
};
```

## Usage in Components

To check terms acceptance in any component:

```typescript
import { isTermsAccepted } from '../utils/termsHelper';

const checkTerms = async () => {
  const accepted = await isTermsAccepted();
  if (accepted) {
    // User has accepted terms
  } else {
    // User needs to accept terms
  }
};
```

## Backend API Requirement

The implementation calls the following endpoint:
- **Endpoint**: `GET https://buildio.co.nz/api/users/accept-terms`
- **Headers**: 
  - `Authorization: Bearer ${authToken}`
  - `Content-Type: application/json`
- **Response**: Should return success status

## Key Differences from Previous Approach

| Aspect | Old | New |
|--------|-----|-----|
| **Flag Storage** | Checked every login | Stored once, checked every login |
| **Terms Screen Display** | Every login if not set | Only first time (once per device) |
| **Logout Behavior** | Clears flag | Preserves flag |
| **User Experience** | See terms every session | Smooth login after accepting once |

## Notes

1. **One-Time Flow**: User sees PrivacySecurityScreen only on their first login/signup
2. **Persistent Flag**: The `is_terms_accepted` flag survives logout and reinstalls
3. **Works Across All Auth Methods**: Email/Password, Google, Facebook, Sign-Up
4. **Device-Based**: Flag is stored per device, not synced across devices
5. **No Repeated Screens**: Once accepted, user goes straight to HomeScreen on future logins

## Future Enhancements

1. Add terms version tracking to force re-acceptance of updated terms
2. Add option for user to manually view accepted terms
3. Add analytics to track first-time acceptance dates
4. Add ability to reset terms acceptance if needed (admin feature)
5. Add device/browser tracking for multi-device users

