import { useState } from "react";
import Link from "next/link";
import styles from "../styles/header.module.css";
import { FaBars, FaTimes } from "react-icons/fa";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <header className={styles.header}>
      <div className={styles.logo}>
        <img src="/logo.png" alt="ElluminateRwa Logo" />
        <span>ElluminateRwa</span>
      </div>

      {/* Desktop Menu */}
      <nav className={`${styles.nav} ${menuOpen ? styles.navMobileOpen : ""}`}>
        <Link href="/">Home</Link>
        <Link href="/about">About</Link>
        <Link href="/contact">Contact</Link>
        <Link href="/login">Login</Link>
        <Link href="/profile">Profile</Link>
      </nav>

      {/* Mobile Menu Icon */}
      <div className={styles.menuIcon} onClick={toggleMenu}>
        {menuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
      </div>
    </header>
  );
}