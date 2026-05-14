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
  FaFolder,
  FaPen,
  FaEye,
  FaUser,
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

export default function Library({ username, folders }) {

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

        {folders.length === 0 && (
          <p>No stories found.</p>
        )}

        {folders.map((folder, i) => (

          <div key={i} className={styles.card}>

            {/* FOLDER HEADER */}
            <div className={styles.folderHeader}>
              <FaFolder />
              <h2>{folder.name}</h2>
            </div>

            <p className={styles.count}>
              {folder.episodes.length} episode(s)
            </p>

            {/* EPISODES LIST */}
            <div className={styles.episodeList}>

              {folder.episodes.map((ep) => (

                <div
                  key={ep.id}
                  className={styles.episode}
                >

                  <span className={styles.epTitle}>
                    {ep.title}
                  </span>

                  <div className={styles.epActions}>

                    {/* CONTINUE EDIT */}
                    <Link
                      href={`/write?folder=${folder.name}&episode=${ep.id}`}
                      className={styles.smallBtn}
                    >
                      <FaPen />
                    </Link>

                    {/* VIEW STORY */}
                    <Link
                      href={`/story/${folder.name}/${ep.id}`}
                      className={styles.smallBtn}
                    >
                      <FaEye />
                    </Link>

                  </div>

                </div>

              ))}

            </div>

          </div>

        ))}

      </div>

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
          folders: [],
        },
      };
    }

    const data = userSnap.data();

    const folderNames = data.folders || [];

    const folders = await Promise.all(

      folderNames.map(async (folderName) => {

        const colRef = collection(userRef, folderName);
        const snap = await getDocs(colRef);

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
      props: {
        username,
        folders: folders.filter(f => f.episodes.length > 0),
      },
    };

  } catch (err) {

    console.error(err);

    return {
      props: {
        username,
        folders: [],
      },
    };

  }

}
