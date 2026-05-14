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

  // LOAD USER + DRAFTS
  useEffect(() => {

    const savedUsername = Cookies.get("username");

    if (savedUsername) {
      setUsername(savedUsername);
    }

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

  // AUTO SAVE
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

  // CLOSE TOOLBAR + MODALS OUTSIDE CLICK
  useEffect(() => {

    const closeThings = (e) => {

      if (
        toolbarRef.current &&
        !toolbarRef.current.contains(e.target)
      ) {
        setShowToolbar(false);
      }

      if (e.target.classList.contains(styles.modalOverlay)) {
        setShowFolderModal(false);
        setShowSaveModal(false);
      }

    };

    document.addEventListener("mousedown", closeThings);

    return () => {
      document.removeEventListener("mousedown", closeThings);
    };

  }, []);

  // FORMAT TEXT
  const formatText = (command, value = null) => {
    document.execCommand(command, false, value);
  };

  // CREATE FOLDER
  const createFolder = () => {

    if (!newFolder.trim()) return;

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
      return setMessage("Select folder.");
    }

    if (!episodeTitle || !content) {
      return setMessage("Complete story first.");
    }

    try {

      setLoading(true);

      const userDoc = doc(
        db,
        "netstore",
        username
      );

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

      setMessage("Story saved.");

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
          placeholder="Enter episode title..."
          className={styles.titleInput}
          value={episodeTitle}
          onChange={(e) =>
            setEpisodeTitle(e.target.value)
          }
        />

        <div className={styles.actions}>

          {/* TOOLBAR BUTTON */}

          <button
            className={styles.iconBtn}
            onClick={() =>
              setShowToolbar(!showToolbar)
            }
          >
            <FaPalette />
          </button>

          {/* CREATE FOLDER */}

          <button
            className={styles.iconBtn}
            onClick={() =>
              setShowFolderModal(true)
            }
          >
            <FaFolderPlus />
          </button>

          {/* SAVE */}

          <button
            className={styles.saveBtn}
            onClick={() =>
              setShowSaveModal(true)
            }
          >
            <FaSave />
            Save
          </button>

        </div>

      </div>

      {/* TOOLBAR */}

      {showToolbar && (

        <div
          ref={toolbarRef}
          className={styles.toolbar}
        >

          <button
            title="Bold"
            onClick={() =>
              formatText("bold")
            }
          >
            <FaBold />
          </button>

          <button
            title="Italic"
            onClick={() =>
              formatText("italic")
            }
          >
            <FaItalic />
          </button>

          <button
            title="Underline"
            onClick={() =>
              formatText("underline")
            }
          >
            <FaUnderline />
          </button>

          <input
            type="color"
            title="Text Color"
            onChange={(e) =>
              formatText(
                "foreColor",
                e.target.value
              )
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
        data-placeholder="Start writing your story here..."
      />

      {/* CREATE FOLDER MODAL */}

      {showFolderModal && (

        <div className={styles.modalOverlay}>

          <div className={styles.modal}>

            <h3>Create Folder</h3>

            <input
              type="text"
              placeholder="Enter folder name..."
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
              Create Folder
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
                Select folder...
              </option>

              {folders.map((folder, index) => (

                <option
                  key={index}
                  value={folder}
                >
                  {folder}
                </option>

              ))}

            </select>

            <button
              className={styles.modalBtn}
              onClick={saveStory}
              disabled={loading}
            >
              {loading
                ? "Saving..."
                : "Save Story"}
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
