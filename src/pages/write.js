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

  /* ---------------- FORMAT TEXT ---------------- */
  const formatText = (command, value = null) => {
    document.execCommand(command, false, value);
  };

  /* ---------------- CREATE FOLDER (DB + STATE) ---------------- */
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

  /* ---------------- SAVE STORY (FULL DB STORAGE) ---------------- */
  const saveStory = async () => {

    const content = editorRef.current?.innerHTML;

    if (!username) return setMessage("No user found.");
    if (!selectedFolder) return setMessage("Select folder.");
    if (!episodeTitle || !content) return setMessage("Complete story first.");

    try {

      setLoading(true);

      // MAIN STORY COLLECTION STRUCTURE:
      // netstore/{username}/stories/{folder}/episodes

      const storyRef = collection(
        db,
        "netstore",
        username,
        "stories",
        selectedFolder,
        "episodes"
      );

      await addDoc(storyRef, {

        username,              // ✔ user
        folder: selectedFolder,// ✔ folder
        title: episodeTitle,   // ✔ title
        content,               // ✔ full story

        createdAt: serverTimestamp(),

      });

      setMessage("Story saved successfully.");

      // reset editor
      if (editorRef.current) {
        editorRef.current.innerHTML = "";
      }

      setEpisodeTitle("");
      setSelectedFolder("");

      Cookies.remove("draft_story");
      Cookies.remove("draft_title");

      setShowSaveModal(false);

    } catch (err) {

      console.error(err);
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
          type="text"
          placeholder="Episode title..."
          className={styles.titleInput}
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

      {/* TOOLBAR */}
      {showToolbar && (

        <div ref={toolbarRef} className={styles.toolbar}>

          <button onClick={() => formatText("bold")}>
            <FaBold />
          </button>

          <button onClick={() => formatText("italic")}>
            <FaItalic />
          </button>

          <button onClick={() => formatText("underline")}>
            <FaUnderline />
          </button>

        </div>

      )}

      {/* EDITOR */}
      <div
        ref={editorRef}
        className={styles.editor}
        contentEditable
        suppressContentEditableWarning
        data-placeholder="Start writing your story here..."
      />

      {/* CREATE FOLDER */}
      {showFolderModal && (

        <div className={styles.modalOverlay}>

          <div className={styles.modal}>

            <h3>Create Folder</h3>

            <input
              placeholder="Folder name"
              value={newFolder}
              onChange={(e) => setNewFolder(e.target.value)}
            />

            <button onClick={createFolder}>
              Create
            </button>

          </div>

        </div>

      )}

      {/* SAVE STORY */}
      {showSaveModal && (

        <div className={styles.modalOverlay}>

          <div className={styles.modal}>

            <h3>Save Story</h3>

            <select
              value={selectedFolder}
              onChange={(e) => setSelectedFolder(e.target.value)}
            >

              <option value="">
                Select folder
              </option>

              {folders.map((f, i) => (
                <option key={i} value={f}>
                  {f}
                </option>
              ))}

            </select>

            <button onClick={saveStory} disabled={loading}>
              {loading ? "Saving..." : "Save Story"}
            </button>

          </div>

        </div>

      )}

      {/* MESSAGE */}
      {message && (
        <div className={styles.message}>
          {message}
        </div>
      )}

    </div>

  );
}
