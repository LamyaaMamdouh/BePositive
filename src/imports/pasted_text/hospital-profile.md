STEP — REBUILD Hospital Profile page and wire to real API

The current Hospital Profile UI has fake data and fake fields
that don't exist in the database. Rebuild it to show only
real data and remove all fake fields.

Do NOT keep the old layout — replace it entirely with the
new structure described below.

═══════════════════════════════════════════════════════════════
BASE CONFIGURATION
═══════════════════════════════════════════════════════════════

Base URL:  https://bepositive.runasp.net
Auth:      Bearer token required on profile endpoints
Read all response data from: response.data

═══════════════════════════════════════════════════════════════
REMOVE THESE FIELDS COMPLETELY — they don't exist in database
═══════════════════════════════════════════════════════════════

❌ Remove: Operating Hours
❌ Remove: Organization Type
❌ Remove: Storage Capacity
❌ Remove: Available Departments
❌ Remove: Rating
❌ Remove: Website
❌ Remove: Hospital Logo / Upload Logo
❌ Remove: "Verified Medical Institution" badge
❌ Remove: any fake/hardcoded data

═══════════════════════════════════════════════════════════════
NEW PROFILE PAGE STRUCTURE
═══════════════════════════════════════════════════════════════

SECTION 1 — Header
  Hospital name (large)
  Status badge:
    "Active"      → green badge
    "UnderReview" → orange badge "Under Review"
    "Suspended"   → red badge

SECTION 2 — Info cards row (3 cards)
  Card 1: License Number  → licensenumber (read-only, show lock icon)
  Card 2: Joined Date     → joineddate formatted as "March 2026"
  Card 3: Location        → city.nameen + ", " + governorate.nameen
                            e.g. "Abbassia, Cairo"

SECTION 3 — Two columns

  LEFT — Contact Information:
    Phone    → phone (or "Not provided" if null)
    Email    → email (or "Not provided" if null)
    Address  → address (or "Not provided" if null)

  RIGHT — Location Details:
    City         → city.nameen / city.namear
    Governorate  → governorate.nameen / governorate.namear
    Coordinates  → if latitude and longitude are not null and not 0
                   show "lat, lng"
                   else show "Not set"

"Edit Profile" button top right → opens Edit Modal

═══════════════════════════════════════════════════════════════
ENDPOINT 1 — LOAD PROFILE (on page open)
═══════════════════════════════════════════════════════════════

URL:   GET /api/hospital/profile
Auth:  Bearer token

Response:
{
  "value": {
    "id":            "df4850e9-...",
    "name":          "Abbassia Hospital",
    "licensenumber": "11111111111",
    "email":         "fayzb315@gmail.com",
    "phone":         "+201027016323",
    "address":       "Abbassia",
    "latitude":      0,
    "longitude":     0,
    "status":        "Active",
    "joineddate":    "2026-03-14T21:08:35",
    "city": {
      "id":     "city-abbassia",
      "nameen": "Abbassia",
      "namear": "العباسية"
    },
    "governorate": {
      "id":     "gov-cairo",
      "nameen": "Cairo",
      "namear": "القاهرة"
    }
  }
}

Read from: response.data.value

═══════════════════════════════════════════════════════════════
EDIT PROFILE MODAL
═══════════════════════════════════════════════════════════════

When "Edit Profile" is clicked open a modal with these fields:

FIELD 1 — Hospital Name (required text input)
  Pre-filled with: value.name

FIELD 2 — Phone (optional text input)
  Pre-filled with: value.phone

FIELD 3 — Email (optional email input)
  Pre-filled with: value.email

FIELD 4 — Address (optional text input)
  Pre-filled with: value.address

FIELD 5 — Governorate (dropdown — load from API)
  Pre-selected with: value.governorate.id

  Load options from:
  GET https://bepositive.runasp.net/api/locations/governorates
  Read from: response.data.value
  Each option: id as value, nameen as label

  When governorate changes → clear city selection
  and reload cities for the new governorate.

FIELD 6 — City (dropdown — load from selected governorate)
  Pre-selected with: value.city.id

  Load options from:
  GET https://bepositive.runasp.net/api/locations/governorates/{governorateId}/cities
  Replace {governorateId} with the selected governorate id.
  Read from: response.data.value
  Each option: id as value, nameen as label

  OR — use city search autocomplete:
  GET https://bepositive.runasp.net/api/locations/cities/search?query={text}&limit=10
  Read from: response.data.value
  Show as autocomplete dropdown while typing.
  On select: store the city id.

  Use whichever approach (dropdown or autocomplete) matches
  the existing city selection pattern already built in the
  Register page — keep it consistent.

NOTE — License Number:
  Show it as READ-ONLY text with a lock icon.
  Do NOT include it in the form inputs.
  Do NOT send it in the update request.

Buttons:
  Cancel     → close modal without saving
  Save Changes → submit the form

═══════════════════════════════════════════════════════════════
ENDPOINT 2 — SAVE PROFILE (on Save Changes)
═══════════════════════════════════════════════════════════════

URL:   PATCH /api/hospital/profile
Auth:  Bearer token

Request body (JSON) — all lowercase field names:
{
  "name":      "Abbassia Hospital",
  "address":   "Abbassia",
  "phone":     "+201027016323",
  "email":     "fayzb315@gmail.com",
  "cityid":    "city-abbassia",
  "latitude":  null,
  "longitude": null
}

IMPORTANT field names are lowercase:
  cityid    NOT cityId
  latitude  NOT Latitude

Send cityid as the selected city's id from the dropdown.
Admin never types the id manually — it comes from the dropdown.

Success response (200):
{
  "value": {
    "name":    "Abbassia Hospital",
    "address": "Abbassia",
    "phone":   "+201027016323",
    "email":   "fayzb315@gmail.com",
    "city": { "nameen": "Abbassia" },
    "governorate": { "nameen": "Cairo" }
  }
}

On success:
  - Close the modal
  - Refresh the profile page with new data
  - Show success toast: "Profile updated successfully."

Error handling:
  400 → show inline error: response.data.message
  401 → redirect to /org/login

═══════════════════════════════════════════════════════════════
ADD TO ENDPOINTS FILE
═══════════════════════════════════════════════════════════════

HOSPITAL: {
  ...existing...,
  PROFILE:        "/api/hospital/profile",
  UPDATE_PROFILE: "/api/hospital/profile",
},

LOCATIONS: {
  ...existing...,
  GOVERNORATES:  "/api/locations/governorates",
  CITIES_BY_GOV: (govId: string) =>
    `/api/locations/governorates/${govId}/cities`,
  CITIES_SEARCH: "/api/locations/cities/search",
},

═══════════════════════════════════════════════════════════════
IMPORTANT RULES
═══════════════════════════════════════════════════════════════

- All response field names are lowercase
  (licensenumber, joineddate, nameen, namear etc.)
- Read all data from response.data.value
- Send Bearer token on every request
- License Number is NEVER sent in the update request
- cityid in the request body is lowercase
- Admin never manually enters any ID
- Show loading skeleton while profile is loading
- Do NOT keep any fake hardcoded data from the old UI