/**
 * Client management tests
 */

import { Logger } from "../dist/logger.js";

console.log("Testing client management\n");

// Test 1: Multiple clients
console.log("✓ Test 1: Multiple clients");
const logger = new Logger();
const client1 = {
  log: (_msg) => {},
  info: (_msg) => {},
  warn: (_msg) => {},
  error: (_msg) => {},
};
const client2 = {
  log: (_msg) => {},
  info: (_msg) => {},
  warn: (_msg) => {},
  error: (_msg) => {},
};

logger.addClient(client1);
logger.addClient(client2);
const clients = logger.clients();
if (clients.length !== 2) {
  throw new Error(`FAILED: Expected 2 clients, got ${clients.length}`);
}
console.log("  ✓ Multiple clients added successfully\n");

// Test 2: Client validation
console.log("✓ Test 2: Client validation");
if (!logger.isValidClient(client1)) {
  throw new Error("FAILED: Valid client should pass validation");
}
const invalidClient = { log: () => {} }; // Missing methods
if (logger.isValidClient(invalidClient)) {
  throw new Error("FAILED: Invalid client should fail validation");
}
console.log("  ✓ isValidClient works correctly\n");

// Test 3: Remove all clients
console.log("✓ Test 3: Remove all clients");
logger.removeAllClients();
const noClients = logger.clients();
if (noClients.length !== 0) {
  throw new Error(`FAILED: Expected 0 clients, got ${noClients.length}`);
}
console.log("  ✓ removeAllClients works correctly\n");

// Test 4: Clients are called
console.log("✓ Test 4: Clients are called");
let logCalled = false;
let infoCalled = false;
const trackingClient = {
  log: (_msg) => {
    logCalled = true;
  },
  info: (_msg) => {
    infoCalled = true;
  },
  warn: (_msg) => {},
  error: (_msg) => {},
};
const logger2 = new Logger();
logger2.addClient(trackingClient);
logger2.log("test");
logger2.info("test");
if (!logCalled || !infoCalled) {
  throw new Error("FAILED: Client methods should be called");
}
console.log("  ✓ Client methods are called correctly\n");

// Test 5: Client error handling
console.log("✓ Test 5: Client error handling");
const errorLogger = new Logger();
const badClient = {
  log: () => {
    throw new Error("Client error!");
  },
  info: () => {},
  warn: () => {},
  error: () => {},
};
errorLogger.addClient(badClient);
// This should not throw - errors are isolated
errorLogger.log("test");
console.log("  ✓ Client errors are properly isolated\n");

console.log("========================================");
console.log("All client management tests passed! ✓");
console.log("========================================");
