import styles from "@/styles/story.module.css";
import Link from "next/link";

import {
  doc,
  getDoc,
  collection,
  getDocs,
} from "firebase/firestore";

import { db } from "@/components/firebase";

import {
  FaCopy,
  FaEdit,
  FaArrowLeft,
  FaArrowRight,
} from "react-icons/fa";

/* ---------------- COOKIE ---------------- */
function getCookie(name, cookieHeader = "") {
  if (!cookieHeader) return null;

  const match = cookieHeader
    .split(";")
    .map(c => c.trim())
    .find(c => c.startsWith(name + "="));

  if (!match) return null;

  return decodeURIComponent(match.split("=")[1]);
}

/* ---------------- COPY (100% WORKING METHOD) ---------------- */
function copyVisibleStory() {
  try {
    const element = document.getElementById("story-content");

    if (!element) return false;

    const range = document.createRange();
    range.selectNodeContents(element);

    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);

    const success = document.execCommand("copy");

    selection.removeAllRanges();

    return success;

  } catch (err) {
    console.error("Copy error:", err);
    return false;
  }
}

/* ---------------- PAGE ---------------- */
export default function StoryPage({
  story,
  prevId,
  nextId,
  folder,
  username,
}) {

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

        <h1 className={styles.title}>
          {story.title}
        </h1>

        <div className={styles.actions}>

          {/* COPY */}
          <button
            className={styles.iconBtn}
            onClick={() => {
              const ok = copyVisibleStory();

              if (!ok) {
                alert("Copy failed");
              }
            }}
          >
            <FaCopy />
          </button>

          {/* EDIT */}
          <Link
            href={`/write?edit=${story.id}&folder=${folder}`}
            className={styles.iconBtn}
          >
            <FaEdit />
          </Link>

        </div>
      </div>

      {/* CONTENT */}
      <div
        id="story-content"
        className={styles.content}
        dangerouslySetInnerHTML={{
          __html: story.content,
        }}
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
        ) : <div />}

        {/* NEXT */}
        {nextId ? (
          <Link
            href={`/story/${folder}/${nextId}`}
            className={styles.navBtn}
          >
            Next
            <FaArrowRight />
          </Link>
        ) : <div />}
      </div>

    </div>
  );
}

/* ---------------- SSR ---------------- */
export async function getServerSideProps(ctx) {

  const username = getCookie("username", ctx.req.headers.cookie);

  if (!username) {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  }

  const { folder, id } = ctx.params;

  try {

    /* STORY */
    const storyRef = doc(
      db,
      "netstore",
      username,
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
          username,
        },
      };
    }

    const story = {
      id: storySnap.id,
      ...storySnap.data(),
    };

    /* EPISODES FOR NAVIGATION */
    const episodesRef = collection(
      db,
      "netstore",
      username,
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
        username,
      },
    };

  } catch (err) {

    console.error(err);

    return {
      props: {
        story: null,
        prevId: null,
        nextId: null,
        folder,
        username,
      },
    };
  }
}
