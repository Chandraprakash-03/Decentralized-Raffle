"use client";
import { useState } from "react";
import styles from "./styles/raffle.module.css";
import Header from "./components/Header";
import MainSection from "./components/MainSection";
import Navbar from "./components/Navbar";

export default function RafflePage() {
    const [activeSection, setActiveSection] = useState("home");

    return (
        <div className={styles.page}>
            <Header />
            <MainSection activeSection={activeSection} />
            <Navbar setActiveSection={setActiveSection} />
        </div>
    );
}
