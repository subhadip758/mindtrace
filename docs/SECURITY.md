# MindTrace Security & Privacy Specification

## 1. Authentication & Token Management
- Passwords are encrypted using PBKDF2-HMAC-SHA256 with random salts (100,000 iterations).
- Sessions are secured with JSON Web Tokens (JWT) signed via HS256 with configurable expiration.

---

## 2. Privacy & Data Minimization
- **Opt-In Research Consent**: Research aggregation is strictly opt-in. Unconsented users' data is never included in population statistics.
- **Pseudonymization**: Opted-in research data is assigned a random `anonymized_id`. Raw emails and journal entries are excluded.
- **GDPR Account Erasure**: The `/privacy/account` endpoint performs cascading deletes across all user tables.

---

## 3. Responsible AI Safety Layer
- MindTrace strictly forbids diagnostic prompts or diagnostic output.
- All AI responses pass safety check validation to prevent psychiatric diagnostic claims.
