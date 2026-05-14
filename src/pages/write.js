import { useState, useEffect, useRef } from "react";
import styles from "../styles/write.module.css";
import Cookies from "js-cookie";

import { db } from "../components/firebase";
import { doc, setDoc, collection, serverTimestamp } from "firebase/firestore";

export default function Write() {
  const [username, setUsername] = useState("");
  const [folderName, setFolderName] = useState("");
  const [episodeTitle, setEpisodeTitle] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const editorRef = useRef(null);

  useEffect(() => {
    const savedUsername = Cookies.get("username");
    if (savedUsername) setUsername(savedUsername);
  }, []);

  const getContent = () => {
    return editorRef.current?.innerHTML || "";
  };

  const saveStory = async () => {
    const content = getContent();

    if (!username) return setMessage("Username ntiboneka.");
    if (!folderName || !episodeTitle || !content) {
      return setMessage("Uzuza byose.");
    }

    try {
      setLoading(true);

      const userDoc = doc(db, "netstore", username);
      const folderCol = collection(userDoc, folderName);
      const episodeDoc = doc(folderCol, episodeTitle);

      await setDoc(episodeDoc, {
        title: episodeTitle,
        content,
        folder: folderName,
        author: username,
        createdAt: serverTimestamp(),
      });

      setMessage("Yabitswe neza.");

      if (editorRef.current) {
        editorRef.current.innerHTML = "";
      }

      setEpisodeTitle("");
    } catch (err) {
      console.error(err);
      setMessage("Habaye ikibazo.");
    } finally {
      setLoading(false);
    }
  };

  const formatText = (command, value = null) => {
    document.execCommand(command, false, value);
  };

  return (
    <div className={styles.container}>
      <div className={styles.editorBox}>

        <div className={styles.topBar}>
          <h2>NetStore Writer</h2>
          <div>User: {username}</div>
        </div>

        <input
          className={styles.input}
          placeholder="Folder name"
          value={folderName}
          onChange={(e) => setFolderName(e.target.value)}
        />

        <input
          className={styles.input}
          placeholder="Episode title"
          value={episodeTitle}
          onChange={(e) => setEpisodeTitle(e.target.value)}
        />

        {/* TOOLBAR */}
        <div className={styles.toolbar}>
          <button onClick={() => formatText("bold")}><b>B</b></button>
          <button onClick={() => formatText("italic")}><i>I</i></button>
          <button onClick={() => formatText("underline")}><u>U</u></button>

          <input
            type="color"
            onChange={(e) => formatText("foreColor", e.target.value)}
          />
        </div>

        {/* EDITOR */}
        <div
          ref={editorRef}
          className={styles.editor}
          contentEditable
          suppressContentEditableWarning={true}
        />

        <button className={styles.button} onClick={saveStory} disabled={loading}>
          {loading ? "Saving..." : "Save Episode"}
        </button>

        {message && <p className={styles.message}>{message}</p>}
      </div>
    </div>
  );
}
