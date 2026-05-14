'use client';

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../components/firebase";
import { doc, getDoc } from "firebase/firestore";
import Cookies from "js-cookie";
import styles from "../components/Login.module.css";

const Login = () => {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage("Logging in...");

    try {
      /* ======================
         1. AUTH LOGIN
      ====================== */
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      const user = userCredential.user;

      /* ======================
         2. FETCH USER PROFILE
         (ONE DOC PER USER)
      ====================== */

      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      let username = "Unknown";

      if (userSnap.exists()) {
        const data = userSnap.data();
        username = data.fName || data.username || "Unknown";
      }

      /* ======================
         3. STORE COOKIE
      ====================== */
      Cookies.set("username", username, {
        expires: 7,
        secure: true,
        sameSite: "Lax",
      });

      /* ======================
         4. SUCCESS + REDIRECT
      ====================== */
      setMessage("Winjiye neza!");

      setTimeout(() => {
        router.replace("/"); // cleaner than push
      }, 200);

    } catch (error) {
      console.error(error);
      setMessage("Injira ntibishobotse: " + error.message);
    }
  };

  return (
    <div className={styles.container}>

      <h2>Sign in</h2>

      <form onSubmit={handleLogin}>

        {message && (
          <div className={styles.messageDiv}>
            {message}
          </div>
        )}

        <div className={styles.inputGroup}>
          <i className="fas fa-envelope"></i>
          <input
            type="email"
            placeholder="Email"
            required
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className={styles.inputGroup}>
          <i className="fas fa-lock"></i>
          <input
            type="password"
            placeholder="Password"
            required
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button className={styles.btn} type="submit">
          Sign In
        </button>

      </form>

      <div className={styles.registerLink}>
        <p>
          Niba nta konti ya author ufite twandikire WhatsApp kuri{" "}
          <strong>+250722319367</strong>
        </p>
      </div>

    </div>
  );
};

export default Login;
