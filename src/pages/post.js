// pages/post.js

import { useState, useRef } from "react";
import Head from "next/head";
import styles from "../styles/ost.module.css";

export default function PostPage() {
  const editorRef = useRef(null);

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState("");

  const handleFileChange = (e) => {
    const selected = e.target.files[0];

    if (!selected) return;

    setFile(selected);

    const url = URL.createObjectURL(selected);
    setPreview(url);
  };

  const handleSubmit = async () => {
    const content = editorRef.current?.innerHTML || "";

    if (!content.trim() && !file) {
      setMessage("Andika post cyangwa ushyireho media.");
      return;
    }

    try {
      setLoading(true);
      setMessage("");
      setProgress(0);

      const formData = new FormData();

      formData.append("content", content);

      if (file) {
        formData.append("media", file);
      }

      const xhr = new XMLHttpRequest();

      xhr.open("POST", "/api/facebook/post");

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = Math.round(
            (event.loaded * 100) / event.total
          );

          setProgress(percent);
        }
      };

      xhr.onload = () => {
        setLoading(false);

        if (xhr.status === 200) {
          setMessage("Post yashyizwe kuri Facebook.");

          editorRef.current.innerHTML = "";

          setFile(null);
          setPreview("");
          setProgress(0);
        } else {
          setMessage("Upload yanze.");
        }
      };

      xhr.onerror = () => {
        setLoading(false);
        setMessage("Network error.");
      };

      xhr.send(formData);
    } catch (err) {
      console.log(err);

      setLoading(false);
      setMessage("Hari ikibazo cyabaye.");
    }
  };

  const formatText = (command, value = null) => {
    document.execCommand(command, false, value);
  };

  return (
    <>
      <Head>
        <title>Facebook Auto Post</title>
      </Head>

      <div className={styles.container}>
        <div className={styles.card}>
          <h1 className={styles.title}>
            Facebook Auto Post
          </h1>

          <div className={styles.toolbar}>
            <button onClick={() => formatText("bold")}>
              B
            </button>

            <button onClick={() => formatText("italic")}>
              I
            </button>

            <button onClick={() => formatText("underline")}>
              U
            </button>

            <input
              type="color"
              onChange={(e) =>
                formatText("foreColor", e.target.value)
              }
            />

            <input
              type="color"
              onChange={(e) =>
                formatText("hiliteColor", e.target.value)
              }
            />
          </div>

          <div
            ref={editorRef}
            className={styles.editor}
            contentEditable
            suppressContentEditableWarning={true}
            spellCheck={false}
            placeholder="Andika post yawe..."
          />

          <label className={styles.uploadBox}>
            <input
              type="file"
              accept="image/*,video/*"
              hidden
              onChange={handleFileChange}
            />

            <span>
              {file
                ? file.name
                : "Hitamo image cyangwa video"}
            </span>
          </label>

          {preview && (
            <div className={styles.preview}>
              {file?.type?.startsWith("image") ? (
                <img src={preview} alt="preview" />
              ) : (
                <video
                  src={preview}
                  controls
                />
              )}
            </div>
          )}

          {loading && (
            <div className={styles.progressWrapper}>
              <div
                className={styles.progressBar}
                style={{
                  width: `${progress}%`,
                }}
              />
            </div>
          )}

          <button
            className={styles.postBtn}
            disabled={loading}
            onClick={handleSubmit}
          >
            {loading
              ? `Uploading ${progress}%`
              : "Post Now"}
          </button>

          {message && (
            <p className={styles.message}>
              {message}
            </p>
          )}
        </div>
      </div>
    </>
  );
}
