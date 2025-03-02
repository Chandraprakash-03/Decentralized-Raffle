"use client";

import { useState, useEffect } from "react";
import { Line, Bar } from "react-chartjs-2";
import "chart.js/auto";
import styles from "../styles/analytics.module.css";

export default function AnalyticsSection() {
    const [participantsData, setParticipantsData] = useState([]);
    const [ethCollectedData, setEthCollectedData] = useState([]);
    const [topParticipants, setTopParticipants] = useState([]);

    // Fetch analytics data
    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const [participantsRes, ethRes, topParticipantsRes] = await Promise.all([
                    fetch("http://localhost:5000/analytics/participants"),
                    fetch("http://localhost:5000/analytics/eth-collected"),
                    fetch("http://localhost:5000/analytics/top-participants")
                ]);

                const participants = await participantsRes.json();
                const ethCollected = await ethRes.json();
                const topUsers = await topParticipantsRes.json();

                setParticipantsData(participants.data);
                setEthCollectedData(ethCollected.data);
                setTopParticipants(topUsers.data);
            } catch (error) {
                console.error("Error fetching analytics:", error);
            }
        };

        fetchAnalytics();
    }, []);

    // Chart Data
    const participantsChartData = {
        labels: participantsData.map((entry) => entry.date),
        datasets: [
            {
                label: "Total Participants",
                data: participantsData.map((entry) => entry.participants),
                borderColor: "#4CAF50",
                backgroundColor: "rgba(76, 175, 80, 0.2)",
                tension: 0.2,
            },
        ],
    };

    const ethCollectedChartData = {
        labels: ethCollectedData.map((entry) => entry.date),
        datasets: [
            {
                label: "Total ETH Collected",
                data: ethCollectedData.map((entry) => entry.total_eth),
                borderColor: "#FF9800",
                backgroundColor: "rgba(255, 152, 0, 0.2)",
                tension: 0.2,
            },
        ],
    };

    return (
        <div className={styles.analyticsContainer}>
            <h2>Analytics</h2>

            <div className={styles.chartsWrapper}>
                <div className={styles.chartContainer}>
                    <h3>Participant Growth Over Time</h3>
                    <Line data={participantsChartData} />
                </div>

                <div className={styles.chartContainer}>
                    <h3>Total ETH Collected Over Time</h3>
                    <Line data={ethCollectedChartData} />
                </div>
            </div>

            <div className={styles.tableContainer}>
                <h3>Top Participants</h3>
                <table>
                    <thead>
                        <tr>
                            <th>User</th>
                            <th>Entries</th>
                        </tr>
                    </thead>
                    <tbody>
                        {topParticipants.map((user, index) => (
                            <tr key={index}>
                                <td>{user.email}</td>
                                <td>{user.entries}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>

    );
}
