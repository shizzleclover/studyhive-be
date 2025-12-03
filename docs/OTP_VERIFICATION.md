# OTP Email Verification System

## ✅ Updated to 6-Digit OTP

The email verification system has been updated from token-based links to a **6-digit OTP (One-Time Password)** system for better security and user experience.

---

## 🔄 What Changed

### Before (Token System)
- Long verification token sent via email
- Click link to verify
- Token expires in 24 hours

### After (OTP System) ✅
- **6-digit numeric code** sent via email
- Enter code to verify
- OTP expires in **10 minutes** (more secure)
- Better mobile experience

---

## 📧 Email Format

Users now receive a beautifully formatted email with:

```
🎓 StudyHive

Welcome, [Name]!

Your Verification Code
━━━━━━━━━━━━━━━━━━━━
    1 2 3 4 5 6
━━━━━━━━━━━━━━━━━━━━

Enter this code in the verification page.
This code will expire in 10 minutes.
```

---

## 🔐 How It Works

### 1. Signup Flow
```
1. User signs up
2. System generates 6-digit OTP (e.g., 123456)
3. OTP is hashed and stored in database
4. Email sent with OTP
5. User enters OTP to verify
```

### 2. OTP Generation
- **Format**: Exactly 6 digits (000000 - 999999)
- **Storage**: Hashed using SHA256 (never stored in plain text)
- **Expiry**: 10 minutes from generation
- **Security**: One-time use (deleted after verification)

### 3. Verification Process
```
1. User enters 6-digit OTP
2. System hashes the input OTP
3. Compares with stored hashed OTP
4. Checks expiry time
5. Verifies email if valid
```

---

## 🛠️ Technical Implementation

### Database Schema
```javascript
{
  emailVerificationOTP: String (hashed),
  emailVerificationOTPExpiry: Date (10 minutes)
}
```

### API Endpoints

#### Signup
```http
POST /api/auth/signup
Body: { name, email, password }
Response: { user, accessToken, refreshToken, verificationOTP? }
```

#### Verify Email
```http
POST /api/auth/verify-email
Body: { otp: "123456" }
Response: { message: "Email verified successfully" }
```

#### Resend OTP
```http
POST /api/auth/resend-verification
Body: { email: "user@example.com" }
Response: { message: "Verification email sent" }
```

---

## 📝 Validation Rules

### OTP Format
- **Required**: Yes
- **Type**: String
- **Pattern**: `^[0-9]{6}$` (exactly 6 digits)
- **Example**: `123456`

### Error Messages
- `"OTP must be exactly 6 digits"` - Invalid format
- `"Invalid or expired OTP. Please request a new OTP."` - Wrong/expired OTP
- `"OTP is required"` - Missing OTP

---

## 🎨 Test UI Updates

### Enhanced Verification Section
- ✅ **OTP Input Field** - Only accepts numbers, max 6 digits
- ✅ **Auto-fill** - OTP auto-filled in development mode
- ✅ **Resend Button** - Request new OTP easily
- ✅ **Visual Feedback** - Clear instructions and expiry notice

### User Experience
1. Sign up → OTP appears in response panel
2. OTP auto-fills in verification field (dev mode)
3. Click "Verify Email" → Done!
4. Or use "Resend OTP" if needed

---

## 🔒 Security Features

### OTP Security
- ✅ **Hashed Storage** - Never stored in plain text
- ✅ **Short Expiry** - 10 minutes (vs 24 hours for tokens)
- ✅ **One-Time Use** - Deleted after verification
- ✅ **Format Validation** - Must be exactly 6 digits
- ✅ **Rate Limiting** - Prevents brute force attacks

### Best Practices
- OTP expires quickly (10 min)
- Cannot reuse OTP
- Hashed before storage
- Validated format before processing

---

## 📊 Swagger Documentation

All endpoints are fully documented in Swagger:

- **Signup** - Shows OTP in response (dev mode)
- **Verify Email** - OTP format and examples
- **Resend Verification** - New OTP generation

Visit: `http://localhost:5000/api-docs`

---

## 🧪 Testing

### Development Mode
In development, the OTP is included in the API response:

```json
{
  "data": {
    "user": { ... },
    "accessToken": "...",
    "refreshToken": "...",
    "verificationOTP": "123456"
  }
}
```

### Production Mode
In production, OTP is **never** returned in API responses for security.

---

## 📱 Mobile-Friendly

The OTP system is perfect for mobile:
- ✅ Easy to type (6 digits)
- ✅ No link clicking needed
- ✅ Works in any email client
- ✅ Fast verification process

---

## 🔄 Migration Notes

### Backward Compatibility
- Legacy `verificationToken` fields still exist
- Old tokens can still be verified (if not expired)
- New signups use OTP system
- Gradual migration supported

### Database
- New fields: `emailVerificationOTP`, `emailVerificationOTPExpiry`
- Old fields: `verificationToken`, `verificationTokenExpiry` (kept for compatibility)

---

## 💡 Usage Examples

### Signup & Verify
```javascript
// 1. Sign up
POST /api/auth/signup
{ name: "John", email: "john@example.com", password: "pass123" }

// Response includes OTP in dev mode
{ verificationOTP: "123456" }

// 2. Verify
POST /api/auth/verify-email
{ otp: "123456" }

// Success!
{ message: "Email verified successfully" }
```

### Resend OTP
```javascript
// If OTP expired or not received
POST /api/auth/resend-verification
{ email: "john@example.com" }

// New OTP sent!
{ message: "Verification email sent" }
```

---

## ✅ Benefits

1. **Better Security** - Shorter expiry, one-time use
2. **Mobile Friendly** - Easy to enter on phones
3. **User Experience** - No link clicking needed
4. **Professional** - Industry-standard approach
5. **Flexible** - Works in any email client

---

## 🚀 Ready to Use!

The OTP system is fully implemented and ready for production. All endpoints are documented, tested, and working!

**Test it now:**
1. Go to `http://localhost:5000`
2. Sign up with any email
3. Check response panel for OTP (dev mode)
4. Enter OTP to verify
5. Login and enjoy! 🎉

---

**Last Updated**: December 2024

