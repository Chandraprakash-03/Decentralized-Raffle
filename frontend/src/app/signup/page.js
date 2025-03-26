"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./signup.module.css";
import { useRouter } from "next/navigation";
import { signInWithGoogle, signUpWithEmail } from "../../../utils/firebase";
import { toast, ToastContainer } from "react-toastify";
import { apiUrl } from "../../../utils/constants"
import "react-toastify/dist/ReactToastify.css";

export default function Signup() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleGoogleSignup = async () => {
        try {
            setIsLoading(true);
            const userCredential = await signInWithGoogle();
            const user = userCredential.email;

            await fetch(`${apiUrl}/signup`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: user }),
            });

            toast.success("Signup Successful!");
            router.push("/raffle");
        } catch (error) {
            toast.error(error.message);
        } finally {
            setIsLoading(false);
        }
    };


    const handleEmailSignup = async () => {
        if (!email || !password) {
            toast.error("Email and password are required!");
            return;
        }

        try {
            setIsLoading(true);
            const userCredential = await signUpWithEmail(email, password);
            const user = userCredential.email;

            console.log(userCredential);

            await fetch(`${apiUrl}/signup`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: user }),
            });

            toast.success("Signup Successful!");
            router.push("/raffle");
        } catch (error) {
            if (error.code === "auth/email-already-in-use") {
                toast.error("Email is already in use. Try logging in.");
            } else if (error.code === "auth/weak-password") {
                toast.error("Password should be at least 6 characters.");
            } else {
                toast.error(error.message);
            }
        } finally {
            setIsLoading(false);
        }
    };


    return (
        <div className={styles.container}>
            <ToastContainer position="top-right" autoClose={3000} />
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
                                    required
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
                                    required
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div className={styles.orDivider}>Or</div>

                <button className={styles.googleBtn} onClick={handleGoogleSignup} disabled={isLoading}>
                    <img src="/google.svg" alt="Google" />
                    {isLoading ? "Processing..." : "Continue with Google"}
                </button>

                <div className={`${styles.buttonContainer} ${step === 2 ? styles.twoButtons : ""}`}>
                    {step === 2 && (
                        <motion.button
                            className={styles.backBtn}
                            onClick={() => setStep(1)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            disabled={isLoading}
                        >
                            Back
                        </motion.button>
                    )}

                    <motion.button
                        className={styles.nextBtn}
                        onClick={() => (step === 1 ? setStep(2) : handleEmailSignup())}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        disabled={isLoading}
                    >
                        {step === 1 ? "Next" : isLoading ? "Processing..." : "Sign Up"}
                    </motion.button>
                </div>

                <div className={styles.loginLink}>
                    Already have an Account? <a href="/login">Login</a>
                </div>
            </div>
        </div>
    );
}
