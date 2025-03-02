require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();
app.use(express.json());
app.use(cors());

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false // Allows self-signed certs
    }
});

// Test DB Connection
pool.connect()
    .then(() => console.log("Connected to PostgreSQL"))
    .catch((err) => console.error("Connection error:", err));

app.get("/", (req, res) => res.send("Backend is running!"));

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

        if (!wallet_address || !tx_hash || !amount || !type) {
            return res.status(400).json({ error: "All fields are required" });
        }

        // Ensure the transaction type is valid
        const validTypes = ["entry", "win"];
        if (!validTypes.includes(type)) {
            return res.status(400).json({ error: "Invalid transaction type" });
        }

        // Get user ID from wallet address
        const userResult = await pool.query(
            "SELECT id FROM users WHERE wallet_address = $1",
            [wallet_address]
        );

        if (userResult.rowCount === 0) {
            return res.status(404).json({ error: "User not found" });
        }

        const user_id = userResult.rows[0].id;

        // Insert transaction into database
        const result = await pool.query(
            "INSERT INTO transactions (user_id, tx_hash, amount, type) VALUES ($1, $2, $3, $4) RETURNING *",
            [user_id, tx_hash, amount, type]
        );

        res.status(201).json({ message: "Transaction logged successfully", transaction: result.rows[0] });
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
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
