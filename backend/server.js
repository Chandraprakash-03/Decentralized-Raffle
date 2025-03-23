require("dotenv").config();
const { sendEmail } = require("./emailService");
const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();
app.use(express.json());

const corsOptions = {
    origin: "*",
    methods: "GET,POST,PUT,DELETE",
    allowedHeaders: "Content-Type,Authorization"
}
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false // Allows self-signed certs
    }
});

// Global raffle state
let raffleState = {
    isActive: false,
    endTime: null,
    participants: 0,
    raffleId: null,
    prizePool: 0
};

// Test DB Connection
pool.connect()
    .then(() => console.log("Connected to PostgreSQL"))
    .catch((err) => console.error("Connection error:", err));

// Initialize raffle state from database
const initializeRaffleState = async () => {
    try {
        // Check if there's an active raffle
        const result = await pool.query(
            "SELECT id, end_time, participants, amount FROM raffles WHERE is_active = TRUE ORDER BY created_at DESC LIMIT 1"
        );

        if (result.rowCount > 0) {
            const activeRaffle = result.rows[0];
            raffleState = {
                isActive: true,
                endTime: activeRaffle.end_time,
                participants: activeRaffle.participants,
                raffleId: activeRaffle.id,
                prizePool: activeRaffle.amount
            };
            console.log("Initialized active raffle:", raffleState);
        } else {
            console.log("No active raffle found");
        }
    } catch (error) {
        console.error("Error initializing raffle state:", error);
    }
};

// Call this function when server starts
initializeRaffleState();

// Create a new raffle or reset current one
const createOrResetRaffle = async (participants = 1, amount = 0) => {
    try {
        // Set end time to 5 minutes (300 seconds) from now
        const endTime = new Date(Date.now() + 300000);

        // const amount = 0;

        // Update any existing active raffle to inactive
        await pool.query("UPDATE raffles SET is_active = FALSE WHERE is_active = TRUE");

        // Create new raffle
        const result = await pool.query(
            "INSERT INTO raffles (end_time, participants, is_active, amount) VALUES ($1, $2, TRUE, $3) RETURNING id",
            [endTime, participants, amount]
        );

        // Update global state
        raffleState = {
            isActive: true,
            endTime: endTime,
            participants: participants,
            raffleId: result.rows[0].id,
            prizePool: amount
        };

        console.log("Created new raffle:", raffleState);

        // Set up timer to end the raffle
        setTimeout(async () => {
            try {
                // Mark raffle as inactive
                await pool.query("UPDATE raffles SET is_active = FALSE WHERE id = $1", [raffleState.raffleId]);

                // Reset state
                raffleState = {
                    isActive: false,
                    endTime: null,
                    participants: 0,
                    raffleId: null,
                    prizePool: 0
                };

                console.log("Raffle ended automatically");

                // Here you would typically trigger the winner selection logic
                // For now, we'll just reset the state
            } catch (error) {
                console.error("Error ending raffle:", error);
            }
        }, 300000); // 5 minutes (300000 ms)

        return result.rows[0].id;
    } catch (error) {
        console.error("Error creating/resetting raffle:", error);
        throw error;
    }
};

// Check if a raffle needs to be created
const checkAndCreateRaffle = async (amount = 0) => {
    // Convert amount to a number to ensure proper addition
    const numericAmount = Number(amount);

    if (!raffleState.isActive) {
        return await createOrResetRaffle(1, numericAmount);
    } else {
        // Update participants count and properly add to prize pool
        const updatedPrizePool = raffleState.prizePool + numericAmount;

        await pool.query(
            "UPDATE raffles SET participants = $1, amount = $2 WHERE id = $3",
            [raffleState.participants + 1, updatedPrizePool, raffleState.raffleId]
        );

        raffleState.participants += 1;
        raffleState.prizePool = updatedPrizePool;

        return raffleState.raffleId;
    }
};

// Base routes
app.get("/", (req, res) => res.send("Backend is running!"));

// Get current raffle status
app.get("/raffle-status", (req, res) => {
    res.status(200).json(raffleState);
});

app.post("/signup", async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ error: "Email is required" });
        }

        // Insert user into DB
        const result = await pool.query(
            "INSERT INTO users (email) VALUES ($1) RETURNING *",
            [email]
        );

        res.status(201).json({ message: "User registered successfully", user: result.rows[0] });
    } catch (error) {
        console.error("Signup error:", error);
        res.status(500).json({ error: "Server error" });
    }
});

app.post("/map-wallet", async (req, res) => {
    try {
        const { email, wallet_address } = req.body;
        if (!email || !wallet_address) {
            return res.status(400).json({ error: "Email and wallet address are required" });
        }

        // Update user with wallet address
        const result = await pool.query(
            "UPDATE users SET wallet_address = $1 WHERE email = $2 RETURNING *",
            [wallet_address, email]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ error: "User not found" });
        }

        res.status(200).json({ message: "Wallet mapped successfully", user: result.rows[0] });
    } catch (error) {
        console.error("Wallet mapping error:", error);
        res.status(500).json({ error: "Server error" });
    }
});

app.post("/log-transaction", async (req, res) => {
    try {
        const { wallet_address, tx_hash, amount, type } = req.body;

        const userResult = await pool.query(
            "SELECT id, email FROM users WHERE wallet_address = $1",
            [wallet_address]
        );

        if (userResult.rowCount === 0) {
            return res.status(404).json({ error: "User not found" });
        }

        const email = userResult.rows[0].email;
        const userId = userResult.rows[0].id;

        // Create or update raffle if this is an entry transaction
        let raffleId = null;
        if (type === "entry") {
            raffleId = await checkAndCreateRaffle(amount);
        }

        // Insert transaction
        await pool.query(
            "INSERT INTO transactions (user_id, tx_hash, amount, type, raffle_id) VALUES ($1, $2, $3, $4, $5) RETURNING *",
            [userId, tx_hash, amount, type, raffleId]
        );

        if (type === "entry") {
            sendEmail(email, "🎟 Raffle Entry Confirmation", "raffle-entry", {
                user: email,
                amount: amount,
                raffle_url: "https://your-raffle-site.com"
            });
        }

        res.status(201).json({
            message: "Transaction logged successfully",
            raffleStatus: raffleState
        });
    } catch (error) {
        console.error("Transaction logging error:", error);
        res.status(500).json({ error: "Server error" });
    }
});

app.get("/participants", async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT email, wallet_address, created_at FROM users WHERE wallet_address IS NOT NULL ORDER BY created_at DESC"
        );

        res.status(200).json({ participants: result.rows });
    } catch (error) {
        console.error("Error fetching participants:", error);
        res.status(500).json({ error: "Server error" });
    }
});

app.get("/winners", async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT u.email, u.wallet_address, w.prize_amount, w.raffle_id, w.created_at FROM winners w JOIN users u ON w.user_id = u.id ORDER BY w.created_at DESC"
        );

        res.status(200).json({ winners: result.rows });
    } catch (error) {
        console.error("Error fetching winners:", error);
        res.status(500).json({ error: "Server error" });
    }
});

app.post("/declare-winner", async (req, res) => {
    try {
        const { raffle_id, user_id, prize_amount } = req.body;

        const userResult = await pool.query("SELECT id, email FROM users WHERE wallet_address = $1", [user_id]);
        if (userResult.rowCount === 0) {
            return res.status(404).json({ error: "User not found" });
        }

        const id = userResult.rows[0].id;
        const email = userResult.rows[0].email;

        await pool.query(
            "INSERT INTO winners (raffle_id, user_id, prize_amount) VALUES ($1, $2, $3)",
            [raffle_id, id, prize_amount]
        );

        sendEmail(email, "🏆 Congratulations! You Won!", "winner-notification", {
            user: email,
            prize_amount,
            raffle_url: "https://your-raffle-site.com/claim-prize"
        });

        res.status(201).json({ message: "Winner declared successfully" });
    } catch (error) {
        console.error("Error declaring winner:", error);
        res.status(500).json({ error: "Server error" });
    }
});

app.get("/transactions/:wallet_address", async (req, res) => {
    try {
        const { wallet_address } = req.params;

        // Get user_id from wallet address
        const userResult = await pool.query(
            "SELECT id FROM users WHERE wallet_address = $1",
            [wallet_address]
        );
        console.log(userResult);

        if (userResult.rowCount === 0) {
            return res.status(404).json({ error: "User not found" });
        }

        const user_id = userResult.rows[0].id;

        // Fetch transactions using user_id
        const result = await pool.query(
            "SELECT tx_hash, amount, type, created_at FROM transactions WHERE user_id = $1 ORDER BY created_at DESC",
            [user_id]
        );

        res.status(200).json({ transactions: result.rows });
    } catch (error) {
        console.error("Error fetching transactions:", error);
        res.status(500).json({ error: "Server error" });
    }
});

app.get("/analytics/participants", async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT DATE(created_at) as date, COUNT(DISTINCT user_id) as participants FROM transactions GROUP BY DATE(created_at) ORDER BY date ASC"
        );

        res.status(200).json({ data: result.rows });
    } catch (error) {
        console.error("Error fetching participant analytics:", error);
        res.status(500).json({ error: "Server error" });
    }
});

app.get("/analytics/eth-collected", async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT DATE(created_at) as date, SUM(amount) as total_eth FROM transactions WHERE type = 'entry' GROUP BY DATE(created_at) ORDER BY date ASC"
        );

        res.status(200).json({ data: result.rows });
    } catch (error) {
        console.error("Error fetching ETH analytics:", error);
        res.status(500).json({ error: "Server error" });
    }
});

app.get("/analytics/top-participants", async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT users.email, COUNT(transactions.id) as entries FROM transactions JOIN users ON transactions.user_id = users.id WHERE transactions.type = 'entry' GROUP BY users.email ORDER BY entries DESC LIMIT 10"
        );

        res.status(200).json({ data: result.rows });
    } catch (error) {
        console.error("Error fetching top participants:", error);
        res.status(500).json({ error: "Server error" });
    }
});

// Start Server
const PORT = process.env.X_ZOHO_CATALYST_LISTEN_PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));