"use client";

import { useState, useEffect } from "react";
import styles from "../styles/header.module.css";
import Link from "next/link";
import { auth } from "../../../../utils/firebase"; // Firebase auth instance
import { onAuthStateChanged } from "firebase/auth";

export default function Header() {
    const [user, setUser] = useState(null);

    useEffect(() => {
        // Listen for auth state changes
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });

        return () => unsubscribe(); // Cleanup listener on unmount
    }, []);

    return (
        <header className={styles.header}>
            <h2 className={styles.logo}>Cipher Draw</h2>

            {/* Hide Login button when user is logged in */}
            {!user && (
                <Link href="/login" className={styles.loginButton}>
                    Login
                </Link>
            )}
        </header>
    );
}
