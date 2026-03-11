import { useState } from "react";
import Head from "next/head";
import { db, auth } from "../components/firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { createUserWithEmailAndPassword } from "firebase/auth";
import styles from "../styles/register.module.css";
import Cookies from "js-cookie";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function Register() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [category, setCategory] = useState(""); // Umukire / Umukene
  const [proofFile, setProofFile] = useState(null);
  const [status, setStatus] = useState("");

  // Upload function to Cloudinary
  const uploadToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "Newtalents"); 
    formData.append("cloud_name", "dilowy3fd");

    const endpoint = "https://api.cloudinary.com/v1_1/dilowy3fd/image/upload";

    const res = await fetch(endpoint, {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    if (!data.secure_url) throw new Error("Upload failed");
    return data.secure_url;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("kwiyandikisha birimo gukorwa...");

    if (!category) {
      setStatus("Nyamuneka hitamo ikiciro wifuza.");
      return;
    }
    if (!proofFile) {
      setStatus("Nyamuneka shyiramo ifoto y'igihamya.");
      return;
    }

    try {
      // Upload image
      const proofUrl = await uploadToCloudinary(proofFile);

      // Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Save to Firestore (users collection)
      await setDoc(doc(db, "users", user.uid), {
        firstName,
        lastName,
        whatsapp,
        email,
        category,
        registrationFee: category === "Umukire" ? 26000 : 13600,
        proofUrl,
        createdAt: serverTimestamp(),
      });

      // Save cookies
      Cookies.set("firstName", firstName, { expires: 7 });
      Cookies.set("lastName", lastName, { expires: 7 });
      Cookies.set("email", email, { expires: 7 });
      Cookies.set("category", category, { expires: 7 });

      // Create balance document
      const balanceMoney = category === "Umukire" ? 8000000 : 3200000;
      const username = `${firstName}_${lastName}`;
      await setDoc(doc(db, "balance", username), {
        money: balanceMoney,
        createdAt: serverTimestamp(),
      });

      setStatus("Kwiyandikisha byakozwe neza!");
      // Clear form
      setFirstName(""); setLastName(""); setWhatsapp(""); setEmail(""); setPassword(""); setProofFile(null); setCategory("");
    } catch (err) {
      console.error(err);
      setStatus("Kwiyandikisha byanze: " + err.message);
    }
  };

  const handlePayUSSD = () => {
    window.location.href = "tel:*182*8*1*456789#";
  };

  return (
    <>
      <Head>
        <title>Register | Elluminate Rwanda</title>
        <meta
          name="description"
          content="Register for Elluminate Rwanda by filling your details and uploading payment proof."
        />
        <meta name="keywords" content="register, elluminate, Rwanda, education, payment" />
      </Head>
<Header />
      <div className={styles.container}>
        <h1 className={styles.pageTitle}>Kwiyandikisha mu muryango wa elluminate Rwanda</h1>

        <ul className={styles.requirements}>
          <li>Zuza amazina yawe nibyerekeye umwirondoro wawe wose neza.</li>
          <li>Hitamo ikiciro wifuza (Umukire / Umukene) mu muryango wa Elluminate Rwanda.</li>
          <li>Shyura amafaranga yo kwiyandikisha: 26,000 RWF (Umukire) cyangwa 13,600 RWF (Umukene).</li>
          <li>Uhereze screenshot yerekana ko wishyuye ayo mafaranga.</li>
          <li>Kanda kuri buto ya <strong>Pay</strong> kugirango uhite ukoresha USSD (*182*8*1*456789#).</li>
          <li>Nyuma y’ibyo, wiyandikishe ku rubuga.</li>
        </ul>

        <button className={styles.payBtn} onClick={handlePayUSSD}>
          Pay
        </button>

        <form className={styles.form} onSubmit={handleSubmit}>
          <label htmlFor="firstName">Amazina ya mbere</label>
          <input
            type="text"
            id="firstName"
            value={firstName}
            required
            onChange={(e) => setFirstName(e.target.value)}
          />

          <label htmlFor="lastName">Amazina y'umuryango</label>
          <input
            type="text"
            id="lastName"
            value={lastName}
            required
            onChange={(e) => setLastName(e.target.value)}
          />

          <label htmlFor="whatsapp">WhatsApp</label>
          <input
            type="text"
            id="whatsapp"
            value={whatsapp}
            required
            onChange={(e) => setWhatsapp(e.target.value)}
          />

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

          <label htmlFor="category">Hitamo ikiciro</label>
          <select
            id="category"
            value={category}
            required
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">--Hitamo--</option>
            <option value="Umukire">Umukire</option>
            <option value="Umukene">Umukene</option>
          </select>

          <label htmlFor="proof">Igihamya kerekana ko wishyuye (screenshot/photo)</label>
          <input
            type="file"
            id="proof"
            accept="image/*"
            required
            onChange={(e) => setProofFile(e.target.files[0])}
          />

          <button type="submit" className={styles.submitBtn}>Register</button>
          {status && <p className={styles.statusMsg}>{status}</p>}
        </form>
      </div>
      <Footer />
      </>
  );
}