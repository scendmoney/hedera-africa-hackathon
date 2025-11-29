# URL Liveness Testing Report

## 📋 Overview

This directory contains comprehensive liveness testing results for 80 URLs. The tests were conducted to verify website availability, response times, and HTTP status codes.

## 📊 Quick Summary

- **Total URLs Tested:** 80
- **Live (✅):** 45 (56.25%)
- **Failed (❌):** 31 (38.75%)
- **Errors (⚠️):** 4 (5.00%)

## 📁 Generated Files

### 1. **url_liveness_report.csv**
- **Format:** CSV (Comma-Separated Values)
- **Use:** Import into Excel, Google Sheets, or any data analysis tool
- **Contains:** URL, Status, HTTP Code, Response Time, Redirect URL, Notes

### 2. **url_liveness_report.json**
- **Format:** JSON (JavaScript Object Notation)
- **Use:** Programmatic access, APIs, or data processing scripts
- **Contains:** Structured data with all test results

### 3. **url_liveness_report.html**
- **Format:** Interactive HTML Dashboard
- **Use:** Open in any web browser for visual analysis
- **Features:**
  - Real-time filtering by status
  - Search functionality
  - Summary statistics with visual cards
  - Sortable table with clickable URLs
  - Responsive design

### 4. **url_liveness_summary.md**
- **Format:** Markdown document
- **Use:** Quick reference and documentation
- **Contains:** Categorized lists of live, failed, and error sites

## 🚀 How to Use

### View HTML Report (Recommended)
```bash
# Open in your default browser
xdg-open url_liveness_report.html

# Or on macOS
open url_liveness_report.html

# Or on Windows
start url_liveness_report.html
```

### View CSV in Command Line
```bash
column -t -s',' url_liveness_report.csv | less -S
```

### Parse JSON with jq
```bash
# Get all live sites
jq '.[] | select(.status == "LIVE") | .url' url_liveness_report.json

# Get sites with errors
jq '.[] | select(.status == "CLIENT_ERROR" or .status == "SERVER_ERROR")' url_liveness_report.json

# Get average response time for live sites
jq '[.[] | select(.status == "LIVE") | .response_time_ms | tonumber] | add / length' url_liveness_report.json
```

## 📈 Test Methodology

- **Tool:** curl with follow redirects (-L flag)
- **Timeout:** 10 seconds connection timeout, 15 seconds max time
- **Method:** HTTP/HTTPS GET requests
- **Response Tracking:** HTTP status codes, response times, redirects

## 🔍 Status Definitions

| Status | Description |
|--------|-------------|
| **LIVE** | HTTP 200-299 - Site is accessible and responding normally |
| **FAIL** | Connection failed - DNS resolution failed, timeout, or network error |
| **CLIENT_ERROR** | HTTP 400-499 - Client-side error (404 Not Found, 403 Forbidden, etc.) |
| **SERVER_ERROR** | HTTP 500-599 - Server-side error |
| **REDIRECT** | HTTP 300-399 - Redirect response (usually followed automatically) |

## ⚡ Performance Metrics

Response times recorded in milliseconds (ms):
- **Fast:** < 500ms
- **Moderate:** 500-1000ms
- **Slow:** 1000-2000ms
- **Very Slow:** > 2000ms

## 🔧 Notable Findings

### Under Construction Sites
- `brooksops.com` - Shows "Coming Soon" page
- `littlejohnins.com` - Shows "Coming Soon" page

### Domains for Sale
- `advantageins.com` - Listed on HugeDomains
- `chinookmortgage.com` - Listed on HugeDomains
- `osborneconsulting.com` - Listed on HugeDomains

### High Response Times
- `steppingstonemortgage.com` - 6303ms
- `teamwickham.com` - 4972ms
- `keystonere.com` - 2593ms

## 📞 Recommendations

1. **For Failed Sites (31):**
   - Verify DNS records
   - Check hosting status
   - Confirm domain ownership and renewal
   - Investigate firewall/security settings

2. **For Error Sites (4):**
   - Review server logs
   - Check web server configuration
   - Verify file permissions
   - Test SSL/TLS certificates

3. **For Slow Sites:**
   - Optimize images and assets
   - Enable caching
   - Consider CDN implementation
   - Review server resources

## 🔄 Re-running Tests

To re-run the tests with the same URLs:

```bash
/tmp/test_urls.sh
```

The script will regenerate all report files with updated results.

## 📝 Notes

- Tests reflect a point-in-time snapshot
- Network conditions may affect results
- Some sites may have geographic restrictions
- Response times include full page load with redirects

---

*Report generated on November 14, 2025*
*Testing Tool: curl-based URL Liveness Checker*
