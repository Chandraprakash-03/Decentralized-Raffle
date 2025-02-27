import styles from "../styles/header.module.css";
import Link from 'next/link';

export default function Header() {
    return (
        <header className={styles.header}>
            <h2 className={styles.logo}>Cipher Draw</h2>
            <Link href="/login" className={styles.loginButton}>
                Login
            </Link>
        </header>
    );
}