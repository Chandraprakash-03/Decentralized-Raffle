import { useState, useEffect, useCallback, memo } from "react";
import { ethers } from "ethers";
import { motion, AnimatePresence } from "framer-motion";
import { connectWallet } from "../../../../utils/connectWallet";
import { contractAddress, contractAbi } from "../../../../utils/constants";
import styles from "../styles/mainSection.module.css";
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

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

// Home Section (Memoized)
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

// Winners Section (Memoized)
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

// Profile Section (Memoized)
const ProfileSection = memo(({ walletAddress, transactions }) => (
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
                    <span>Wallet Address</span>
                    <span>{walletAddress || "Not connected"}</span>
                </div>
                <div className={styles.detailsRow}>
                    <span>Total Entries</span>
                    <span>{transactions?.length || 0}</span>
                </div>
            </div>
        </div>
    </motion.div>
));

export default function MainSection({ activeSection }) {
    const [timeLeft, setTimeLeft] = useState(() => {
        const savedTime = localStorage.getItem("raffleTimer");
        return savedTime ? parseInt(savedTime, 10) : 300;
    }); // 5 minutes in seconds
    const [walletAddress, setWalletAddress] = useState("");
    const [prizePool, setPrizePool] = useState("0.00 ETH");
    const [entryFee, setEntryFee] = useState("0.01 ETH");
    const [participants, setParticipants] = useState(0);
    const [isLoading, setIsLoading] = useState(false);

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

            // Start timer only if at least one participant exists
            if (Number(participantCount) > 0 && !localStorage.getItem("raffleTimerStart")) {
                setTimeLeft(300);
                localStorage.setItem("raffleTimerStart", Date.now().toString());
            }
        } catch (error) {
            console.error("Error fetching contract data:", error);
        }
    }, []);

    // Timer Effect (Runs Only When Participants > 0)
    useEffect(() => {
        const storedStartTime = localStorage.getItem("raffleTimerStart");
        if (!storedStartTime || participants === 0) return;

        const elapsedTime = Math.floor((Date.now() - parseInt(storedStartTime, 10)) / 1000);
        const remainingTime = Math.max(300 - elapsedTime, 0);
        setTimeLeft(remainingTime);

        const timerId = setInterval(() => {
            setTimeLeft((prevTime) => {
                if (prevTime <= 0) {
                    clearInterval(timerId);
                    localStorage.removeItem("raffleTimerStart");
                    return 0;
                }
                localStorage.setItem("raffleTimer", prevTime - 1);
                return prevTime - 1;
            });
        }, 1000);

        return () => clearInterval(timerId);
    }, [participants]);

    // Fetch Data When Wallet Connects
    useEffect(() => {
        if (walletAddress) {
            fetchContractData();
        }
    }, [walletAddress]);

    // Handle Wallet Connection
    const handleConnectWallet = useCallback(async () => {
        const wallet = await connectWallet();
        if (wallet) setWalletAddress(wallet.address);
    }, []);

    // Handle Enter Raffle
    const handleEnterRaffle = useCallback(async () => {
        try {
            if (!walletAddress) {
                toast.error("Please connect your wallet first!");
                return;
            }

            setIsLoading(true);

            if (!window.ethereum) {
                toast.error("MetaMask is not installed!");
                return;
            }

            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const contract = new ethers.Contract(contractAddress, contractAbi, signer);

            const entranceFee = await contract.getEntranceFee();

            const tx = await contract.enterRaffle({ value: entranceFee });
            await tx.wait();

            toast.success("You have successfully entered the raffle!");

            localStorage.setItem("raffleTimerStart", Date.now().toString());

            // Refresh contract data after entering
            fetchContractData();
        } catch (error) {
            console.error("Error entering raffle:", error);
            toast.error("Transaction failed! Check the console for details.");
        } finally {
            setIsLoading(false);
        }
    }, [walletAddress, fetchContractData]);
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
                {activeSection === "faq" && (
                    <FaqSection />
                )}
                {activeSection === "profile" && (
                    <ProfileSection
                        walletAddress={walletAddress}
                        transactions={[]}
                    />
                )}
            </AnimatePresence>
        </main>
    );
}