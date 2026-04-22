STEP 3 — ADD OTP VERIFICATION SCREEN AFTER HOSPITAL REGISTRATION

After the hospital registration form submits successfully (201),
do NOT show the success screen yet.
Instead, navigate to or show an OTP verification screen.

═══════════════════════════════════════════════════════════════
FLOW
═══════════════════════════════════════════════════════════════

Registration form submitted → 201 received
  → Store the email used in registration (needed for OTP call)
  → Hide the registration form
  → Show the OTP verification screen

OTP verified successfully → 200 received
  → Hide the OTP screen
  → Show the final success screen:
    "Registration Submitted!"
    "Your application is under review.
     Our team will activate your account shortly."
    Button: "Go to Login" → navigates to /org/login

═══════════════════════════════════════════════════════════════
OTP VERIFICATION SCREEN — UI
═══════════════════════════════════════════════════════════════

Show a centered card (same style as the registration form card).

Content:
  - Email icon at the top (large, inside a light red circle)
  - Title: "Verify Your Email"
  - Subtitle: "We sent a 6-digit verification code to:"
  - The email address in bold red below the subtitle
  - 6 individual input boxes side by side for the OTP digits
    (each box: square, bordered, large centered font, 
     auto-focus moves to next box on each digit entry,
     auto-focus moves back on delete)
  - "Verify Email" button (red, full width, shows spinner when loading)
  - Below button: "Didn't receive the code?"
    with a "Resend Code" link button (gray, disabled with countdown
    timer if resend is not yet available)
  - Inline error message below the OTP inputs if code is wrong

═══════════════════════════════════════════════════════════════
ENDPOINT — VERIFY OTP
═══════════════════════════════════════════════════════════════

URL:    POST https://bepositive.runasp.net/api/Auth/email/verify
Auth:   None (public)
Call:   When user clicks "Verify Email"

Request body (JSON):
{
  "email": "string — the email used during registration",
  "otp":   "string — the 6 digits joined as one string e.g. '044308'"
}

Important: join the 6 input boxes into a single string before sending.
Example: ["0","4","4","3","0","8"] → "044308"

Success response (200):
{
  "statusCode":     200,
  "message":        "Email verified successfully! You can now log in.",
  "emailconfirmed": true,
  "verifiedat":     "2026-03-14T18:17:47Z",
  "success":        true
}

On success:
  - Check response.success === true
  - Show the final registration success screen

Error handling:
  400 → show inline error below OTP inputs:
        "Invalid or expired verification code. Please try again."
  404 → show inline error:
        "Email not found. Please register again."
  500 → show toast: "Server error. Please try again later."

═══════════════════════════════════════════════════════════════
READ RESPONSE FROM
═══════════════════════════════════════════════════════════════

Read success from:   response.data.success
Read message from:   response.data.message
Read confirmed from: response.data.emailconfirmed

Note: this endpoint returns fields directly on the object,
NOT inside a "value" wrapper like the locations endpoints.

═══════════════════════════════════════════════════════════════
ADD TO ENDPOINTS FILE
═══════════════════════════════════════════════════════════════

In endpoints.ts, add inside AUTH:

  VERIFY_EMAIL: "/api/Auth/email/verify",

═══════════════════════════════════════════════════════════════
IMPORTANT RULES
═══════════════════════════════════════════════════════════════

- Do NOT change any existing UI styles or colors
- Keep the same card design, font, and red accent color
- The OTP inputs must be 6 separate boxes, not one text field
- Auto-advance focus to the next box when a digit is entered
- Auto-move focus back to previous box when backspace is pressed
- Disable the "Verify Email" button while the API call is loading
- The email must be passed from the registration step —
  do not ask the user to type it again