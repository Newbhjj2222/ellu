import Head from "next/head";
import { db } from "../components/firebase";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import styles from "../styles/messages.module.css";
import { useEffect, useState } from "react";

// Client-only component for date formatting
function DateClient({ isoString }) {
  const [formatted, setFormatted] = useState("");
  useEffect(() => {
    if (isoString) {
      const date = new Date(isoString);
      setFormatted(date.toLocaleString("en-GB")); // or any consistent locale
    }
  }, [isoString]);
  return <span>{formatted}</span>;
}

export async function getServerSideProps() {
  const q = query(collection(db, "contacts"), orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);

  const messages = snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      username: data.username || "",
      email: data.email || "",
      message: data.message || "",
      createdAt: data.createdAt?.toDate().toISOString() || "", // ISO string for SSR
    };
  });

  return {
    props: { messages },
  };
}

export default function Messages({ messages }) {
  return (
    <>
      <Head>
        <title>All Messages | Elluminate</title>
        <meta
          name="description"
          content="View all messages sent via the contact form on Elluminate."
        />
        <meta name="keywords" content="messages, contact, elluminate" />
      </Head>

      <div className={styles.container}>
        <h1 className={styles.pageTitle}>All Messages</h1>

        <div className={styles.messagesGrid}>
          {messages.map(msg => (
            <div key={msg.id} className={styles.messageCard}>
              <p>
                <strong>Name:</strong> {msg.username}
              </p>
              <p>
                <strong>Email:</strong> {msg.email}
              </p>
              <p>
                <strong>Message:</strong> {msg.message}
              </p>
              <p className={styles.date}>
                <DateClient isoString={msg.createdAt} />
              </p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}