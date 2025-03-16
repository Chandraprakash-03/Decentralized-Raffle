import { useState, useEffect, useCallback, memo } from "react";
import { ethers } from "ethers";
import { motion, AnimatePresence } from "framer-motion";
import { connectWallet } from "../../../../utils/connectWallet";
import { contractAddress, contractAbi, apiUrl } from "../../../../utils/constants";
import styles from "../styles/mainSection.module.css";
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { auth } from "../../../../utils/firebase"; // Firebase Auth
import { onAuthStateChanged, signOut } from "firebase/auth";
import AnalyticsSection from "./AnalyticsSection";

const Timer = memo(({ seconds, hasParticipants }) => {
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    };

    return (
        <div className={styles.timerWrapper}>
            <div className={styles.timer}>
                TIME LEFT: {hasParticipants ? formatTime(seconds) : "05:00"}
            </div>
        </div>
    );
});

// Home Section
const HomeSection = memo(({ timeLeft, hasParticipants, prizePool, entryFee, participants, walletAddress, isLoading, onConnect, onEnterRaffle }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className={styles.details}
    >
        <Timer seconds={timeLeft} hasParticipants={hasParticipants} />
        <div className={styles.statsContainer}>
            <div className={styles.detailsRow}>
                <span>Prize Pool</span>
                <span>{prizePool}</span>
            </div>
            <div className={styles.detailsRow}>
                <span>Entry Fee</span>
                <span>{entryFee}</span>
            </div>
            <div className={styles.detailsRow}>
                <span>Participants</span>
                <span>{participants}</span>
            </div>
        </div>
        <div className={styles.buttonGroup}>
            <button className={styles.connectButton} onClick={onConnect}>
                {walletAddress ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` : "Connect"}
            </button>
            <button
                className={styles.enterButton}
                onClick={onEnterRaffle}
                disabled={!walletAddress || isLoading}
            >
                {isLoading ? "Processing..." : "Enter Raffle"}
            </button>
        </div>
    </motion.div>
));

// Winners Section
const WinnersSection = memo(({ winners }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className={styles.details}
    >
        <div className={styles.details}>
            <h2 className={styles.sectionTitle}>Past Winners</h2>
            <div className={styles.winnersList}>
                {winners.map((winner, index) => (
                    <div key={index} className={styles.detailsRow}>
                        <span>{winner.name}</span>
                        <span>{winner.amount}</span>
                    </div>
                ))}
            </div>
        </div>
    </motion.div>
));

// Profile Section with Logout Button
const ProfileSection = memo(({ walletAddress, transactions = [], onLogout, userEmail }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className={styles.details}
    >
        <div className={styles.details}>
            <h2 className={styles.sectionTitle}>Profile</h2>
            <div className={styles.profileInfo}>
                <div className={styles.detailsRow}>
                    <span>Email</span>
                    <span>{userEmail || "Not logged in"}</span>
                </div>
                <div className={styles.detailsRow}>
                    <span>Wallet Address</span>
                    <span>{walletAddress ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` : "Connect"}</span>
                </div>
            </div>

            <h3 className={styles.sectionTitle}>Transaction History</h3>
            <div className={styles.transactionsList}>
                {transactions.length > 0 ? (
                    transactions.map((tx, index) => (
                        <div key={index} className={styles.detailsRow}>
                            <span>{tx.type === "entry" ? "Entered Raffle" : "Won Prize"}</span>
                            <span>{tx.amount} ETH</span>
                            <span>{new Date(tx.created_at).toLocaleString()}</span>
                        </div>
                    ))
                ) : (
                    <p>No transactions found.</p>
                )}
            </div>

            <button className={styles.logoutButton} onClick={onLogout}>
                Logout
            </button>
        </div>
    </motion.div>
));

export default function MainSection({ activeSection }) {
    const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
    const [walletAddress, setWalletAddress] = useState("");
    const [prizePool, setPrizePool] = useState("0.00 ETH");
    const [entryFee, setEntryFee] = useState("0.01 ETH");
    const [participants, setParticipants] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [userEmail, setUserEmail] = useState("");
    const [transactions, setTransactions] = useState([]);
    const [raffleEndTime, setRaffleEndTime] = useState(null);
    const [timerIntervalId, setTimerIntervalId] = useState(null);

    // Fetch Contract Data
    const fetchContractData = useCallback(async () => {
        try {
            if (!window.ethereum) return;

            const provider = new ethers.BrowserProvider(window.ethereum);
            const contract = new ethers.Contract(contractAddress, contractAbi, provider);

            const poolValue = await contract.getPrizePool();
            setPrizePool(ethers.formatEther(poolValue) + " ETH");

            const fee = await contract.getEntranceFee();
            setEntryFee(ethers.formatEther(fee) + " ETH");

            const participantCount = await contract.getNumberOfPlayers();
            setParticipants(Number(participantCount));

            // Update the global timer after fetching contract data
            setupGlobalTimer();
        } catch (error) {
            console.error("Error fetching contract data:", error);
        }
    }, []); // Remove setupGlobalTimer from dependencies to avoid circular dependency

    // Setup synchronized timer
    const setupGlobalTimer = useCallback(async () => {
        try {
            // Clear any existing timer
            if (timerIntervalId) {
                clearInterval(timerIntervalId);
            }

            // Fetch the current raffle end time from the server
            const response = await fetch(`${apiUrl}/raffle-status`);
            const data = await response.json();

            if (response.ok) {
                const { endTime, isActive, participants } = data;

                if (isActive && endTime) {
                    // Convert server timestamp to local Date object
                    const endTimeDate = new Date(endTime);
                    setRaffleEndTime(endTimeDate);
                    setParticipants(participants);

                    // Define the timer update function
                    const updateTimer = () => {
                        const now = new Date();
                        const secondsLeft = Math.max(0, Math.floor((endTimeDate - now) / 1000));
                        setTimeLeft(secondsLeft);

                        // If timer has reached zero, refresh contract data
                        if (secondsLeft <= 0) {
                            clearInterval(intervalId);
                            fetchContractData();
                        }
                    };

                    // Update immediately to avoid initial delay
                    updateTimer();

                    // Set up interval to update timer every second
                    const intervalId = setInterval(updateTimer, 1000);
                    setTimerIntervalId(intervalId);
                } else {
                    // No active raffle, show default time
                    setTimeLeft(300);
                    setParticipants(participants);
                }
            }
        } catch (error) {
            console.error("Error setting up global timer:", error);
            toast.error("Failed to synchronize timer!");
        }
    }, [timerIntervalId, fetchContractData]);

    // Fix circular dependency by setting up fetchContractData dependency
    useEffect(() => {
        // Update the fetchContractData function to use the current setupGlobalTimer
        fetchContractData.current = async () => {
            try {
                if (!window.ethereum) return;

                const provider = new ethers.BrowserProvider(window.ethereum);
                const contract = new ethers.Contract(contractAddress, contractAbi, provider);

                const poolValue = await contract.getPrizePool();
                setPrizePool(ethers.formatEther(poolValue) + " ETH");

                const fee = await contract.getEntranceFee();
                setEntryFee(ethers.formatEther(fee) + " ETH");

                const participantCount = await contract.getNumberOfPlayers();
                setParticipants(Number(participantCount));

                // Update the global timer after fetching contract data
                setupGlobalTimer();
            } catch (error) {
                console.error("Error fetching contract data:", error);
            }
        };
    }, [setupGlobalTimer]);

    // Fetch Firebase User
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUserEmail(user ? user.email : "");
        });

        return () => unsubscribe();
    }, []);

    // Initial data fetch
    useEffect(() => {
        fetchContractData();

        // Clean up interval on unmount
        return () => {
            if (timerIntervalId) {
                clearInterval(timerIntervalId);
            }
        };
    }, [fetchContractData, timerIntervalId]);

    // Handle Wallet Connection
    const handleConnectWallet = useCallback(async () => {
        try {
            const wallet = await connectWallet();
            if (!wallet) {
                toast.error("Failed to connect wallet!");
                return;
            }

            setWalletAddress(wallet.address);

            // Ensure user is logged in
            if (!userEmail) {
                toast.error("Please log in first!");
                return;
            }

            // Send wallet address to backend for mapping
            const res = await fetch(`${apiUrl}/map-wallet`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: userEmail, wallet_address: wallet.address }),
            });

            const data = await res.json();
            if (res.ok) {
                toast.success("Wallet connected successfully!");
            } else {
                toast.error(data.error || "Failed to map wallet!");
            }
            fetchContractData();
        } catch (error) {
            console.error("Wallet connection error:", error);
            toast.error("Error connecting wallet!");
        }
    }, [userEmail, fetchContractData]);

    // Handle Enter Raffle
    const handleEnterRaffle = useCallback(async () => {
        try {
            if (!walletAddress) {
                toast.error("Please connect your wallet first!");
                return;
            }

            setIsLoading(true);
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const contract = new ethers.Contract(contractAddress, contractAbi, signer);

            const entranceFee = await contract.getEntranceFee();
            const tx = await contract.enterRaffle({ value: entranceFee });
            await tx.wait();

            // Send transaction details to backend
            await fetch(`${apiUrl}/log-transaction`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    wallet_address: walletAddress,
                    tx_hash: tx.hash,
                    amount: ethers.formatEther(entranceFee),
                    type: "entry",
                }),
            });

            toast.success("You have successfully entered the raffle!");

            // Refresh contract data and timer
            fetchContractData();
        } catch (error) {
            console.error("Transaction error:", error);
            toast.error("Transaction failed! Check console for details.");
        } finally {
            setIsLoading(false);
        }
    }, [walletAddress, fetchContractData]);

    useEffect(() => {
        if (!walletAddress) return;

        const fetchTransactions = async () => {
            try {
                const res = await fetch(`${apiUrl}/transactions/${walletAddress}`);
                const data = await res.json();
                if (res.ok) {
                    setTransactions(data.transactions);
                } else {
                    toast.error(data.error || "Failed to fetch transactions");
                }
            } catch (error) {
                console.error("Error fetching transactions:", error);
                toast.error("Error fetching transactions!");
            }
        };

        fetchTransactions();
    }, [walletAddress]);

    // Handle Logout
    const handleLogout = async () => {
        try {
            await signOut(auth);
            setUserEmail("");
            toast.success("Logged out successfully!");
        } catch (error) {
            toast.error("Error logging out. Try again.");
        }
    };

    return (
        <main className={styles.mainContainer}>
            <ToastContainer position="top-right" autoClose={3000} />
            <AnimatePresence mode="wait">
                {activeSection === "home" && (
                    <HomeSection
                        timeLeft={timeLeft}
                        hasParticipants={participants > 0}
                        prizePool={prizePool}
                        entryFee={entryFee}
                        participants={participants}
                        walletAddress={walletAddress}
                        isLoading={isLoading}
                        onConnect={handleConnectWallet}
                        onEnterRaffle={handleEnterRaffle}
                    />
                )}
                {activeSection === "winners" && (
                    <WinnersSection winners={[]} />
                )}
                {activeSection === "analytics" && <AnalyticsSection />}

                {activeSection === "profile" && (
                    <ProfileSection
                        walletAddress={walletAddress}
                        transactions={transactions}
                        onLogout={handleLogout}
                        userEmail={userEmail}
                    />
                )}
            </AnimatePresence>
        </main>
    );
}