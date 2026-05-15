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
  query,
  orderBy,
  limit,
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
              className={styles.card}
            >

              {/* ICON */}

              <div className={styles.iconBox}>
                <FaFolder />
              </div>

              {/* FOLDER NAME */}

              <h2 className={styles.folderName}>
                {folder.folderName}
              </h2>

              {/* STORY COUNT */}

              <div className={styles.storyCount}>
                <FaBookOpen />
                <span>
                  {folder.totalStories} Stories
                </span>
              </div>

              {/* OPEN FIRST STORY */}

              {folder.firstStoryId ? (

  <Link
    href={`/story/${folder.folderName}/${folder.firstStoryId}`}
    className={styles.iconBtn}
    title="Open first story"
  >
    <FaEye />
    <span>View Folder</span>
  </Link>

) : (

  <div
    className={styles.iconBtnDisabled}
    title="No stories available in this folder"
  >
    <FaEye />
    <span>Empty</span>
  </div>

)}

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

    /* READ COOKIE */

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

    /* USER DOC */

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

    /* LOOP FOLDERS */

    for (const folderName of foldersArray) {

      const episodesRef = collection(
        db,
        "netstore",
        username,
        "stories",
        folderName,
        "episodes"
      );

      /* GET FIRST STORY (LATEST) */

      const q = query(
        episodesRef,
        orderBy("createdAt", "desc"),
        limit(1)
      );

      const firstSnap = await getDocs(q);

      let firstStoryId = null;

      if (!firstSnap.empty) {
        firstStoryId =
          firstSnap.docs[0].id;
      }

      /* COUNT ALL STORIES */

      const allSnap =
        await getDocs(episodesRef);

      folders.push({

        folderName,

        totalStories:
          allSnap.size,

        firstStoryId,

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
