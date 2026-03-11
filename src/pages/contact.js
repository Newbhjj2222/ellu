import { useState, useEffect } from "react";
import Head from "next/head";
import { db } from "../components/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import styles from "../styles/contact.module.css";
import Cookies from "js-cookie";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function Contact() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("");

  // Load username from cookie if exists
  useEffect(() => {
    const savedName = Cookies.get("username");
    if (savedName) setUsername(savedName);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("Sending...");

    try {
      // Save username in cookie for 30 days
      Cookies.set("username", username, { expires: 30 });

      // Save message to Firestore
      await addDoc(collection(db, "contacts"), {
        username,
        email,
        message,
        createdAt: serverTimestamp(),
      });

      setStatus("Message sent successfully!");
      setEmail("");
      setMessage("");
    } catch (err) {
      console.error(err);
      setStatus("Failed to send message.");
    }
  };

  return (
    <>
      <Head>
        <title>Contact Us | Elluminate</title>
        <meta
          name="description"
          content="Send us a message. Fill the contact form and we will get back to you."
        />
        <meta name="keywords" content="contact, message, elluminate, support" />
      </Head>
<Header />
      <div className={styles.container}>
        <h1 className={styles.pageTitle}>Contact Us</h1>

        <form className={styles.form} onSubmit={handleSubmit}>
          <label htmlFor="username">Name</label>
          <input
            type="text"
            id="username"
            value={username}
            required
            onChange={(e) => setUsername(e.target.value)}
          />

          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            required
            onChange={(e) => setEmail(e.target.value)}
          />

          <label htmlFor="message">Message</label>
          <textarea
            id="message"
            value={message}
            required
            onChange={(e) => setMessage(e.target.value)}
          />

          <button type="submit" className={styles.submitBtn}>
            Send Message
          </button>

          {status && <p className={styles.statusMsg}>{status}</p>}
        </form>
      </div>
      <Footer />
    </>
  );
}