import { io } from "socket.io-client";

const SERVER_URL = "http://localhost:3000"; // Server port from server.ts
const CAR_ID = "stress-car-1"; // Bidding on one car per stress run
const NUM_CLIENTS = 50; // Total concurrent bidders
const BID_INTERVAL_MS = 1000; // Time between bids for one client (1 bid/sec/client)
const TEST_DURATION_MS = 60000; // Stress run for 1 min

console.log(`Starting Stress Bidding Simulation...`);
console.log(`Clients: ${NUM_CLIENTS}, Target Car: ${CAR_ID}`);

const clients: any[] = [];
let totalBidsSent = 0;
let errorsCount = 0;

let globalCurrentBid = 2000;

function createClient(id: number) {
    const socket = io(SERVER_URL, {
        transports: ["websocket"]
    });

    const userId = `stress-user-${id}`;

    socket.on("connect", () => {
        socket.emit("join_auction", CAR_ID);
        console.log(`Client ${id} connected and joined auction.`);

        const intervalId = setInterval(() => {
            globalCurrentBid += 100;
            const bidAmount = globalCurrentBid + Math.floor(Math.random() * 50);
            socket.emit("place_bid", {
                carId: CAR_ID,
                userId: userId,
                amount: bidAmount, // Sending a valid higher amount
                type: "manual"
            });
            totalBidsSent++;
        }, BID_INTERVAL_MS);

        // Stop client after duration
        setTimeout(() => {
            clearInterval(intervalId);
            socket.disconnect();
        }, TEST_DURATION_MS);
    });

    socket.on("bid_error", (err: any) => {
        errorsCount++;
        if (errorsCount % 10 === 0) console.error(`Bid Error Summary: ${err.message} (Count: ${errorsCount})`);
    });

    socket.on("timer_update", (data: any) => {
        // Optionally log timer updates
    });

    return socket;
}

// Stagger client connections to avoid initial storm
for (let i = 1; i <= NUM_CLIENTS; i++) {
    setTimeout(() => createClient(i), i * 100);
}

// Summary Report after test duration
setTimeout(() => {
    console.log("------------------------------------------");
    console.log(`Stress Test Report:`);
    console.log(`Total Bid Requests Sent: ${totalBidsSent}`);
    console.log(`Total Bid Errors (if any): ${errorsCount}`);
    console.log(`Duration: ${TEST_DURATION_MS / 1000} seconds`);
    console.log(`Avg Troughput: ${(totalBidsSent / (TEST_DURATION_MS / 1000)).toFixed(2)} bids/sec`);
    console.log("------------------------------------------");
    process.exit(0);
}, TEST_DURATION_MS + 5000);
