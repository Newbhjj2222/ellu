// pages/library.js

import Cookies from "cookies";
import Link from "next/link";
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
        <h2>No user found.</h2>
      </div>
    );
  }

  return (
    <div className={styles.container}>

      <div className={styles.top}>
        <h1>{username}'s Library</h1>
        <p>{stories.length} stories found</p>
      </div>

      {stories.length === 0 ? (
        <div className={styles.empty}>
          No stories available.
        </div>
      ) : (

        <div className={styles.grid}>

          {stories.map((story) => (

            <div key={story.id} className={styles.card}>

              <div className={styles.folder}>
                📁 {story.folder}
              </div>

              <h2>{story.title}</h2>

              <div
                className={styles.preview}
                dangerouslySetInnerHTML={{
                  __html: story.content.slice(0, 200) + "...",
                }}
              />

              <div className={styles.bottom}>
                <span>
                  {story.createdAt}
                </span>

                <Link
                  href={`/read/${story.id}?folder=${story.folder}`}
                  className={styles.readBtn}
                >
                  Read
                </Link>
              </div>

            </div>

          ))}

        </div>

      )}

    </div>
  );
}

/* ================= SSR ================= */

export async function getServerSideProps({ req, res }) {

  try {

    const cookies = new Cookies(req, res);

    const username = cookies.get("username");

    if (!username) {
      return {
        props: {
          username: null,
          stories: [],
        },
      };
    }

    const stories = [];

    // folders collection
    const storiesRoot = collection(
      db,
      "netstore",
      username,
      "stories"
    );

    const foldersSnap = await getDocs(storiesRoot);

    for (const folderDoc of foldersSnap.docs) {

      const folderName = folderDoc.id;

      // episodes
      const episodeRef = collection(
        db,
        "netstore",
        username,
        "stories",
        folderName,
        "episodes"
      );

      const episodeSnap = await getDocs(episodeRef);

      episodeSnap.forEach((doc) => {

        const data = doc.data();

        stories.push({
          id: doc.id,
          folder: folderName,
          title: data.title || "Untitled",
          content: data.content || "",
          createdAt: data.createdAt
            ? new Date(
                data.createdAt.seconds * 1000
              ).toLocaleString()
            : "No date",
        });

      });

    }

    return {
      props: {
        username,
        stories,
      },
    };

  } catch (error) {

    return {
      props: {
        username: null,
        stories: [],
      },
    };

  }

}
