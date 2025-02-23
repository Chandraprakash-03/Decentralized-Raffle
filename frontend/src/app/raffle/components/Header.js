import styles from "../styles/header.module.css";

export default function Header() {
    return (
        <header className={styles.header}>
            <h2 className={styles.logo}>Cipher Draw</h2>
            <button className={styles.loginButton}>Login</button>
        </header>
    );
}