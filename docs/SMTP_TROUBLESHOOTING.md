# SMTP Connection Troubleshooting Guide

## ❌ Common Error: "Connection closed" or "Unexpected socket close"

This error typically occurs when Gmail SMTP rejects the connection. Here's how to fix it:

---

## ✅ Solution 1: Fix App Password Format

Gmail App Passwords should **NOT have spaces** in the `.env` file.

### ❌ Wrong Format:
```env
SMTP_PASS=hkfs raum fvjw uzuq
```

### ✅ Correct Format:
```env
SMTP_PASS=hkfsraumfvjwuzuq
```

**Note:** The code now automatically removes spaces, but it's better to store it correctly.

---

## ✅ Solution 2: Verify Gmail Settings

### Step 1: Enable 2-Step Verification
1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Enable **2-Step Verification** if not already enabled

### Step 2: Generate App Password
1. Go to [App Passwords](https://myaccount.google.com/apppasswords)
2. Select **Mail** as the app
3. Select **Other (Custom name)** as device
4. Enter "StudyHive" as the name
5. Click **Generate**
6. Copy the 16-character password (no spaces)

### Step 3: Update `.env` File
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your16characterapppassword
SMTP_FROM=your-email@gmail.com
```

---

## ✅ Solution 3: Try Port 465 (SSL)

If port 587 (TLS) doesn't work, try port 465 (SSL):

```env
SMTP_PORT=465
```

The code automatically sets `secure: true` for port 465.

---

## ✅ Solution 4: Check Network/Firewall

- Ensure port 587 or 465 is not blocked by your firewall
- Check if your network allows SMTP connections
- Try from a different network (e.g., mobile hotspot)

---

## ✅ Solution 5: Verify Account Status

- Ensure your Gmail account is not locked
- Check if "Less secure app access" is enabled (if using older Gmail accounts)
- Verify the account is not suspended

---

## 🔍 Debug Mode

The email configuration now includes:
- ✅ Automatic space removal from App Password
- ✅ Better TLS/SSL configuration
- ✅ Connection timeouts
- ✅ Detailed error logging
- ✅ Troubleshooting tips in console

---

## 📝 Testing the Connection

When you start the server, it will automatically verify the SMTP connection. Look for:

```
✅ SMTP connection verified successfully!
```

If you see an error, check the troubleshooting tips printed in the console.

---

## 🚨 Still Not Working?

### Alternative: Use a Different Email Service

Consider using:
- **SendGrid** (Free tier: 100 emails/day)
- **Mailgun** (Free tier: 5,000 emails/month)
- **Amazon SES** (Very affordable)
- **Resend** (Developer-friendly)

### Example: Using SendGrid

```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
SMTP_FROM=noreply@yourdomain.com
```

---

## ✅ Quick Checklist

- [ ] App Password has no spaces in `.env`
- [ ] 2-Step Verification is enabled
- [ ] App Password is correctly generated
- [ ] Port 587 or 465 is not blocked
- [ ] Gmail account is active and not locked
- [ ] Network allows SMTP connections

---

## 📞 Need More Help?

Check the server console for detailed error messages and troubleshooting tips. The system now provides specific guidance based on the error type.

**Last Updated:** December 2024

