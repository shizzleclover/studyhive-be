# Email Troubleshooting Guide

## Issues Fixed

### ✅ Variable Name Conflict
**Problem:** The `email` parameter was conflicting with the `email` module import, causing `email.sendVerificationEmail()` to fail silently.

**Solution:** Renamed the email module import to `emailService` to avoid conflicts.

### ✅ Better Error Logging
Added comprehensive error logging to help diagnose SMTP issues:
- SMTP connection details
- Error messages and codes
- Response information

### ✅ Development Mode Token Return
In development mode, the verification token is now returned in the API response so you can test even if email fails.

---

## Testing Email Configuration

### 1. Check Server Startup
When you start the server, you should see:
```
✅ SMTP connection verified
```

If you see:
```
❌ SMTP connection failed: ...
```
Your SMTP configuration is incorrect.

### 2. Check .env Configuration

Make sure your `.env` file has:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=StudyHive <noreply@studyhive.com>
```

### 3. Gmail Setup

If using Gmail, you need to:

1. **Enable 2-Factor Authentication** on your Google account
2. **Generate an App Password**:
   - Go to: https://myaccount.google.com/apppasswords
   - Select "Mail" and "Other (Custom name)"
   - Enter "StudyHive"
   - Copy the 16-character password
   - Use this as `SMTP_PASS` (not your regular Gmail password)

### 4. Other Email Providers

#### Outlook/Hotmail
```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
```

#### Yahoo
```env
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=587
```

#### SendGrid
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
```

#### Mailgun
```env
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=your-mailgun-username
SMTP_PASS=your-mailgun-password
```

---

## Testing Without Email

### Development Mode
In development mode, the verification token is automatically included in the signup response:

```json
{
  "data": {
    "user": { ... },
    "accessToken": "...",
    "refreshToken": "...",
    "verificationToken": "abc123xyz..."
  }
}
```

**In the Test UI:**
1. Sign up
2. The verification token will appear in:
   - The alert popup
   - The response panel (bottom of page)
   - Auto-filled in the "Verify Email" field

3. Click "Verify" to verify your email

### Manual Testing
You can also check the server console logs. If email fails, you'll see:
```
📝 Verification token for user@example.com: abc123xyz...
```

Copy this token and use it to verify the email.

---

## Common Issues

### Issue: "SMTP connection failed"
**Causes:**
- Wrong SMTP host/port
- Incorrect credentials
- Firewall blocking port 587/465
- 2FA not enabled (for Gmail)

**Solutions:**
- Double-check your `.env` values
- For Gmail, use App Password, not regular password
- Try port 465 with `secure: true`
- Check firewall settings

### Issue: "Email sent but not received"
**Causes:**
- Email in spam folder
- Wrong email address
- Email provider blocking

**Solutions:**
- Check spam/junk folder
- Verify email address is correct
- Check email provider logs
- Try a different email provider

### Issue: "Authentication failed"
**Causes:**
- Wrong username/password
- Gmail: Not using App Password
- Account security restrictions

**Solutions:**
- Verify credentials
- For Gmail: Generate new App Password
- Check "Less secure app access" (if available)

---

## Debugging Steps

1. **Check server logs** when starting:
   ```
   ✅ SMTP connection verified
   ```

2. **Check server logs** when signing up:
   ```
   📧 Attempting to send email to: user@example.com
   📧 Using SMTP: smtp.gmail.com:587
   ✅ Email sent successfully: <message-id>
   ```

3. **If email fails**, check logs for:
   ```
   ❌ Email send failed!
   ❌ Error message: ...
   ❌ Error code: ...
   ```

4. **Use the test UI** - The verification token will be shown in development mode

5. **Check response panel** - All API responses show the verification token

---

## Production Considerations

1. **Don't return tokens in production** - The code automatically excludes tokens in production mode
2. **Use proper email service** - Consider SendGrid, Mailgun, or AWS SES for production
3. **Set up SPF/DKIM** - For better email deliverability
4. **Monitor email delivery** - Track bounce rates and delivery status
5. **Rate limiting** - Implement rate limiting on email sending

---

## Quick Test

1. Start server: `npm run dev`
2. Check console for: `✅ SMTP connection verified`
3. Sign up via test UI: `http://localhost:5000`
4. Check response panel for verification token
5. Use token to verify email
6. Login and test!

---

## Still Having Issues?

1. Check server console logs
2. Verify `.env` configuration
3. Test SMTP connection manually
4. Try a different email provider
5. Check firewall/network settings

For Gmail specifically, make sure you're using an **App Password**, not your regular password!

