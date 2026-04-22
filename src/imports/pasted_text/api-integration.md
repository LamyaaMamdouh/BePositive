STEP — WIRE Dashboard page and Activity Log page to API

You already have both pages built with mock data.
Now connect them to the real API.
Do NOT change any UI. Only replace mock data with real API data.

═══════════════════════════════════════════════════════════════
BASE CONFIGURATION
═══════════════════════════════════════════════════════════════

Base URL:  https://bepositive.runasp.net
Auth:      Bearer token required on all endpoints
Read all response data from: response.data

═══════════════════════════════════════════════════════════════
ENDPOINT 1 — STAT CARDS (on dashboard load)
═══════════════════════════════════════════════════════════════

URL:   GET /api/hospital/dashboard/stats
Auth:  Bearer token
Call:  On dashboard page load

Response:
{
  "value": {
    "totaldonors": {
      "value":         1,
      "changepercent": 0,
      "changelabel":   "vs last month"
    },
    "availablebloodunits": {
      "value":         40,
      "changepercent": 100,
      "changelabel":   "vs last month"
    },
    "urgentrequests": {
      "value":         2,
      "changepercent": 100,
      "changelabel":   "vs last month"
    },
    "transfusionstoday": {
      "value":         0,
      "changepercent": 0,
      "changelabel":   "vs last month"
    }
  }
}

Read from: response.data.value

UI mapping:
  totaldonors.value          → "Total Donors" card number
  availablebloodunits.value  → "Available Blood Units" card number
  urgentrequests.value       → "Urgent Requests" card number
  transfusionstoday.value    → "Transfusions Today" card number

  changepercent for each card:
    positive → show green "+X%" with up arrow
    negative → show red "-X%" with down arrow
    zero     → show gray "0%" with no arrow

  changelabel → show as subtitle e.g. "vs last month"

═══════════════════════════════════════════════════════════════
ENDPOINT 2 — RECENT ACTIVITY (on dashboard load)
═══════════════════════════════════════════════════════════════

URL:   GET /api/hospital/dashboard/recent-activity?limit=4
Auth:  Bearer token
Call:  On dashboard page load

Response:
{
  "value": [
    {
      "id":              "string",
      "activitytype":    "RequestFulfilled",
      "title":           "Request Fulfilled: AB+",
      "bloodtypeid":     "bt-abpos",
      "bloodtypename":   "AB+",
      "relatedid":       "string",
      "occurredat":      "2026-04-05T18:17:58.797",
      "transactionhash": null,
      "isverified":      false
    }
  ],
  "success": true
}

Read array from: response.data.value

UI mapping per activity item:
  title       → activity text
  occurredat  → relative time e.g. "2 mins ago", "1 hour ago"
  bloodtypename → small badge if not null
  activitytype → dot color:
    "BloodDonation"      → green dot
    "NewRequest"         → orange dot
    "RequestFulfilled"   → green dot
    "RequestCancelled"   → red dot
    "InventoryAdded"     → blue dot
    "InventoryWithdrawn" → orange dot
    "BatchExpired"       → red dot

"View All Activity" button → navigate to /org/dashboard/activity-log

═══════════════════════════════════════════════════════════════
ENDPOINT 3 — ACTIVITY LOG PAGE (full list with filters)
═══════════════════════════════════════════════════════════════

URL:   GET /api/hospital/dashboard/activity-log
Auth:  Bearer token
Call:  On activity log page load and when filters change

Query params:
  page         = 1           (default)
  limit        = 10          (default)
  activityType = string      (optional) — Donation, Request, Inventory
  bloodTypeId  = string      (optional) — e.g. bt-apos
  date         = YYYY-MM-DD  (optional) — filter by specific date

Response:
{
  "value": [
    {
      "id":              "string",
      "activitytype":    "InventoryAdded",
      "title":           "Inventory Added: A+ +5 units",
      "bloodtypeid":     "bt-apos",
      "bloodtypename":   "A+",
      "relatedid":       "string",
      "occurredat":      "2026-04-05T18:17:46.166",
      "transactionhash": null,
      "isverified":      false
    }
  ],
  "total":      20,
  "page":       1,
  "limit":      10,
  "totalpages": 2,
  "success":    true
}

Read array from:      response.data.value
Read total from:      response.data.total
Read totalPages from: response.data.totalpages

UI mapping per activity item:
  title           → activity title
  occurredat      → formatted datetime
  bloodtypename   → blood type badge on right
  activitytype    → icon and dot color (same as above)
  transactionhash → if NOT null show "Blockchain Verified" green badge
                    and show the hash truncated e.g. "0x7a9f...f2a5"
                    if null → show nothing (no badge, no hash)
  isverified      → if true show "Blockchain Verified" badge
                    if false → show nothing

FILTERS:
  "All Activities" dropdown → sends activityType:
    "All Activities" → do not send activityType param
    "Donations"      → send activityType=Donation
    "Requests"       → send activityType=Request
    "Inventory"      → send activityType=Inventory

  "All Blood Types" dropdown → load from GET /api/locations/blood-types
    Read from response.data.value
    "All Blood Types" → do not send bloodTypeId param
    specific type     → send bloodTypeId=bt-apos etc.

  Date picker → send as date=YYYY-MM-DD
    empty → do not send date param

  Applying any filter resets page to 1

PAGINATION:
  Show page controls below the list
  Load next page with ?page=2&limit=10
  Keep all active filters when paginating

═══════════════════════════════════════════════════════════════
ADD TO ENDPOINTS FILE
═══════════════════════════════════════════════════════════════

HOSPITAL: {
  ...existing...,
  DASHBOARD_STATS:          "/api/hospital/dashboard/stats",
  DASHBOARD_RECENT_ACTIVITY: "/api/hospital/dashboard/recent-activity",
  DASHBOARD_ACTIVITY_LOG:   "/api/hospital/dashboard/activity-log",
},

═══════════════════════════════════════════════════════════════
IMPORTANT RULES
═══════════════════════════════════════════════════════════════

- All response field names are lowercase
  (totaldonors, changepercent, activitytype, occurredat etc.)
- Read all data from response.data.value
- Send Authorization Bearer token on every request
- Show loading skeleton while fetching
- The "Welcome back, {Hospital Name}" greeting should use
  the hospital name from the stored user info in localStorage
- Do NOT change any existing UI design or layout