# 🧪 GeoWGS84 Datastore — E2E Test Suite

<p align="center">
  <img src="https://img.shields.io/badge/Playwright-1.50+-blue?logo=playwright&logoColor=white" alt="Playwright" />
  <img src="https://img.shields.io/badge/Node.js-22-green?logo=node.js&logoColor=white" alt="Node.js" />
    <img src="https://img.shields.io/badge/Tests-68-8B5CF6?logo=test&logoColor=white" alt="68 Tests" />
    <img src="https://img.shields.io/badge/Workers-4_per_shard-FF6B35?logo=parallel&logoColor=white" alt="4 Workers per shard" />
  <img src="https://img.shields.io/badge/CI-GitHub_Actions-2088FF?logo=githubactions&logoColor=white" alt="CI" />
  <img src="https://img.shields.io/badge/Email_Reporter-Nodemailer-EA4335?logo=gmail&logoColor=white" alt="Email" />
  <img src="https://img.shields.io/badge/Schedule-12%3A00_IST-gold?logo=clock&logoColor=black" alt="Daily" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/P0_Critical-12-red?style=for-the-badge" alt="P0" />
  <img src="https://img.shields.io/badge/P1_Standard-8-yellow?style=for-the-badge" alt="P1" />
  <img src="https://img.shields.io/badge/Coverage-100%25-success?style=for-the-badge" alt="100%" />
</p>

```mermaid
graph LR
    A[🧪 68 Tests] --> B[⚡ 8 Shards × 4 Workers]
    B --> C{🔄 Each Test}
    C --> D[📋 beforeEach<br/>Clear State]
    C --> E[🎯 Execute Steps]
    C --> F[📸 afterEach<br/>Capture + Persist]
    D --> E
    E --> F
    F --> G{Has Issues?}
    G -->|Yes| H[🖼️ Screenshot<br/>🎬 Video]
    G -->|No| I[✅ Clean]
    H --> J[💾 Diagnostics JSON]
    I --> J
    J --> K[📧 One aggregation job<br/>Daily summary + failure detail]
```

---

## 📑 Table of Contents

- [Architecture Overview](#-architecture-overview)
- [Project Structure](#-project-structure)
- [Page Object Model](#-page-object-model)
- [Current Test Inventory](#-current-test-inventory)
- [Representative Flow Diagrams](#-representative-flow-diagrams)
- [Diagnostics System](#-diagnostics-system)
- [Email Reporting](#-email-reporting)
- [CI/CD Pipeline](#-cicd-pipeline)
- [Configuration Reference](#-configuration-reference)
- [Troubleshooting](#-troubleshooting)

---

## 🏗️ Architecture Overview

```mermaid
graph TB
    subgraph PLAYWRIGHT["🎭 PLAYWRIGHT RUNNER (8 Shards × 4 Workers)"]
        T1["🧪 Test 1"]
        T2["🧪 Test 2"]
        T3["🧪 Test N"]
    end

    subgraph COMMON["📋 specs/common.js"]
        BE["beforeEach<br/>🧹 Clear INFOS<br/>🧹 Clear WARNINGS<br/>🧹 Clear ERRORS<br/>🧹 Clear SKIPPED<br/>🎯 Set Context<br/>🖥️ Bind Console"]
        AE["afterEach<br/>📸 Capture Screenshots<br/>🎬 Attach Video<br/>💾 Persist Diagnostics<br/>🧹 Clear Ref"]
    end

    subgraph POM["📄 Page Object Model"]
        MP["🗺️ MapPage"]
        SP["🛰️ SatellitePage"]
        CP["🛒 CartPage"]
        BP["🏗️ BasePage"]
    end

    subgraph HELPERS["🔧 utils/helpers.js"]
        LOG["📝 Logging<br/>INFO / WARN / ERROR / SKIP"]
        VIS["🎨 Visual<br/>Highlight / Banner / Annotate"]
        ASR["✅ Assertions<br/>RobustClick / WaitFill / ClickWV"]
        DET["🔍 Detection<br/>AOI / Overlay / BBox"]
        DIAG["💾 Diagnostics<br/>Persist / Read / Clear / Filter"]
    end

    subgraph STORAGE["💾 Runtime Storage"]
        DIAGDIR["📁 diagnostics/<br/>testId.json<br/>testTitle.json"]
        TRDIR["📁 test-results/<br/>screenshots + videos"]
    end

    subgraph REPORTER["📧 email-reporter.cjs"]
        DAILY["📊 Daily Summary<br/>Pass/Fail Counts"]
        DETAIL["📋 Detailed Report<br/>Logs + Attachments"]
    end

    T1 --> BE
    T2 --> BE
    T3 --> BE
    BE --> POM
    POM --> HELPERS
    AE --> DIAGDIR
    AE --> TRDIR
    DIAGDIR --> REPORTER
```

---

## 🧪 Current Test Inventory

The repository currently contains **68 Playwright tests**. Playwright runs them
with `fullyParallel: true`, across eight balanced CI shards with four workers
per shard:

| Spec file | Tests | Coverage |
|-----------|------:|----------|
| `specs/cart.spec.js` | 3 | Cart, checkout, export options |
| `specs/launch.spec.js` | 1 | Application launch smoke test |
| `specs/map.spec.js` | 10 | Search, map controls, AOI, uploads, navigation |
| `specs/satellite.spec.js` | 43 | Satellite products, scenes, previews, metadata |
| `specs/service.spec.js` | 11 | Service filters, workflows, and checkout |
| **Total** | **68** | **All discovered tests** |

The source files and Playwright's `--list` output are the source of truth for
test count. The flow diagrams below document representative workflows and are
not a numbered replacement for every individual test definition.

## 📁 Project Structure

```
Geowgs84-Datastore/
├── ⚙️ playwright.config.js              ← Workers, reporters, timeouts
├── 🔄 .github/workflows/playwright.yml ← Daily CI @ 12:00 IST
│
├── 📂 specs/
│   ├── 📄 common.js                    ← beforeEach / afterEach hooks
│   ├── 📄 map.spec.js                   ← Map and AOI tests
│   ├── 📄 satellite.spec.js             ← Satellite service tests
│   ├── 📄 cart.spec.js                  ← Cart and checkout tests
│   ├── 📄 service.spec.js               ← Service workflow tests
│   └── 📄 launch.spec.js                ← Launch smoke test
│
├── 📂 pages/
│   ├── 📄 BasePage.js                  ← Shared: highlight, click, wait
│   ├── 📄 MapPage.js                   ← Map: search, AOI, coords, hover
│   ├── 📄 SatellitePage.js             ← Satellite: products, scenes, images
│   └── 📄 CartPage.js                  ← Cart: add, verify, checkout
│
├── 📂 utils/
│   ├── 📄 helpers.js                   ← All utilities + diagnostics engine
│   └── 📂 test-data/
│       ├── 🖼️ Datastore_Logo.png       ← Email logo (inline CID)
│       └── 🗺️ MadhyaPradesh.kmz        ← Test upload file
│
├── 📂 reporters/
│   └── 📄 email-reporter.cjs            ← HTML email with animations
│
├── 📂 diagnostics/                     ← Runtime JSON files (auto-managed)
├── 📂 test-results/                    ← Screenshots + Videos
└── 📂 playwright-report/               ← HTML report
```

---

## 🎭 Page Object Model

```mermaid
classDiagram
    class BasePage {
        +showStep(text)
        +highlight(locator, opts)
        +fastWait(ms)
        +robustClick(locator, opts)
        +annotate(locator, text)
        +waitForVisible(locator)
        +setFlow(flow)
    }

    class MapPage {
        +openLanding() bool
        +closeWizardModal() bool
        +searchPlace(name) bool
        +zoomUntilAOI()
        +openAndDrawRectangleAOI()
        +enterCoordinates(lat, lon)
        +uploadKMZ(filePath)
        +locateCurrentLocation(lat, lon)
        +enableHoverLocation()
        +verifyHoverCoordinates() bool
        +switchToWorldView()
        +switchToAoiView()
        +closeInfoWindow()
        +resetAOI()
        +waitForMapToLoad()
        +zoomMapNTimes(n)
        +clickMapUntilInfoWindow() bool
    }

    class SatellitePage {
        +openSatelliteSection()
        +waitForSatelliteTable()
        +selectProduct(name) bool
        +waitForScenesTable() status
        +processScene(row)
        +getSceneIdFromRow(row) id
    }

    class CartPage {
        +addItemToCartAndVerifyPopup() bool
        +openCartAndVerifyItem() bool
        +checkoutAndFillForm() bool
    }

    BasePage <|-- MapPage
    BasePage <|-- SatellitePage
    BasePage <|-- CartPage
```

---

## 🧭 Representative Flow Diagrams

### Test 1: Shopping Cart & Checkout

```mermaid
flowchart TD
    START([🟢 START]) --> S1
    S1["🌐 Step 1<br/>openLanding()"] --> S1C{URL contains<br/>datastore?}
    S1C -->|No| S1F[⚠️ Warning +Screenshot]
    S1C -->|Yes| S2

    S2["❌ Step 2<br/>closeWizardModal()"] --> S2C{Modal<br/>visible?}
    S2C -->|No| S2S[⏭️ SKIPPED<br/>Already closed]
    S2C -->|Yes| S2D[Click close button]
    S2D --> S2H{Modal<br/>hidden?}
    S2H -->|No| S2F2[⚠️ Warning<br/>Force click]
    S2H -->|Yes| S3
    S2F2 --> S3
    S2S --> S3

    S3["🔍 Step 3<br/>searchPlace 'Indore'"] --> S3A[Click search icon]
    S3A --> S3B{pac-input<br/>visible?}
    S3B -->|No| S3F[⚠️ Warning]
    S3B -->|Yes| S3C[Type 'Indore']
    S3C --> S3D{Suggestion<br/>visible?}
    S3D -->|No| S3F
    S3D -->|Yes| S3E[Click suggestion]
    S3E --> S3G{AOI toolbar<br/>visible?}
    S3G -->|No| S3H2[Zoom + retry]
    S3H2 --> S3G
    S3G -->|Yes| S3I[Draw rectangle]
    S3I --> S3J{AOI detected?}
    S3J -->|No| S3F2[⚠️ Warning +Screenshot]
    S3J -->|Yes| S4
    S3F --> END_FAIL
    S3F2 --> S4

    S4["🛰️ Step 4<br/>openSatelliteSection()"] --> S4C{Product table<br/>visible 60s?}
    S4C -->|No| S4F[❌ Throw error]
    S4C -->|Yes| S5

    S5["⏳ Step 5<br/>waitForSatelliteTable()"] --> S5C{Table loaded?}
    S5C -->|No| S5F[❌ Throw error]
    S5C -->|Yes| S6

    S6["🛒 Step 6<br/>addItemToCartAndVerifyPopup()"] --> S6A[Extract product name]
    S6A --> S6B{First row<br/>visible?}
    S6B -->|No| S6F[⚠️ Warning +Screenshot]
    S6B -->|Yes| S6C[Click add-to-cart btn]
    S6C --> S6D{Popup visible<br/>15s?}
    S6D -->|No| S6F2[⚠️ Warning +Screenshot]
    S6D -->|Yes| S6E{Contains<br/>'Item added'?}
    S6E -->|No| S6F3[⚠️ Warning]
    S6E -->|Yes| S6G{display:block?}
    S6G -->|No| S6F4[⚠️ Warning +Screenshot]
    S6G -->|Yes| S7
    S6F --> END_FAIL
    S6F2 --> S7
    S6F3 --> S7
    S6F4 --> S7

    S7["🛒 Step 7<br/>openCartAndVerifyItem()"] --> S7A{Badge text<br/>== '1'?}
    S7A -->|No| S7F[⚠️ Warning +Screenshot]
    S7A -->|Yes| S7B[Click cart trigger]
    S7B --> S7C{Cart table<br/>visible 15s?}
    S7C -->|No| S7F2[⚠️ Warning +Screenshot]
    S7C -->|Yes| S7D{First row<br/>matches product?}
    S7D -->|No| S7F3[⚠️ Warning +Screenshot]
    S7D -->|Yes| S8
    S7F --> END_FAIL
    S7F2 --> S8
    S7F3 --> S8

    S8["🛒 Step 8<br/>checkoutAndFillForm()"] --> S8A{Checkout btn<br/>visible?}
    S8A -->|No| S8F[⚠️ Warning +Screenshot]
    S8A -->|Yes| S8B[Click checkout]
    S8B --> S8C{Form fields<br/>visible 15s?}
    S8C -->|No| S8F2[⚠️ Warning +Screenshot]
    S8C -->|Yes| S8D[Fill 11 fields]
    S8D --> S8E[Click submit]
    S8E --> S8G{New tab OR<br/>navigation?}
    S8G -->|No| S8F3[⚠️ Warning +Screenshot]
    S8G -->|Yes| S8H{URL contains<br/>thank_you?}
    S8H -->|No| S8F4[⚠️ Warning +Screenshot]
    S8H -->|Yes| END_PASS

    S8F --> END_FAIL
    S8F2 --> END_FAIL
    S8F3 --> END_FAIL
    S8F4 --> END_FAIL

    END_PASS([✅ PASSED])
    END_FAIL([❌ FAILED / ⚠️ WARNINGS])

    style START fill:#22c55e,color:#fff
    style END_PASS fill:#22c55e,color:#fff
    style END_FAIL fill:#dc2626,color:#fff
    style S1F fill:#fef2f2,color:#dc2626
    style S2F2 fill:#fef2f2,color:#dc2626
    style S3F fill:#fef2f2,color:#dc2626
    style S3F2 fill:#fef2f2,color:#dc2626
    style S4F fill:#dc2626,color:#fff
    style S5F fill:#dc2626,color:#fff
    style S6F fill:#fef2f2,color:#dc2626
    style S6F2 fill:#fef2f2,color:#dc2626
    style S6F3 fill:#fef2f2,color:#dc2626
    style S6F4 fill:#fef2f2,color:#dc2626
    style S7F fill:#fef2f2,color:#dc2626
    style S7F2 fill:#fef2f2,color:#dc2626
    style S7F3 fill:#fef2f2,color:#dc2626
    style S8F fill:#fef2f2,color:#dc2626
    style S8F2 fill:#fef2f2,color:#dc2626
    style S8F3 fill:#fef2f2,color:#dc2626
    style S8F4 fill:#fef2f2,color:#dc2626
    style S2S fill:#f5f3ff,color:#7c3aed
```

**Product Name Extraction:**

```mermaid
flowchart LR
    A[First Row TD] --> B{div inside<br/>has text?}
    B -->|Yes| C["✅ Use innerText"]
    B -->|No| D{input value<br/>parseable?}
    D -->|Yes| E["✅ Parse JSON array<br/>extract index 0"]
    D -->|No| F["⚠️ Empty string<br/>log warning"]
    E --> G[setLastAddedProduct]
    C --> G
```

---

### Tests 2–13: Satellite Scene Processing

All 12 satellite tests share this outer flow, then branch into the scene processing pipeline:

```mermaid
flowchart TD
    START([🟢 START]) --> S1
    S1["🌐 Open Landing"] --> S2
    S2["❌ Close Wizard"] --> S3
    S3["🔍 Search 'Indore' + Draw AOI"] --> S4
    S4["🛰️ Open Satellite Section"] --> S5
    S5["⏳ Wait Product Table 60s"] --> S5C{Table<br/>visible?}
    S5C -->|No| FAIL1[❌ Throw]
    S5C -->|Yes| S6

    S6["🔍 Select Product"] --> S6C{Product cell<br/>found?}
    S6C -->|No| S6S["⏭️ markLogicSkipped<br/>Product not found"]
    S6C -->|Yes| S6D[Click product cell]
    S6S --> END_SKIP([⏭️ PASS + SKIPPED])
    S6D --> S7

    S7["⏳ Wait Scenes Table 180s"] --> S7P[Poll loop<br/>every 3s]
    S7P --> S7A{Processing<br/>indicator?}
    S7A -->|Yes| S7P
    S7A -->|No| S7B{Rows > 0<br/>and not empty?}
    S7B -->|Yes| PROC
    S7B -->|No| S7C{180s<br/>elapsed?}
    S7C -->|No| S7P
    S7C -->|Yes| S7D{Last-moment<br/>rows found?}
    S7D -->|Yes| PROC
    S7D -->|No| EMPTY["⏭️ markLogicSkipped<br/>No scenes for AOI"]
    EMPTY --> END_EMPTY([⏭️ PASS + EMPTY])

    PROC["🎬 processScene(firstRow)"] --> SCENE_PIPE

    subgraph SCENE_PIPE ["Scene Processing Pipeline"]
        direction TB
        O1["1️⃣ OUTLINE"] --> O1A{Outline btn<br/>found?}
        O1A -->|No| O1S[⏭️ Skipped]
        O1A -->|Yes| O1B{State =<br/>'Show'?}
        O1B -->|Yes| O1C[Click to activate]
        O1B -->|No| O1D[Already active]
        O1C --> P1
        O1D --> P1
        O1S --> P1

        P1["2️⃣ PREVIEW"] --> P1A[Click preview btn]
        P1A --> P1B[Capture existing<br/>map img srcs]
        P1B --> P1C["Strategy 1:<br/>Wait new img src"]
        P1C --> P1D{New valid<br/>image?}
        P1D -->|Yes| P1OK[✅ Preview found]
        P1D -->|No| P1E["Strategy 2:<br/>Find by sceneId"]
        P1E --> P1F{Found by<br/>sceneId?}
        P1F -->|Yes| P1OK
        P1F -->|No| P1G["Strategy 3:<br/>Find browse URL"]
        P1G --> P1H{Browse<br/>found?}
        P1H -->|Yes| P1OK
        P1H -->|No| P1FAIL[⚠️ No valid preview]
        P1OK --> D1
        P1FAIL --> D1

        D1["3️⃣ DETAILS"] --> D1A[Click details btn]
        D1A --> D1B{Modal<br/>visible 25s?}
        D1B -->|No| D1F[⚠️ Modal error]
        D1B -->|Yes| D1C[Wait #img_scene<br/>up to 120s]
        D1C --> D1D{Detail src<br/>valid?}
        D1D -->|No| D1F2[⚠️ Invalid src]
        D1D -->|Yes| D1E{Preview vs Detail<br/>match?}
        D1E -->|Exact match| D1OK["✅ Filenames match"]
        D1E -->|SceneId match| D1OK2["✅ SceneId match"]
        D1E -->|Different| D1INFO["ℹ️ Normal (different views)"]
        D1OK --> D1CLOSE
        D1OK2 --> D1CLOSE
        D1INFO --> D1CLOSE
        D1F --> D1CLOSE
        D1F2 --> D1CLOSE
        D1CLOSE[Close modal] --> END_SCENE
        END_SCENE([Scene Complete])
    end

    style START fill:#22c55e,color:#fff
    style END_SKIP fill:#f5f3ff,color:#7c3aed
    style END_EMPTY fill:#fffbeb,color:#d97706
    style FAIL1 fill:#dc2626,color:#fff
    style P1OK fill:#f0fdf4,color:#16a34a
    style P1FAIL fill:#fef2f2,color:#dc2626
    style D1OK fill:#f0fdf4,color:#16a34a
    style D1OK2 fill:#f0fdf4,color:#16a34a
    style D1INFO fill:#f0f9ff,color:#2563eb
    style D1F fill:#fef2f2,color:#dc2626
    style D1F2 fill:#fef2f2,color:#dc2626
    style O1S fill:#f5f3ff,color:#7c3aed
```

**Preview Image — 3-Strategy Fallback:**

```mermaid
flowchart TD
    CLICK[Click preview button] --> CAPTURE[Capture all current<br/>#map img srcs into Set]
    CAPTURE --> S1

    subgraph S1["Strategy 1: SRC Diff (90s)"]
        S1A["Poll every 500ms"] --> S1B{New img appeared<br/>AND src valid?}
        S1B -->|Yes| FOUND1["✅ Return locator"]
        S1B -->|No| S1C{90s elapsed?}
        S1C -->|No| S1A
        S1C -->|Yes| S2
    end

    subgraph S2["Strategy 2: SceneId Match (20s)"]
        S2A["Split sceneId on '-'"] --> S2B["Filter parts >= 8 chars"]
        S2B --> S2C["Search #map img[src*=part]"]
        S2C --> S2D{Valid src<br/>found?}
        S2D -->|Yes| FOUND2["✅ Return locator"]
        S2D -->|No| S3
    end

    subgraph S3["Strategy 3: Browse URL (20s)"]
        S3A["Search #map img[src*=browse]<br/>or src*=browser"] --> S3B{Valid src<br/>found?}
        S3B -->|Yes| FOUND3["✅ Return locator"]
        S3B -->|No| FAIL["⚠️ No preview detected"]
    end

    style FOUND1 fill:#f0fdf4,color:#16a34a
    style FOUND2 fill:#f0fdf4,color:#16a34a
    style FOUND3 fill:#f0fdf4,color:#16a34a
    style FAIL fill:#fef2f2,color:#dc2626
```

**Image Src Validation Rules:**

```mermaid
flowchart LR
    SRC[Image src] --> R1{Empty / null / undefined?}
    R1 -->|Yes| REJECT❌
    R1 -->|No| R2{Starts with<br/>data: ?}
    R2 -->|Yes| REJECT❌
    R2 -->|No| R3{Contains<br/>google/gstatic?}
    R3 -->|Yes| REJECT❌
    R3 -->|No| R4{Contains<br/>marker/icon/pin?}
    R4 -->|Yes| REJECT❌
    R4 -->|No| R5{Contains<br/>show/hide/preview.png?}
    R5 -->|Yes| REJECT❌
    R5 -->|No| R6{Starts with<br/>http or / ?}
    R6 -->|No| REJECT❌
    R6 -->|Yes| ACCEPT✅

    style REJECT❌ fill:#fef2f2,color:#dc2626
    style ACCEPT✅ fill:#f0fdf4,color:#16a34a
```

**Scene ID Extraction from Row:**

```mermaid
flowchart TD
    ROW[Scene Row Element] --> M1["Try: input id attribute"]
    M1 --> M1A{Contains '-' ?}
    M1A -->|Yes| M1B["Extract after last '-'<br/>e.g. B1200011002CD010"]
    M1A -->|No| M1C["Use full id if >= 10 chars"]
    M1B --> M1D{Valid format?<br/>A-Z0-9, 8+ chars}
    M1D -->|Yes| DONE["✅ Return sceneId"]
    M1D -->|No| M2
    M1C --> M1D

    M2["Try: <td> cell text"] --> M2A{Regex match<br/>A-Z0-9_ 8+ chars?}
    M2A -->|Yes| DONE
    M2A -->|No| M3

    M3["Try: Full row innerText"] --> M3A{Same regex?}
    M3A -->|Yes| DONE
    M3A -->|No| NULL["return null<br/>(proceed without sceneId)"]

    style DONE fill:#f0fdf4,color:#16a34a
    style NULL fill:#f1f5f9,color:#64748b
```

**Preview vs Detail Comparison (Dashed SceneId Handling):**

```mermaid
flowchart TD
    START[Have previewSrc + detailSrc + sceneId] --> EXACT{Filenames<br/>identical?}
    EXACT -->|Yes| PASS1["✅ PASS:<br/>Exact match"]
    EXACT -->|No| SPLIT["Split sceneId on '-'<br/>e.g. Legion02-B12000..."]
    SPLIT --> FILTER["Keep parts >= 8 chars<br/>e.g. B1200011002CD010"]
    FILTER --> CHECK{Both URLs<br/>contain part?}
    CHECK -->|Yes| PASS2["✅ PASS:<br/>SceneId match"]
    CHECK -->|No| SPLIT2["Split sceneId on '_'"]
    SPLIT2 --> FILTER2["Keep parts >= 8 chars"]
    FILTER2 --> CHECK2{Both URLs<br/>contain part?}
    CHECK2 -->|Yes| PASS2
    CHECK2 -->|No| INFO["ℹ️ INFO:<br/>Different images (normal)"]

    style PASS1 fill:#f0fdf4,color:#16a34a
    style PASS2 fill:#f0fdf4,color:#16a34a
    style INFO fill:#f0f9ff,color:#2563eb
```

**Scenes Table Polling State Machine:**

```mermaid
stateDiagram-v2
    [*] --> Polling: Start
    Polling --> Processing: .dataTables_processing visible
    Processing --> Polling: Wait 3s
    Polling --> HasRows: Row count > 0 AND not "No data"
    Polling --> HasInfo: .dataTables_info says "Showing X"
    HasInfo --> RecheckRows: Wait 2s, recheck rows
    RecheckRows --> HasRows: Rows appeared
    RecheckRows --> Polling: Still empty
    HasRows --> [*]: Return 'data'
    Polling --> Timeout: 180s elapsed
    Timeout --> LastChance: Check one final time
    LastChance --> HasRows: Last-moment data
    LastChance --> [*]: Return 'empty'
```

**Products Tested:**

| Test | Product | Scene ID Format | Special |
|------|---------|-----------------|---------|
| 2 | WorldView01 | Standard | — |
| 2.1 | WorldView02 | Standard | — |
| 2.2 | WorldView03 | Standard | — |
| 2.3 | WorldView04 | Standard | — |
| 2.4 | GeoEye1 | Standard | — |
| 2.5 | QuickBird | Standard | — |
| 2.6 | IKONOS | Standard | — |
| 2.7 | 21AT 30cm | `BJ3N3_PMS_20230609...` | Underscore segments |
| 2.8 | 21AT 50cm | `BJ3A1_PMS1_20260314...` | Underscore segments |
| 2.9 | 21AT 80cm | `TRIPLESAT_3_PMS_...` | Underscore segments |
| 2.10 | WV-Legion01 | `Legion01-B1100011002CD010` | 🔑 Dash-split |
| 2.11 | WV-Legion02 | `Legion02-B12000110165F700` | 🔑 Dash-split |

---

### Test 14: Search UI

```mermaid
flowchart TD
    START([🟢 START]) --> S1[🌐 Open Landing]
    S1 --> S2[❌ Close Wizard]
    S2 --> S3["🔍 Click #world_search"]
    S3 --> S3C{#pac-input<br/>visible 10s?}
    S3C -->|No| FAIL1[❌ Throw]
    S3C -->|Yes| S4
    S4["⌨️ Click input to focus"] --> S5["Type 'Indore'"]
    S5 --> S6[".pac-item visible 15s?"]
    S6 -->|No| FAIL2[❌ Throw]
    S6 -->|Yes| S7["Click first suggestion"]
    S7 --> S8["⏳ waitForMapToLoad()"]
    S8 --> S9["⏳ Wait 5s for marker"]
    S9 --> S10{"#map img[src*=<br/>transparent.png]<br/>visible 30s?"}
    S10 -->|Yes| PASS([✅ PASSED])
    S10 -->|No| FAIL3[❌ Throw]

    style START fill:#22c55e,color:#fff
    style PASS fill:#22c55e,color:#fff
    style FAIL1 fill:#dc2626,color:#fff
    style FAIL2 fill:#dc2626,color:#fff
    style FAIL3 fill:#dc2626,color:#fff
```

---

### Test 15: Coordinates

```mermaid
flowchart TD
    START([🟢 START]) --> S1[🌐 Open Landing]
    S1 --> S2[❌ Close Wizard]
    S2 --> S3["📍 Click coords button"]
    S3 --> S3C{Modal with<br/>'Enter Coordinates'<br/>visible?}
    S3C -->|No| S3F[❌ Throw]
    S3C -->|Yes| S4

    subgraph S4["Fill Coordinates (Fallback Selectors)"]
        S4A["Lat: #user_lat<br/>fallback: input.lat_coord"] --> S4B["Lon: #user_lon<br/>fallback: input.lon_coord"]
        S4B --> S4C["Submit: #submitCoordinates<br/>fallback: button#submitCoordinates<br/>fallback: button:has-text('Take Me')"]
    end

    S4 --> S5["⏳ Wait 5s"]
    S5 --> S6{"#map img[src*=<br/>transparent.png]<br/>visible 30s?"}
    S6 -->|Yes| PASS([✅ PASSED])
    S6 -->|No| FAIL[❌ Throw]

    style START fill:#22c55e,color:#fff
    style PASS fill:#22c55e,color:#fff
    style FAIL fill:#dc2626,color:#fff
    style S3F fill:#dc2626,color:#fff
```

---

### Test 16: Upload KMZ

```mermaid
flowchart TD
    START([🟢 START]) --> S1[🌐 Open Landing]
    S1 --> S2[❌ Close Wizard]
    S2 --> S3

    subgraph S3["Open Upload Modal (3 Strategies)"]
        S3A["Strategy 1:<br/>Click nav link"] --> S3A1{Modal<br/>visible?}
        S3A1 -->|Yes| S4
        S3A1 -->|No| S3B
        S3B["Strategy 2:<br/>Retry click"] --> S3B1{Modal<br/>visible?}
        S3B1 -->|Yes| S4
        S3B1 -->|No| S3C
        S3C["Strategy 3:<br/>JS eval trigger<br/>$('#uploadFilesModal').modal('show')"] --> S3C1{Modal<br/>visible?}
        S3C1 -->|Yes| S4
        S3C1 -->|No| FAIL1[❌ Throw]
    end

    S4["📁 setInputFiles(KMZ path)"] --> S5["Click upload button"]
    S5 --> S6

    subgraph S6["Click Map Until Info Window (15 attempts)"]
        S6A["i = 0"] --> S6B["Calculate click position<br/>center + offset + random"]
        S6B --> S6C["Move mouse (smooth steps)"]
        S6C --> S6D["Draw red dot indicator"]
        S6D --> S6E["mouse.down → 80ms → mouse.up"]
        S6E --> S6F["Wait 900ms"]
        S6F --> S6G{SideNav<br/>visible?}
        S6G -->|Yes| S6H["Close sideNav"]
        S6H --> S6I
        S6G -->|No| S6I{.gm-style-iw<br/>visible 1.5s?}
        S6I -->|Yes| FOUND["✅ Info window found"]
        S6I -->|No| S6J["i++"]
        S6J --> S6K{i < 15?}
        S6K -->|Yes| S6B
        S6K -->|No| FAIL2[⚠️ Warning + Screenshot]
    end

    FOUND --> S7["expect(found).toBeTruthy()"]
    S7 --> PASS([✅ PASSED])
    FAIL2 --> PASS_FAIL

    PASS_FAIL{found?}
    PASS_FAIL -->|No| FAIL3[❌ Throw]
    PASS_FAIL -->|Yes| PASS

    style START fill:#22c55e,color:#fff
    style PASS fill:#22c55e,color:#fff
    style FAIL1 fill:#dc2626,color:#fff
    style FAIL2 fill:#fef2f2,color:#dc2626
    style FAIL3 fill:#dc2626,color:#fff
    style FOUND fill:#f0fdf4,color:#16a34a
```

**Click Grid Pattern:**

```
              offset (-120, 0)
                    │
     (-100,-60) ── CENTER ── (100,-60)
          │           │           │
     (-40, 0)      [CLICK]     (40, 0)
          │           │           │
     (-100, 60) ────────── (100, 60)
                    │
              offset (120, 0)

     + Random: 6 additional random points
     + Range: 30-70% of map width/height
```

---

### Test 17: Locate Geolocation

```mermaid
flowchart TD
    START([🟢 START]) --> S1[🌐 Open Landing]
    S1 --> S2[❌ Close Wizard]
    S2 --> S3

    subgraph S3["Grant Geolocation Permission"]
        S3A["context.grantPermissions<br/>['geolocation'],<br/>{origin: BASE_URL}"] --> S3OK{Success?}
        S3OK -->|Yes| S4
        S3OK -->|No| S3B["Fallback:<br/>grantPermissions<br/>['geolocation'] (no origin)"]
    end

    S4["context.setGeolocation({<br/>lat: 22.7196,<br/>lon: 75.8577,<br/>accuracy: 50})"] --> S5["Close sideNav"]
    S5 --> S6["Click #locate a"]
    S6 --> S7["waitForLoadState('networkidle')"]
    S7 --> S8["⏳ Wait 3s"]
    S8 --> S9{"#map img[src*=<br/>transparent.png]<br/>visible 30s?"}
    S9 -->|Yes| PASS([✅ PASSED])
    S9 -->|No| FAIL[❌ Throw]

    style START fill:#22c55e,color:#fff
    style PASS fill:#22c55e,color:#fff
    style FAIL fill:#dc2626,color:#fff
```

---

### Test 18: Hover Locationer

```mermaid
flowchart TD
    START([🟢 START]) --> S1[🌐 Open Landing]
    S1 --> S2[❌ Close Wizard]
    S2 --> S3

    subgraph S3["Enable Hover Toggle (3 Selectors)"]
        S3A{"#hover_location<br/>visible?"} -->|Yes| S3A1[Click anchor]
        S3A -->|No| S3B{"#show_hoverLocation<br/>count > 0?"}
        S3B -->|Yes| S3B1["check() or click()"]
        S3B -->|No| FAIL1[❌ Throw: No toggle found]
        S3A1 --> S4
        S3B1 --> S4
    end

    S4 --> S5

    subgraph S5["Hover Grid + Random Scan (15 points)"]
        S5A["9 grid points<br/>+ 6 random points"] --> S5B["Move mouse to point<br/>(smooth steps)"]
        S5B --> S5C["Wait 450-600ms"]
        S5C --> S5D{"#position_on_hover<br/>visible?"}
        S5D -->|Yes| S5E{"Contains regex?<br/>latitude:\s*\d+<br/>longitude:\s*\d+"}
        S5E -->|Yes| FOUND["✅ Coords detected"]
        S5E -->|No| S5F["More points?"]
        S5D -->|No| S5F
        S5F -->|Yes| S5B
        S5F -->|No| FAIL2["⚠️ Warning + Screenshot"]
    end

    FOUND --> S6["expect(hasCoords).toBeTruthy()"]
    S6 --> PASS([✅ PASSED])
    FAIL2 --> FAIL3[❌ Throw]

    style START fill:#22c55e,color:#fff
    style PASS fill:#22c55e,color:#fff
    style FAIL1 fill:#dc2626,color:#fff
    style FAIL2 fill:#fef2f2,color:#dc2626
    style FAIL3 fill:#dc2626,color:#fff
    style FOUND fill:#f0fdf4,color:#16a34a
```

---

### Test 19: AOI View & World View

```mermaid
flowchart TD
    START([🟢 START]) --> S1[🌐 Open Landing]
    S1 --> S2[❌ Close Wizard]
    S2 --> S3["🔍 Zoom until AOI toolbar"]
    S3 --> S4["📐 Draw rectangle AOI"]
    S4 --> S5

    S5["waitForAOIOnMap()"] --> S5C{AOI<br/>found?}
    S5C -->|No| FAIL1[❌ Throw]
    S5C -->|Yes| S6["getElementMetrics(initialAoi)"]
    S6 --> S6SAVE["💾 Screenshot: initial state"]

    S6SAVE --> S7["🌍 Click #world_view"]
    S7 --> S8["waitForMapToLoad()"]
    S8 --> S9["💾 Screenshot: world view state"]
    S9 --> S10["getElementMetrics(initialAoi again)"]

    S10 --> S10A{Metrics<br/>null?}
    S10A -->|Yes| WV_VALID["✅ VALIDATED:<br/>AOI off-screen"]
    S10A -->|No| S10B{"area < 90%<br/>of initial?"}
    S10B -->|Yes| WV_VALID2["✅ VALIDATED:<br/>AOI shrunk"]
    S10B -->|No| S10C{"center shifted<br/>> 50px?"}
    S10C -->|Yes| WV_VALID3["✅ VALIDATED:<br/>AOI moved"]
    S10C -->|No| WV_WARN["⚠️ No significant change"]

    WV_VALID --> S11
    WV_VALID2 --> S11
    WV_VALID3 --> S11
    WV_WARN --> S11_WARN["💾 Screenshot: validation failed"]

    S11_WARN --> S11
    S11["🎯 Click #AOI_view"] --> S12["waitForMapToLoad()"]
    S12 --> S13["waitForAOIOnMap()"]
    S13 --> S13C{AOI<br/>found?}
    S13C -->|No| FAIL2[❌ Throw: AOI did not reappear]
    S13C -->|Yes| S14["getElementMetrics(restoredAoi)"]

    S14 --> S15{"|area_diff| < 20%<br/>of initial?"}
    S15 -->|Yes| S16["✅ VALIDATED:<br/>AOI returned to size"]
    S15 -->|No| S16WARN["⚠️ Size mismatch"]
    S16 --> S17["💾 Screenshot: aoi_view_restored"]
    S16WARN --> S17
    S17 --> S18["expect(worldViewValid).toBe(true)"]
    S18 --> PASS([✅ PASSED])

    style START fill:#22c55e,color:#fff
    style PASS fill:#22c55e,color:#fff
    style FAIL1 fill:#dc2626,color:#fff
    style FAIL2 fill:#dc2626,color:#fff
    style WV_VALID fill:#f0fdf4,color:#16a34a
    style WV_VALID2 fill:#f0fdf4,color:#16a34a
    style WV_VALID3 fill:#f0fdf4,color:#16a34a
    style WV_WARN fill:#fffbeb,color:#d97706
    style S16WARN fill:#fffbeb,color:#d97706
```

**Area Comparison Formula:**

```
initial.area = 11706
threshold = 11706 × 0.2 = 2341

restored.area = 11706
|11706 - 11706| = 0
0 < 2341 → ✅ SIMILAR

━━━━━━━━━━━━━━━━━━━━━━━━━━━
initial.area = 11706
restored.area = 5000
|11706 - 5000| = 6706
6706 > 2341 → ⚠️ MISMATCH
━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

### Test 20: AOI Info Window

```mermaid
flowchart TD
    START([🟢 START]) --> S1[🌐 Open Landing]
    S1 --> S2[❌ Close Wizard]
    S2 --> S3["🔍 Search 'Vijay Nagar'"]
    S3 --> S4{".gm-style-iw<br/>visible?"}
    S4 -->|No| FAIL1[❌ Throw]
    S4 -->|Yes| S5["❌ Click info window close btn"]
    S5 --> S6["🗑️ Click #delete_all"]
    S6 --> S7["expect(.gm-style-iw)<br/>.not.toBeVisible()"]
    S7 --> PASS([✅ PASSED])

    style START fill:#22c55e,color:#fff
    style PASS fill:#22c55e,color:#fff
    style FAIL1 fill:#dc2626,color:#fff
```

---

## 💾 Diagnostics System

```mermaid
sequenceDiagram
    participant R as 📧 Reporter
    participant T as 🧪 Test
    participant H as 🔧 Helpers
    participant F as 📁 Filesystem

    Note over R: onBegin()
    R->>F: clearDiagnosticsFolder()<br/>🧹 Delete all .json

    Note over T: beforeEach()
    T->>H: clearInfos()
    T->>H: clearWarnings()
    T->>H: clearErrors()
    T->>H: clearSkippedSteps()
    T->>H: setContext({testcase, testFile})

    Note over T: During test execution
    T->>H: logInfo("msg")
    H-->>H: INFOS.push({test, flow, time, msg})
    T->>H: addWarning("msg")
    H-->>H: WARNINGS.push() + 📸 auto-screenshot
    T->>H: addError("msg")
    H-->>H: ERRORS.push() + 📸 auto-screenshot
    T->>H: markLogicSkipped("reason")
    H-->>H: SKIPPED_STEPS.push() + addWarning()

    Note over T: afterEach()
    T->>H: persistDiagnosticsSummary({testId, testTitle, ...})
    H->>H: Filter INFOS to current test only
    H->>F: Write diagnostics/{testId}.json
    H->>F: Write diagnostics/{testTitle}.json
    T->>H: clearPageRef() + clearContext()

    Note over R: onEnd()
    R->>F: readDiagnostics(testId, testTitle)
    F-->>R: JSON data (or null)
    R->>H: formatInfosAsLogs(infos, testTitle)
    H-->>H: Filter: info.test === testTitle only
    H-->>R: Filtered log string
    R->>R: Build email HTML
```

**Diagnostic File Lookup Strategy:**

```mermaid
flowchart TD
    LOOKUP["readDiagnostics(testId, testTitle)"] --> T1
    T1["Try: diagnostics/{testId}.json"] --> T1C{File<br/>exists?}
    T1C -->|Yes| PARSE["✅ Parse and return"]
    T1C -->|No| T2
    T2["Try: diagnostics/{testTitle}.json"] --> T2C{File<br/>exists?}
    T2C -->|Yes| PARSE
    T2C -->|No| T3
    T3["Search all .json files<br/>for matching testcase field"] --> T3C{Match<br/>found?}
    T3C -->|Yes| PARSE
    T3C -->|No| NULL["return null"]

    style PARSE fill:#f0fdf4,color:#16a34a
    style NULL fill:#fef2f2,color:#dc2626
```

---

## 📧 Email Reporting

CI sends email from the single `email-report` aggregation job after every shard
has completed. Shard jobs never send email directly, so recipients receive at
most two messages per run:

- **Daily summary:** one message containing totals for all 68 tests: passed,
    failed, warnings, skipped logic, and skipped tests.
- **Failure report:** one message sent only when one or more tests remain failed
    after retries. It contains the consolidated results, per-test logs, errors,
    warnings, skipped steps, screenshots, and videos collected from every shard.

The report job uses the merged Playwright blob reports plus downloaded
diagnostics. Configure `DAILY_REPORT_EMAILS` and `FAILURE_ALERT_EMAILS` as
GitHub Actions secrets; do not put SMTP credentials in the repository.

```mermaid
flowchart LR
    subgraph INPUT["Input Data"]
        A[68 Test Results]
        B[68 Diagnostic JSONs when generated]
        C[Screenshots + Videos]
    end

    INPUT --> BUILD

    subgraph BUILD["Build Emails"]
        D[Sort by<br/>test order]
        E[Filter logs<br/>per test]
        F[Collect<br/>attachments<br/>max 20MB]
    end

    BUILD --> EMAIL1
    BUILD --> EMAIL2

    subgraph EMAIL1["📊 Daily Summary"]
        G1[🖼️ Logo]
        G2[🕐 Time + ⏱️ Duration]
        G3[✅❌⚠️⏭️ Stats + Progress]
        G4[🟢/🔴/🟡/🟣 Summary badge]
        G5[🌍 Footer]
    end

    subgraph EMAIL2["📋 Failure Report (only when failures remain)"]
        H1[All of Daily Summary]
        H2[📋 Test Results Table]
        H3[Per-row:<br/>💥 Error pre<br/>⚠️ Warnings<br/>⏭️ Skipped steps<br/>📋 Scrollable logs]
        H4[📎 Attachments]
    end

    EMAIL1 --> SMTP["📧 One daily email"]
    EMAIL2 --> SMTP2["📧 One consolidated failure email"]
```

**Attachment Decision Per Test:**

```mermaid
flowchart TD
    START{Test result} --> PASS{PASSED +<br/>no warnings<br/>no skips?}
    PASS -->|Yes| CLEAN["— clean —<br/>No attachments"]
    PASS -->|No| COLLECT
    COLLECT["Collect attachments"] --> IMG["🖼️ .png/.jpg from<br/>result.attachments"]
    COLLECT --> VID["🎬 .webm/.mp4 from<br/>result.attachments"]
    IMG --> SIZE
    VID --> SIZE
    SIZE{"Total size<br/>< 20MB?"}
    SIZE -->|No| SKIP["⚠️ Skip (too large)"]
    SIZE -->|Yes| ATTACH["📎 Add to email"]
    SKIP --> ATTACH

    style CLEAN fill:#f1f5f9,color:#94a3b8
    style ATTACH fill:#f0fdf4,color:#16a34a
    style SKIP fill:#fffbeb,color:#d97706
```

---

## 🔄 CI/CD Pipeline

```mermaid
flowchart TD
    TRIGGER["⏰ Cron: 06:30 UTC<br/>= 12:00 IST<br/>OR Manual dispatch"] --> CHECKOUT
    CHECKOUT["📥 Checkout@v4"] --> NODE
    NODE["🟢 Setup Node.js 22"] --> NPMCI
    NPMCI["📦 npm ci"] --> PWINSTALL
    PWINSTALL["🎭 npx playwright<br/>install --with-deps"] --> RUN

    subgraph RUN["🧪 Run Tests (8 shards × 4 workers)"]
        ENV["🌍 Environment Variables<br/>BASE_URL, SMTP_*, HEADLESS=true<br/>PAUSE_MULTIPLIER=0.3, CI=true"]
        CMD["npx playwright test<br/>8 shards, 4 workers each, retries=2"]
    end

    RUN --> ART1
    RUN --> ART2
    RUN --> ART3

    ART1["📊 Upload blob + HTML reports<br/>7 days retain"]
    ART2["📸 Upload test-results/<br/>7 days retain"]
    ART3["💾 Upload diagnostics/<br/>7 days retain"]

    style TRIGGER fill:#8b5cf6,color:#fff
    style ART1 fill:#eff6ff,color:#2563eb
    style ART2 fill:#fff7ed,color:#ea580c
    style ART3 fill:#f0fdf4,color:#16a34a
```

**CI vs Local Differences:**

| Setting | 💻 Local | 🔄 CI |
|---------|----------|-------|
| `HEADLESS` | `false` | `true` |
| `PAUSE_MULTIPLIER` | `0.55` | `0.3` ⚡ |
| `retries` | `0` | `2` (CI=true) |
| `workflow timeout` | N/A | `60 min per shard` ⏰ |
| Email | Optional local reporter | One daily summary + one failure report |
| Artifacts | ❌ | ✅ (7 days) |

---

## ⚙️ Configuration Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `BASE_URL` | ✅ | `https://datastore.geowgs84.com` | Target URL |
| `HEADLESS` | ❌ | `false` | Headless mode |
| `PAUSE_MULTIPLIER` | ❌ | `0.55` | Visual pause speed |
| `SOFT_ASSERT` | ❌ | `false` | Warnings instead of errors |
| `DEFAULT_WAIT` | ❌ | `15000` | Default timeout (ms) |
| `OUTLINE_WAIT_MS` | ❌ | `90000` | Outline wait (ms) |
| `PREVIEW_WAIT_MS` | ❌ | `90000` | Preview wait (ms) |
| `DETAILS_IMAGE_WAIT_MS` | ❌ | `120000` | Detail image wait (ms) |
| `REPORT_TIMEZONE` | ❌ | `Asia/Kolkata` | Email timezone |
| `SMTP_HOST` | ✅* | — | SMTP host |
| `SMTP_PORT` | ✅* | `587` | SMTP port |
| `SMTP_USER` | ✅* | — | SMTP user |
| `SMTP_PASS` | ✅* | — | SMTP password |
| `DAILY_REPORT_EMAILS` | ✅* | — | Summary recipients |
| `FAILURE_ALERT_EMAILS` | ✅* | — | Detailed recipients |

---

## 🔍 Troubleshooting

```mermaid
flowchart TD
    ERROR["❌ Test Failure"] --> TYPE{Error Type?}

    TYPE -->|"ReferenceError:<br/>clearInfos not defined"| F1["Fix: Add clearInfos<br/>to import in common.js"]
    TYPE -->|"ReferenceError:<br/>CURRENT_TESTFILE"| F2["Fix: Use CURRENT_TEST_FILE<br/>(with underscore)"]
    TYPE -->|"Wrong test's logs<br/>in email"| F3["Fix: clearInfos() in<br/>beforeEach + filter in<br/>persistDiagnosticsSummary"]
    TYPE -->|"Log box wraps<br/>long paths"| F4["Fix: white-space:pre<br/>+ overflow-x:auto<br/>+ max-width:820px"]
    TYPE -->|"No diagnostics found"| F5["Fix: persistDiagnostics<br/>crashed before write<br/>check for ReferenceErrors"]
    TYPE -->|"Preview not found<br/>for 21AT products"| F6["Expected: dashed sceneId<br/>handled by _findImageBySceneId<br/>split on '-' and '_'"]
    TYPE -->|"Scenes table empty"| F7["Normal: no scenes for AOI<br/>Test returns 'empty'<br/>⏭️ SKIPPED in email"]
    TYPE -->|"Upload modal won't open"| F8["3-strategy fallback<br/>1. Click → 2. Retry → 3. JS eval"]

    style F1 fill:#fef2f2,color:#dc2626
    style F2 fill:#fef2f2,color:#dc2626
    style F3 fill:#fef2f2,color:#dc2626
    style F4 fill:#fffbeb,color:#d97706
    style F5 fill:#fffbeb,color:#d97706
    style F6 fill:#f0f9ff,color:#2563eb
    style F7 fill:#f0f9ff,color:#2563eb
    style F8 fill:#f0f9ff,color:#2563eb
```

**Debug Commands:**

```bash
# Check diagnostics folder
ls -la diagnostics/

# View specific diagnostic
cat diagnostics/*QuickBird*.json | jq '.warnings, .errors, .skippedSteps'

# Run single test with visible browser
HEADLESS=false PAUSE_MULTIPLIER=1 npx playwright test -g "Shopping Cart"

# Run only P0 tests
npx playwright test -g "\[P0\]"

# Run without email
DAILY_REPORT_EMAILS= FAILURE_ALERT_EMAILS= npx playwright test

# Check artifact sizes
du -sh test-results/ diagnostics/
```

---

## 🏁 Quick Start

```bash
git clone <repo> && cd Geowgs84-Datastore
npm ci
cp .env.example .env   # Edit with BASE_URL, SMTP, emails
npx playwright test
npx playwright show-report
```

---

<p align="center">
  <img src="https://img.shields.io/badge/Built_with_❤️_for_GeoWGS84_Datastore-8B5CF6?style=for-the-badge" alt="Love" />
  <br/><br/>
    <sub>🤖 Automated E2E · Playwright · Node.js 22 · 8 Shards × 4 Workers · Daily CI</sub>
</p>
