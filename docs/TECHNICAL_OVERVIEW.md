# IP Highlighter Extension - Technical Overview

## Architecture Overview

The extension consists of:
- **content.js**: Main logic for IP detection and annotation
- **manifest.json**: Chrome extension configuration and site permissions
- **popup.js/html**: User interface for manual IP lookup and debug controls
- **background.js**: Service worker for context menu and cross-tab communication

## Core Functionality Flow

1. **Site Detection** → **Element Discovery** → **IP Pattern Extraction** → **RIR Database Lookup** → **Visual Annotation**

## Supported Sites & Patterns

### 1. gall.dcinside.com
- **Elements**: `<span class="ip">` 
- **Pattern**: `(156.146)` - parentheses with 2 octets
- **Lookup**: Range query `a.b.*.*`
- **Example**: `<span class="ip">(156.146)</span>`

### 2. mlbpark.donga.com  
- **Elements**: `<span class="ip">`
- **Patterns**: 
  - `IP: 58.29.*.54` (enhanced: a.b.*.d)
  - `IP: 156.146.*.*` (range: a.b.*.*)
  - `IP: 1.2.3.4` (precise: full IP)
- **Lookup**: Enhanced sampling for partial IPs, precise for full IPs
- **Example**: `<span class="ip">IP: 58.29.*.54</span>`

### 3. namu.wiki
- **Elements**: `<a href="/contribution/ip/...">` links
- **Pattern**: `119.200.148.199` - full IP addresses
- **Lookup**: Precise lookup using complete IP
- **Example**: `<a href="/contribution/ip/119.200.148.199">119.200.148.199</a>`

### 4. arca.live
- **Elements**: `<small>` inside `<span class="user-info">`
- **Pattern**: `(183.96)` - parentheses with 2 octets  
- **Lookup**: Range query `a.b.*.*`
- **Example**: `<span class="user-info"><small>(183.96)</small></span>`

### 5. www.ppomppu.co.kr
- **Elements**: 
  - `<small>` inside `<li class="topTitle-name">`
  - `<font class="over_hide">` inside `<td class="comment_template_depth*">` inside `<div id="comment_####">`
- **Patterns**:
  - `IP 106.101.x.52` (in longer text)
  - `(IP:106.101.x.52)` (standalone)
- **Lookup**: Enhanced sampling `a.b.*.d` (similar to mlbpark)
- **Examples**: 
  - `<small>IP 106.101.x.52  포인트 363 가입일 2025-02-18</small>`
  - `<div id="comment_15194987"><td class="comment_template_depth3_vote"><font class="over_hide">(IP:106.101.x.52)</font></td></div>`

## IP Lookup Strategies

### 1. Precise Lookup
- **Used for**: Full IP addresses (namu.wiki, complete mlbpark IPs)
- **Method**: Direct RIR database query `findCountryForIp(ip)`
- **Accuracy**: Exact country assignment

### 2. Enhanced Lookup  
- **Used for**: Partial IPs with known 4th octet (mlbpark `a.b.*.d`, ppomppu `a.b.x.d`)
- **Method**: Sample multiple 3rd octets, aggregate results
- **Coverage**: Samples every 64th value in missing octet range

### 3. Range Lookup
- **Used for**: 2-octet patterns (dcinside, arca.live)  
- **Method**: Query `RIR_IPDB.queryAb(a, b)` for range `a.b.*.*`
- **Coverage**: All possible allocations in that /16 range

## Data Sources

### RIR Database (Regional Internet Registries)
- **Source**: Combined data from APNIC, ARIN, RIPE, AFRINIC, LACNIC
- **Format**: Gzipped, base64-encoded delegation files
- **Query Functions**:
  - `findCountryForIp(ip)`: Precise country lookup
  - `queryAb(a, b)`: Range query for a.b.0.0/16

### Korean ISP Database  
- **Purpose**: Detect mobile carriers (통피 identification)
- **Covers**: KT, SKT, LG U+, MVNO ranges
- **Integration**: Triggered for Korean IPs, shows in tooltips as `📱carrier`

## Visual Annotation System

### Color Coding
- **KR-only**: Dark green (`#28a745`) - Korean IP exclusively
- **KR-mixed**: Light green (`#d4edda`) - Korean + other countries  
- **Non-KR**: Yellow (`#ffeeba`) - Foreign countries only
- **No-data**: Light red (`#f8d7da`) - No RIR assignment found

### Tooltip Format
```
RIR Data: KR, US (📱KT) (enhanced: 106.101.*.52)
          ^^^^^ ^^^^^^^^^ ^^^^^^^^^^^^^^^^^^^^ 
          countries ISP  lookup method
```

## Key Code Patterns

### Site Detection
```javascript
const isGall = host.endsWith('gall.dcinside.com');
const isMlbpark = host === 'mlbpark.donga.com';
const isNamu = host === 'namu.wiki';
const isArca = host === 'arca.live';  
const isPpomppu = host === 'www.ppomppu.co.kr';
```

### Element Selection Strategy
```javascript
if (isNamu) {
  // Target specific elements with IP-like href patterns
  ipElements = Array.from(document.querySelectorAll('a[href*="/contribution/ip/"]'));
} else if (isPpomppu) {
  // Pattern 1: Simple selector for title areas
  document.querySelectorAll('li.topTitle-name small');
  
  // Pattern 2: Hierarchical filtering for comment areas
  // div[id^="comment_"] → filter(/^comment_\d+$/) → td[class*="comment_template_depth"] → font.over_hide
  const commentDivs = document.querySelectorAll('div[id^="comment_"]');
  commentDivs.forEach(div => {
    if (/^comment_\d+$/.test(div.id)) {
      const depthTds = div.querySelectorAll('td[class*="comment_template_depth"]');
      depthTds.forEach(td => {
        const fonts = td.querySelectorAll('font.over_hide');
        // Process fonts for IP patterns...
      });
    }
  });
} else {
  // Fallback to generic span.ip
  ipElements = Array.from(document.querySelectorAll('span.ip'));
}
```

### Pattern Extraction Template
```javascript
if (isSite) {
  const match = el.textContent.match(/pattern_regex/);
  if (match) {
    num1 = parseInt(match[1], 10);
    num2 = parseInt(match[2], 10);
    num3 = match[3] ? parseInt(match[3], 10) : null;
    num4 = match[4] ? parseInt(match[4], 10) : null;
  }
}
```

## Extension Points for New Sites

To add a new site:

1. **Add URL to manifest.json**:
   ```json
   "matches": ["https://newsite.com/*"]
   ```

2. **Add site detection**:
   ```javascript
   const isNewSite = host === 'newsite.com';
   if (!isGall && !isMlbpark && !isNamu && !isArca && !isPpomppu && !isNewSite) return;
   ```

3. **Add element discovery**:
   ```javascript
   } else if (isNewSite) {
     const elements = document.querySelectorAll('selector.for.ip.elements');
     // filter and add to ipElements array
   }
   ```

4. **Add pattern extraction**:
   ```javascript
   } else if (isNewSite) {
     const match = el.textContent.match(/your_ip_regex/);
     // extract num1, num2, num3, num4
   }
   ```

5. **Update lookup logic if needed**:
   ```javascript
   } else if ((existingConditions) || (isNewSite && yourCondition)) {
     // choose appropriate lookup strategy
   }
   ```

## Debug Features

- **Debug Mode**: Toggle via popup, enables console logging
- **Manual Lookup**: Test IP patterns through popup interface  
- **Annotation Toggle**: Apply/clear annotations on demand
- **Notifications**: Visual feedback for annotation operations

## Performance Considerations

- **Lazy Loading**: RIR database loaded only when needed
- **Sampling**: Enhanced lookup limits samples to prevent blocking
- **Caching**: Single database load per page session
- **Selective Processing**: Only runs on matching hostnames
- **Hierarchical Filtering**: For complex sites like ppomppu, uses multi-level DOM traversal to avoid false positives while maintaining precision
