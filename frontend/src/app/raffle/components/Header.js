"use client";

import { useState, useEffect } from "react";
import styles from "../styles/header.module.css";
import Link from "next/link";
import Image from "next/image";
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
            <Image src="/logo.svg" alt="Cipher Draw" width={100} height={100} className={styles.logo} />

            {/* Hide Login button when user is logged in */}
            {!user && (
                <Link href="/login" className={styles.loginButton}>
                    Login
                </Link>
            )}
        </header>
    );
}
