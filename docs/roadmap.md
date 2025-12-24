# i45-jslogger Roadmap & Analysis

**Package:** i45-jslogger  
**Current Version:** v2.0.0  
**Next Major Version:** v3.0.0 (Planned)  
**Document Date:** December 23, 2025

---

## Executive Summary

i45-jslogger is a browser-based logging library designed for **development debugging and async timing analysis**. It provides persistent localStorage logging with CustomEvent dispatching, enabling developers to debug complex async workflows (like React useEffect chains) where traditional console logging is insufficient.

**Core Value Proposition:**

- **Persistent logs** survive page refreshes and crashes
- **Guaranteed execution order** via synchronous localStorage writes
- **Multi-destination routing** via custom clients (APIs, analytics, monitoring)
- **Event-driven architecture** for building reactive debug UIs

**Primary Use Cases:**

- React/Vue/Angular useEffect/lifecycle debugging
- Async operation timing analysis
- Race condition investigation
- Intermittent bug reproduction
- Multi-tab interaction debugging

---

## Current State (v2.0.0)

### ✅ Strengths

**1. Solid Foundation**

- ✅ Clean API with method chaining
- ✅ CustomEvent dispatching with namespace (`i45-logger:`)
- ✅ localStorage persistence for crash recovery
- ✅ Custom client system for multi-destination logging
- ✅ Environment detection (browser/Node.js)
- ✅ Comprehensive test coverage
- ✅ Storage limits via `maxEvents` property

**2. Developer Experience**

- ✅ Zero configuration required
- ✅ TypeScript definitions included
- ✅ Clear documentation with examples
- ✅ Semantic versioning with migration guides

**3. Reliability**

- ✅ Client error isolation (one client failure doesn't break others)
- ✅ Proper error handling and validation
- ✅ Breaking changes clearly documented

### ⚠️ Outstanding Issues from Project Analysis

#### Must Fix (Critical)

1. ✅ **Syntax errors in documentation** - FIXED in v2.0.0
2. ✅ **Build process** - FIXED in v2.0.0 (proper Rollup bundling)
3. ✅ **TypeScript definitions** - FIXED in v2.0.0 (complete .d.ts)
4. ✅ **Environment detection** - FIXED in v2.0.0
5. ✅ **addClient() return value** - FIXED in v2.0.0 (returns boolean)

#### Should Fix (Next Version - v3.0.0)

6. ✅ **Test coverage** - COMPLETED in v2.0.0
7. ✅ **Storage limits** - COMPLETED in v2.0.0 (`maxEvents`)
8. ✅ **Error handling** - COMPLETED in v2.0.0
9. ✅ **Event namespacing** - COMPLETED in v2.0.0 (`i45-logger:` prefix)
10. ⏸️ **Separate concerns** - DEFERRED to v3.0.0 (architectural refactoring)

#### Nice to Have (Future Versions)

11. ⏭️ **Full Node.js compatibility** - Future
12. ⏭️ **Plugin architecture** - v3.0.0 target
13. ⏭️ **Async client support** - v3.0.0 target
14. ⏭️ **Live demo and playground** - Future
15. ⏭️ **Performance optimizations** - v3.0.0+

---

## v3.0.0 Feature Roadmap

### 🎯 Phase 1: Core Architecture (Priority: HIGH)

#### 1.1 Session & Timing Tracking

**Motivation:** Enable grouping logs by user session and analyzing async operation timing.

**Features:**

```javascript
// Session tracking across page refreshes
const logger = new Logger({
  enableSessionTracking: true,     // Default: true
  sessionIdStorage: 'sessionStorage' // or 'localStorage'
});

// Each log entry includes:
{
  sessionId: "abc-123-def",      // Persists across page refreshes
  pageLoadId: "xyz-789-uvw",     // Unique per page load
  timestamp: 1703354001234,      // High-resolution timestamp
  level: "info",
  message: "Component mounted",
  args: [...]
}

// Query helpers
logger.getEventsBySession();           // All logs in current session
logger.getEventsByPageLoad();          // All logs in current page load
logger.getSessionId();                 // Current session ID
logger.getPageLoadId();                // Current page load ID
```

**Benefits:**

- ✅ Group logs across page refreshes for crash analysis
- ✅ Distinguish between sessions in multi-tab scenarios
- ✅ Analyze timing relationships in async workflows
- ✅ Trace user journeys through multiple page loads

**Implementation:**

- Use `crypto.randomUUID()` for ID generation
- Store session ID in sessionStorage (default) or localStorage (configurable)
- Generate new page load ID on each instantiation
- Add query helpers for filtering by session/page load

---

#### 1.2 Additional Log Levels

**Motivation:** Provide more granular logging for different use cases.

**Proposed Levels:**

```javascript
logger.trace("Function entry: fetchUser()"); // Verbose debugging
logger.debug("Variable state:", { userId: 123 }); // Development details
logger.log("User action recorded"); // Standard logging (existing)
logger.info("Payment processed"); // Informational (existing)
logger.warn("Rate limit approaching"); // Warning (existing)
logger.error("Database connection failed"); // Error (existing)
logger.critical("System shutdown imminent"); // Critical/Fatal
```

**Level Hierarchy:**

```
TRACE < DEBUG < LOG < INFO < WARN < ERROR < CRITICAL
```

**Configuration:**

```javascript
const logger = new Logger({
  minLevel: "info", // Only log INFO and above (suppress DEBUG/TRACE)
});

// Or runtime control
logger.setMinLevel("debug"); // Enable debug logging
```

**Benefits:**

- ✅ Filter noise in production (only WARN+)
- ✅ Enable verbose debugging in development (TRACE+)
- ✅ Distinguish critical vs standard errors
- ✅ Better log aggregation and filtering

**Implementation:**

- Add `trace()`, `debug()`, `critical()` methods
- Add level filtering configuration
- Update CustomEvent names (`i45-logger:TRACE`, etc.)
- Update storage format to include level enum

---

#### 1.3 Categories & Namespaces

**Motivation:** Organize logs by feature/module for better analysis.

**Proposed API:**

```javascript
// Create categorized loggers
const authLogger = logger.category("auth");
const paymentLogger = logger.category("payments");
const cartLogger = logger.category("cart");

// Logs include category
authLogger.error("Login failed");
// → [auth] Login failed

paymentLogger.info("Payment processing");
// → [payments] Payment processing

// Query by category
logger.getEventsByCategory("auth");

// Hierarchical categories
const stripeLogger = paymentLogger.category("stripe");
stripeLogger.warn("Retry attempt 3");
// → [payments:stripe] Retry attempt 3
```

**Configuration:**

```javascript
const logger = new Logger({
  enableCategories: true,
  categoryFormat: "[{category}]", // Customizable prefix
  categorySeparator: ":", // For hierarchies
});

// Filter by category
logger.filterCategories = ["auth", "payments"]; // Only these categories
```

**Benefits:**

- ✅ Organize logs in large applications
- ✅ Filter by feature during debugging
- ✅ Track specific workflows (auth, checkout, etc.)
- ✅ Better log analysis and reporting

**Implementation:**

- Add `category(name)` method returning new Logger instance
- Share event storage across category instances
- Add category field to log entries
- Add category-based filtering

---

### 🎯 Phase 2: Storage & Performance (Priority: MEDIUM)

#### 2.1 IndexedDB Archival Strategy

**Motivation:** Use localStorage for ordering guarantees, IndexedDB for capacity.

**Hybrid Approach:**

```javascript
const logger = new Logger({
  maxEvents: 200, // Keep 200 recent in localStorage
  enableArchival: true, // Archive old logs to IndexedDB
  archivalThreshold: 150, // Archive when >150 logs
  archivalStrategy: "auto", // or 'manual', 'time-based'
});

// Manual archival
await logger.archiveToIndexedDB();

// Query archived logs
const archived = await logger.getArchivedLogs({
  sessionId: "abc-123",
  startTime: yesterday,
  endTime: today,
  level: "error",
});
```

**Architecture:**

```
User Action
  ↓
logger.info("Action")
  ↓
localStorage (immediate, ordered) ← For recent debugging
  ↓ (async archival when >150 logs)
IndexedDB (large capacity) ← For long-term analysis
```

**Benefits:**

- ✅ localStorage: Guaranteed order + crash recovery
- ✅ IndexedDB: Large capacity (50MB+) for long sessions
- ✅ Automatic cleanup of localStorage (prevents quota errors)
- ✅ Query capabilities for archived logs

**Implementation:**

- Add IndexedDB wrapper class
- Implement archival trigger logic
- Add query API for archived logs
- Provide custom client pattern as alternative

**Documentation Note:**
Provide example implementation of IndexedDB client for users who want manual control:

```javascript
// Optional: DIY IndexedDB client using i45 DataContext
import { Logger } from "i45-jslogger";
import { DataContext, StorageLocations } from "i45";

class IndexedDBLoggerClient {
  constructor() {
    this.context = new DataContext({
      storageKey: "ApplicationLogs",
      storageLocation: StorageLocations.IndexedDB,
    });
  }

  async #storeLog(level, message, ...args) {
    const logs = await this.context.retrieve();
    logs.push({
      timestamp: Date.now(),
      level,
      message,
      args,
    });

    // Keep last 10,000 logs
    if (logs.length > 10000) logs.shift();
    await this.context.store(logs);
  }

  log(msg, ...args) {
    this.#storeLog("log", msg, ...args);
  }
  info(msg, ...args) {
    this.#storeLog("info", msg, ...args);
  }
  warn(msg, ...args) {
    this.#storeLog("warn", msg, ...args);
  }
  error(msg, ...args) {
    this.#storeLog("error", msg, ...args);
  }
}
```

---

#### 2.2 Lightweight Cross-Tab Sync

**Motivation:** See logs from other tabs in real-time debug dashboards.

**Proposed Implementation:**

```javascript
const logger = new Logger({
  enableCrossTabSync: true, // Default: false (opt-in)
});

// Listen for other tabs' logs
window.addEventListener("i45-logger:cross-tab-update", (e) => {
  console.log("Another tab logged:", e.detail.newEvents);
  updateDebugUI(e.detail.newEvents);
});
```

**Implementation:**

```javascript
class Logger {
  #initCrossTabSync() {
    // Use browser's built-in storage event
    window.addEventListener("storage", (e) => {
      if (e.key !== "i45-logger-events") return;

      window.dispatchEvent(
        new CustomEvent("i45-logger:cross-tab-update", {
          detail: {
            newEvents: JSON.parse(e.newValue || "[]"),
            oldEvents: JSON.parse(e.oldValue || "[]"),
          },
        })
      );
    });
  }
}
```

**Benefits:**

- ✅ Minimal code (uses native `storage` event)
- ✅ Opt-in (no overhead unless enabled)
- ✅ Useful for OAuth popups, multi-tab testing
- ✅ Build debug dashboards that aggregate tab logs

**Use Cases:**

- Debug admin panel monitoring user tabs
- OAuth/SSO popup window debugging
- WebSocket connection coordination
- Multi-tab integration testing

---

### 🎯 Phase 3: Developer Experience (Priority: LOW)

#### 3.1 React/Framework Debugging Helpers

**Motivation:** Make async debugging easier with framework-specific utilities.

**React Hook Wrapper:**

```javascript
import { useTrackedEffect } from "i45-jslogger/react";

// Automatic timing and error tracking
useTrackedEffect(
  "FetchUser",
  () => {
    fetchUser().then(setUser);
  },
  []
);

// Logs:
// → [FetchUser] START { deps: [], pageLoadId: "..." }
// → [FetchUser] MOUNTED { duration: "234.56ms" }
// → [FetchUser] CLEANUP (on unmount)
```

**Operation Tracking:**

```javascript
// Track async operation lifecycle
const opId = logger.startOperation("FetchOrders");
try {
  const orders = await fetchOrders();
  logger.endOperation(opId, { count: orders.length });
} catch (error) {
  logger.failOperation(opId, error);
}

// Logs:
// → ▶ START FetchOrders { opId: "abc-123" }
// → ✓ COMPLETE FetchOrders (456.78ms) { opId: "abc-123", result: {...} }
// or
// → ✗ FAILED FetchOrders (123.45ms) { opId: "abc-123", error: "..." }
```

**Benefits:**

- ✅ Track React useEffect execution order
- ✅ Validate component dependency chains (A → B → C)
- ✅ Measure operation durations automatically
- ✅ Detect StrictMode double-execution patterns

---

#### 3.2 Log Export & Analysis Tools

**Motivation:** Help developers analyze and share debugging sessions.

**Export Utilities:**

```javascript
// Export session logs
const sessionData = logger.exportSession({
  format: "json", // or 'csv', 'markdown'
  sessionId: "abc-123",
  includeArchived: true,
});

downloadFile("debug-session.json", sessionData);

// Import logs for analysis
logger.importSession(sessionData);
```

**Analysis Helpers:**

```javascript
// Timing analysis
const analysis = logger.analyzeTimings({
  sessionId: "abc-123",
  groupBy: "category",
});

console.log(analysis);
// {
//   "auth": { avgDuration: 234ms, operations: 5 },
//   "payments": { avgDuration: 567ms, operations: 3 }
// }

// Dependency validation
const valid = logger.validateDependencies([
  { name: "FetchUser", dependsOn: [] },
  { name: "FetchOrders", dependsOn: ["FetchUser"] },
  { name: "ProcessPayment", dependsOn: ["FetchOrders"] },
]);
// Returns: { valid: true, violations: [] }
```

**Benefits:**

- ✅ Share debug sessions with team
- ✅ Attach logs to bug reports
- ✅ Automated timing analysis
- ✅ Dependency chain validation

---

### 🎯 Phase 4: Architecture Refactoring (Priority: MEDIUM)

#### 4.1 Separation of Concerns

**Current State (v2.0.0):**

```javascript
// Monolithic Logger class
class Logger {
  #events = [];
  #clients = new Set();
  #loggingEnabled = true;
  // Everything in one class
}
```

**Proposed (v3.0.0):**

```javascript
// Separated concerns
class Logger {
  #storage; // EventStorage
  #dispatcher; // EventDispatcher
  #clientManager; // ClientManager
  #console; // ConsoleManager

  constructor(options = {}) {
    this.#storage = new EventStorage(options.storage);
    this.#dispatcher = new EventDispatcher(options.dispatcher);
    this.#clientManager = new ClientManager(options.clients);
    this.#console = new ConsoleManager(options.console);
  }
}
```

**Module Structure:**

```
/src
  /logger.js              # Main Logger class
  /storage/
    EventStorage.js       # localStorage + in-memory
    IndexedDBStorage.js   # IndexedDB archival
  /events/
    EventDispatcher.js    # CustomEvent handling
  /clients/
    ClientManager.js      # External client management
  /console/
    ConsoleManager.js     # Console output
  /utils/
    SessionManager.js     # Session/PageLoad ID tracking
    CategoryManager.js    # Category/namespace handling
    TimingAnalyzer.js     # Performance tracking
```

**Benefits:**

- ✅ Better testability (isolated unit tests)
- ✅ Tree-shaking (unused modules excluded)
- ✅ Extensibility (swap implementations)
- ✅ Maintainability (clear responsibilities)

---

#### 4.2 Graceful Deprecation & Migration Strategy

**Philosophy:** v2.0.0 just introduced breaking changes. Give the API time to mature (12-18 months) before v3.0.0, and provide comprehensive migration support when the time comes.

**Timeline Overview:**

```
v2.0.0 (Dec 2025) - Current release, stable
v2.1.0-2.4.0 (Q1-Q3 2026) - Additive features only, no breaking changes
v2.5.0 (Q3 2026) - Deprecation warnings begin
v2.8.0 (Q4 2026) - Dual API support, migration tools
v3.0.0 (Q1-Q2 2027) - Major refactoring (12-18 months after v2.0.0)
v2.x LTS (Q1-Q3 2027) - Security/critical fixes for 6 months
```

---

##### Stage 1: Deprecation Warnings (v2.5.0+)

**Introduce new architecture alongside old:**

```javascript
// v2.5.0 - new modular approach (opt-in)
class Logger {
  #deprecationWarningShown = false;

  constructor(options = {}) {
    // New modular architecture (preferred)
    if (options.modules) {
      this.#storage = options.modules.storage || new EventStorage();
      this.#dispatcher = options.modules.dispatcher || new EventDispatcher();
      this.#clientManager = options.modules.clients || new ClientManager();
    } else {
      // Old monolithic approach (deprecated but works)
      this.#events = [];
      this.#clients = new Set();

      // Emit one-time deprecation warning
      if (!this.#deprecationWarningShown) {
        console.warn(
          "[i45-jslogger] Deprecation Notice: Monolithic Logger architecture " +
            "will be removed in v3.0.0 (planned Q1 2027). " +
            "Migrate to modular architecture for better performance and tree-shaking. " +
            "Migration guide: https://github.com/xnodeoncode/i45-jslogger/blob/master/docs/v3-migration.md"
        );
        this.#deprecationWarningShown = true;
        sessionStorage.setItem("i45-logger-deprecation-shown", "true");
      }
    }
  }
}
```

**What users see:**

- Existing code works unchanged
- Console warning (once per session) with link to migration guide
- No functionality broken
- 6+ months to plan migration

---

##### Stage 2: Dual API Support (v2.8.0)

**Provide side-by-side compatibility:**

```javascript
// v2.8.0 - both APIs work simultaneously
import { Logger } from "i45-jslogger"; // Legacy (still works)
import { ModularLogger } from "i45-jslogger/v3"; // New API (opt-in)

// Old code continues working
const legacyLogger = new Logger();
legacyLogger.info("Still works");

// New code ready for v3.0.0
const newLogger = new ModularLogger({
  storage: new EventStorage({ maxEvents: 200 }),
  dispatcher: new EventDispatcher({ namespace: "i45-logger:" }),
  clients: new ClientManager(),
});
newLogger.info("Future-ready");

// Adapter for gradual migration
import { createV3Adapter } from "i45-jslogger/adapters";
const adaptedLogger = createV3Adapter(legacyLogger);
// Acts like v3 API but uses v2 internally
```

**Benefits:**

- Test v3 API without committing
- Gradual migration (file-by-file)
- Rollback if issues arise
- Both versions in same codebase

---

##### Stage 3: Automated Migration Tools (v2.8.0+)

**CLI Migration Assistant:**

```bash
# Install migration tool
npm install -g @i45-jslogger/migrate

# Scan project for compatibility
npx @i45-jslogger/migrate scan

# Output:
# ✓ 15 files compatible with v3.0.0
# ⚠️  3 files need updates:
#   - src/logger.js:12 - Use modular constructor
#   - src/debug.js:45 - Replace direct #events access
#   - src/utils/log.js:89 - Update client registration pattern
#
# Run 'npx @i45-jslogger/migrate fix' to auto-migrate

# Apply automated fixes
npx @i45-jslogger/migrate fix

# Review changes
git diff

# Output shows before/after for each file
```

**Codemod Script:**

```javascript
// Transforms v2 code to v3 automatically
// Before (v2.x):
const logger = new Logger();
logger.loggingEnabled = true;
logger.maxEvents = 100;

// After (v3.0.0) - auto-transformed:
const logger = new Logger({
  storage: new EventStorage({
    maxEvents: 100,
  }),
  dispatcher: new EventDispatcher({
    enabled: true,
  }),
});
```

**Manual Migration Guide:**

Comprehensive documentation with:

- Side-by-side code examples (before/after)
- Common patterns and their v3 equivalents
- Breaking change checklist
- Troubleshooting FAQ
- Performance comparison
- Rollback instructions

---

##### Stage 4: v3.0.0 Release Checklist

**Before Release:**

- [ ] All v2.x features work in v3.0.0 (via adapter if needed)
- [ ] Migration guide complete with real-world examples
- [ ] Automated codemod tested on 10+ real projects
- [ ] v3.0.0-beta released 2+ months before stable
- [ ] Breaking changes clearly documented
- [ ] Community feedback incorporated
- [ ] Performance benchmarks show no regression
- [ ] Rollback procedure documented

**Breaking Changes (v3.0.0):**

- Remove monolithic constructor pattern
- Remove direct property access to internal storage
- Require module-based architecture for advanced features
- Drop Node.js <16 support (if needed)
- Remove v1.x compatibility shims

**What Stays Compatible:**

- Basic logging API (`log()`, `info()`, `warn()`, `error()`)
- CustomEvent naming (`i45-logger:*`)
- localStorage format (can read v2.x logs)
- Custom client interface
- Session tracking (introduced in v2.1.0)

---

##### Stage 5: Long-Term Support (LTS)

**v2.x LTS (6 months after v3.0.0 release):**

```
v3.0.0 released (Q1 2027)
  ↓
v2.x enters LTS mode
  ↓
Q1-Q3 2027: Security fixes and critical bugs only
  ↓
Q4 2027: v2.x officially EOL (end-of-life)
```

**What's supported:**

- ✅ Security vulnerabilities
- ✅ Critical bugs (data loss, crashes)
- ✅ npm package remains available
- ❌ No new features
- ❌ No non-critical bug fixes
- ❌ No dependency updates (except security)

**Communication:**

- Clear EOL date announced 6+ months in advance
- Pinning guide: `npm install i45-jslogger@^2.8.0`
- Archive branch maintained: `v2-maintenance`
- GitHub issues labeled: `v2-lts-only`

---

##### Migration Support Resources

**Documentation:**

- Migration guide: `/docs/migration/v2-to-v3.md`
- Video walkthrough (10-15 minutes)
- Blog post series (3-4 articles)
- FAQ document
- Before/after example repository

**Tooling:**

- Automated codemod (JavaScript/TypeScript)
- VS Code extension with inline migration hints
- ESLint plugin to warn about deprecated patterns
- GitHub Action to check compatibility

**Community Support:**

- GitHub Discussions: Migration Q&A
- Discord channel: #v3-migration
- Office hours: Weekly Zoom sessions during transition
- Case studies from early adopters
- Bounty program for community-contributed migration guides

**Testing Strategy:**

- Beta testing program (volunteers get early access)
- Canary releases: `npm install i45-jslogger@canary`
- Side-by-side comparison tools
- Performance regression testing
- Automated compatibility test suite

---

##### Key Principles

**1. Transparency**

- Document every breaking change
- Explain why changes are necessary
- Show before/after code examples
- Provide cost/benefit analysis

**2. Automation**

- Codemods for mechanical changes
- CLI tools for scanning and reporting
- CI/CD integration for compatibility checks
- Minimal manual effort required

**3. Time**

- Minimum 12 months between major versions
- Minimum 6 months deprecation warning
- Minimum 2 months beta testing
- 6 months LTS support after new major

**4. Escape Hatches**

- Keep v2.x available indefinitely on npm
- Document version pinning strategies
- Provide adapter/polyfill layers
- Clear rollback procedures

**5. Community First**

- Gather feedback before finalizing changes
- Prioritize real-world use cases
- Support users during migration
- Celebrate successful migrations

---

### 🎯 Phase 5: Plugin System (Priority: LOW)

#### 5.1 Plugin Architecture

**Motivation:** Extensibility without bloating core package.

**API Design:**

```javascript
// Plugin interface
interface LoggerPlugin {
  name: string;
  install(logger: Logger): void;
  uninstall?(logger: Logger): void;
}

// Usage
const logger = new Logger();
logger.use(apiLoggerPlugin);
logger.use(filterPlugin);
logger.use(performancePlugin);
```

**Built-in Plugins (Separate Packages):**

- `@i45-jslogger/plugin-api` - API logging client
- `@i45-jslogger/plugin-filter` - Message filtering/sanitization
- `@i45-jslogger/plugin-sentry` - Sentry integration
- `@i45-jslogger/plugin-analytics` - Google Analytics events
- `@i45-jslogger/plugin-performance` - Performance.mark() integration

**Example Plugin:**

```javascript
// API Logger Plugin
const apiLoggerPlugin = {
  name: "api-logger",
  install(logger) {
    logger.on("error", async (event) => {
      await fetch("/api/errors", {
        method: "POST",
        body: JSON.stringify(event),
      });
    });
  },
};
```

**Benefits:**

- ✅ Core stays lightweight
- ✅ Community can build plugins
- ✅ Easy integration with third-party services
- ✅ Pay-for-what-you-use approach

---

### 🎯 Phase 6: Middleware & Auto-Instrumentation (Priority: MEDIUM)

#### 6.1 Client-Side Middleware Architecture

**Motivation:** Inspired by .NET middleware patterns, enable automatic logging of user interactions, API calls, navigation, and framework lifecycle events without polluting the codebase with explicit logging calls. This provides the same benefits as ASP.NET middleware/filters - centralized logging with rich context.

**Configuration-Based Approach:**

```javascript
const logger = new Logger({
  middleware: {
    // Global event interception
    dom: {
      captureClicks: true,
      captureFormSubmissions: true,
      captureInputChanges: false, // Privacy consideration
      includeElementPath: true, // div.container > button#submit
      excludeSelectors: [".no-log", "[data-no-log]"],
      sanitizeInputs: ["password", "ssn", "credit-card"],
    },

    // API call interception (Fetch/XHR)
    fetch: {
      enabled: true,
      includeHeaders: false, // Privacy
      includeRequestBody: false, // Privacy
      includeResponseBody: false, // Privacy
      includeTimings: true,
      excludeUrls: [/\/analytics/, "/api/metrics"],
      sanitizeUrls: true, // Remove tokens from URLs
    },

    // Navigation interception (SPA routing)
    navigation: {
      enabled: true,
      captureHashChange: true,
      capturePushState: true,
      captureReplaceState: true,
      capturePopState: true,
      includeReferrer: true,
    },

    // Error interception
    errors: {
      captureUnhandledRejections: true,
      captureGlobalErrors: true,
      captureConsoleErrors: true,
      includeStackTrace: true,
    },

    // Performance monitoring
    performance: {
      captureNavigation: true,
      captureResources: false, // Can be verbose
      captureLongTasks: true,
      longTaskThreshold: 50, // ms
      captureLayoutShifts: true,
    },
  },
});
```

**Benefits:**

- ✅ Zero code pollution - configure once, works everywhere
- ✅ Consistent logging - all events captured uniformly
- ✅ Rich context - automatic capture of DOM state, user actions, timing
- ✅ Privacy controls - built-in sanitization and exclusion rules
- ✅ Opt-in/opt-out - granular control over what's captured

---

#### 6.2 DOM Event Interception

**Implementation:**

```javascript
class DOMMiddleware {
  #logger;
  #config;

  constructor(logger, config) {
    this.#logger = logger;
    this.#config = config;
    this.#attachListeners();
  }

  #attachListeners() {
    if (this.#config.captureClicks) {
      document.addEventListener("click", this.#handleClick.bind(this), true);
    }

    if (this.#config.captureFormSubmissions) {
      document.addEventListener("submit", this.#handleSubmit.bind(this), true);
    }
  }

  #handleClick(event) {
    const target = event.target;

    // Check exclusions
    if (this.#shouldExclude(target)) return;

    this.#logger.info("[middleware:click]", {
      element: target.tagName.toLowerCase(),
      id: target.id,
      className: target.className,
      text: target.textContent?.trim().substring(0, 50),
      elementPath: this.#getElementPath(target),
      timestamp: Date.now(),
    });
  }

  #handleSubmit(event) {
    const form = event.target;

    if (this.#shouldExclude(form)) return;

    const formData = new FormData(form);
    const data = {};

    for (const [key, value] of formData.entries()) {
      // Sanitize sensitive fields
      if (this.#config.sanitizeInputs.includes(key)) {
        data[key] = "[REDACTED]";
      } else {
        data[key] = value;
      }
    }

    this.#logger.info("[middleware:form]", {
      action: form.action,
      method: form.method,
      data,
      timestamp: Date.now(),
    });
  }

  #shouldExclude(element) {
    return this.#config.excludeSelectors.some(
      (selector) => element.matches?.(selector) || element.closest?.(selector)
    );
  }

  #getElementPath(element) {
    if (!this.#config.includeElementPath) return undefined;

    const path = [];
    let current = element;

    while (current && current !== document.body) {
      let selector = current.tagName.toLowerCase();
      if (current.id) selector += `#${current.id}`;
      else if (current.className)
        selector += `.${current.className.split(" ")[0]}`;
      path.unshift(selector);
      current = current.parentElement;
    }

    return path.join(" > ");
  }
}
```

**Auto-Logged Events:**

```javascript
// User clicks button
// → [middleware:click] { element: "button", id: "submit-btn", text: "Save Order", elementPath: "div.checkout > form#order-form > button#submit-btn" }

// User submits form
// → [middleware:form] { action: "/api/orders", method: "POST", data: { email: "user@example.com", password: "[REDACTED]" } }
```

---

#### 6.3 Fetch/XHR Interception

**Implementation:**

```javascript
class FetchMiddleware {
  #logger;
  #config;
  #originalFetch;
  #originalXHROpen;

  constructor(logger, config) {
    this.#logger = logger;
    this.#config = config;
    this.#interceptFetch();
    this.#interceptXHR();
  }

  #interceptFetch() {
    this.#originalFetch = window.fetch;
    const self = this;

    window.fetch = async function (...args) {
      const url = typeof args[0] === "string" ? args[0] : args[0].url;
      const options = args[1] || {};

      // Check exclusions
      if (self.#shouldExcludeUrl(url)) {
        return self.#originalFetch.apply(this, args);
      }

      const startTime = performance.now();
      const requestId = crypto.randomUUID();

      self.#logger.info("[middleware:fetch:request]", {
        requestId,
        url: self.#sanitizeUrl(url),
        method: options.method || "GET",
        headers: self.#config.includeHeaders ? options.headers : undefined,
        body: self.#config.includeRequestBody ? options.body : undefined,
      });

      try {
        const response = await self.#originalFetch.apply(this, args);
        const duration = performance.now() - startTime;

        self.#logger.info("[middleware:fetch:response]", {
          requestId,
          url: self.#sanitizeUrl(url),
          status: response.status,
          statusText: response.statusText,
          duration: `${duration.toFixed(2)}ms`,
          ok: response.ok,
        });

        return response;
      } catch (error) {
        const duration = performance.now() - startTime;

        self.#logger.error("[middleware:fetch:error]", {
          requestId,
          url: self.#sanitizeUrl(url),
          error: error.message,
          duration: `${duration.toFixed(2)}ms`,
        });

        throw error;
      }
    };
  }

  #interceptXHR() {
    this.#originalXHROpen = XMLHttpRequest.prototype.open;
    const self = this;

    XMLHttpRequest.prototype.open = function (method, url, ...args) {
      if (!self.#shouldExcludeUrl(url)) {
        const requestId = crypto.randomUUID();
        const startTime = performance.now();

        this.addEventListener("load", function () {
          const duration = performance.now() - startTime;

          self.#logger.info("[middleware:xhr:response]", {
            requestId,
            url: self.#sanitizeUrl(url),
            method,
            status: this.status,
            duration: `${duration.toFixed(2)}ms`,
          });
        });

        this.addEventListener("error", function () {
          const duration = performance.now() - startTime;

          self.#logger.error("[middleware:xhr:error]", {
            requestId,
            url: self.#sanitizeUrl(url),
            method,
            duration: `${duration.toFixed(2)}ms`,
          });
        });
      }

      return self.#originalXHROpen.apply(this, [method, url, ...args]);
    };
  }

  #shouldExcludeUrl(url) {
    return this.#config.excludeUrls.some((pattern) => {
      if (pattern instanceof RegExp) return pattern.test(url);
      return url.includes(pattern);
    });
  }

  #sanitizeUrl(url) {
    if (!this.#config.sanitizeUrls) return url;

    // Remove common token patterns
    return url
      .replace(/([?&]token=)[^&]+/, "$1[REDACTED]")
      .replace(/([?&]api_key=)[^&]+/, "$1[REDACTED]")
      .replace(/([?&]access_token=)[^&]+/, "$1[REDACTED]");
  }
}
```

**Auto-Logged API Calls:**

```javascript
// fetch('/api/users/123')
// → [middleware:fetch:request] { requestId: "abc-123", url: "/api/users/123", method: "GET" }
// → [middleware:fetch:response] { requestId: "abc-123", status: 200, duration: "234.56ms", ok: true }

// Failed API call
// → [middleware:fetch:request] { requestId: "def-456", url: "/api/orders", method: "POST" }
// → [middleware:fetch:error] { requestId: "def-456", error: "Network Error", duration: "5012.34ms" }
```

---

#### 6.4 Navigation Interception

**Implementation:**

```javascript
class NavigationMiddleware {
  #logger;
  #config;
  #originalPushState;
  #originalReplaceState;

  constructor(logger, config) {
    this.#logger = logger;
    this.#config = config;
    this.#interceptHistory();
    this.#attachListeners();
  }

  #interceptHistory() {
    this.#originalPushState = history.pushState;
    this.#originalReplaceState = history.replaceState;
    const self = this;

    if (this.#config.capturePushState) {
      history.pushState = function (state, title, url) {
        self.#logger.info("[middleware:navigation:pushState]", {
          from: window.location.pathname,
          to: url,
          state,
          referrer: self.#config.includeReferrer
            ? document.referrer
            : undefined,
        });
        return self.#originalPushState.apply(this, arguments);
      };
    }

    if (this.#config.captureReplaceState) {
      history.replaceState = function (state, title, url) {
        self.#logger.info("[middleware:navigation:replaceState]", {
          from: window.location.pathname,
          to: url,
          state,
        });
        return self.#originalReplaceState.apply(this, arguments);
      };
    }
  }

  #attachListeners() {
    if (this.#config.capturePopState) {
      window.addEventListener("popstate", (event) => {
        this.#logger.info("[middleware:navigation:popstate]", {
          url: window.location.pathname,
          state: event.state,
        });
      });
    }

    if (this.#config.captureHashChange) {
      window.addEventListener("hashchange", (event) => {
        this.#logger.info("[middleware:navigation:hashchange]", {
          from: event.oldURL,
          to: event.newURL,
        });
      });
    }
  }
}
```

**Auto-Logged Navigation:**

```javascript
// SPA navigation (React Router, Vue Router, etc.)
// → [middleware:navigation:pushState] { from: "/dashboard", to: "/users/123", state: {...} }

// Browser back/forward
// → [middleware:navigation:popstate] { url: "/dashboard", state: {...} }

// Hash navigation
// → [middleware:navigation:hashchange] { from: "#home", to: "#settings" }
```

---

#### 6.5 Framework-Specific Integrations

##### React Integration

**Approach 1: React Profiler (Lightweight, No Code Changes)**

```javascript
const logger = new Logger({
  middleware: {
    react: {
      enabled: true,
      mode: "profiler", // Use React's built-in Profiler
      includeProps: true,
      excludeComponents: ["Button", "Icon", /^UI/],
      minRenderTime: 16, // Only log if render > 16ms
    },
  },
});

// Logger automatically wraps your app:
function App() {
  return (
    <Profiler id="App" onRender={logger.handleReactRender}>
      <YourApp />
    </Profiler>
  );
}

// Auto-logged:
// → [react:mount] { component: "UserDashboard", duration: "23.45ms", props: {...} }
// → [react:update] { component: "OrderList", duration: "45.67ms", propsChanged: ["userId"] }
```

**Approach 2: createElement Interception (Global)**

```javascript
const logger = new Logger({
  middleware: {
    react: {
      enabled: true,
      mode: "createElement", // Monkey-patch React.createElement
      logCreation: false, // Too verbose for production
      logLifecycle: true,
    },
  },
});

// Behind the scenes:
const originalCreateElement = React.createElement;
React.createElement = function (type, props, ...children) {
  if (typeof type === "function") {
    const componentName = type.name || type.displayName || "Anonymous";

    // Only log on first render (not every re-render)
    if (logger.#isFirstRender(componentName)) {
      logger.trace("[react:createElement]", {
        component: componentName,
        props: logger.#sanitizeProps(props),
      });
    }
  }
  return originalCreateElement.call(this, type, props, ...children);
};
```

**Approach 3: Custom Hook (Opt-In Per Component)**

```javascript
// One-time provider setup
import { LoggerProvider } from "i45-jslogger/react";

function App() {
  return (
    <LoggerProvider logger={logger}>
      <YourApp />
    </LoggerProvider>
  );
}

// In components you want to log (opt-in):
import { useComponentLogger } from "i45-jslogger/react";

function UserProfile({ userId }) {
  useComponentLogger("UserProfile", { userId }); // One line!

  const [user, setUser] = useState(null);

  useEffect(() => {
    // Automatically logged as "[UserProfile] Effect: fetchUser"
    fetchUser(userId).then(setUser);
  }, [userId]);

  return <div>Profile for {user?.name}</div>;
}

// Auto-logged:
// → [UserProfile] Mount { props: { userId: 123 } }
// → [UserProfile] Effect: fetchUser { userId: 123 }
// → [UserProfile] Update { propsChanged: ["userId"], newProps: { userId: 456 } }
// → [UserProfile] Unmount
```

##### Vue Integration

```javascript
const logger = new Logger({
  middleware: {
    vue: {
      enabled: true,
      logLifecycle: true,
      logDataChanges: true,
      excludeComponents: ["BaseButton", "BaseIcon"],
    },
  },
});

// Automatically intercepts Vue lifecycle hooks:
app.mixin({
  mounted() {
    logger.info("[vue:mounted]", {
      component: this.$options.name,
      props: this.$props,
    });
  },
  updated() {
    logger.info("[vue:updated]", {
      component: this.$options.name,
    });
  },
  unmounted() {
    logger.info("[vue:unmounted]", {
      component: this.$options.name,
    });
  },
});
```

##### Angular Integration

```javascript
// Injectable service with HTTP interceptor
import { HttpInterceptor } from '@angular/common/http';
import { Logger } from 'i45-jslogger';

@Injectable()
export class LoggingInterceptor implements HttpInterceptor {
  constructor(private logger: Logger) {}

  intercept(req: HttpRequest<any>, next: HttpHandler) {
    const startTime = Date.now();

    this.logger.info('[angular:http:request]', {
      url: req.url,
      method: req.method,
    });

    return next.handle(req).pipe(
      tap(
        response => {
          const duration = Date.now() - startTime;
          this.logger.info('[angular:http:response]', {
            url: req.url,
            status: response.status,
            duration: `${duration}ms`,
          });
        },
        error => {
          const duration = Date.now() - startTime;
          this.logger.error('[angular:http:error]', {
            url: req.url,
            error: error.message,
            duration: `${duration}ms`,
          });
        }
      )
    );
  }
}
```

---

#### 6.6 Build-Time Instrumentation (Advanced)

**Babel Plugin:**

```javascript
// babel.config.js
module.exports = {
  plugins: [
    [
      "i45-jslogger/babel-plugin",
      {
        enabled: process.env.NODE_ENV === "development",
        framework: "react",
        components: ["*"], // or specific patterns
        excludeComponents: ["Button", "Icon"],
        logLifecycle: true,
        logProps: true,
      },
    ],
  ],
};

// Before transformation:
function UserProfile({ userId }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetchUser(userId).then(setUser);
  }, [userId]);

  return <div>Profile</div>;
}

// After transformation (automatic):
function UserProfile({ userId }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    logger.info("[UserProfile] Mounted", { props: { userId } });
    return () => logger.info("[UserProfile] Unmounted");
  }, []);

  useEffect(() => {
    logger.info("[UserProfile] Effect Start", { deps: [userId] });
    fetchUser(userId).then(setUser);
  }, [userId]);

  return <div>Profile</div>;
}
```

**Vite Plugin:**

```javascript
// vite.config.js
import { defineConfig } from "vite";
import { i45LoggerPlugin } from "i45-jslogger/vite";

export default defineConfig({
  plugins: [
    i45LoggerPlugin({
      framework: "react",
      autoInstrument: true,
      include: ["src/**/*.jsx", "src/**/*.tsx"],
      exclude: ["src/components/ui/**"],
      mode: "development", // Only in dev mode
    }),
  ],
});
```

**Webpack Loader:**

```javascript
// webpack.config.js
module.exports = {
  module: {
    rules: [
      {
        test: /\.(jsx|tsx)$/,
        use: [
          "babel-loader",
          {
            loader: "i45-jslogger/webpack-loader",
            options: {
              framework: "react",
              autoInstrument: true,
              excludeComponents: ["Button", "Icon"],
            },
          },
        ],
      },
    ],
  },
};
```

---

#### 6.7 Performance Observer Integration

**Automatic Performance Monitoring:**

```javascript
const logger = new Logger({
  middleware: {
    performance: {
      captureNavigation: true,
      captureResources: false, // Can be very verbose
      captureLongTasks: true,
      longTaskThreshold: 50, // ms
      captureLayoutShifts: true,
      captureLargestContentfulPaint: true,
      captureFirstInputDelay: true,
    },
  },
});

// Behind the scenes:
class PerformanceMiddleware {
  #logger;
  #config;

  constructor(logger, config) {
    this.#logger = logger;
    this.#config = config;
    this.#initObservers();
  }

  #initObservers() {
    // Navigation timing
    if (this.#config.captureNavigation) {
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.#logger.info("[performance:navigation]", {
            type: entry.type,
            duration: `${entry.duration.toFixed(2)}ms`,
            domContentLoaded: `${
              entry.domContentLoadedEventEnd - entry.domContentLoadedEventStart
            }ms`,
            loadComplete: `${entry.loadEventEnd - entry.loadEventStart}ms`,
          });
        }
      }).observe({ entryTypes: ["navigation"] });
    }

    // Long tasks (blocking the main thread)
    if (this.#config.captureLongTasks) {
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.duration >= this.#config.longTaskThreshold) {
            this.#logger.warn("[performance:longtask]", {
              duration: `${entry.duration.toFixed(2)}ms`,
              startTime: entry.startTime,
              attribution: entry.attribution,
            });
          }
        }
      }).observe({ entryTypes: ["longtask"] });
    }

    // Layout shifts (visual stability)
    if (this.#config.captureLayoutShifts) {
      let clsValue = 0;
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
            this.#logger.info("[performance:layout-shift]", {
              value: entry.value,
              cumulativeScore: clsValue,
            });
          }
        }
      }).observe({ entryTypes: ["layout-shift"] });
    }

    // Largest Contentful Paint (LCP)
    if (this.#config.captureLargestContentfulPaint) {
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        this.#logger.info("[performance:lcp]", {
          renderTime: `${lastEntry.renderTime.toFixed(2)}ms`,
          element: lastEntry.element?.tagName,
          url: lastEntry.url,
        });
      }).observe({ entryTypes: ["largest-contentful-paint"] });
    }

    // First Input Delay (FID)
    if (this.#config.captureFirstInputDelay) {
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.#logger.info("[performance:fid]", {
            delay: `${entry.processingStart - entry.startTime}ms`,
            eventType: entry.name,
          });
        }
      }).observe({ entryTypes: ["first-input"] });
    }
  }
}
```

**Auto-Logged Performance Metrics:**

```javascript
// Page load
// → [performance:navigation] { type: "navigate", duration: "1234.56ms", domContentLoaded: "567.89ms", loadComplete: "234.56ms" }

// Long task detected
// → [performance:longtask] { duration: "123.45ms", startTime: 5678.90 }

// Layout shift
// → [performance:layout-shift] { value: 0.15, cumulativeScore: 0.15 }

// Largest Contentful Paint
// → [performance:lcp] { renderTime: "2345.67ms", element: "IMG", url: "/hero.jpg" }

// First Input Delay
// → [performance:fid] { delay: "12.34ms", eventType: "click" }
```

---

#### 6.8 Error Interception

**Global Error Handling:**

```javascript
const logger = new Logger({
  middleware: {
    errors: {
      captureUnhandledRejections: true,
      captureGlobalErrors: true,
      captureConsoleErrors: true,
      includeStackTrace: true,
      includeUserAgent: true,
    },
  },
});

// Implementation:
class ErrorMiddleware {
  #logger;
  #config;

  constructor(logger, config) {
    this.#logger = logger;
    this.#config = config;
    this.#attachHandlers();
  }

  #attachHandlers() {
    if (this.#config.captureUnhandledRejections) {
      window.addEventListener("unhandledrejection", (event) => {
        this.#logger.error("[middleware:unhandled-rejection]", {
          reason: event.reason?.message || event.reason,
          promise: event.promise,
          stack: this.#config.includeStackTrace
            ? event.reason?.stack
            : undefined,
          userAgent: this.#config.includeUserAgent
            ? navigator.userAgent
            : undefined,
        });
      });
    }

    if (this.#config.captureGlobalErrors) {
      window.addEventListener("error", (event) => {
        this.#logger.error("[middleware:global-error]", {
          message: event.message,
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
          stack: this.#config.includeStackTrace
            ? event.error?.stack
            : undefined,
        });
      });
    }

    if (this.#config.captureConsoleErrors) {
      const originalError = console.error;
      console.error = (...args) => {
        this.#logger.error("[middleware:console-error]", {
          args: args.map((arg) =>
            typeof arg === "object" ? JSON.stringify(arg) : String(arg)
          ),
        });
        originalError.apply(console, args);
      };
    }
  }
}
```

---

#### 6.9 Privacy & Security Considerations

**Built-In Sanitization:**

```javascript
const logger = new Logger({
  middleware: {
    privacy: {
      // Automatic PII detection and redaction
      sanitizePasswords: true, // Any field with "password" in name
      sanitizeCreditCards: true, // Detect credit card patterns
      sanitizeTokens: true, // Remove tokens from URLs and headers
      sanitizeEmails: false, // Keep emails (unless specified)

      // Custom sanitization rules
      customRules: [
        { pattern: /ssn|social_security/i, replacement: "[SSN-REDACTED]" },
        { pattern: /api_key=[\w-]+/g, replacement: "api_key=[REDACTED]" },
        { pattern: /\b\d{16}\b/g, replacement: "[CARD-REDACTED]" }, // Credit cards
      ],

      // Data retention
      maxStorageDays: 7, // Auto-delete logs older than 7 days
      clearOnLogout: true, // Clear logs when user logs out

      // Consent management
      requireConsent: true, // Don't log until user consents
      consentStorageKey: "i45-logger-consent",
    },
  },
});

// Check consent before logging
if (!logger.hasConsent()) {
  logger.requestConsent(); // Show UI prompt
}

// User grants consent
logger.grantConsent();

// User revokes consent (stops logging + clears data)
logger.revokeConsent();
```

---

#### 6.10 Use Cases

**1. Production Bug Investigation**

```javascript
// Silent logging in production (no console output)
const logger = new Logger({
  suppressConsole: true,
  middleware: {
    dom: { captureClicks: true, captureForms: true },
    fetch: { enabled: true, includeTimings: true },
    errors: { captureUnhandledRejections: true },
  },
});

// When user reports a bug, export their session
window.addEventListener("unhandledrejection", async () => {
  const sessionData = await logger.exportSession();
  await sendToSupportTeam(sessionData);
  // Support team can replay the exact sequence of events
});
```

**2. A/B Testing Analysis**

```javascript
// Track user interactions for experiment analysis
const logger = new Logger({
  middleware: {
    dom: {
      captureClicks: true,
      includeElementPath: true,
    },
  },
});

// All clicks automatically logged with context
// → [middleware:click] { element: "button", id: "checkout-btn-variant-a", ... }
// → [middleware:click] { element: "button", id: "checkout-btn-variant-b", ... }

// Analyze which variant gets more clicks
const clicks = logger
  .getEvents()
  .filter((e) => e.category === "middleware:click");
```

**3. Multi-Tab Debugging**

```javascript
// Debug OAuth popup flow
const logger = new Logger({
  enableCrossTabSync: true,
  middleware: {
    navigation: { enabled: true },
    fetch: { enabled: true },
  },
});

// Main window
logger.info("Opening OAuth popup");
window.open("/oauth", "oauth", "width=600,height=400");

// Popup window (same logger config)
// → [middleware:navigation] popup loaded
// → [middleware:fetch:request] /oauth/authorize
// → [middleware:fetch:response] status: 302
// → [middleware:navigation] redirect to /callback

// Main window receives all popup logs via cross-tab sync!
```

**4. Performance Regression Testing**

```javascript
// Automatically track Core Web Vitals
const logger = new Logger({
  middleware: {
    performance: {
      captureLargestContentfulPaint: true,
      captureFirstInputDelay: true,
      captureLayoutShifts: true,
      captureLongTasks: true,
    },
  },
});

// After each deployment, compare metrics
const currentMetrics = logger.analyzePerformance();
const baselineMetrics = loadFromBaseline();

if (currentMetrics.lcp > baselineMetrics.lcp * 1.1) {
  alert("LCP regression detected!");
}
```

**5. React useEffect Debugging**

```javascript
// Track all component lifecycle automatically
const logger = new Logger({
  middleware: {
    react: {
      enabled: true,
      mode: "profiler",
      includeProps: true,
    },
  },
});

// After mount, analyze dependency chain
const events = logger.getEventsBySession();
// → [react:mount] UserDashboard
// → [react:mount] OrderList { props: { userId: undefined } } ← Bug! Should have userId
// → [react:update] OrderList { propsChanged: ["userId"] } ← Fixed after parent updated
```

---

#### 6.11 Implementation Strategy

**Phase 1: Core Middleware (v3.0.0)**

- ✅ DOM event interception (clicks, forms)
- ✅ Fetch/XHR interception
- ✅ Navigation interception (history API)
- ✅ Error interception (unhandled rejections, global errors)
- ✅ Privacy controls (sanitization, exclusions)

**Phase 2: Framework Integrations (v3.1.0)**

- ✅ React Profiler integration
- ✅ React custom hook (`useComponentLogger`)
- ⚠️ Vue mixin (optional)
- ⚠️ Angular interceptor (optional)

**Phase 3: Performance Monitoring (v3.2.0)**

- ✅ PerformanceObserver integration
- ✅ Core Web Vitals tracking (LCP, FID, CLS)
- ✅ Long task detection
- ✅ Resource timing (opt-in)

**Phase 4: Build-Time Tooling (v3.3.0+)**

- ⚠️ Babel plugin (optional, advanced users)
- ⚠️ Vite plugin (optional, advanced users)
- ⚠️ Webpack loader (optional, advanced users)

**Priority:** Medium (powerful feature, but optional for core functionality)

---

#### 6.12 Configuration Examples

**Development Mode (Verbose Logging):**

```javascript
const logger = new Logger({
  loggingEnabled: true,
  suppressConsole: false,
  minLevel: "trace",
  middleware: {
    dom: { captureClicks: true, captureForms: true },
    fetch: { enabled: true, includeHeaders: true, includeTimings: true },
    navigation: { enabled: true },
    errors: { captureUnhandledRejections: true, captureGlobalErrors: true },
    performance: { captureLongTasks: true, captureLayoutShifts: true },
    react: { enabled: true, mode: "profiler", includeProps: true },
  },
});
```

**Production Mode (Silent, Error-Only):**

```javascript
const logger = new Logger({
  loggingEnabled: true,
  suppressConsole: true, // No console output
  minLevel: "error", // Only errors
  middleware: {
    dom: { captureClicks: false, captureForms: false },
    fetch: { enabled: true, includeHeaders: false, includeTimings: true },
    navigation: { enabled: false },
    errors: { captureUnhandledRejections: true, captureGlobalErrors: true },
    performance: { captureLongTasks: false },
    privacy: {
      sanitizePasswords: true,
      sanitizeCreditCards: true,
      sanitizeTokens: true,
      maxStorageDays: 7,
    },
  },
});
```

**Testing Mode (API & Performance Focus):**

```javascript
const logger = new Logger({
  middleware: {
    fetch: {
      enabled: true,
      includeHeaders: true,
      includeRequestBody: true,
      includeResponseBody: true,
      includeTimings: true,
    },
    performance: {
      captureNavigation: true,
      captureLongTasks: true,
      longTaskThreshold: 50,
    },
    errors: { captureUnhandledRejections: true },
  },
});
```

---

## Version Roadmap Timeline

### v3.0.0 (Q2-Q3 2026)

**Breaking Changes - Major Release**

**Phase 1 (Essential):**

- ✅ Session & timing tracking (sessionId, pageLoadId)
- ✅ Additional log levels (trace, debug, critical)
- ✅ Categories & namespaces

**Phase 2 (Important):**

- ✅ IndexedDB archival strategy
- ⚠️ Optional: Lightweight cross-tab sync

**Phase 4 (Architecture):**

- ✅ Separation of concerns refactoring
- ✅ Backward compatibility adapter

### v3.1.0 (Q4 2026)

**Feature Release**

- React/framework debugging helpers
- Log export & analysis tools

### v3.2.0 (Q1 2027)

**Plugin System**

- Plugin architecture
- Core plugins (@i45-jslogger/plugin-\*)

### v3.3.0 (Q2 2027)

**Middleware & Auto-Instrumentation - Part 1**

- DOM event interception (clicks, forms)
- Fetch/XHR interception
- Navigation interception (history API)
- Error interception (unhandled rejections, global errors)
- Privacy controls (sanitization, exclusions)

### v3.4.0 (Q3 2027)

**Middleware & Auto-Instrumentation - Part 2**

- React Profiler integration
- React custom hook (`useComponentLogger`)
- Performance monitoring (Core Web Vitals, long tasks)
- Vue mixin (optional)
- Angular interceptor (optional)

### v3.5.0+ (Future)

**Advanced Tooling & Enhancements**

- Babel plugin for automatic instrumentation
- Vite plugin for automatic instrumentation
- Webpack loader for automatic instrumentation
- Performance optimizations
- Live demo & playground
- Full Node.js compatibility

---

## Migration Path

### v2.0.0 → v3.0.0

**Breaking Changes:**

1. Constructor signature changes (config object expanded)
2. Internal module structure (shouldn't affect public API)
3. Deprecated features removed (if any)

**Migration Guide:**

```javascript
// v2.0.0
const logger = new Logger();
logger.enableLogging = true;
logger.maxEvents = 100;

// v3.0.0 (backward compatible)
const logger = new Logger({
  loggingEnabled: true,
  maxEvents: 100,
  enableSessionTracking: true, // NEW
  enableCategories: true, // NEW
});

// Or continue using v2 style (still works)
const logger = new Logger();
logger.loggingEnabled = true;
logger.maxEvents = 100;
```

**Tools Provided:**

- Automated codemod script
- Migration CLI: `npx @i45-jslogger/migrate`
- Deprecation warnings with upgrade instructions
- Side-by-side compatibility for 1 minor version

---

## Success Metrics

### Pre-Release Checklist

- [ ] All v2.0.0 features work in v3.0.0
- [ ] Performance: No regression, target 10-20% improvement
- [ ] Bundle size: Core under 5KB gzipped
- [ ] Test coverage: 95%+ including new features
- [ ] Documentation: Complete with examples
- [ ] Migration guide: Step-by-step with codemods
- [ ] TypeScript: Full type definitions for all features

### Post-Release Tracking

- npm download trends
- GitHub issues/PRs
- Community feedback (surveys)
- Adoption rate metrics
- Performance benchmarks

---

## Open Questions & Community Input

1. **Session ID Persistence:** sessionStorage (default) vs localStorage?
2. **IndexedDB Priority:** Built-in vs custom client pattern only?
3. **Cross-tab Sync:** Essential feature or niche use case?
4. **Plugin System:** Separate packages or monorepo?
5. **Breaking Changes:** How aggressive should v3.0.0 refactoring be?

**Feedback Welcome:**

- GitHub Issues: Feature requests
- GitHub Discussions: Architecture proposals
- Pull Requests: Proof-of-concept implementations

---

## Appendix: Use Case Examples

### A. React useEffect Debugging

**Problem:** Component B depends on data from Component A, but timing is unclear.

**Solution:**

```javascript
// Component A
useEffect(() => {
  logger.info("A: START fetch user");
  fetchUser().then((user) => {
    logger.info("A: COMPLETE", { userId: user.id });
    setUser(user);
  });
}, []);

// Component B (depends on A)
useEffect(() => {
  if (!user) {
    logger.info("B: SKIPPED - no user");
    return;
  }
  logger.info("B: START fetch orders", { userId: user.id });
  fetchOrders(user.id).then((orders) => {
    logger.info("B: COMPLETE", { count: orders.length });
    setOrders(orders);
  });
}, [user]);

// After crash, analyze logs:
const logs = logger.getEventsBySession();
// Shows: A START → B SKIPPED → A COMPLETE → B START → B COMPLETE
```

### B. Multi-Tab OAuth Debugging

**Problem:** OAuth popup closes before you can see what happened.

**Solution:**

```javascript
// Main window
const logger = new Logger({ enableCrossTabSync: true });
logger.info("Opening OAuth popup");

// Popup window (same logger instance)
logger.info("OAuth callback received");
logger.info("Token saved");
window.close();

// Main window still has logs from popup!
const allLogs = logger.getEventsBySession();
// Includes popup logs even after it closed
```

### C. Production Error Tracking

**Problem:** Users report intermittent errors, but you can't reproduce.

**Solution:**

```javascript
// Production logger with archival
const logger = new Logger({
  suppressConsole: true, // Silent in production
  maxEvents: 200, // Recent logs in localStorage
  enableArchival: true, // Long-term storage
  enableSessionTracking: true,
});

// When error occurs, export session
window.addEventListener("unhandledrejection", async (e) => {
  logger.error("Unhandled rejection", { error: e.reason });

  // Export logs for support team
  const sessionData = await logger.exportSession({ includeArchived: true });
  await sendToSupport(sessionData);
});
```

---

## Document Maintenance

**Last Updated:** December 23, 2025  
**Next Review:** Q1 2026 (before v3.0.0 development begins)  
**Maintainer:** Project Lead

This roadmap is a living document and will be updated based on:

- Community feedback
- Technical discoveries during implementation
- Changing ecosystem requirements
- User demand and adoption patterns

---

**Let's build the future of browser debugging together! 🚀**
