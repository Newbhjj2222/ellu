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
  FaUser,
} from "react-icons/fa";

/* ---------------- COOKIE PARSER ---------------- */
function getCookie(name, cookieHeader = "") {

  const match = cookieHeader
    .split(";")
    .map(c => c.trim())
    .find(c => c.startsWith(name + "="));

  if (!match) return null;

  return decodeURIComponent(
    match.split("=")[1]
  );
}

export default function Library({ folders, username }) {

  return (

    <div className={styles.container}>

      {/* HEADER */}
      <div className={styles.header}>

        <div className={styles.userBox}>

          <FaUser />

          <span>
            {username}
          </span>

        </div>

        <h1>Your Stories</h1>

      </div>

      {/* GRID */}
      <div className={styles.grid}>

        {folders.length === 0 && (
          <p>No folders found.</p>
        )}

        {folders.map((folder, i) => (

          <div key={i} className={styles.card}>

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

    const userRef = doc(
      db,
      "netstore",
      username
    );

    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {

      return {
        props: {
          folders: [],
          username,
        },
      };

    }

    const data = userSnap.data();

    const folderNames = data.folders || [];

    const folders = await Promise.all(

      folderNames.map(async (name) => {

        const colRef = collection(
          userRef,
          name
        );

        const snap = await getDocs(colRef);

        const episodes = snap.docs.map(
          d => d.id
        );

        if (episodes.length === 0) return null;

        return {
          name,
          count: episodes.length,
          firstEpisode: episodes[0],
        };

      })

    );

    return {
      props: {
        folders: folders.filter(Boolean),
        username,
      },
    };

  } catch (err) {

    console.error(err);

    return {
      props: {
        folders: [],
        username,
      },
    };

  }

}
