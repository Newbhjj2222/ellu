import { useState } from "react";
import Head from "next/head";
import { auth } from "../components/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import Cookies from "js-cookie";
import styles from "../styles/login.module.css";
import { useRouter } from "next/router";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("Kwinjira birimo...");

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Save cookies
      Cookies.set("email", email, { expires: 7 });

      setStatus("Winjiye neza!");
      // Redirect to dashboard or homepage
      router.push("/"); // niba ufite page ya dashboard
    } catch (err) {
      console.error(err);
      setStatus("Login yaranze: " + err.message);
    }
  };

  return (
    <>
      <Head>
        <title>Login | Elluminate Rwanda</title>
        <meta name="description" content="Login to Elluminate Rwanda using your email and password." />
      </Head>
<Header />
      <div className={styles.container}>
        <h1 className={styles.pageTitle}>Kwinjira</h1>

        <form className={styles.form} onSubmit={handleSubmit}>
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            required
            onChange={(e) => setEmail(e.target.value)}
          />

          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            required
            onChange={(e) => setPassword(e.target.value)}
          />

          <button type="submit" className={styles.submitBtn}>Login</button>
          {status && <p className={styles.statusMsg}>{status}</p>}
        </form>
      </div>
      <Footer />
    </>
  );
}