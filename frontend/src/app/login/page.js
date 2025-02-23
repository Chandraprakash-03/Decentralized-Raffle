"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./login.module.css";

export default function Login() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className={styles.container}>
      <div className={styles.loginBox}>
        <h1 className={styles.title}>Login</h1>

        {/* Google Sign-In Button (Stays the Same) */}
        <button className={styles.googleBtn}>
          <img src="/file.svg" alt="Google" />
          Continue with Google
        </button>

        <div className={styles.orDivider}>Or</div>

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
                {/* Forgot Password Link */}
                <div className={styles.forgotPassword}>
                  <a href="#">Forgot Password?</a>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

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
            onClick={() => (step === 1 ? setStep(2) : alert("Login Clicked"))}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {step === 1 ? "Next" : "Login"}
          </motion.button>
        </div>

        <div className={styles.signupLink}>
          Don't have an Account? <a href="#">Create One</a>
        </div>
      </div>
    </div>
  );
}
