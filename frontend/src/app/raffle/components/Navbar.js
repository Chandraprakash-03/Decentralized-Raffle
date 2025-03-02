// Navbar.js
import styles from "../styles/navbar.module.css";
import Image from 'next/image';

export default function Navbar({ setActiveSection, activeSection }) {
    return (
        <nav className={styles.navbar}>
            <div
                onClick={() => setActiveSection("home")}
                className={`${styles.navItem} ${activeSection === "home" ? styles.active : ""}`}
            >
                <Image
                    src="/home.svg"
                    alt="Home"
                    width={24}
                    height={24}
                />
            </div>
            <div
                onClick={() => setActiveSection("winners")}
                className={`${styles.navItem} ${activeSection === "winners" ? styles.active : ""}`}
            >
                <Image
                    src="/winner.svg"
                    alt="Winners"
                    width={24}
                    height={24}
                />
            </div>
            <div
                onClick={() => setActiveSection("analytics")}
                className={`${styles.navItem} ${activeSection === "analytics" ? styles.active : ""}`}
            >
                <Image
                    src="/analytics.svg"
                    alt="Analytics"
                    width={24}
                    height={24}
                />
            </div>
            <div
                onClick={() => setActiveSection("profile")}
                className={`${styles.navItem} ${activeSection === "profile" ? styles.active : ""}`}
            >
                <Image
                    src="/profile.svg"
                    alt="Profile"
                    width={24}
                    height={24}
                />
            </div>
        </nav>
    );
}