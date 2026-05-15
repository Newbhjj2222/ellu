// pages/library.js

import cookie from "cookie";
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
  foldersWithStories,
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

      <div className={styles.top}>
        <h1>{username}'s Library</h1>
      </div>

      {foldersWithStories.length === 0 ? (

        <div className={styles.empty}>
          No stories available.
        </div>

      ) : (

        foldersWithStories.map((folder, index) => (

          <div
            key={index}
            className={styles.folderBox}
          >

            <h2 className={styles.folderTitle}>
              📁 {folder.folderName}
            </h2>

            {folder.stories.length === 0 ? (

              <div className={styles.noStories}>
                Empty folder
              </div>

            ) : (

              <div className={styles.grid}>

                {folder.stories.map((story) => (

                  <div
                    key={story.id}
                    className={styles.card}
                  >

                    <h3>
                      {story.title}
                    </h3>

                    <div
                      className={styles.preview}
                      dangerouslySetInnerHTML={{
                        __html:
                          story.content.substring(0, 250)
                          + "...",
                      }}
                    />

                    <span className={styles.date}>
                      {story.createdAt}
                    </span>

                  </div>

                ))}

              </div>

            )}

          </div>

        ))

      )}

    </div>

  );

}

/* ================= SSR ================= */

export async function getServerSideProps({ req }) {

  try {

    /* GET COOKIE */

    const parsedCookies = cookie.parse(
      req.headers.cookie || ""
    );

    const username =
      parsedCookies.username || null;

    if (!username) {

      return {

        props: {
          username: null,
          foldersWithStories: [],
        },

      };

    }

    /* GET USER DOC */

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
          foldersWithStories: [],
        },

      };

    }

    /* GET FOLDERS ARRAY */

    const folders =
      userSnap.data().folders || [];

    const foldersWithStories = [];

    /* LOOP FOLDERS */

    for (const folderName of folders) {

      const stories = [];

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

      /* SORT STORIES */

      stories.sort((a, b) => {

        return (
          new Date(b.createdAt) -
          new Date(a.createdAt)
        );

      });

      foldersWithStories.push({

        folderName,
        stories,

      });

    }

    return {

      props: {
        username,
        foldersWithStories,
      },

    };

  } catch (error) {

    console.log(error);

    return {

      props: {
        username: null,
        foldersWithStories: [],
      },

    };

  }

}
