# Login Authentication System (front-end)

Registration, login and a protected dashboard using HTML, CSS and vanilla JavaScript with `localStorage`.
Designed by Sangeeta Shetty for the Oasis Infobyte internship (Web Development, Level 2).

## Features
- Register page with username + password and a Register button
- Password rules (minimum 8 characters, at least 1 number) with live checklist and strength meter
- Duplicate username check
- Login page; wrong credentials show one generic error (does not reveal which field is wrong)
- Show / hide password buttons
- Dashboard redirects to login if opened without a session
- Logout clears the session and redirects to login
- Passwords are never stored in plain text: each is salted and hashed with SHA-256 (Web Crypto API)
- No empty form submissions
- Split-screen responsive design, error shake animation, styled dashboard

## Run
Hashing uses `crypto.subtle`, which needs a secure context. Use `localhost` (VS Code "Live Server" or `python -m http.server`) if login fails when opening the file directly.

## Limitation
Client-side auth is a learning demo. Real apps verify credentials on a server (e.g. bcrypt + sessions).
