import cookie from "cookie";
import Link from "next/link";

import {
  FaFolder,
  FaBookOpen,
  FaEye,
} from "react-icons/fa";

import styles from "../styles/library.module.css";

import {
  doc,
  getDoc,
  collection,
  getDocs,
} from "firebase/firestore";

import { db } from "../components/firebase";

export default function Library({
  username,
  folders,
}) {

  if (!username) {

    return (
      <div className={styles.container}>
        <h1>No user found.</h1>
      </div>
    );

  }

  return (

    <div className={styles.container}>

      {/* HEADER */}

      <div className={styles.top}>

        <h1>
          📚 {username}'s Library
        </h1>

        <p>
          {folders.length} folders available
        </p>

      </div>

      {/* EMPTY */}

      {folders.length === 0 ? (

        <div className={styles.empty}>
          No folders available.
        </div>

      ) : (

        <div className={styles.grid}>

          {folders.map((folder, index) => (

            <div
              key={index}
              className={styles.card}
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
                <span>
                  {folder.totalStories} Stories
                </span>
              </div>

              {/* VIEW BUTTON (FIXED ROUTE) */}

              <Link
  href={`/story/${folder.folderName}/${story.id}`}
  className={styles.iconBtn}
  title="View story"
>
  <FaEye />
</Link>

            </div>

          ))}

        </div>

      )}

    </div>

  );

}

/* ================= SSR ================= */

export async function getServerSideProps({ req }) {

  try {

    const parsedCookies = cookie.parse(
      req.headers.cookie || ""
    );

    const username =
      parsedCookies.username || null;

    if (!username) {

      return {
        props: {
          username: null,
          folders: [],
        },
      };

    }

    const userRef = doc(
      db,
      "netstore",
      username
    );

    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {

      return {
        props: {
          username,
          folders: [],
        },
      };

    }

    const foldersArray =
      userSnap.data().folders || [];

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

      const episodesSnap =
        await getDocs(episodesRef);

      folders.push({

        folderName,
        totalStories:
          episodesSnap.size,

      });

    }

    return {
      props: {
        username,
        folders,
      },
    };

  } catch (error) {

    console.log(error);

    return {
      props: {
        username: null,
        folders: [],
      },
    };

  }

}
