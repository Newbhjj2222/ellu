// pages/library.js

import cookie from "cookie";
import styles from "../styles/library.module.css";

import {
  collection,
  getDocs,
} from "firebase/firestore";

import { db } from "../components/firebase";

export default function Library({ username, stories }) {

  if (!username) {

    return (
      <div className={styles.container}>
        <h1>No user found.</h1>
      </div>
    );

  }

  return (

    <div className={styles.container}>

      {/* TOP */}
      <div className={styles.top}>

        <h1>
          {username}'s Library
        </h1>

        <p>
          {stories.length} stories found
        </p>

      </div>

      {/* EMPTY */}
      {stories.length === 0 ? (

        <div className={styles.empty}>
          No stories available.
        </div>

      ) : (

        <div className={styles.grid}>

          {stories.map((story) => (

            <div
              key={story.id}
              className={styles.card}
            >

              <div className={styles.folder}>
                📁 {story.folder}
              </div>

              <h2 className={styles.storyTitle}>
                {story.title}
              </h2>

              <div
                className={styles.preview}
                dangerouslySetInnerHTML={{
                  __html:
                    story.content.substring(0, 250) + "...",
                }}
              />

              <div className={styles.bottom}>

                <span className={styles.date}>
                  {story.createdAt}
                </span>

              </div>

            </div>

          ))}

        </div>

      )}

    </div>

  );

}

/* ========================= SSR ========================= */

export async function getServerSideProps({ req }) {

  try {

    /* GET COOKIE */

    const parsedCookies = cookie.parse(
      req.headers.cookie || ""
    );

    const username =
      parsedCookies.username || null;

    /* NO USER */

    if (!username) {

      return {

        props: {
          username: null,
          stories: [],
        },

      };

    }

    const stories = [];

    /* GET ALL FOLDERS */

    const foldersRef = collection(
      db,
      "netstore",
      username,
      "stories"
    );

    const foldersSnap =
      await getDocs(foldersRef);

    /* LOOP FOLDERS */

    for (const folderDoc of foldersSnap.docs) {

      const folderName = folderDoc.id;

      /* GET EPISODES */

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

      episodesSnap.forEach((episodeDoc) => {

        const data = episodeDoc.data();

        stories.push({

          id: episodeDoc.id,

          folder: folderName,

          title:
            data.title || "Untitled",

          content:
            data.content || "",

          createdAt: data.createdAt
            ? new Date(
                data.createdAt.seconds * 1000
              ).toLocaleString()
            : "No date",

        });

      });

    }

    /* SORT NEWEST FIRST */

    stories.sort((a, b) => {

      return (
        new Date(b.createdAt) -
        new Date(a.createdAt)
      );

    });

    return {

      props: {
        username,
        stories,
      },

    };

  } catch (error) {

    console.log(error);

    return {

      props: {
        username: null,
        stories: [],
      },

    };

  }

}
