import { useEffect, useRef, useState } from "react";
import styles from "../styles/write.module.css";
import Cookies from "js-cookie";

import {
  doc,
  setDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "../components/firebase";

import {
  FaBold,
  FaItalic,
  FaUnderline,
  FaSave,
  FaFolderPlus,
} from "react-icons/fa";

export default function Write() {
  const editorRef = useRef(null);

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

  // LOAD USER + DRAFT
  useEffect(() => {
    const savedUsername = Cookies.get("username");
    if (savedUsername) setUsername(savedUsername);

    const draft = Cookies.get("draft_story");
    const draftTitle = Cookies.get("draft_title");

    if (draft && editorRef.current) {
      editorRef.current.innerHTML = draft;
    }

    if (draftTitle) {
      setEpisodeTitle(draftTitle);
    }

    const savedFolders = Cookies.get("story_folders");

    if (savedFolders) {
      setFolders(JSON.parse(savedFolders));
    }
  }, []);

  // AUTO SAVE DRAFT
  useEffect(() => {
    const interval = setInterval(() => {
      if (editorRef.current) {
        Cookies.set(
          "draft_story",
          editorRef.current.innerHTML,
          { expires: 7 }
        );

        Cookies.set(
          "draft_title",
          episodeTitle,
          { expires: 7 }
        );
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [episodeTitle]);

  const formatText = (command, value = null) => {
    document.execCommand(command, false, value);
  };

  // SHOW TOOLBAR WHEN TEXT SELECTED
  const handleSelection = () => {
    const selection = window.getSelection().toString();

    if (selection.length > 0) {
      setShowToolbar(true);
    } else {
      setShowToolbar(false);
    }
  };

  // CREATE FOLDER
  const createFolder = () => {
    if (!newFolder) return;

    const updated = [...folders, newFolder];

    setFolders(updated);

    Cookies.set(
      "story_folders",
      JSON.stringify(updated),
      { expires: 30 }
    );

    setSelectedFolder(newFolder);

    setNewFolder("");
    setShowFolderModal(false);
  };

  // SAVE STORY
  const saveStory = async () => {
    const content = editorRef.current?.innerHTML;

    if (!selectedFolder) {
      return setMessage("Hitamo folder.");
    }

    if (!episodeTitle || !content) {
      return setMessage("Andika inkuru.");
    }

    try {
      setLoading(true);

      const userDoc = doc(db, "netstore", username);

      const folderCollection = collection(
        userDoc,
        selectedFolder
      );

      const episodeDoc = doc(
        folderCollection,
        episodeTitle
      );

      await setDoc(episodeDoc, {
        title: episodeTitle,
        content,
        folder: selectedFolder,
        author: username,
        createdAt: serverTimestamp(),
      });

      setMessage("Inkuru yabitswe.");

      Cookies.remove("draft_story");
      Cookies.remove("draft_title");

      setShowSaveModal(false);

    } catch (err) {
      console.error(err);
      setMessage("Habaye ikibazo.");
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

          <button
            className={styles.iconBtn}
            onClick={() => setShowFolderModal(true)}
          >
            <FaFolderPlus />
          </button>

          <button
            className={styles.saveBtn}
            onClick={() => setShowSaveModal(true)}
          >
            <FaSave />
            Save
          </button>

        </div>
      </div>

      {/* FLOATING TOOLBAR */}
      {showToolbar && (
        <div className={styles.toolbar}>

          <button onClick={() => formatText("bold")}>
            <FaBold />
          </button>

          <button onClick={() => formatText("italic")}>
            <FaItalic />
          </button>

          <button onClick={() => formatText("underline")}>
            <FaUnderline />
          </button>

          <input
            type="color"
            onChange={(e) =>
              formatText("foreColor", e.target.value)
            }
          />

        </div>
      )}

      {/* EDITOR */}
      <div
        ref={editorRef}
        className={styles.editor}
        contentEditable
        suppressContentEditableWarning={true}
        onMouseUp={handleSelection}
        onKeyUp={handleSelection}
      />

      {/* CREATE FOLDER MODAL */}
      {showFolderModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>

            <h3>Create Folder</h3>

            <input
              type="text"
              placeholder="Folder name"
              className={styles.modalInput}
              value={newFolder}
              onChange={(e) =>
                setNewFolder(e.target.value)
              }
            />

            <button
              className={styles.modalBtn}
              onClick={createFolder}
            >
              Create
            </button>

          </div>
        </div>
      )}

      {/* SAVE MODAL */}
      {showSaveModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>

            <h3>Save Story</h3>

            <select
              className={styles.select}
              value={selectedFolder}
              onChange={(e) =>
                setSelectedFolder(e.target.value)
              }
            >
              <option value="">
                Select folder
              </option>

              {folders.map((folder, index) => (
                <option key={index} value={folder}>
                  {folder}
                </option>
              ))}
            </select>

            <button
              className={styles.modalBtn}
              onClick={saveStory}
              disabled={loading}
            >
              {loading ? "Saving..." : "Save"}
            </button>

          </div>
        </div>
      )}

      {message && (
        <div className={styles.message}>
          {message}
        </div>
      )}

    </div>
  );
}
