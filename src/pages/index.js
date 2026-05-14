'use client';

import React, { useEffect, useState } from "react";
import Link from "next/link";
import styles from "../styles/library.module.css";

import {
  doc,
  getDoc,
  collection,
  getDocs,
} from "firebase/firestore";

import { db } from "../components/firebase";

import {
  FaUser,
  FaFolder,
  FaBook,
  FaEye,
  FaPen,
} from "react-icons/fa";

import Cookies from "js-cookie";

/* ======================
   PAGE
====================== */
export default function Library() {

  const [username, setUsername] = useState(null);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ======================
     LOAD USER + DATA
  ====================== */
  useEffect(() => {

    const fetchData = async () => {

      try {

        /* 1. GET COOKIE */
        const cookieUser = Cookies.get("username");

        if (!cookieUser) {
          window.location.href = "/login";
          return;
        }

        setUsername(cookieUser);

        /* 2. GET USER DOC */
        const userRef = doc(db, "netstore", cookieUser);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
          window.location.href = "/login";
          return;
        }

        const folders = userSnap.data().folders || [];

        /* 3. GET STORIES (FAST PARALLEL) */
        const result = await Promise.all(
          folders.map(async (folderName) => {

            const storiesRef = collection(
              db,
              "netstore",
              cookieUser,
              "stories",
              folderName,
              "episodes"
            );

            const snap = await getDocs(storiesRef);

            const stories = snap.docs.map((d) => ({
              id: d.id,
              ...d.data(),
            }));

            return {
              name: folderName,
              stories,
            };

          })
        );

        setData(result.filter(f => f.stories.length > 0));

      } catch (err) {
        console.error(err);
        window.location.href = "/login";
      } finally {
        setLoading(false);
      }

    };

    fetchData();

  }, []);

  /* ======================
     LOADING STATE (PAGE HIDDEN UNTIL READY)
  ====================== */
  if (loading) {
    return (
      <div className={styles.loading}>
        Loading your stories...
      </div>
    );
  }

  /* ======================
     RENDER
  ====================== */
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

        {data.length === 0 && (
          <div className={styles.empty}>
            No folders or stories found.
          </div>
        )}

        {data.map((folder) => (
          <div key={folder.name} className={styles.card}>

            <div className={styles.folderHeader}>
              <FaFolder />
              <h2>{folder.name}</h2>
            </div>

            <p className={styles.count}>
              {folder.stories.length} story(s)
            </p>

            <div className={styles.storyList}>

              {folder.stories.map((story) => (
                <div key={story.id} className={styles.storyItem}>

                  <FaBook className={styles.bookIcon} />

                  <span className={styles.storyTitle}>
                    {story.title}
                  </span>

                  <Link
                    href={`/story/${folder.name}/${story.id}`}
                    className={styles.viewBtn}
                  >
                    <FaEye />
                  </Link>

                </div>
              ))}

            </div>

          </div>
        ))}

      </div>

      {/* WRITE BUTTON */}
      <Link href="/write" className={styles.fab}>
        <FaPen />
      </Link>

    </div>
  );
}
