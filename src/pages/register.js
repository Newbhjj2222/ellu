import { useState } from "react";
import Head from "next/head";
import Link from "next/link";
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
  const [category, setCategory] = useState("");
  const [proofFile, setProofFile] = useState(null);
  const [status, setStatus] = useState("");

  // Upload image to Cloudinary
  const uploadToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "Newtalents");
    formData.append("cloud_name", "dilowy3fd");

    const res = await fetch(
      "https://api.cloudinary.com/v1_1/dilowy3fd/image/upload",
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await res.json();
    if (!data.secure_url) throw new Error("Upload failed");
    return data.secure_url;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("Kwiyandikisha birimo gukorwa...");

    if (!category) {
      setStatus("Nyamuneka hitamo ikiciro.");
      return;
    }

    if (!proofFile) {
      setStatus("Nyamuneka shyiramo screenshot y'igihamya cyo kwishyura.");
      return;
    }

    try {
      // upload image
      const proofUrl = await uploadToCloudinary(proofFile);

      // create firebase auth user
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      const user = userCredential.user;

      // save user profile
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

      // username
      const username = `${firstName}_${lastName}`;

      // save cookies
      Cookies.set("username", username, { expires: 7 });
      Cookies.set("firstName", firstName, { expires: 7 });
      Cookies.set("lastName", lastName, { expires: 7 });
      Cookies.set("email", email, { expires: 7 });
      Cookies.set("category", category, { expires: 7 });

      // create balance document
      const balanceMoney = category === "Umukire" ? 8000000 : 3200000;

      await setDoc(doc(db, "balance", username), {
        money: balanceMoney,
        createdAt: serverTimestamp(),
      });

      setStatus("Kwiyandikisha byakozwe neza!");

      // redirect to home
      window.location.href = "/";

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
          content="Iyandikishe muri Elluminate Rwanda."
        />
      </Head>

      <Header />

      <div className={styles.container}>
        <h1 className={styles.pageTitle}>
          Kwiyandikisha mu muryango wa Elluminate Rwanda
        </h1>

        <ul className={styles.requirements}>
          <li>Zuza amazina yawe neza.</li>
          <li>Hitamo ikiciro (Umukire cyangwa Umukene).</li>
          <li>
            Shyura amafaranga yo kwiyandikisha: 26,000 RWF cyangwa 13,600 RWF.
          </li>
          <li>Ohereza screenshot y'igihamya cyo kwishyura.</li>
        </ul>

        <button className={styles.payBtn} onClick={handlePayUSSD}>
          Pay
        </button>

        <form className={styles.form} onSubmit={handleSubmit}>
          <label>Amazina ya mbere</label>
          <input
            type="text"
            required
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />

          <label>Amazina y'umuryango</label>
          <input
            type="text"
            required
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />

          <label>WhatsApp</label>
          <input
            type="text"
            required
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
          />

          <label>Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <label>Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <label>Hitamo ikiciro</label>
          <select
            required
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">--Hitamo--</option>
            <option value="Umukire">Umukire</option>
            <option value="Umukene">Umukene</option>
          </select>

          <label>Screenshot y'igihamya cyo kwishyura</label>
          <input
            type="file"
            accept="image/*"
            required
            onChange={(e) => setProofFile(e.target.files[0])}
          />

          <button type="submit" className={styles.submitBtn}>
            Register
          </button>

          {status && <p className={styles.statusMsg}>{status}</p>}
        </form>

        <p className={styles.loginText}>
          Usanzwe ufite account?{" "}
          <Link href="/login">Injira hano</Link>
        </p>
      </div>

      <Footer />
    </>
  );
}
