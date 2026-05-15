import cookie from "cookie";
import Link from "next/link";
import { useEffect, useState } from "react";

import {
  FaFolder,
  FaBookOpen,
  FaEye,
  FaPen,
} from "react-icons/fa";

import styles from "../styles/library.module.css";

import {
  doc,
  getDoc,
  collection,
  getDocs,
  query,
  orderBy,
  limit,
} from "firebase/firestore";

import { db } from "../components/firebase";

/* ================= PAGE ================= */

export default function Library({ username, folders }) {

  const [loading, setLoading] = useState(true);

  useEffect(() => {

    if (!username) return;

    const t = setTimeout(() => {
      setLoading(false);
    }, 400);

    return () => clearTimeout(t);

  }, [username]);

  if (!username) return null;

  /* ================= LOADING UI ================= */

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingBox}>
          <div className={styles.spinner}></div>
          <p>Loading your library...</p>
        </div>
      </div>
    );
  }

  /* ================= MAIN UI ================= */

  return (

    <div className={styles.container}>

      {/* HEADER */}

      <div className={styles.top}>
        <h1>📚 {username}'s Library</h1>
        <p>{folders.length} folders available</p>
      </div>

      {/* EMPTY STATE */}

      {folders.length === 0 ? (

        <div className={styles.empty}>
          No folders available.
        </div>

      ) : (

        <div className={styles.grid}>

          {folders.map((folder, index) => (

            <div
              key={index}
              className={`${styles.card} ${styles["card" + (index % 5)]}`}
            >

              {/* ICON */}

              <div className={styles.iconBox}>
                <FaFolder />
              </div>

              {/* NAME */}

              <h2 className={styles.folderName}>
                {folder.folderName}
              </h2>

              {/* COUNT */}

              <div className={styles.storyCount}>
                <FaBookOpen />
                <span>{folder.totalStories} Stories</span>
              </div>

              {/* VIEW BUTTON */}

              {folder.firstStoryId ? (

                <Link
                  href={`/story/${folder.folderName}/${folder.firstStoryId}`}
                  className={styles.iconBtn}
                >
                  <FaEye />
                  <span>View Folder</span>
                </Link>

              ) : (

                <div className={styles.iconBtnDisabled}>
                  <FaEye />
                  <span>Empty</span>
                </div>

              )}

            </div>

          ))}

        </div>

      )}

      {/* FLOATING WRITE BUTTON */}

      <Link href="/write" className={styles.floatingBtn}>
        <FaPen />
      </Link>

    </div>

  );
}

/* ================= SSR ================= */

export async function getServerSideProps({ req }) {

  const parsed = cookie.parse(req.headers.cookie || "");
  const username = parsed.username || null;

  if (!username) {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  }

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

  const foldersArray = userSnap.data().folders || [];

  const folders = [];

  for (const folderName of foldersArray) {

    const episodesRef = collection(
      db,
      "netstore",
      username,
      "stories",
      folderName,
      "episodes"
    );

    const latestQuery = query(
      episodesRef,
      orderBy("createdAt", "desc"),
      limit(1)
    );

    const latestSnap = await getDocs(latestQuery);

    const firstStoryId =
      latestSnap.empty ? null : latestSnap.docs[0].id;

    const allSnap = await getDocs(episodesRef);

    folders.push({
      folderName,
      totalStories: allSnap.size,
      firstStoryId,
    });

  }

  return {
    props: {
      username,
      folders,
    },
  };
}
