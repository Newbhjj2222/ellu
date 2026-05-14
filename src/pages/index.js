import styles from "../styles/library.module.css";
import Link from "next/link";

import {
  collection,
  getDocs,
} from "firebase/firestore";

import { db } from "../components/firebase";

import {
  FaBook,
  FaFolder,
  FaEye,
} from "react-icons/fa";

export default function Library({ stories }) {

  return (

    <div className={styles.container}>

      <div className={styles.header}>
        <h1>NetStore Library (All Stories)</h1>
      </div>

      <div className={styles.grid}>

        {stories.length === 0 && (
          <p>No stories found in database.</p>
        )}

        {stories.map((user, i) => (

          <div key={i} className={styles.card}>

            <div className={styles.userTitle}>
              <h2>{user.username}</h2>
            </div>

            {user.folders.map((folder, j) => (

              <div key={j} className={styles.folderBlock}>

                <div className={styles.folderHeader}>
                  <FaFolder />
                  <span>{folder.name}</span>
                </div>

                {folder.episodes.map((ep, k) => (

                  <div key={k} className={styles.episodeRow}>

                    <FaBook />

                    <span>{ep.title}</span>

                    <Link
                      href={`/story/${folder.name}/${ep.id}`}
                      className={styles.viewBtn}
                    >
                      <FaEye />
                    </Link>

                  </div>

                ))}

              </div>

            ))}

          </div>

        ))}

      </div>

    </div>

  );
}

/* ---------------- SSR ---------------- */
export async function getServerSideProps() {

  try {

    const netstoreRef = collection(db, "netstore");
    const usersSnap = await getDocs(netstoreRef);

    const stories = await Promise.all(

      usersSnap.docs.map(async (userDoc) => {

        const username = userDoc.id;

        const data = userDoc.data();
        const folderNames = data.folders || [];

        const folders = await Promise.all(

          folderNames.map(async (folderName) => {

            const folderRef = collection(
              db,
              "netstore",
              username,
              folderName
            );

            const snap = await getDocs(folderRef);

            const episodes = snap.docs.map(doc => ({
              id: doc.id,
              ...doc.data(),
            }));

            return {
              name: folderName,
              episodes,
            };

          })

        );

        return {
          username,
          folders: folders.filter(f => f.episodes.length > 0),
        };

      })

    );

    return {
      props: {
        stories,
      },
    };

  } catch (err) {

    console.error(err);

    return {
      props: {
        stories: [],
      },
    };

  }

}
