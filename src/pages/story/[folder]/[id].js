import styles from "../../../styles/story.module.css";
import Link from "next/link";
import { useRouter } from "next/router";

import {
  doc,
  getDoc,
  collection,
  getDocs,
} from "firebase/firestore";

import { db } from "../../../components/firebase";

import {
  FaCopy,
  FaEdit,
  FaArrowLeft,
  FaArrowRight,
} from "react-icons/fa";

/* ---------------- COPY HTML ---------------- */
function copyToClipboard(html) {
  const blob = new Blob([html], { type: "text/html" });
  const data = [new ClipboardItem({ "text/html": blob })];
  navigator.clipboard.write(data);
}

/* ---------------- PAGE ---------------- */
export default function StoryPage({ story, prevId, nextId, folder }) {

  const router = useRouter();

  if (!story) {
    return (
      <div className={styles.container}>
        <p>Story not found.</p>
      </div>
    );
  }

  return (

    <div className={styles.container}>

      {/* HEADER */}
      <div className={styles.header}>

        <h1 className={styles.title}>{story.title}</h1>

        <div className={styles.actions}>

          {/* COPY */}
          <button
            className={styles.iconBtn}
            onClick={() => copyToClipboard(story.content)}
            title="Copy Episode"
          >
            <FaCopy />
          </button>

          {/* EDIT */}
          <Link
            href={`/write?edit=${story.id}&folder=${folder}`}
            className={styles.iconBtn}
            title="Edit Episode"
          >
            <FaEdit />
          </Link>

        </div>

      </div>

      {/* CONTENT */}
      <div
        className={styles.content}
        dangerouslySetInnerHTML={{ __html: story.content }}
      />

      {/* NAVIGATION */}
      <div className={styles.nav}>

        {/* PREVIOUS */}
        {prevId ? (
          <Link
            href={`/story/${folder}/${prevId}`}
            className={styles.navBtn}
          >
            <FaArrowLeft />
            Previous
          </Link>
        ) : (
          <div />
        )}

        {/* NEXT */}
        {nextId ? (
          <Link
            href={`/story/${folder}/${nextId}`}
            className={styles.navBtn}
          >
            Next
            <FaArrowRight />
          </Link>
        ) : (
          <div />
        )}

      </div>

    </div>

  );
}

/* ---------------- SSR ---------------- */
export async function getServerSideProps(ctx) {

  const { folder, id } = ctx.params;

  const storyRef = doc(
    db,
    "netstore",
    "temp", // placeholder (we will derive real user in real system)
    "stories",
    folder,
    "episodes",
    id
  );

  const storySnap = await getDoc(storyRef);

  if (!storySnap.exists()) {
    return {
      props: {
        story: null,
        prevId: null,
        nextId: null,
        folder,
      },
    };
  }

  const story = {
    id: storySnap.id,
    ...storySnap.data(),
  };

  /* GET ALL EPISODES FOR NAVIGATION */
  const episodesRef = collection(
    db,
    "netstore",
    "temp",
    "stories",
    folder,
    "episodes"
  );

  const snap = await getDocs(episodesRef);

  const episodes = snap.docs.map(d => d.id);

  const index = episodes.indexOf(id);

  const prevId = index > 0 ? episodes[index - 1] : null;
  const nextId = index < episodes.length - 1 ? episodes[index + 1] : null;

  return {
    props: {
      story,
      prevId,
      nextId,
      folder,
    },
  };
}
