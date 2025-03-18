'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import styles from './page.module.css';

export default function Home() {
  const [isLoaded, setIsLoaded] = useState(false);
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const cubeRotateX = useTransform(scrollYProgress, [0, 1], [0, 360]);
  const cubeRotateY = useTransform(scrollYProgress, [0, 1], [0, 360]);
  const cubeScale = useTransform(scrollYProgress, [0, 0.5, 1], [1, 1.5, 0.8]);

  const [participants, setParticipants] = useState(0);
  const [prizePool, setPrizePool] = useState(0);
  const [countdownTime, setCountdownTime] = useState({
    days: 2,
    hours: 14,
    minutes: 35,
    seconds: 22
  });

  useEffect(() => {
    // Simulate data loading
    setTimeout(() => setIsLoaded(true), 1000);

    // Simulate prize pool and participants increasing
    const interval = setInterval(() => {
      setPrizePool(prev => {
        const newValue = prev + (Math.random() * 0.05);
        return newValue > 15 ? 15 : newValue;
      });
      setParticipants(prev => {
        const newValue = prev + (Math.random() * 3);
        return newValue > 840 ? 840 : Math.floor(newValue);
      });
    }, 3000);

    // Simulate countdown
    const countdown = setInterval(() => {
      setCountdownTime(prev => {
        const newSeconds = prev.seconds - 1;
        if (newSeconds < 0) {
          const newMinutes = prev.minutes - 1;
          if (newMinutes < 0) {
            const newHours = prev.hours - 1;
            if (newHours < 0) {
              const newDays = prev.days - 1;
              return {
                days: newDays < 0 ? 0 : newDays,
                hours: newDays < 0 ? 0 : 23,
                minutes: newDays < 0 ? 0 : 59,
                seconds: newDays < 0 ? 0 : 59
              };
            }
            return {
              ...prev,
              hours: newHours,
              minutes: 59,
              seconds: 59
            };
          }
          return {
            ...prev,
            minutes: newMinutes,
            seconds: 59
          };
        }
        return {
          ...prev,
          seconds: newSeconds
        };
      });
    }, 1000);

    return () => {
      clearInterval(interval);
      clearInterval(countdown);
    };
  }, []);

  return (
    <div className={styles.landingContainer} ref={containerRef}>
      <nav className={styles.navbar}>
        <div className={styles.logoContainer}>
          <Image src="/logo.svg" alt="Cipher Draw Logo" width={80} height={80} />
          {/* <span className={styles.logoText}>CIPHER DRAW</span> */}
        </div>
        <div className={styles.navLinks}>
          <Link href="/">Home</Link>
          <Link href="/draws">Draws</Link>
          <Link href="/history">History</Link>
          <Link href="/about">About</Link>
          <motion.button
            className={styles.connectBtn}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Connect Wallet
          </motion.button>
        </div>
      </nav>

      <main>
        <section className={styles.heroSection}>
          <div className={styles.heroContent}>
            <motion.h1
              className={styles.heroTitle}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              DECENTRALIZED RAFFLES
              <span className={styles.highlight}> REDEFINED</span>
            </motion.h1>

            <motion.p
              className={styles.heroSubtitle}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Participate in transparent blockchain-powered draws with
              verifiable randomness and instant payouts
            </motion.p>

            <motion.div
              className={styles.heroButtons}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <motion.button
                className={styles.primaryBtn}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Enter Current Draw
              </motion.button>
              <motion.button
                className={styles.secondaryBtn}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                How It Works
              </motion.button>
            </motion.div>
          </div>

          <motion.div
            className={styles.hero3dContainer}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
          >
            <motion.div
              className={styles.cubeContainer}
              style={{
                rotateX: cubeRotateX,
                rotateY: cubeRotateY,
                scale: cubeScale
              }}
            >
              <div className={styles.cube}>
                <div className={`${styles.cubeFace} ${styles.front}`}></div>
                <div className={`${styles.cubeFace} ${styles.back}`}></div>
                <div className={`${styles.cubeFace} ${styles.left}`}></div>
                <div className={`${styles.cubeFace} ${styles.right}`}></div>
                <div className={`${styles.cubeFace} ${styles.top}`}></div>
                <div className={`${styles.cubeFace} ${styles.bottom}`}></div>
              </div>
              <div className={styles.cubeGlow}></div>
              <div className={styles.cubeRings}>
                <div className={`${styles.ring} ${styles.ring1}`}></div>
                <div className={`${styles.ring} ${styles.ring2}`}></div>
                <div className={`${styles.ring} ${styles.ring3}`}></div>
              </div>
            </motion.div>
          </motion.div>
        </section>

        <section className={styles.statsSection}>
          <div className={styles.statsGrid}>
            <motion.div
              className={styles.statCard}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h3>Current Prize Pool</h3>
              <div className={styles.statValue}>{prizePool.toFixed(2)} ETH</div>
              <div className={styles.statGraph}>
                <div className={styles.graphBar} style={{ width: `${(prizePool / 15) * 100}%` }}></div>
              </div>
            </motion.div>

            <motion.div
              className={styles.statCard}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <h3>Participants</h3>
              <div className={styles.statValue}>{participants}</div>
              <div className={styles.statGraph}>
                <div className={styles.graphBar} style={{ width: `${(participants / 840) * 100}%` }}></div>
              </div>
            </motion.div>

            <motion.div
              className={`${styles.statCard} ${styles.countdownCard}`}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h3>Next Draw In</h3>
              <div className={styles.countdownContainer}>
                <div className={styles.countdownItem}>
                  <div className={styles.countdownValue}>{countdownTime.days}</div>
                  <div className={styles.countdownLabel}>Days</div>
                </div>
                <div className={styles.countdownItem}>
                  <div className={styles.countdownValue}>{countdownTime.hours}</div>
                  <div className={styles.countdownLabel}>Hours</div>
                </div>
                <div className={styles.countdownItem}>
                  <div className={styles.countdownValue}>{countdownTime.minutes}</div>
                  <div className={styles.countdownLabel}>Min</div>
                </div>
                <div className={styles.countdownItem}>
                  <div className={styles.countdownValue}>{countdownTime.seconds}</div>
                  <div className={styles.countdownLabel}>Sec</div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        <section className={styles.featuresSection}>
          <motion.h2
            className={styles.sectionTitle}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            Why Choose Cipher Draw?
          </motion.h2>

          <div className={styles.featuresGrid}>
            <motion.div
              className={styles.featureCard}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <div className={`${styles.featureIcon} ${styles.securityIcon}`}></div>
              <h3>Verifiable Fairness</h3>
              <p>Powered by Chainlink VRF for provable randomness that cannot be manipulated by anyone, including us</p>
            </motion.div>

            <motion.div
              className={styles.featureCard}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className={`${styles.featureIcon} ${styles.lightningIcon}`}></div>
              <h3>Instant Payouts</h3>
              <p>Automatic transfers to winners once results are determined - no delays, no manual approvals</p>
            </motion.div>

            <motion.div
              className={styles.featureCard}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <div className={`${styles.featureIcon} ${styles.blockchainIcon}`}></div>
              <h3>Full Transparency</h3>
              <p>All entries, draws and winnings are recorded on the blockchain and publicly verifiable</p>
            </motion.div>

            <motion.div
              className={styles.featureCard}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <div className={`${styles.featureIcon} ${styles.feesIcon}`}></div>
              <h3>Low Fees</h3>
              <p>Minimal fees compared to traditional lotteries, maximizing your potential winnings</p>
            </motion.div>
          </div>
        </section>

        <section className={styles.howItWorksSection}>
          <motion.h2
            className={styles.sectionTitle}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            How It Works
          </motion.h2>

          <div className={styles.stepsContainer}>
            <motion.div
              className={styles.stepItem}
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className={styles.stepNumber}>01</div>
              <div className={styles.stepContent}>
                <h3>Connect Wallet</h3>
                <p>Link your Web3 wallet to participate in the raffles</p>
              </div>
            </motion.div>

            <motion.div
              className={styles.flowArrow}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 0.6 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
            ></motion.div>

            <motion.div
              className={styles.stepItem}
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className={styles.stepNumber}>02</div>
              <div className={styles.stepContent}>
                <h3>Enter Raffle</h3>
                <p>Pay the entrance fee to join the current draw</p>
              </div>
            </motion.div>

            <motion.div
              className={styles.flowArrow}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 0.6 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
            ></motion.div>

            <motion.div
              className={styles.stepItem}
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <div className={styles.stepNumber}>03</div>
              <div className={styles.stepContent}>
                <h3>Random Draw</h3>
                <p>Chainlink VRF selects a winner when the timer ends</p>
              </div>
            </motion.div>

            <motion.div
              className={styles.flowArrow}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 0.6 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.5 }}
            ></motion.div>

            <motion.div
              className={styles.stepItem}
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <div className={styles.stepNumber}>04</div>
              <div className={styles.stepContent}>
                <h3>Receive Winnings</h3>
                <p>Winners automatically receive funds in their wallet</p>
              </div>
            </motion.div>
          </div>
        </section>

        <section className={styles.ctaSection}>
          <motion.div
            className={styles.ctaContent}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2>Ready to Try Your Luck?</h2>
            <p>Join the next draw and potentially win the growing prize pool with Cipher Draw's transparent blockchain lottery system</p>
            <motion.button
              className={`${styles.primaryBtn} ${styles.ctaBtn}`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Enter Current Draw
            </motion.button>
          </motion.div>

          <div className={styles.ctaParticles}>
            {[...Array(20)].map((_, i) => (
              <div key={i} className={`${styles.particle} ${styles[`particle${i + 1}`]}`}></div>
            ))}
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <div className={styles.footerLogo}>
            <Image src="/logo.svg" alt="Cipher Draw Logo" width={30} height={30} />
            <span>CIPHER DRAW</span>
          </div>

          <div className={styles.footerLinks}>
            <div className={styles.footerColumn}>
              <h4>Navigation</h4>
              <Link href="/">Home</Link>
              <Link href="/draws">Draws</Link>
              <Link href="/history">Winners</Link>
              <Link href="/about">About</Link>
            </div>

            <div className={styles.footerColumn}>
              <h4>Resources</h4>
              <Link href="/faq">FAQ</Link>
              <Link href="/tutorial">How to Play</Link>
              <Link href="/contract">Smart Contract</Link>
              <Link href="/whitepaper">Whitepaper</Link>
            </div>

            <div className={styles.footerColumn}>
              <h4>Legal</h4>
              <Link href="/terms">Terms of Service</Link>
              <Link href="/privacy">Privacy Policy</Link>
              <Link href="/disclaimer">Disclaimer</Link>
            </div>
          </div>
        </div>

        <div className={styles.footerBottom}>
          <p>© {new Date().getFullYear()} Cipher Draw. All rights reserved.</p>
          <div className={styles.socialIcons}>
            <Link href="https://twitter.com" className={`${styles.socialIcon} ${styles.twitter}`}></Link>
            <Link href="https://discord.com" className={`${styles.socialIcon} ${styles.discord}`}></Link>
            <Link href="https://github.com" className={`${styles.socialIcon} ${styles.github}`}></Link>
            <Link href="https://medium.com" className={`${styles.socialIcon} ${styles.medium}`}></Link>
          </div>
        </div>
      </footer>
    </div>
  );
}