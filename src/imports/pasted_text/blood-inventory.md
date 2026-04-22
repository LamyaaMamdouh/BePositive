STEP — BUILD Blood Inventory Page and link all endpoints

You need to CREATE a new page called "Blood Inventory" and wire
it to the real API. This page does not exist yet — build it from scratch.
Match the same dark/light theme and design style as the rest of the dashboard.

═══════════════════════════════════════════════════════════════
BASE CONFIGURATION
═══════════════════════════════════════════════════════════════

Base URL:  https://bepositive.runasp.net
Auth:      Bearer token required on all endpoints
Read all response data from: response.data

═══════════════════════════════════════════════════════════════
PAGE STRUCTURE
═══════════════════════════════════════════════════════════════

The page has 4 sections:

1. INVENTORY OVERVIEW  — cards showing each blood type level
2. EXPIRING SOON ALERT — warning banner if any batch expires soon
3. TRANSACTION HISTORY — audit log table
4. ADD BATCH MODAL     — form to add new blood units

═══════════════════════════════════════════════════════════════
SECTION 1 — INVENTORY OVERVIEW CARDS
═══════════════════════════════════════════════════════════════

URL:   GET /api/hospital/inventory
Call:  On page load

Response:
{
  "value": [
    {
      "inventoryid":     "string",
      "bloodtypeid":     "bt-apos",
      "bloodtypename":   "A+",
      "totalunits":      15,
      "expiringin7days": 0,
      "batchcount":      1,
      "nearestexpiry":   "2026-05-05"
    }
  ]
}

Read array from: response.data.value

Show one card per blood type:
  bloodtypename  → large badge e.g. "A+"
  totalunits     → big number "15 Units"
  batchcount     → "1 Active Batch"
  nearestexpiry  → "Expires: 2026-05-05"
  expiringin7days > 0 → show red warning badge "⚠ Expiring Soon"

Show all 8 blood types — if a blood type has no inventory show it
as a card with "0 Units" and a gray "No Stock" badge.

Each card has two buttons:
  [+ Add Units]   → opens Add Batch Modal with this bloodtypeid pre-selected
  [View Details]  → opens Detail Modal for this blood type

═══════════════════════════════════════════════════════════════
SECTION 1b — INVENTORY DETAIL MODAL (View Details button)
═══════════════════════════════════════════════════════════════

URL:   GET /api/hospital/inventory/{bloodTypeId}
Call:  When user clicks "View Details" on a card

Replace {bloodTypeId} with the card's bloodtypeid.

Response:
{
  "value": {
    "inventoryid":   "string",
    "bloodtypeid":   "bt-apos",
    "bloodtypename": "A+",
    "totalunits":    15,
    "batches": [
      {
        "id":              "string",
        "units":           15,
        "remainingunits":  15,
        "collectiondate":  "2026-04-05",
        "expirydate":      "2026-05-05",
        "daysuntilexpiry": 30,
        "status":          "Active"
      }
    ]
  }
}

Read from: response.data.value

Show in a modal:
  Header: bloodtypename + totalunits
  Table of batches with columns:
    Collection Date | Units | Remaining | Expiry Date | Days Left | Status
  Status badge:
    "Active"   → green
    "Expired"  → red
    "Depleted" → gray
  daysuntilexpiry <= 7 → show orange "⚠" warning next to the row

═══════════════════════════════════════════════════════════════
SECTION 2 — EXPIRING SOON ALERT BANNER
═══════════════════════════════════════════════════════════════

URL:   GET /api/hospital/inventory/expiring-soon?days=7
Call:  On page load

Response:
{
  "value": [
    {
      "batchid":         "string",
      "bloodtypeid":     "bt-opos",
      "bloodtypename":   "O+",
      "remainingunits":  16,
      "expirydate":      "2026-05-05",
      "daysuntilexpiry": 30
    }
  ]
}

Read array from: response.data.value

If value array is empty → do NOT show this section at all.
If value array has items → show a red/orange alert banner:
  "⚠ {count} batch(es) expiring within 7 days"
  List each item: bloodtypename — remainingunits units — expires expirydate
  Add a [Use Now] button per item → opens Withdraw modal
  with bloodtypeid and units pre-filled from this batch

═══════════════════════════════════════════════════════════════
SECTION 3 — TRANSACTION HISTORY TABLE
═══════════════════════════════════════════════════════════════

URL:   GET /api/hospital/inventory/transactions?page=1&limit=10
Call:  On page load

Response:
{
  "value": [
    {
      "id":           "string",
      "bloodtypeid":  "bt-apos",
      "bloodtypename": "A+",
      "changeamount": 15,
      "reason":       "ManualAdd",
      "requestid":    null,
      "notes":        "string or null",
      "changedat":    "datetime"
    }
  ],
  "total":      4,
  "page":       1,
  "totalpages": 1
}

Read array from: response.data.value

Show as a table with columns:
  Date       → changedat formatted
  Blood Type → bloodtypename badge
  Change     → changeamount:
               positive (+15) → green "+15 Units Added"
               negative (-2)  → red  "-2 Units Withdrawn"
  Reason     → reason formatted:
               "ManualAdd"          → "Manual Add"
               "ManualWithdraw"     → "Manual Withdraw"
               "RequestFulfillment" → "Request Fulfilled"
               "ExpiredAutoRemoved" → "Auto Expired"
               "CompatibleTypeUsed" → "Compatible Type Used"
  Notes      → notes or "-"
  Request    → if requestid is not null show a small linked badge
               otherwise show "-"

Pagination controls below the table.

═══════════════════════════════════════════════════════════════
SECTION 4 — ADD BATCH MODAL
═══════════════════════════════════════════════════════════════

URL:   POST /api/hospital/inventory/batches/add
Call:  When user submits the Add Batch form

Triggered by:
  - "Add Units" button in page header
  - "+ Add Units" button on a blood type card
    (pre-selects that blood type)

Form fields:
  Blood Type     → dropdown loaded from GET /api/locations/blood-types
                   pre-selected if opened from a card
  Units          → number input (min 1, max 1000)
  Collection Date → date picker (max = today)
  Expiry Date    → date picker (min = tomorrow)
  Notes          → optional text input

Request body (JSON):
{
  "bloodtypeid":    "bt-apos",
  "units":          15,
  "collectiondate": "2026-04-05",
  "expirydate":     "2026-05-05",
  "notes":          "optional"
}

Response (201):
{
  "value": {
    "id":              "string",
    "units":           15,
    "remainingunits":  15,
    "collectiondate":  "2026-04-05",
    "expirydate":      "2026-05-05",
    "daysuntilexpiry": 30,
    "status":          "Active"
  }
}

On success:
  - Close modal
  - Refresh inventory overview cards
  - Show success toast: "Blood batch added successfully."

═══════════════════════════════════════════════════════════════
WITHDRAW — ONLY FROM ACTIVE REQUESTS PAGE (not a standalone page)
═══════════════════════════════════════════════════════════════

Do NOT add a standalone withdraw page or button on the inventory page.

Instead, add a "Use Inventory" button on each row of the
Active Requests page (next to the existing Details and Update buttons).

When hospital admin clicks "Use Inventory" on a request row:
  1. Show a modal titled "Fulfill from Inventory"
  2. Call GET /api/hospital/inventory/compatible/{bloodTypeId}
     using the request's bloodtypeid automatically
  3. Show the available inventory:

     Response:
     {
       "value": {
         "requestedtype":  "A+",
         "exactunits":     15,
         "compatible": [
           {
             "bloodtypeid":    "bt-apos",
             "bloodtypename":  "A+",
             "availableunits": 15,
             "isexactmatch":   true
           },
           {
             "bloodtypeid":    "bt-opos",
             "bloodtypename":  "O+",
             "availableunits": 16,
             "isexactmatch":   false
           }
         ],
         "totalavailable": 31
       }
     }

  4. Show two sections in the modal:
     - "Exact Match" → bt-apos — 15 units available
     - "Compatible Types" → bt-opos — 16 units available (with warning label)
  5. Admin selects which blood type to use and enters units amount
  6. On confirm → call POST /api/hospital/inventory/withdraw with:
     {
       "bloodtypeid": selected bloodtypeid from modal,
       "units":       entered amount,
       "requestid":   the request id from the row (auto-filled, NOT shown to admin),
       "notes":       "Fulfilled from inventory"
     }
  7. On success:
     - Close modal
     - Refresh the Active Requests list
     - Show success toast: "Inventory used successfully."

The requestid is NEVER shown to or entered by the admin —
it is read automatically from the request row and sent silently.

═══════════════════════════════════════════════════════════════
ADD TO ENDPOINTS FILE
═══════════════════════════════════════════════════════════════

HOSPITAL: {
  ...existing...,
  INVENTORY:             "/api/hospital/inventory",
  INVENTORY_BY_TYPE:     (bloodTypeId: string) => `/api/hospital/inventory/${bloodTypeId}`,
  INVENTORY_ADD_BATCH:   "/api/hospital/inventory/batches/add",
  INVENTORY_WITHDRAW:    "/api/hospital/inventory/withdraw",
  INVENTORY_EXPIRING:    "/api/hospital/inventory/expiring-soon",
  INVENTORY_TRANSACTIONS: "/api/hospital/inventory/transactions",
  INVENTORY_COMPATIBLE:  (bloodTypeId: string) => `/api/hospital/inventory/compatible/${bloodTypeId}`,
},

═══════════════════════════════════════════════════════════════
IMPORTANT RULES
═══════════════════════════════════════════════════════════════

- All response field names are lowercase
  (bloodtypeid, totalunits, remainingunits, changeamount etc.)
- Read all data from response.data.value
- Send Authorization Bearer token on every request
- Show loading skeleton while fetching
- The requestid in withdraw is ALWAYS auto-filled from context
  — admin never types an ID manually anywhere in this feature
- Do NOT change any existing pages or components
- Match the existing dashboard design style exactly