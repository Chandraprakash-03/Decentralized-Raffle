import { useState, useEffect } from "react";
import styles from "../styles/mainSection.module.css";

export default function MainSection({ activeSection }) {
    const [timeLeft, setTimeLeft] = useState("00:05:00");
    const prizePool = "12.00 ETH";
    const entryFee = "0.01 ETH";
    const participants = "12";

    const pastWinners = [
        { name: "Alice", amount: "3.5 ETH" },
        { name: "Bob", amount: "2.0 ETH" },
        { name: "Charlie", amount: "1.5 ETH" },
    ];

    return (
        <main className={styles.mainContainer}>
            {activeSection === "home" && (
                <div className={styles.details}>
                    <div className={styles.timer}>
                        TIME LEFT : {timeLeft}
                    </div>
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
                    <div className={styles.buttonGroup}>
                        <button className={styles.connectButton}>Connect</button>
                        <button className={styles.enterButton}>Enter Raffle</button>
                    </div>
                </div>
            )}

            {activeSection === "winners" && (
                <div className={styles.details}>
                    <h3>Past Winners</h3>
                    <div className={styles.winnersList}>
                        {pastWinners.map((winner, index) => (
                            <div key={index} className={styles.detailsRow}>
                                <span>{winner.name}</span>
                                <span>{winner.amount}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {activeSection === "faq" && (
                <div className={styles.details}>
                    <h3>FAQ</h3>
                    <div className={styles.faqItem}>
                        <h4>How does this raffle work?</h4>
                        <p>Winners are randomly drawn every 5 minutes.</p>
                    </div>
                </div>
            )}

            {activeSection === "profile" && (
                <div className={styles.details}>
                    <h3>Profile</h3>
                    <div className={styles.detailsRow}>
                        <span>Wallet Address</span>
                        <span>0x123...456</span>
                    </div>
                </div>
            )}
        </main>
    );
}