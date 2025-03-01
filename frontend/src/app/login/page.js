"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import styles from "./login.module.css";
import { signInWithGoogle, signInWithEmail } from "../../../utils/firebase";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Login() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle();
      toast.success("Login Successful!");
      router.push("/raffle");
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleEmailLogin = async () => {
    try {
      await signInWithEmail(email, password);
      toast.success("Login Successful!");
      router.push("/raffle");
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className={styles.container}>
      <ToastContainer position="top-right" autoClose={3000} />
      <div className={styles.loginBox}>
        <h1 className={styles.title}>Login</h1>

        <button className={styles.googleBtn} onClick={handleGoogleLogin}>
          <img src="/google.svg" alt="Google" />
          Continue with Google
        </button>

        <div className={styles.orDivider}>Or</div>

        <div className={styles.inputWrapper}>
          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.div key="email">
                <label className={styles.inputLabel}>Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={styles.inputField}
                />
              </motion.div>
            ) : (
              <motion.div key="password">
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

        <div className={styles.buttonContainer}>
          {step === 2 && (
            <button className={styles.backBtn} onClick={() => setStep(1)}>
              Back
            </button>
          )}
          <button
            className={styles.nextBtn}
            onClick={() => (step === 1 ? setStep(2) : handleEmailLogin())}
          >
            {step === 1 ? "Next" : "Login"}
          </button>
        </div>

        <div className={styles.signupLink}>
          Don't have an Account? <a href="/signup">Create One</a>
        </div>
      </div>
    </div>
  );
}
