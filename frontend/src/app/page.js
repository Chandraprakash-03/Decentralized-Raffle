// pages/index.js
import Head from 'next/head';
import styles from './page.module.css';
import React from 'react';

export default function Home() {
  return (
    <div className={styles.container}>
      <Head>
        <title>Cipher Draw - Blockchain Lottery</title>
        <meta name="description" content="A blockchain-based lottery system with transparency and fairness" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <header className={styles.header}>
        <div className={styles.logo}>
          <span>Cipher</span>
          <span>Draw</span>
        </div>
      </header>

      <main className={styles.main}>
        <section className={styles.hero}>
          <div className={styles.heroContent}>
            <h1>Welcome to Cipher Draw - a place where trust and luck meet</h1>
            <p>Economics, Fairness and Transparency in Every Draw</p>
            <div className={styles.heroBtns}>
              <button className={styles.learnBtn}>Learn More</button>
              <button className={styles.playBtn}>Play Now</button>
            </div>
          </div>
        </section>

        <section className={styles.jackpots}>
          <div className={styles.sectionHeader}>
            <div className={styles.placeholder}></div>
            <h2>Featured Jackpots</h2>
          </div>
          <div className={styles.jackpotGrid}>
            <div className={styles.jackpotCard}>
              <div className={styles.tag}>New</div>
              <div className={styles.jackpotImage}>Jackpot Image</div>
              <h3>Grand Prize</h3>
              <p className={styles.prize}>10 ETH</p>
            </div>
            <div className={styles.jackpotCard}>
              <div className={styles.tag}>Hot</div>
              <div className={styles.jackpotImage}>Jackpot Image</div>
              <h3>Mega Draw</h3>
              <p className={styles.prize}>5 BTC</p>
            </div>
            <div className={styles.jackpotCard}>
              <div className={styles.tag}>Popular</div>
              <div className={styles.jackpotImage}>Jackpot Image</div>
              <h3>Lucky Jackpot</h3>
              <p className={styles.prize}>1000 ADA</p>
            </div>
          </div>
        </section>

        <section className={styles.blockchain}>
          <div className={styles.blockchainContent}>
            <div>
              <h2>Learn How Blockchain Ensures Fairness</h2>
              <p>Explore the Technology Behind Our Lottery Draws</p>
              <button className={styles.discoverBtn}>Discover More</button>
            </div>
            <div className={styles.blockchainImage}></div>
          </div>

          <div className={styles.features}>
            <div className={styles.feature}>
              <div className={styles.featureIcon}></div>
              <div className={styles.featureText}>
                <h3>Decentralization</h3>
                <p>See how decentralized networks secure our lotteries</p>
              </div>
            </div>
            <div className={styles.feature}>
              <div className={styles.featureIcon}></div>
              <div className={styles.featureText}>
                <h3>Transparency</h3>
                <p>Understand how transparent blockchain records all transactions</p>
              </div>
            </div>
            <div className={styles.feature}>
              <div className={styles.featureIcon}></div>
              <div className={styles.featureText}>
                <h3>Smart Contracts</h3>
                <p>Learn about the automation of prize distribution</p>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.testimonials}>
          <h2>Player Testimonials</h2>
          <button className={styles.moreReviewsBtn}>Read More Reviews</button>

          <div className={styles.testimonialCards}>
            <div className={styles.testimonialCard}>
              <div className={styles.testimonialHeader}>
                <div className={styles.userIcon}></div>
                <span>Alex</span>
                <div className={styles.stars}>★★★★★</div>
              </div>
              <p>I won the jackpot! Thanks, Blockchain Lottery</p>
            </div>
            <div className={styles.testimonialCard}>
              <div className={styles.testimonialHeader}>
                <div className={styles.userIcon}></div>
                <span>Bob</span>
                <div className={styles.stars}>★★★★★</div>
              </div>
              <p>Exciting draws and instant payouts</p>
            </div>
          </div>
        </section>

        <section className={styles.joinDraw}>
          <div className={styles.joinContent}>
            <h2>Join the Next Draw</h2>
            <p>Enter for a Chance to Win Big</p>

            <form className={styles.joinForm}>
              <div className={styles.formGroup}>
                <label>Full Name</label>
                <input type="text" placeholder="Enter your name" />
              </div>
              <div className={styles.formGroup}>
                <label>Email Address</label>
                <input type="email" placeholder="Enter your email" />
              </div>
              <button className={styles.submitBtn} type="submit">Submit</button>
            </form>
          </div>
        </section>

        <section className={styles.statistics}>
          <h2>Lottery Statistics</h2>
          <p>View the Latest Results and Trends</p>
          <button className={styles.metricsBtn}>View More Metrics</button>

          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <h3>Total Tickets Sold</h3>
              <p className={styles.statNumber}>10,000</p>
              <p className={styles.statChange}>+5%</p>
            </div>
            <div className={styles.statCard}>
              <h3>Total Prizes Won</h3>
              <p className={styles.statNumber}>100 ETH</p>
              <p className={styles.statChange}>+12%</p>
            </div>
          </div>

          <div className={styles.chart}>
            <h3>Tickets Sold by Date</h3>
            <div className={styles.chartContent}>
              <div className={styles.chartBars}>
                <div className={styles.chartBar} style={{ height: '80%' }}></div>
                <div className={styles.chartBar} style={{ height: '60%' }}></div>
                <div className={styles.chartBar} style={{ height: '40%' }}></div>
                <div className={styles.chartBar} style={{ height: '70%' }}></div>
                <div className={styles.chartBar} style={{ height: '50%' }}></div>
                <div className={styles.chartBar} style={{ height: '90%' }}></div>
                <div className={styles.chartBar} style={{ height: '60%' }}></div>
              </div>
              <div className={styles.chartLabels}>
                <div>Tickets Sold</div>
                <div>Date</div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <p>© 2021 Blockchain Lottery System. All Rights Reserved.</p>
      </footer>
    </div>
  );
}