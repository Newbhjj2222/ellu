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

/* ---------------- COPY FUNCTION (ROBUST) ---------------- */
async function copyToClipboard(html) {
  try {
    const blob = new Blob([html], { type: "text/html" });

    const item = new ClipboardItem({
      "text/html": blob,
    });

    await navigator.clipboard.write([item]);
    return true;

  } catch (err) {
    console.warn("Clipboard HTML failed, fallback used", err);

    try {
      const temp = document.createElement("textarea");

      temp.value = html
        .replace(/<br\s*\/?>/gi, "\n")
        .replace(/<[^>]*>/g, "");

      document.body.appendChild(temp);
      temp.select();
      document.execCommand("copy");
      document.body.removeChild(temp);

      return true;

    } catch (e) {
      console.error("Copy failed completely", e);
      return false;
    }
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

          {/* COPY BUTTON */}
          <button
            className={styles.iconBtn}
            onClick={async () => {
              const ok = await copyToClipboard(story.content);

              if (!ok) {
                alert("Copy failed");
              }
            }}
          >
            <FaCopy />
          </button>

          {/* EDIT BUTTON */}
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

  const username = getCookie(
    "username",
    ctx.req.headers.cookie
  );

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
