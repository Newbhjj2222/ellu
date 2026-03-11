import Head from "next/head";
import { db } from "../../components/firebase";
import { doc, getDoc } from "firebase/firestore";
import styles from "../../styles/post.module.css";

export async function getServerSideProps({ params }) {
  if (!params?.id) return { notFound: true };

  const ref = doc(db, "posts", params.id);
  const snap = await getDoc(ref);

  if (!snap.exists()) return { notFound: true };

  const data = snap.data();

  // Fata summary for meta description
  const contentText = (data.content || "").replace(/<[^>]+>/g, "");
  const summary = contentText.slice(0, 160);

  return {
    props: {
      post: {
        id: snap.id,
        title: data.title || "",
        image: data.image || "",
        content: data.content || "",
        summary,
      },
    },
  };
}

export default function PostPage({ post }) {
  return (
    <>
      <Head>
        <title>{post.title} | Elluminate Blog</title>
        <meta name="description" content={post.summary} />
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={post.summary} />
        {post.image && <meta property="og:image" content={post.image} />}
        <meta property="og:type" content="article" />
      </Head>

      <div className={styles.container}>
        <article className={styles.post}>
          <h1>{post.title}</h1>
          {post.image && (
            <img src={post.image} alt={post.title} className={styles.image} />
          )}
          <div
            className={styles.content}
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </article>
      </div>
    </>
  );
}