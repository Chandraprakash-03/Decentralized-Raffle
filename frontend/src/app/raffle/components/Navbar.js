import styles from "../styles/navbar.module.css";

export default function Navbar({ setActiveSection }) {
    return (
        <nav className={styles.navbar}>
            <div onClick={() => setActiveSection("home")} className={styles.navItem}>
                <span>🏠</span>
            </div>
            <div onClick={() => setActiveSection("winners")} className={styles.navItem}>
                <span>🏆</span>
            </div>
            <div onClick={() => setActiveSection("faq")} className={styles.navItem}>
                <span>❓</span>
            </div>
            <div onClick={() => setActiveSection("profile")} className={styles.navItem}>
                <span>👤</span>
            </div>
        </nav>
    );
}