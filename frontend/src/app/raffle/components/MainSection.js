import { useState, useEffect, useCallback, memo, useRef } from "react";
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

const Timer = memo(({ seconds }) => {
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    };

    return (
        <div className={styles.timerWrapper}>
            <div className={styles.timer}>
                TIME LEFT: {formatTime(seconds)}
            </div>
        </div>
    );
});

// Home Section
const HomeSection = memo(({ timeLeft, prizePool, entryFee, participants, walletAddress, isLoading, onConnect, onEnterRaffle }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className={styles.details}
    >
        <Timer seconds={timeLeft} />
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
                {winners.length > 0 ? (
                    winners.map((winner, index) => (
                        <div key={index} className={styles.winnerCard}>
                            <div className={styles.detailsRow}>
                                <span>Winner</span>
                                <span>{winner.name}</span>
                            </div>
                            <div className={styles.detailsRow}>
                                <span>Amount</span>
                                <span>{winner.amount}</span>
                            </div>
                            <div className={styles.detailsRow}>
                                <span>Date</span>
                                <span>{winner.date}</span>
                            </div>
                            <div className={styles.detailsRow}>
                                <span>Raffle ID</span>
                                <span>#{winner.raffleId}</span>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className={styles.emptyState}>No winners recorded yet.</p>
                )}
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
    const [timeLeft, setTimeLeft] = useState(300); // 5 minutes default
    const [walletAddress, setWalletAddress] = useState("");
    const [prizePool, setPrizePool] = useState("0.00 ETH");
    const [entryFee, setEntryFee] = useState("0.01 ETH");
    const [winners, setWinners] = useState([]);
    const [participants, setParticipants] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [userEmail, setUserEmail] = useState("");
    const [transactions, setTransactions] = useState([]);
    const [currentRaffleId, setCurrentRaffleId] = useState(null);
    const [activeRaffle, setActiveRaffle] = useState(false);
    let rafflePrizePool = "";

    const timerRef = useRef(null);
    const isTimerInitialized = useRef(false);
    const isDataFetching = useRef(false);
    const isWinnerBeingDeclared = useRef(false);
    const raffleIdRef = useRef(null); // Ref to store raffle ID
    const activeRaffleRef = useRef(false); // Add ref to track active raffle state

    // Fetch Contract Data
    const fetchContractData = useCallback(async () => {
        if (isDataFetching.current) return;
        isDataFetching.current = true;

        try {
            if (!window.ethereum) {
                isDataFetching.current = false;
                return;
            }

            const provider = new ethers.BrowserProvider(window.ethereum);
            const contract = new ethers.Contract(contractAddress, contractAbi, provider);

            const poolValue = await contract.getPrizePool();
            setPrizePool(ethers.formatEther(poolValue) + " ETH");

            const fee = await contract.getEntranceFee();
            setEntryFee(ethers.formatEther(fee) + " ETH");

            const participantCount = await contract.getNumberOfPlayers();
            setParticipants(Number(participantCount));

            // Fetch raffle status from backend
            await fetchRaffleStatus();
        } catch (error) {
            console.error("Error fetching contract data:", error);
        } finally {
            isDataFetching.current = false;
        }
    }, []);

    // const declareWinner = useCallback(async (raffleIdToUse) => {
    //     // Prevent multiple executions
    //     if (isWinnerBeingDeclared.current) {
    //         console.log("Winner declaration already in progress");
    //         return;
    //     }

    //     isWinnerBeingDeclared.current = true;
    //     console.log("Starting winner declaration process");

    //     try {
    //         // Use the provided raffle ID, or fall back to refs/state
    //         const raffleId = raffleIdToUse || raffleIdRef.current || currentRaffleId;

    //         // Check if we have a valid raffle ID
    //         if (!raffleId) {
    //             console.error("No raffle ID available for winner declaration");
    //             toast.error("No active raffle found");
    //             isWinnerBeingDeclared.current = false;
    //             return;
    //         }

    //         console.log("Declaring winner for raffle ID:", raffleId);

    //         // Get winner information from the smart contract
    //         if (!window.ethereum) {
    //             toast.error("Ethereum provider not found");
    //             isWinnerBeingDeclared.current = false;
    //             return;
    //         }

    //         const provider = new ethers.BrowserProvider(window.ethereum);
    //         const contract = new ethers.Contract(contractAddress, contractAbi, provider);

    //         // Get the number of participants
    //         const numPlayers = await contract.getNumberOfPlayers();
    //         if (Number(numPlayers) === 0) {
    //             console.log("No participants in this raffle");
    //             toast.info("No participants in this raffle. Starting a new one.");
    //             // Reset and start a new raffle cycle
    //             setActiveRaffle(false);
    //             activeRaffleRef.current = false;
    //             isWinnerBeingDeclared.current = false;
    //             fetchContractData();
    //             return;
    //         }

    //         // Get the winner directly from the contract
    //         const winner = await contract.getRecentWinner();
    //         console.log("Winner address:", winner);

    //         // Get the prize amount
    //         const prizeAmount = await contract.getPrizePool();
    //         const formattedPrizeAmount = ethers.formatEther(prizeAmount);
    //         console.log("Prize amount:", formattedPrizeAmount);

    //         // Send winner data to API
    //         const response = await fetch(`${apiUrl}/declare-winner`, {
    //             method: "POST",
    //             headers: { "Content-Type": "application/json" },
    //             body: JSON.stringify({
    //                 raffle_id: raffleId,
    //                 user_id: winner,
    //                 prize_amount: formattedPrizeAmount
    //             }),
    //         });

    //         const data = await response.json();
    //         if (response.ok) {
    //             toast.success("Winner has been declared!");
    //             console.log("Winner declared successfully");
    //             // Reset raffle state
    //             setActiveRaffle(false);
    //             activeRaffleRef.current = false;
    //             setCurrentRaffleId(null);
    //             raffleIdRef.current = null;
    //         } else {
    //             toast.error(data.error || "Failed to declare winner");
    //             console.error("Failed to declare winner:", data.error);
    //         }

    //         // Refresh contract data
    //         fetchContractData();
    //     } catch (error) {
    //         console.error("Error declaring winner:", error);
    //         toast.error("Error declaring winner. Check console for details.");
    //     } finally {
    //         isWinnerBeingDeclared.current = false;
    //     }
    // }, [currentRaffleId, fetchContractData]);

    // Fetch raffle status and set up timer
    const fetchRaffleStatus = useCallback(async () => {
        try {
            const response = await fetch(`${apiUrl}/raffle-status`);

            if (!response.ok) {
                console.error("Failed to fetch raffle status:", response.statusText);
                return;
            }

            const data = await response.json();
            console.log("Raffle status data:", data);

            if (data && typeof data === 'object') {
                const { endTime, isActive, participants, prizePool, raffleId } = data;

                // Update active raffle state in both state and ref
                setActiveRaffle(!!isActive);
                activeRaffleRef.current = !!isActive;

                // Store raffle ID in both state and ref
                if (raffleId) {
                    setCurrentRaffleId(raffleId);
                    raffleIdRef.current = raffleId;
                    console.log("Raffle ID set to:", raffleId);
                } else {
                    console.warn("No raffle ID received from backend");
                }

                if (participants !== undefined) setParticipants(participants);
                if (prizePool !== undefined) setPrizePool(prizePool + " ETH");
                rafflePrizePool = prizePool
                console.log(rafflePrizePool)

                if (isActive && endTime) {
                    const endTimeDate = new Date(endTime);
                    const now = new Date();

                    // Check if the end time has already passed
                    if (endTimeDate <= now && raffleId) {
                        console.log("Raffle end time has already passed, declaring winner immediately");
                        // If the raffle should have ended already, declare winner immediately
                        // declareWinner(raffleId);
                    } else {
                        // Otherwise start the timer
                        startTimer(endTimeDate, raffleId);
                    }
                } else {
                    // If no active raffle, maintain the default time
                    if (!isTimerInitialized.current) {
                        setTimeLeft(300);
                        isTimerInitialized.current = true;
                    }
                }
            } else {
                console.error("Invalid data format received from raffle-status endpoint");
            }
        } catch (error) {
            console.error("Error fetching raffle status:", error);
            // Keep the current time if there's an error
            if (!isTimerInitialized.current) {
                setTimeLeft(300);
                isTimerInitialized.current = true;
            }
        }
    },);

    const startTimer = useCallback((endTime, raffleId) => {
        // Clear any existing timer
        if (timerRef.current) {
            clearInterval(timerRef.current);
        }

        // Store the raffle ID in the ref
        if (raffleId) {
            raffleIdRef.current = raffleId;
            console.log("Timer started for raffle ID:", raffleId);
        }

        // Calculate initial time
        const now = new Date();
        const secondsLeft = Math.max(0, Math.floor((endTime - now) / 1000));
        setTimeLeft(secondsLeft);

        // Set up the timer
        timerRef.current = setInterval(async () => {
            const now = new Date();
            const secondsLeft = Math.max(0, Math.floor((endTime - now) / 1000));
            setTimeLeft(secondsLeft);

            if (secondsLeft <= 0) {
                // Clear the interval immediately to prevent multiple calls
                clearInterval(timerRef.current);
                console.log("Timer reached zero for raffle ID:", raffleIdRef.current);

                try {
                    // Direct call to smart contract when timer ends
                    if (window.ethereum && raffleIdRef.current) {
                        const provider = new ethers.BrowserProvider(window.ethereum);
                        const contract = new ethers.Contract(contractAddress, contractAbi, provider);

                        // Get the winner directly from the contract
                        const winner = await contract.getRecentWinner();
                        console.log("Winner address:", winner);

                        // Get the prize amount

                        // const formattedPrizeAmount = ethers.formatEther(prizePool);
                        // console.log("Prize amount:", formattedPrizeAmount);
                        let numericValue = parseFloat(rafflePrizePool);
                        console.log(numericValue);

                        // Send winner data to API
                        const response = await fetch(`${apiUrl}/declare-winner`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                raffle_id: raffleIdRef.current,
                                user_id: winner,
                                prize_amount: numericValue
                            }),
                        });

                        const data = await response.json();
                        if (response.ok) {
                            toast.success("Winner has been declared!");
                            console.log("Winner declared successfully");
                        } else {
                            toast.error(data.error || "Failed to declare winner");
                            console.error("Failed to declare winner:", data.error);
                        }

                        // Refresh contract data
                        fetchContractData();
                    }
                } catch (error) {
                    console.error("Error declaring winner:", error);
                    toast.error("Error declaring winner. Check console for details.");
                }
            }
        }, 1000);
    }, [fetchContractData]);

    // Fetch Firebase User
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUserEmail(user ? user.email : "");
        });

        return () => unsubscribe();
    }, []);

    // Initial data fetch
    useEffect(() => {
        // Set initial default time
        setTimeLeft(300);
        isTimerInitialized.current = true;

        // Fetch contract data and set up timer
        fetchContractData();

        // Clean up timer on unmount
        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, [fetchContractData]);

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

    const fetchWinners = useCallback(async () => {
        try {
            const response = await fetch(`${apiUrl}/winners`);
            const data = await response.json();

            if (response.ok) {
                // Transform the data to match the expected format in WinnersSection
                const formattedWinners = data.winners.map(winner => ({
                    name: winner.email || winner.wallet_address.slice(0, 6) + '...' + winner.wallet_address.slice(-4),
                    amount: winner.prize_amount + ' ETH',
                    date: new Date(winner.created_at).toLocaleDateString(),
                    raffleId: winner.raffle_id
                }));

                setWinners(formattedWinners);
            } else {
                toast.error(data.error || "Failed to fetch winners");
            }
        } catch (error) {
            console.error("Error fetching winners:", error);
            toast.error("Error fetching winners!");
        }
    }, []);

    // Add an effect to fetch winners when the section changes to "winners"
    useEffect(() => {
        if (activeSection === "winners") {
            fetchWinners();
        }
    }, [activeSection, fetchWinners]);

    // Fetch transactions when wallet address changes
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

    // Add effect to monitor raffle ID and active raffle status for debugging
    useEffect(() => {
        console.log("Current raffle state updated:", {
            raffleId: currentRaffleId,
            activeRaffle: activeRaffle
        });
    }, [currentRaffleId, activeRaffle]);

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
                    <WinnersSection winners={winners} />
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