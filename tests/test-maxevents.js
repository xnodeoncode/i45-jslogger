/**
 * Test maxEvents storage limit
 */

import { Logger } from "../dist/logger.js";

console.log("Testing maxEvents storage limit\n");

// Test 1: maxEvents limits storage
console.log("✓ Test 1: maxEvents limits storage");
const logger = new Logger();
logger.maxEvents = 5;

// Add 10 events
for (let i = 1; i <= 10; i++) {
  logger.log(`Event ${i}`);
}

const events = logger.getEvents();
if (events.length !== 5) {
  throw new Error(`FAILED: Expected 5 events, got ${events.length}`);
}

// Verify we have the last 5 events (6-10)
const firstEvent = events[0];
if (!firstEvent.event.includes("Event 6")) {
  throw new Error(
    `FAILED: Expected first event to be Event 6, got ${firstEvent.event}`
  );
}

const lastEvent = events[events.length - 1];
if (!lastEvent.event.includes("Event 10")) {
  throw new Error(
    `FAILED: Expected last event to be Event 10, got ${lastEvent.event}`
  );
}

console.log("  ✓ maxEvents correctly limits to 5 events\n");
console.log(`  ✓ Oldest events removed (kept Events 6-10)\n`);

// Test 2: Setting maxEvents on existing data
console.log("✓ Test 2: Setting maxEvents trims existing data");
const logger2 = new Logger();
for (let i = 1; i <= 20; i++) {
  logger2.log(`Item ${i}`);
}

logger2.maxEvents = 3;
const trimmedEvents = logger2.getEvents();
if (trimmedEvents.length !== 3) {
  throw new Error(
    `FAILED: Expected 3 events after trim, got ${trimmedEvents.length}`
  );
}

console.log("  ✓ Setting maxEvents trims existing events\n");

// Test 3: null maxEvents means unlimited
console.log("✓ Test 3: null maxEvents = unlimited");
const logger3 = new Logger();
logger3.maxEvents = null;
for (let i = 1; i <= 100; i++) {
  logger3.log(`Event ${i}`);
}

const unlimitedEvents = logger3.getEvents();
if (unlimitedEvents.length !== 100) {
  throw new Error(
    `FAILED: Expected 100 events with unlimited, got ${unlimitedEvents.length}`
  );
}

console.log("  ✓ null maxEvents allows unlimited storage\n");

// Test 4: maxEvents validation
console.log("✓ Test 4: maxEvents validation");
const logger4 = new Logger();

try {
  logger4.maxEvents = -1;
  throw new Error("FAILED: Should reject negative maxEvents");
} catch (e) {
  if (e.message.includes("FAILED")) throw e;
  console.log("  ✓ Rejects negative values\n");
}

try {
  logger4.maxEvents = 3.5;
  throw new Error("FAILED: Should reject non-integer maxEvents");
} catch (e) {
  if (e.message.includes("FAILED")) throw e;
  console.log("  ✓ Rejects non-integer values\n");
}

try {
  logger4.maxEvents = "10";
  throw new Error("FAILED: Should reject string maxEvents");
} catch (e) {
  if (e.message.includes("FAILED")) throw e;
  console.log("  ✓ Rejects string values\n");
}

// Test 5: maxEvents = 0 means no storage
console.log("✓ Test 5: maxEvents = 0 prevents storage");
const logger5 = new Logger();
logger5.maxEvents = 0;
logger5.log("This should not be stored");

const noEvents = logger5.getEvents();
if (noEvents.length !== 0) {
  throw new Error(
    `FAILED: Expected 0 events with maxEvents=0, got ${noEvents.length}`
  );
}

console.log("  ✓ maxEvents=0 prevents all event storage\n");

console.log("========================================");
console.log("All maxEvents tests passed! ✓");
console.log("========================================");
