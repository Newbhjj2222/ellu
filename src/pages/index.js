import styles from "../styles/library.module.css";
import Link from "next/link";

import {
  doc,
  getDoc,
  collection,
  getDocs,
} from "firebase/firestore";

import { db } from "../components/firebase";

import * as cookie from "cookie";

import {
  FaUser,
  FaFolder,
  FaBook,
  FaEye,
  FaPen,
} from "react-icons/fa";

/* ======================
   PAGE UI
====================== */
export default function Library({ username, data }) {
  return (
    <div className={styles.container}>

      {/* HEADER */}
      <div className={styles.header}>
        <div className={styles.userBox}>
          <FaUser />
          <span>{username}</span>
        </div>

        <h1>Your Stories</h1>
      </div>

      {/* CONTENT */}
      <div className={styles.grid}>

        {data.length === 0 && (
          <div className={styles.empty}>
            No folders or stories found.
          </div>
        )}

        {data.map((folder) => (
          <div key={folder.name} className={styles.card}>

            <div className={styles.folderHeader}>
              <FaFolder />
              <h2>{folder.name}</h2>
            </div>

            <p className={styles.count}>
              {folder.stories.length} story(s)
            </p>

            <div className={styles.storyList}>

              {folder.stories.map((story) => (
                <div key={story.id} className={styles.storyItem}>

                  <FaBook className={styles.bookIcon} />

                  <span className={styles.storyTitle}>
                    {story.title}
                  </span>

                  <Link
                    href={`/story/${folder.name}/${story.id}`}
                    className={styles.viewBtn}
                  >
                    <FaEye />
                  </Link>

                </div>
              ))}

            </div>

          </div>
        ))}

      </div>

      {/* FLOATING WRITE BUTTON */}
      <Link href="/write" className={styles.fab}>
        <FaPen />
      </Link>

    </div>
  );
}

/* ======================
   SSR (FAST VERSION)
====================== */
export async function getServerSideProps(ctx) {

  const cookies = cookie.parse(ctx.req.headers.cookie || "");
  const username = cookies.username || null;

  if (!username) {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  }

  try {

    /* ======================
       1. USER DATA (1 QUERY)
    ====================== */
    const userRef = doc(db, "netstore", username);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      return {
        redirect: {
          destination: "/login",
          permanent: false,
        },
      };
    }

    const folders = userSnap.data().folders || [];

    /* ======================
       2. LOAD STORIES (PARALLEL)
    ====================== */
    const data = await Promise.all(
      folders.map(async (folderName) => {

        const storiesRef = collection(
          db,
          "netstore",
          username,
          "stories",
          folderName,
          "episodes"
        );

        const snap = await getDocs(storiesRef);

        const stories = snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));

        return {
          name: folderName,
          stories,
        };
      })
    );

    /* ======================
       RESULT
    ====================== */
    return {
      props: {
        username,
        data: data.filter(f => f.stories.length > 0),
      },
    };

  } catch (err) {
    console.error("Library error:", err);

    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  }
}
