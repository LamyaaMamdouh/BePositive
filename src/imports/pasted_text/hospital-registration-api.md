STEP 2 — IMPLEMENT API INTEGRATION FOR HOSPITAL REGISTRATION FLOW

You already have the base API configuration ready from Step 1.
Now wire the Hospital Registration page to the real API.
Do NOT change any UI. Only add the API calls behind the existing UI.

═══════════════════════════════════════════════════════════════
ENDPOINTS TO IMPLEMENT
═══════════════════════════════════════════════════════════════

1. GET https://bepositive.runasp.net/api/locations/governorates
2. GET https://bepositive.runasp.net/api/locations/governorates/{governorateId}/cities
3. GET https://bepositive.runasp.net/api/locations/cities/search?query={input}&limit=10
4. POST https://bepositive.runasp.net/api/auth/hospital/register
5. POST https://bepositive.runasp.net/api/Auth/HospitalAdminlogin

═══════════════════════════════════════════════════════════════
ENDPOINT 1 — GET ALL GOVERNORATES
═══════════════════════════════════════════════════════════════

URL:     GET https://bepositive.runasp.net/api/locations/governorates
Auth:    None (public)
Call:    Once on page load

Response shape:
{
  "value": [
    { "id": "gov-cairo", "nameen": "Cairo", "namear": "القاهرة" },
    { "id": "gov-giza",  "nameen": "Giza",  "namear": "الجيزة"  }
  ]
}

Use for: Governorate dropdown — populate with nameEn for display,
         store id as the selected value.

═══════════════════════════════════════════════════════════════
ENDPOINT 2 — GET CITIES BY GOVERNORATE
═══════════════════════════════════════════════════════════════

URL:     GET https://bepositive.runasp.net/api/locations/governorates/{governorateId}/cities
Auth:    None (public)
Call:    When user selects a governorate from the dropdown

Replace {governorateId} with the selected governorate id.
Example: /api/locations/governorates/gov-cairo/cities

Response shape:
{
  "value": [
    { "id": "city-maadi",     "nameen": "Maadi",     "namear": "المعادي"   },
    { "id": "city-new-cairo", "nameen": "New Cairo", "namear": "القاهرة الجديدة" }
  ]
}

Use for: City dropdown — populate after governorate is selected.
         Store city id as the form CityId value.
         Clear cities list when governorate changes.

═══════════════════════════════════════════════════════════════
ENDPOINT 3 — CITY AUTOCOMPLETE SEARCH
═══════════════════════════════════════════════════════════════

URL:     GET https://bepositive.runasp.net/api/locations/cities/search?query={input}&limit=10
Auth:    None (public)
Call:    When user types in the City search input field

Rules:
- Only call if input length >= 2 characters
- Debounce: wait 300ms after user stops typing before calling
- Cancel previous request if user keeps typing

Response shape:
{
  "value": [
    {
      "id": "city-giza-center",
      "nameen": "Giza",
      "namear": "الجيزة",
      "governorate": {
        "id": "gov-giza",
        "nameen": "Giza",
        "namear": "الجيزة"
      }
    }
  ]
}

Use for: Autocomplete dropdown under the city input.
         Show: "{nameEn} — {governorate.nameEn}" in dropdown.
         On selection: store city.id as CityId in the form
                       and fill governorate field automatically.
         Show empty state "No cities found" if value is empty array.

═══════════════════════════════════════════════════════════════
ENDPOINT 4 — HOSPITAL REGISTRATION
═══════════════════════════════════════════════════════════════

URL:     POST https://bepositive.runasp.net/api/auth/hospital/register
Auth:    None (public)
Call:    On form submit

Request body (JSON):
{
  "hospitalName":    "string",
  "licenseNumber":   "string",
  "email":           "string",
  "phoneNumber":     "string",
  "cityId":          "string",
  "password":        "string",
  "confirmPassword": "string"
}

Important: cityId must be the id from the city autocomplete,
           NOT the city name text.

Success response (201):
{
  "value": {
    "hospitalId":   "string",
    "adminUserId":  "string",
    "hospitalName": "string",
    "email":        "string",
    "status":       1,
    "message":      "Registration submitted. Your account is under review."
  }
}

On success (201):
- Do NOT navigate to dashboard
- Hide the form
- Show a success screen with:
    Large green checkmark icon
    Title: "Registration Submitted!"
    Message: "Your application is under review.
              Our team will activate your account shortly."
    Button: "Back to Home" → navigates to /

Error handling:
  409 → show error message under the relevant field:
        "This email is already registered." → under email field
        "A hospital with this license number already exists."
        → under license number field
  400 → show the message under the form as a general error
  500 → show toast: "Server error. Please try again later."

═══════════════════════════════════════════════════════════════
ENDPOINT 5 — HOSPITAL ADMIN LOGIN
═══════════════════════════════════════════════════════════════

URL:     POST https://bepositive.runasp.net/api/Auth/HospitalAdminlogin
Auth:    None (public)
Call:    On login form submit

Request body (JSON):
{
  "email":    "string",
  "password": "string"
}

Success response (200):
{
  "value": {
    "accessToken":  "string",
    "refreshToken": "string",
    "userType":     3,
    "hospitalId":   "string",
    "adminName":    "string",
    "email":        "string",
    "status":       2
  }
}

On success:
- Store accessToken in memory or httpOnly cookie
- Store refreshToken securely
- Check status value:
    1 = UnderReview → do NOT navigate to dashboard
                      show message:
                      "Your account is still under review.
                       Please wait for activation."
    2 = Active      → navigate to /hospital/dashboard
    3 = Suspended   → show message:
                      "Your account has been suspended.
                       Please contact support."

Error handling:
  401 → "Invalid email or password." — show under form
  400 → show the error message under the form
  500 → show toast: "Server error. Please try again later."

═══════════════════════════════════════════════════════════════
IMPORTANT RULES
═══════════════════════════════════════════════════════════════

- Read data from response.value not response.data
- Do NOT change any existing UI design or layout
- Only add the logic and API calls behind what already exists
- Show a loading spinner on every button while API call is running
- Disable the submit button while loading to prevent double submit
- All error messages must appear inline under their fields,
  not as popups or alerts