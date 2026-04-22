STEP — WIRE CREATE BLOOD REQUEST PAGE TO API

You already have the UI for "Create New Blood Request" built.
Now connect it to the real API.
Do NOT change any UI. Only add the API logic.

═══════════════════════════════════════════════════════════════
ENDPOINT 1 — LOAD BLOOD TYPES (on page/modal open)
═══════════════════════════════════════════════════════════════

URL:    GET https://bepositive.runasp.net/api/locations/blood-types
Auth:   None (public)
Call:   Once when the form opens

Response shape:
{
  "statusCode": 200,
  "message": "Success",
  "traceId": "...",
  "value": [
    { "id": "bt-apos",  "typename": "A+"  },
    { "id": "bt-aneg",  "typename": "A-"  },
    { "id": "bt-bpos",  "typename": "B+"  },
    { "id": "bt-bneg",  "typename": "B-"  },
    { "id": "bt-abpos", "typename": "AB+" },
    { "id": "bt-abneg", "typename": "AB-" },
    { "id": "bt-opos",  "typename": "O+"  },
    { "id": "bt-oneg",  "typename": "O-"  }
  ]
}

Read data from: response.data.value

Render the blood type buttons dynamically from this list:
- Display: typename  (e.g. "A+", "O-")
- Store:   id        (e.g. "bt-apos", "bt-oneg")
- On click: set selectedBloodTypeId = item.id
- Selected button should show active/highlighted state

Do NOT hardcode any blood type buttons.
Always load them from this endpoint.

═══════════════════════════════════════════════════════════════
ENDPOINT 2 — SUBMIT BLOOD REQUEST
═══════════════════════════════════════════════════════════════

URL:    POST https://bepositive.runasp.net/api/hospital/requests
Auth:   Required — Bearer token from login
Call:   On "Submit Request" button click

Request body (JSON) — all lowercase field names:
{
  "bloodtypeid":      "string — id from selected blood type button",
  "quantityrequired": number  — from Units Needed input (min 1),
  "urgencylevel":     "string — Routine | Urgent | Critical",
  "note":             "string or null — from Additional Notes textarea",
  "deadline":         "ISO datetime string or null — from Needed By picker"
}

Example:
{
  "bloodtypeid":      "bt-opos",
  "quantityrequired": 2,
  "urgencylevel":     "Critical",
  "note":             "Patient in surgery ward B",
  "deadline":         "2026-03-20T07:38:47.749Z"
}

Success response (201):
{
  "statusCode": 201,
  "message": "Success",
  "traceId": "...",
  "value": {
    "id":               "string",
    "hospitalname":     "string",
    "bloodtypename":    "string",
    "quantityrequired": number,
    "urgencylevel":     "string",
    "status":           "Open",
    "deadline":         "datetime or null",
    "createdat":        "datetime"
  }
}

Read success from: response.data.value.id exists

On success (201):
- Close the form / modal
- Show a success toast or message:
  "Blood request created successfully."
- Refresh the Active Requests list if it is visible

Error handling:
  400 → show inline error below the form:
        display response.data.message
  401 → token expired — redirect to /org/login
  500 → show toast: "Server error. Please try again later."

═══════════════════════════════════════════════════════════════
FIELD MAPPING — Form fields to request body
═══════════════════════════════════════════════════════════════

Form field              → Request body field
──────────────────────────────────────────────
Blood Type buttons      → bloodtypeid   (id of selected button)
Units Needed input      → quantityrequired
Urgency Level buttons   → urgencylevel  ("Routine", "Urgent", "Critical")
Needed By datetime      → deadline      (ISO string, null if empty)
Additional Notes        → note          (null if empty)

═══════════════════════════════════════════════════════════════
VALIDATION BEFORE SUBMIT
═══════════════════════════════════════════════════════════════

- bloodtypeid must be selected — show error if not
- quantityrequired must be >= 1
- urgencylevel must be selected — show error if not
- deadline is optional — send null if not filled
- note is optional — send null if empty

═══════════════════════════════════════════════════════════════
ADD TO ENDPOINTS FILE
═══════════════════════════════════════════════════════════════

In endpoints.ts add:

LOCATIONS: {
  ...existing...,
  BLOOD_TYPES: "/api/locations/blood-types",
},

HOSPITAL: {
  ...existing...,
  CREATE_REQUEST: "/api/hospital/requests",
},

═══════════════════════════════════════════════════════════════
IMPORTANT RULES
═══════════════════════════════════════════════════════════════

- All response fields are lowercase (bloodtypeid, hospitalname etc.)
- Read data from response.data.value not response.data.data
- Send the Authorization Bearer token on the POST request
- Show loading spinner on Submit button while API call is running
- Disable Submit button while loading to prevent double submit
- Do NOT change any existing UI design or layout