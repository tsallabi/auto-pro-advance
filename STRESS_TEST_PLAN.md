# End-to-End Stress Testing Plan

To ensure the **Auto Pro** auction system handles high traffic correctly, especially during the final minutes of a live auction, we need a robust stress testing framework.

## 1. Objectives

- **Bidding Concurrency**: Simulate 100+ users bidding simultaneously on the same car.
- **Real-time Synchronization**: Verify that all users receive socket updates (bid updates, timer counts) without delay.
- **Server Stability**: Monitor memory/CPU usage of the Node.js/SQLite backend under load.
- **UI Responsiveness**: Ensure the dashboard remains usable while heavy bidding occurs.

## 2. Tools & Stack

- **Framework**: `Playwright` for E2E browser automation (testing actual UI flows).
- **Load Testing**: `Artillery` or custom `Socket.io` scripts for high-frequency bid simulation.
- **Runner**: `tsx` (already installed) to run TypeScript test scripts.
- **Data**: A seeder script to create 50-100 test users with high buying power.

## 3. Implementation Steps

1. **Test Data Seeder**: Create `tests/seed_stress_data.ts` to populate the database with testable accounts.
2. **Socket Stress Script**: Create `tests/stress_bidding_sockets.ts` to simulate high-frequency bidding via Socket.io.
3. **E2E UI Test**: Create `tests/e2e_auction_flow.spec.ts` using Playwright to test the full login-to-win journey.
4. **Monitoring**: Track server logs for "Slow SQL" or "Socket overflows".

## 4. Current Requirements

- [x] Create `tests` directory.
- [/] Install Playwright (`npx playwright install`).
- [ ] Create Seeder script.
- [ ] Create Stress script.
