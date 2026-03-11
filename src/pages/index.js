import { useEffect, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { db } from "../components/firebase";
import { collection, getDocs } from "firebase/firestore";
import styles from "../styles/posts.module.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Cookies from "js-cookie";

export async function getServerSideProps() {
  const snapshot = await getDocs(collection(db, "posts"));
  const posts = snapshot.docs.map(doc => {
    const data = doc.data();
    const contentText = data.content.replace(/<[^>]+>/g, "");
    return {
      id: doc.id,
      title: data.title || "",
      image: data.image || "",
      summary: contentText.slice(0, 150) + (contentText.length > 150 ? "..." : ""),
    };
  });

  return {
    props: { posts },
  };
}

export default function Home({ posts }) {
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const username = Cookies.get("username");
    if (!username) {
      window.location.href = "/register"; // redirect niba username idahari
    } else {
      setIsChecking(false); // user afite username, tugaragaze page
    }
  }, []);

  if (isChecking) return null; // ntitwerekane page mbere yo gusuzuma cookie

  return (
    <>
      <Head>
        <title>Elluminate Blog - All Posts</title>
        <meta
          name="description"
          content="Ba umutunzi, icyamamare, umunyabwenge hamwe numuryango wacu. elluminate Rwanda turaguha ubutunzi , imbaraga namahirwe. iyandikishe nonaha mu muryango wacu."
        />
        <meta name="keywords" content="elluminate, ubutunzi, elluminate Rwanda, tutorials, elluminate" />
        <meta property="og:title" content="Elluminate Blog - All Posts" />
        <meta property="og:description" content="soma ibyerekeye elluminate Rwanda umuryango utanga ubutunzi ku isi yose." />
        <meta property="og:type" content="website" />
      </Head>
      <Header />
      <div className={styles.container}>
        <h1>ELLUMINATE RWANDA</h1>
        <div className={styles.postsGrid}>
          {posts.map(post => (
            <div key={post.id} className={styles.postCard}>
              {post.image && <img src={post.image} alt={post.title} className={styles.postImage} />}
              <h2>{post.title}</h2>
              <p>{post.summary}</p>
              <Link href={`/posts/${post.id}`}>
                <button className={styles.readMoreBtn}>Read More</button>
              </Link>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </>
  );
}
