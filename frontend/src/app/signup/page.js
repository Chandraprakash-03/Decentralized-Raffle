"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./signup.module.css";

export default function Signup() {
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    return (
        <div className={styles.container}>
            <div className={styles.signupBox}>
                <h1 className={styles.title}>Signup</h1>

                <div className={styles.inputWrapper}>
                    <AnimatePresence mode="wait">
                        {step === 1 ? (
                            <motion.div
                                key="email"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0, transition: { type: "spring", stiffness: 300, damping: 20 } }}
                                exit={{ opacity: 0, x: 20, transition: { type: "spring", stiffness: 300, damping: 20 } }}
                            >
                                <label className={styles.inputLabel}>Email</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className={styles.inputField}
                                />
                            </motion.div>
                        ) : (
                            <motion.div
                                key="password"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0, transition: { type: "spring", stiffness: 300, damping: 20 } }}
                                exit={{ opacity: 0, x: 20, transition: { type: "spring", stiffness: 300, damping: 20 } }}
                            >
                                <label className={styles.inputLabel}>Password</label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className={styles.inputField}
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div className={styles.orDivider}>Or</div>

                {/* Google Sign-Up Button */}
                <button className={styles.googleBtn}>
                    <img src="/google.svg" alt="Google" />
                    Continue with Google
                </button>

                {/* Buttons */}
                <div className={`${styles.buttonContainer} ${step === 2 ? styles.twoButtons : ""}`}>
                    {step === 2 && (
                        <motion.button
                            className={styles.backBtn}
                            onClick={() => setStep(1)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            Back
                        </motion.button>
                    )}

                    <motion.button
                        className={styles.nextBtn}
                        onClick={() => (step === 1 ? setStep(2) : alert("Signup Clicked"))}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        {step === 1 ? "Next" : "Sign Up"}
                    </motion.button>
                </div>

                <div className={styles.loginLink}>
                    Already have an Account? <a href="/login">Login</a>
                </div>
            </div>
        </div>
    );
}
