import { useEffect, useRef, useState } from "react";
import styles from "../styles/write.module.css";
import Cookies from "js-cookie";

import {
  doc,
  setDoc,
  addDoc,
  collection,
  serverTimestamp,
  getDoc,
} from "firebase/firestore";

import { db } from "../components/firebase";

import {
  FaBold,
  FaItalic,
  FaUnderline,
  FaSave,
  FaFolderPlus,
  FaPalette,
} from "react-icons/fa";

export default function Write() {

  const editorRef = useRef(null);
  const toolbarRef = useRef(null);

  const [username, setUsername] = useState("");
  const [episodeTitle, setEpisodeTitle] = useState("");

  const [folders, setFolders] = useState([]);
  const [selectedFolder, setSelectedFolder] = useState("");

  const [showToolbar, setShowToolbar] = useState(false);
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [newFolder, setNewFolder] = useState("");
  const [showSaveModal, setShowSaveModal] = useState(false);

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  /* ---------------- LOAD USER ---------------- */
  useEffect(() => {

    const savedUsername = Cookies.get("username");
    if (savedUsername) setUsername(savedUsername);

    const loadFolders = async () => {
      if (!savedUsername) return;

      const userRef = doc(db, "netstore", savedUsername);
      const snap = await getDoc(userRef);

      if (snap.exists()) {
        setFolders(snap.data().folders || []);
      }
    };

    loadFolders();

  }, []);

  /* ---------------- CLOSE ON OUTSIDE CLICK ---------------- */
  useEffect(() => {

    const closeAll = (e) => {

      if (toolbarRef.current && !toolbarRef.current.contains(e.target)) {
        setShowToolbar(false);
      }

      const modalClick = e.target.classList.contains(styles.modalOverlay);
      if (modalClick) {
        setShowFolderModal(false);
        setShowSaveModal(false);
      }

    };

    document.addEventListener("mousedown", closeAll);
    return () => document.removeEventListener("mousedown", closeAll);

  }, []);

  /* ---------------- FORMAT TEXT ---------------- */
  const formatText = (command, value = null) => {
    document.execCommand(command, false, value);
  };

  /* ---------------- CREATE FOLDER ---------------- */
  const createFolder = async () => {

    if (!newFolder.trim()) return;

    const updated = [...folders, newFolder];
    setFolders(updated);

    const userRef = doc(db, "netstore", username);

    await setDoc(userRef, {
      folders: updated,
    }, { merge: true });

    setSelectedFolder(newFolder);
    setNewFolder("");
    setShowFolderModal(false);

  };

  /* ---------------- SAVE STORY ---------------- */
  const saveStory = async () => {

    const content = editorRef.current?.innerHTML;

    if (!username) return setMessage("No user found.");
    if (!selectedFolder) return setMessage("Select folder.");
    if (!episodeTitle || !content) return setMessage("Complete story first.");

    try {

      setLoading(true);

      const storyRef = collection(
        db,
        "netstore",
        username,
        "stories",
        selectedFolder,
        "episodes"
      );

      await addDoc(storyRef, {
        username,
        folder: selectedFolder,
        title: episodeTitle,
        content,
        createdAt: serverTimestamp(),
      });

      setMessage("Story saved successfully.");

      editorRef.current.innerHTML = "";
      setEpisodeTitle("");
      setSelectedFolder("");

      setShowSaveModal(false);

    } catch (err) {
      setMessage("Error saving story.");
    } finally {
      setLoading(false);
    }

  };

  return (

    <div className={styles.container}>

      {/* TOP BAR */}
      <div className={styles.topBar}>

        <input
          className={styles.titleInput}
          placeholder="Episode title..."
          value={episodeTitle}
          onChange={(e) => setEpisodeTitle(e.target.value)}
        />

        <div className={styles.actions}>

          <button onClick={() => setShowToolbar(!showToolbar)}>
            <FaPalette />
          </button>

          <button onClick={() => setShowFolderModal(true)}>
            <FaFolderPlus />
          </button>

          <button onClick={() => setShowSaveModal(true)}>
            <FaSave />
          </button>

        </div>

      </div>

      {/* FLOATING TOOLBAR */}
      {showToolbar && (
        <div ref={toolbarRef} className={styles.toolbar}>
          <button onClick={() => formatText("bold")}><FaBold /></button>
          <button onClick={() => formatText("italic")}><FaItalic /></button>
          <button onClick={() => formatText("underline")}><FaUnderline /></button>
        </div>
      )}

      {/* EDITOR */}
      <div
        ref={editorRef}
        className={styles.editor}
        contentEditable
        suppressContentEditableWarning
        data-placeholder="Start writing your story..."
      />

      {/* MODAL FOLDER */}
      {showFolderModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h3>Create Folder</h3>

            <input
              placeholder="Folder name"
              value={newFolder}
              onChange={(e) => setNewFolder(e.target.value)}
            />

            <button onClick={createFolder}>Create</button>
          </div>
        </div>
      )}

      {/* SAVE MODAL */}
      {showSaveModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h3>Save Story</h3>

            <select
              value={selectedFolder}
              onChange={(e) => setSelectedFolder(e.target.value)}
            >
              <option value="">Select folder</option>
              {folders.map((f, i) => (
                <option key={i} value={f}>{f}</option>
              ))}
            </select>

            <button onClick={saveStory} disabled={loading}>
              {loading ? "Saving..." : "Save Story"}
            </button>

          </div>
        </div>
      )}

      {/* MESSAGE */}
      {message && <div className={styles.message}>{message}</div>}

    </div>

  );
}
