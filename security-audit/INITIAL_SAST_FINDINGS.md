# Initial SAST Findings Report

This report summarizes the security issues identified in the LearnSprint AI codebase during the initial Static Application Security Testing (SAST) review.

---

## Findings Summary

### Finding ID: SEC-01
- **Severity**: High
- **Vulnerability**: Insecure Session/Credential Storage
- **File Location**: [js/auth.js](file:///c:/Users/adity/OneDrive/Desktop/studyplanner/js/auth.js)
- **Description**: User authentication credentials, active session objects, and access/refresh tokens were stored in raw cleartext inside the browser's `localStorage` (`LearnSprint_session`), exposing them to extraction in the event of an XSS attack.
- **Expected Behavior**: Sensitive session payloads should be encoded or obfuscated to prevent trivial exposure.
- **Actual Behavior**: Full token payloads and user profiles were readable in plain text via browser inspection or storage access.
- **Remediation**: Implement Base64-obfuscated storage ciphers for all sensitive data keys.

---

### Finding ID: SEC-02
- **Severity**: High
- **Vulnerability**: DOM-based Cross-Site Scripting (XSS) Sinks
- **File Locations**:
  - [js/reminders.js](file:///c:/Users/adity/OneDrive/Desktop/studyplanner/js/reminders.js) (Line 220)
  - [js/learn-ai.js](file:///c:/Users/adity/OneDrive/Desktop/studyplanner/js/learn-ai.js) (Line 652)
- **Description**: Unsafe assignment of user-supplied inputs (reminder topic strings, dynamic quiz option texts) into `.innerHTML` sinks.
- **Expected Behavior**: User inputs must be rendered using safe DOM APIs (like `textContent`) or thoroughly sanitized.
- **Actual Behavior**: Strings containing potential HTML/script tags were rendered dynamically in the DOM.
- **Remediation**: Refactor target rendering functions to utilize `.textContent` element binding instead of HTML template string interpolation.

---

### Finding ID: SEC-03
- **Severity**: Medium
- **Vulnerability**: Homemade Sanitization and Filtering
- **File Locations**:
  - [js/reminders.js](file:///c:/Users/adity/OneDrive/Desktop/studyplanner/js/reminders.js) (Line 200)
  - [js/learn-ai.js](file:///c:/Users/adity/OneDrive/Desktop/studyplanner/js/learn-ai.js) (Line 1013)
- **Description**: Custom character replacement regular expressions (`replace(/[&<>'"]/g, ...)`) were used for HTML escaping. These custom filters can be bypassed by unicode characters or filter evasion payloads.
- **Expected Behavior**: Centralized, industry-standard sanitization libraries (like `DOMPurify`) should be used for HTML context sanitization.
- **Actual Behavior**: Code relied on hand-rolled character maps.
- **Remediation**: Integrate DOMPurify via a CDN, falling back to a centralized DOM text-escaper.

---

### Finding ID: SEC-04
- **Severity**: Medium
- **Vulnerability**: Client-Side Mass Assignment
- **File Location**: [js/auth.js](file:///c:/Users/adity/OneDrive/Desktop/studyplanner/js/auth.js)
- **Description**: Bulk assignment of arbitrary parameters onto the active session user object without property allow-listing.
- **Expected Behavior**: Explicit allow-list mapping of permitted fields.
- **Actual Behavior**: The application merged incoming profile updates directly into the session cache object.
- **Remediation**: Explicitly map and validate fields during `syncSession()`.
