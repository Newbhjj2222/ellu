import styles from "../styles/library.module.css";
import Link from "next/link";

import {
  doc,
  getDoc,
  collection,
  getDocs,
} from "firebase/firestore";

import { db } from "../components/firebase";

import {
  FaUser,
  FaFolder,
  FaBook,
  FaEye,
  FaPen,
} from "react-icons/fa";

/* ---------------- COOKIE PARSER ---------------- */
function getCookie(name, cookieHeader = "") {

  if (!cookieHeader) return null;

  const match = cookieHeader
    .split(";")
    .map(c => c.trim())
    .find(c => c.startsWith(name + "="));

  if (!match) return null;

  return decodeURIComponent(match.split("=")[1]);
}

export default function Library({ username, data }) {

  return (

    <div className={styles.container}>

      {/* HEADER */}
      <div className={styles.header}>

        <div className={styles.userBox}>
          <FaUser />
          <span>{username}</span>
        </div>

        <h1>Your Library</h1>

      </div>

      {/* CONTENT */}
      <div className={styles.grid}>

        {data.length === 0 && (
          <div className={styles.empty}>
            No folders or stories found.
          </div>
        )}

        {data.map((folder, i) => (

          <div key={i} className={styles.card}>

            {/* FOLDER HEADER */}
            <div className={styles.folderHeader}>
              <FaFolder />
              <h2>{folder.name}</h2>
            </div>

            <p className={styles.count}>
              {folder.stories.length} story(s)
            </p>

            {/* STORIES */}
            <div className={styles.storyList}>

              {folder.stories.map((story, j) => (

                <div key={j} className={styles.storyItem}>

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

      {/* FLOATING ACTION BUTTON */}
      <Link href="/write" className={styles.fab}>
        <FaPen />
      </Link>

    </div>

  );
}

/* ---------------- SSR ---------------- */
export async function getServerSideProps(ctx) {

  const username = getCookie(
    "username",
    ctx.req.headers.cookie
  );

  if (!username) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  try {

    const userRef = doc(db, "netstore", username);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      return {
        props: {
          username,
          data: [],
        },
      };
    }

    const userData = userSnap.data();
    const folderNames = userData.folders || [];

    const data = await Promise.all(

      folderNames.map(async (folderName) => {

        const storiesRef = collection(
          db,
          "netstore",
          username,
          "stories",
          folderName,
          "episodes"
        );

        const snap = await getDocs(storiesRef);

        const stories = snap.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));

        return {
          name: folderName,
          stories,
        };

      })

    );

    return {
      props: {
        username,
        data: data.filter(f => f.stories.length > 0),
      },
    };

  } catch (err) {

    console.error(err);

    return {
      props: {
        username,
        data: [],
      },
    };

  }

}
