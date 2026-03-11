import { useState, useEffect } from "react";
import Head from "next/head";
import { db } from "../components/firebase";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import Cookies from "js-cookie";
import styles from "../styles/profile.module.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function Profile({ initialData }) {
  const [firstName, setFirstName] = useState(initialData.firstName || "");
  const [lastName, setLastName] = useState(initialData.lastName || "");
  const [email, setEmail] = useState(initialData.email || "");
  const [category, setCategory] = useState(initialData.category || "");
  const [balance, setBalance] = useState(initialData.balance || 0);
  const [proofFile, setProofFile] = useState(null);
  const [status, setStatus] = useState("");
  const [showWithdrawForm, setShowWithdrawForm] = useState(false); // control form visibility

  const handlePayUSSD = () => {
    window.location.href = "tel:*182*8*1*456789#";
  };

  const uploadToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "Newtalents");
    formData.append("cloud_name", "dilowy3fd");

    const endpoint = "https://api.cloudinary.com/v1_1/dilowy3fd/image/upload";
    const res = await fetch(endpoint, { method: "POST", body: formData });
    const data = await res.json();
    if (!data.secure_url) throw new Error("Upload failed");
    return data.secure_url;
  };

  const handleWithdrawClick = () => {
    setShowWithdrawForm(true);
  };

  const handleWithdrawSubmit = async () => {
    if (!proofFile) {
      setStatus("Nyamuneka shyiramo ifoto y'igihamya cyawe.");
      return;
    }
    try {
      const proofUrl = await uploadToCloudinary(proofFile);
      const username = `${firstName}_${lastName}`;
      await setDoc(doc(db, "withdrawals", username + "_" + Date.now()), {
        user: username,
        email,
        category,
        proofUrl,
        balance,
        createdAt: serverTimestamp(),
      });
      setStatus("Ubutumwa bwo gukuraho amafaranga bwoherejwe neza!");
      setShowWithdrawForm(false);
    } catch (err) {
      console.error(err);
      setStatus("Gukura amafaranga byaranze: " + err.message);
    }
  };

  return (
    <>
      <Head>
        <title>Profile | Elluminate Rwanda</title>
      </Head>
<Header />
      <div className={styles.container}>
        <h1 className={styles.pageTitle}>Profile yawe</h1>

        <div className={styles.infoBox}>
          <p><strong>Amazina:</strong> {firstName} {lastName}</p>
          <p><strong>Email:</strong> {email}</p>
          <p><strong>Category:</strong> {category}</p>
          <p><strong>Balance:</strong> {balance.toLocaleString()} RWF</p>
        </div>

        <div className={styles.actions}>
          <button className={styles.payBtn} onClick={handlePayUSSD}>
            Pay
          </button>

          <div className={styles.withdrawSection}>
            <h3>Kura amafaranga</h3>
            {!showWithdrawForm && (
              <button onClick={handleWithdrawClick} className={styles.withdrawBtn}>
                Withdraw
              </button>
            )}

            {showWithdrawForm && (
              <div>
                <p>
                  Kugirango ubikuze amafaranga yawe ohereza igihamya cyerekana ko wishyuye amafaranga agurira inzoga abakurambere 45,000 rwf.
                  Niba utarishyura, kanda buto ya <strong>Pay</strong> mbere y'uko wohereza igihamya.
                </p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setProofFile(e.target.files[0])}
                />
                <button onClick={handleWithdrawSubmit} className={styles.withdrawBtn}>
                  Ohereza Igihamya
                </button>
              </div>
            )}

            {status && <p className={styles.statusMsg}>{status}</p>}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

// SSR: fetch balance and cookies
export async function getServerSideProps({ req }) {
  const cookies = req.headers.cookie || "";
  const cookieObj = {};
  cookies.split(";").forEach((c) => {
    const [key, val] = c.trim().split("=");
    if (key && val) cookieObj[key] = decodeURIComponent(val);
  });

  const firstName = cookieObj.firstName || "";
  const lastName = cookieObj.lastName || "";
  const email = cookieObj.email || "";
  const category = cookieObj.category || "";

  let balance = 0;
  if (firstName && lastName) {
    const username = `${firstName}_${lastName}`;
    const docRef = doc(db, "balance", username);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      balance = docSnap.data().money || 0;
    }
  }

  return {
    props: {
      initialData: { firstName, lastName, email, category, balance },
    },
  };
}