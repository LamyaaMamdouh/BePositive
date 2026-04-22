STEP — WIRE Active Requests Page to API

You already have the Active Requests UI built.
Now connect it to the real API.
Do NOT change any UI. Only add the API logic.

═══════════════════════════════════════════════════════════════
BASE CONFIGURATION
═══════════════════════════════════════════════════════════════

Base URL:  https://bepositive.runasp.net
Auth:      Bearer token required on all 4 endpoints
Read all response data from: response.data

═══════════════════════════════════════════════════════════════
ENDPOINT 1 — LOAD REQUESTS LIST
═══════════════════════════════════════════════════════════════

URL:   GET /api/hospital/requests
Call:  On page load and when any filter changes

Query params:
  page         = 1          (default)
  limit        = 10         (default)
  search       = string     (optional)
  status       = string     (optional) — Open, Fulfilled, Cancelled, Expired
  urgencyLevel = string     (optional) — Routine, Urgent, Critical
  bloodTypeId  = string     (optional) — e.g. bt-apos

Response:
{
  "value": [
    {
      "id":               "string",
      "bloodtypeid":      "string",
      "bloodtypename":    "A+",
      "quantityrequired": 2,
      "quantityfulfilled": 0,
      "progresspercent":  0.0,
      "urgencylevel":     "Routine",
      "status":           "Open",
      "note":             "string or null",
      "deadline":         "2026-03-19T09:18:07.981",
      "createdat":        "2026-03-18T10:18:46.984"
    }
  ],
  "total":      1,
  "page":       1,
  "limit":      10,
  "totalpages": 1,
  "success":    true
}

Read array from:      response.data.value
Read total from:      response.data.total
Read totalPages from: response.data.totalpages

UI mapping:
  bloodtypename  → Blood Type badge
  urgencylevel   → Urgency badge color:
                   "Routine"  → blue
                   "Urgent"   → orange
                   "Critical" → red
  status         → Status text:
                   "Open" + progresspercent > 0  → "In Progress"
                   "Open" + progresspercent === 0 → "Pending"
                   "Fulfilled" → "Fulfilled" (green)
                   "Cancelled" → "Cancelled" (red)
                   "Expired"   → "Expired"   (gray)
  progresspercent → progress bar width percentage
  quantityfulfilled + " of " + quantityrequired + " units" → bar label

Show loading skeleton while fetching.
Show "No requests found" empty state if value array is empty.

═══════════════════════════════════════════════════════════════
ENDPOINT 2 — LOAD REQUEST DETAILS (Details button)
═══════════════════════════════════════════════════════════════

URL:   GET /api/hospital/requests/{id}
Call:  When user clicks "Details" on any row

Replace {id} with row id from the list.

Response:
{
  "value": {
    "id":               "string",
    "bloodtypename":    "A+",
    "quantityrequired": 2,
    "quantityfulfilled": 0,
    "progresspercent":  0.0,
    "urgencylevel":     "Routine",
    "status":           "Open",
    "note":             "string or null",
    "deadline":         "datetime or null",
    "createdat":        "datetime",
    "latitude":         null,
    "longitude":        null,
    "responses":        0,
    "accepted":         0,
    "arrived":          0,
    "donated":          0,
    "noshow":           0
  },
  "success": true
}

Read data from: response.data.value

Show in a detail modal or side panel with all fields including
response counts (responses, accepted, arrived, donated, noshow).

═══════════════════════════════════════════════════════════════
ENDPOINT 3 — UPDATE REQUEST (Update button)
═══════════════════════════════════════════════════════════════

URL:   PATCH /api/hospital/requests/{id}
Call:  When user submits the update form

Request body (JSON):
{
  "quantityrequired": 4,
  "urgencylevel":     "Routine",
  "note":             "string or null",
  "deadline":         "2026-03-19T09:19:23.572Z",
  "status":           "Open"
}

All fields are optional — only send what changed.
Do NOT use this to cancel — use Endpoint 4 for that.

Response:
{
  "value": {
    "id":               "string",
    "hospitalname":     "string",
    "bloodtypename":    "string",
    "quantityrequired": 4,
    "quantityfulfilled": 0,
    "urgencylevel":     "Routine",
    "status":           "Open",
    "note":             "string",
    "deadline":         "datetime",
    "createdat":        "datetime"
  }
}

Read updated data from: response.data.value

On success:
- Close the update modal
- Refresh the requests list
- Show success toast: "Request updated successfully."

Error handling:
  400 → show inline error: response.data.message
  404 → show error: "Request not found."

═══════════════════════════════════════════════════════════════
ENDPOINT 4 — CANCEL REQUEST (Cancel action)
═══════════════════════════════════════════════════════════════

URL:   PATCH /api/hospital/requests/{id}/cancel
Call:  When user confirms cancel action
Body:  None — no request body needed

Response:
{
  "value": {
    "success": true,
    "message": "Request cancelled successfully."
  }
}

Read success from: response.data.value.success === true

On success:
- Update the row status to "Cancelled" in the list
  OR refresh the full list
- Show success toast: "Request cancelled successfully."

Error handling:
  400 → show error: response.data.message
        e.g. "Only open requests can be cancelled."
  404 → show error: "Request not found."

═══════════════════════════════════════════════════════════════
SEARCH AND FILTER BEHAVIOR
═══════════════════════════════════════════════════════════════

Search input (magnifier icon):
- Debounce 400ms after user stops typing
- Send as ?search=value
- Clearing search removes the filter and reloads

Filter button:
- urgencyLevel: send "Routine", "Urgent", or "Critical"
- status: send "Open", "Fulfilled", "Cancelled", "Expired"
- Applying any filter resets page back to 1
- Active filters should show a visual indicator

Pagination:
- Load next page: ?page=2&limit=10
- Keep all active filters when changing page

═══════════════════════════════════════════════════════════════
ADD TO ENDPOINTS FILE
═══════════════════════════════════════════════════════════════

HOSPITAL: {
  CREATE_REQUEST: "/api/hospital/requests",
  GET_REQUESTS:   "/api/hospital/requests",
  GET_REQUEST:    (id: string) => `/api/hospital/requests/${id}`,
  UPDATE_REQUEST: (id: string) => `/api/hospital/requests/${id}`,
  CANCEL_REQUEST: (id: string) => `/api/hospital/requests/${id}/cancel`,
},

═══════════════════════════════════════════════════════════════
IMPORTANT RULES
═══════════════════════════════════════════════════════════════

- All response field names are lowercase
  (urgencylevel, bloodtypename, quantityrequired, totalpages etc.)
- Read list array from response.data.value
- Read single object from response.data.value
- Send Authorization Bearer token on every request
- Show loading spinner on every button while its request is running
- Disable buttons while loading to prevent double submit
- Do NOT change any existing UI design or layout