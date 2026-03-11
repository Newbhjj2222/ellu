import styles from "../styles/footer.module.css";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerContainer}>
        <div className={styles.about}>
          <h3>ElluminateRwa</h3>
          <p>Urubuga rwa Elluminate Rwanda rugamije kwigisha, guhuza abantu no gutanga amahirwe.</p>
        </div>

        <div className={styles.links}>
          <h4>Links</h4>
          <ul>
            <li><Link href="/">Home</Link></li>
            <li><Link href="/about">About</Link></li>
            <li><Link href="/contact">Contact</Link></li>
            <li><Link href="/login">Login</Link></li>
            <li><Link href="/profile">Profile</Link></li>
          </ul>
        </div>

        <div className={styles.contact}>
          <h4>Contact</h4>
          <p>Email: info@elluminaterwa.rw</p>
          <p>WhatsApp: +250 788 123 456</p>
        </div>
      </div>

      <div className={styles.copy}>
        &copy; {new Date().getFullYear()} ElluminateRwa. All rights reserved.
      </div>
    </footer>
  );
}