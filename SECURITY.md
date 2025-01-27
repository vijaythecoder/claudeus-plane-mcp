# Security Policy

## Reporting Security Issues

⚠️ **PRIVATE REPOSITORY - INTERNAL USE ONLY** ⚠️

This repository is private and for SimHop IT & Media AB team use only. If you have discovered a security vulnerability, please:

1. **DO NOT** create a public GitHub issue
2. Contact our security team immediately:
   - 📧 Email: security@simhop.se
   - 📱 Emergency: +46-76-427-1243 (Amadeus)

## For Team Members

If you discover a security vulnerability:

1. Document the issue with detailed steps to reproduce
2. Contact the security team immediately
3. Do not commit any fixes until cleared by the security team
4. Follow our internal security protocols

## Security Updates

Security updates are handled internally by the SimHop IT & Media AB team. We do not publish security advisories publicly.

## Plane Instance Configuration Security

When configuring Plane instances:

1. Always use environment variables for sensitive data
2. Keep API tokens and credentials secure
3. Use proper access control settings
4. Regularly rotate access tokens

Add the following to your `plane-instances.json`:
```json
{
  "instances": [
    {
      "name": "example",
      "url": "https://plane.example.com",
      "apiKey": "process.env.PLANE_API_KEY"
    }
  ]
}
```

**Note:** Never commit actual API keys or sensitive data. Always use environment variables. 