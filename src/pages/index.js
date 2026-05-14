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
   SIMPLE COOKIE PARSER (SSR)
----------------------------*/
function parseCookies(cookieHeader = "") {
  const cookies = {};

  cookieHeader.split(";").forEach((cookie) => {
    const [key, ...v] = cookie.trim().split("=");
    if (!key) return;
    cookies[key] = decodeURIComponent(v.join("="));
  });

  return cookies;
}

export default function Library({ folders }) {

  return (

    <div className={styles.container}>

      <div className={styles.header}>
        <h1>Your Stories</h1>
      </div>

      <div className={styles.grid}>

        {folders.map((folder, index) => (

          <div key={index} className={styles.card}>

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
   SSR
----------------------------*/
export async function getServerSideProps(ctx) {

  const cookies = parseCookies(
    ctx.req.headers.cookie
  );

  const username = cookies.username;

  if (!username) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  const userDoc = doc(
    db,
    "netstore",
    username
  );

  const userSnap = await getDoc(userDoc);

  if (!userSnap.exists()) {
    return {
      props: {
        folders: [],
      },
    };
  }

  const data = userSnap.data();

  const folderNames = data.folders || [];

  const folders = [];

  for (const folderName of folderNames) {

    const folderRef = collection(
      userDoc,
      folderName
    );

    const snapshot = await getDocs(folderRef);

    const episodes = [];

    snapshot.forEach((doc) => {
      episodes.push(doc.id);
    });

    if (episodes.length > 0) {

      folders.push({
        name: folderName,
        count: episodes.length,
        firstEpisode: episodes[0],
      });

    }

  }

  return {
    props: {
      folders,
    },
  };
}
