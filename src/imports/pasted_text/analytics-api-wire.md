STEP — WIRE Analytics Page to API

You already have the Analytics UI built with mock data.
Now connect it to the real API and update the UI where needed.
Read all response data from: response.data

═══════════════════════════════════════════════════════════════
BASE CONFIGURATION
═══════════════════════════════════════════════════════════════

Base URL:  https://bepositive.runasp.net
Auth:      Bearer token required on all 3 endpoints

═══════════════════════════════════════════════════════════════
UI CHANGES NEEDED FIRST (before wiring)
═══════════════════════════════════════════════════════════════

CHANGE 1 — Update the period dropdown options:
Remove the current options and replace with exactly these 4:

  "Last 7 Days"   → sends period=Last7Days
  "Last 30 Days"  → sends period=Last30Days
  "Last 3 Months" → sends period=Last3Months
  "Last Year"     → sends period=LastYear

Default selected: "Last 7 Days"

CHANGE 2 — Stat card title changes with period:
The "Total Donations" card title must update based on selection:
  Last7Days   → "Total Donations (7 Days)"
  Last30Days  → "Total Donations (30 Days)"
  Last3Months → "Total Donations (3 Months)"
  LastYear    → "Total Donations (Year)"

CHANGE 3 — Response Rate shows as percentage:
The value from API is already a percentage number e.g. 100
Display it as: "100%" not "100"

CHANGE 4 — Avg Fulfillment Time shows in hours:
The value from API is in hours e.g. 32.5
Display it as: "32.5 hrs"

═══════════════════════════════════════════════════════════════
ENDPOINT 1 — STAT CARDS
═══════════════════════════════════════════════════════════════

URL:   GET /api/hospital/analytics/summary?period=Last7Days
Auth:  Bearer token
Call:  On page load and when period dropdown changes

Response:
{
  "value": {
    "totaldonations": {
      "value":         1,
      "changepercent": 100
    },
    "responserate": {
      "value":         100,
      "changepercent": 100
    },
    "avgfulfillmenthrs": {
      "value":         32.5,
      "changepercent": 100
    },
    "periodlabel": "Last 30 Days"
  }
}

Read from: response.data.value

UI mapping:
  totaldonations.value          → Total Donations card number
  responserate.value            → Response Rate card — show as "X%"
  avgfulfillmenthrs.value       → Avg Fulfillment Time — show as "X hrs"

  changepercent for each card:
    positive → green "+X%" with up arrow ↑
    negative → red   "-X%" with down arrow ↓
    zero     → gray  "0%"  no arrow

  periodlabel → use this to update the Total Donations card title:
    "Last 7 Days"   → "Total Donations (7 Days)"
    "Last 30 Days"  → "Total Donations (30 Days)"
    "Last 3 Months" → "Total Donations (3 Months)"
    "Last Year"     → "Total Donations (Year)"

═══════════════════════════════════════════════════════════════
ENDPOINT 2 — LINE CHART (Donation vs Requests Trends)
═══════════════════════════════════════════════════════════════

URL:   GET /api/hospital/analytics/trends?period=Last7Days
Auth:  Bearer token
Call:  On page load and when period dropdown changes

Response:
{
  "value": {
    "labels":    ["Mar 8", "Mar 9", ... "Apr 6"],
    "donations": [0, 0, 0, 1, 0, ...],
    "requests":  [0, 6, 0, 0, 2, ...]
  }
}

Read from: response.data.value

UI mapping:
  labels    → X axis labels
  donations → red line data points  (label: "Donations")
  requests  → blue line data points (label: "Requests")

Data points per period:
  Last7Days   → 7 points  (Mon, Tue, Wed, Thu, Fri, Sat, Sun)
  Last30Days  → 30 points (Mar 8, Mar 9 ... Apr 6)
  Last3Months → 12 points (W1, W2 ... W12)
  LastYear    → 12 points (Jan, Feb ... Dec)

When period changes → reload the chart with new data.
Show loading state while fetching.

═══════════════════════════════════════════════════════════════
ENDPOINT 3 — DONUT CHART (Blood Type Distribution)
═══════════════════════════════════════════════════════════════

URL:   GET /api/hospital/analytics/blood-type-distribution?period=Last7Days
Auth:  Bearer token
Call:  On page load and when period dropdown changes

Response:
{
  "value": [
    {
      "bloodtypeid":   "bt-opos",
      "bloodtypename": "O+",
      "count":         1,
      "percentage":    100
    }
  ],
  "success": true
}

Read array from: response.data.value

UI mapping per item:
  bloodtypename → legend label  (e.g. "O+")
  count         → used for donut slice size
  percentage    → show in tooltip e.g. "O+: 100%"

If value array is empty → show "No donation data for this period"
message inside the donut chart area instead of an empty chart.

When period changes → reload the chart with new data.

═══════════════════════════════════════════════════════════════
BEHAVIOR — ALL 3 ENDPOINTS RELOAD TOGETHER
═══════════════════════════════════════════════════════════════

When admin changes the period dropdown:
  1. Call all 3 endpoints simultaneously with the new period value
  2. Show loading skeleton on all 3 sections while fetching
  3. Update all 3 sections when data returns

Default period on page load: Last7Days

═══════════════════════════════════════════════════════════════
ADD TO ENDPOINTS FILE
═══════════════════════════════════════════════════════════════

HOSPITAL: {
  ...existing...,
  ANALYTICS_SUMMARY:      (period: string) =>
    `/api/hospital/analytics/summary?period=${period}`,
  ANALYTICS_TRENDS:       (period: string) =>
    `/api/hospital/analytics/trends?period=${period}`,
  ANALYTICS_DISTRIBUTION: (period: string) =>
    `/api/hospital/analytics/blood-type-distribution?period=${period}`,
},

═══════════════════════════════════════════════════════════════
IMPORTANT RULES
═══════════════════════════════════════════════════════════════

- All response field names are lowercase
  (totaldonations, changepercent, periodlabel,
   bloodtypename, avgfulfillmenthrs etc.)
- Read all data from response.data.value
- Send Authorization Bearer token on every request
- Do NOT change the chart design, colors, or layout
- Only replace mock data with real API data