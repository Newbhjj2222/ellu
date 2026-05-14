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
  FaBook,
  FaPen,
  FaEye,
} from "react-icons/fa";

/* ---------------------------
   FAST COOKIE PARSER
----------------------------*/
function getCookieValue(cookieHeader, name) {

  if (!cookieHeader) return null;

  const match = cookieHeader
    .split(";")
    .map(v => v.trim())
    .find(v => v.startsWith(name + "="));

  if (!match) return null;

  return decodeURIComponent(
    match.split("=")[1]
  );
}

export default function Library({ folders }) {

  return (

    <div className={styles.container}>

      <div className={styles.header}>
        <h1>Your Stories</h1>
      </div>

      <div className={styles.grid}>

        {folders.length === 0 && (
          <p>No stories found.</p>
        )}

        {folders.map((folder, i) => (

          <div
            key={i}
            className={styles.card}
          >

            <div className={styles.icon}>
              <FaBook />
            </div>

            <h2>{folder.name}</h2>

            <p>
              {folder.count} episode(s)
            </p>

            <div className={styles.actions}>

              {/* CONTINUE WRITING */}
              <Link
                href={`/write?folder=${folder.name}`}
                className={styles.writeBtn}
              >
                <FaPen />
                Continue
              </Link>

              {/* VIEW STORY */}
              <Link
                href={`/story/${folder.name}/${folder.firstEpisode}`}
                className={styles.viewBtn}
              >
                <FaEye />
                View
              </Link>

            </div>

          </div>

        ))}

      </div>

    </div>

  );
}

/* ---------------------------
   SSR (FAST + MINIMAL READS)
----------------------------*/
export async function getServerSideProps(ctx) {

  const username = getCookieValue(
    ctx.req.headers.cookie,
    "username"
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

    const userRef = doc(
      db,
      "netstore",
      username
    );

    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      return {
        props: { folders: [] },
      };
    }

    const data = userSnap.data();

    const folderNames = data.folders || [];

    // 🔥 FAST PARALLEL FETCH (instead of loop await)
    const folderPromises = folderNames.map(async (name) => {

      const folderRef = collection(
        userRef,
        name
      );

      const snap = await getDocs(folderRef);

      const episodes = snap.docs.map(
        d => d.id
      );

      if (episodes.length === 0) return null;

      return {
        name,
        count: episodes.length,
        firstEpisode: episodes[0],
      };

    });

    const foldersRaw = await Promise.all(folderPromises);

    const folders = foldersRaw.filter(Boolean);

    return {
      props: {
        folders,
      },
    };

  } catch (err) {

    console.error(err);

    return {
      props: {
        folders: [],
      },
    };

  }
}
