import formidable from "formidable";
import fs from "fs";
import path from "path";
import fetch from "node-fetch";

export const config = {
  api: {
    bodyParser: false,
  },
};

// ⚠️ PUT YOUR VALUES HERE DIRECTLY
const PAGE_ID = "YOUR_PAGE_ID_HERE";
const PAGE_ACCESS_TOKEN = "YOUR_PAGE_ACCESS_TOKEN_HERE";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Only POST allowed" });
  }

  const form = new formidable.IncomingForm({
    multiples: false,
    keepExtensions: true,
  });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res.status(500).json({ error: "Form parsing failed" });
    }

    try {
      const content = fields.content || "";
      const media = files.media;

      // =====================
      // TEXT POST
      // =====================
      if (!media) {
        const response = await fetch(
          `https://graph.facebook.com/v19.0/${PAGE_ID}/feed`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              message: content,
              access_token: PAGE_ACCESS_TOKEN,
            }),
          }
        );

        const data = await response.json();

        return res.status(200).json({
          success: true,
          type: "text",
          data,
        });
      }

      const fileStream = fs.createReadStream(media.filepath);

      const isVideo = media.mimetype?.startsWith("video");

      // =====================
      // VIDEO POST
      // =====================
      if (isVideo) {
        const formData = new FormData();
        formData.append("description", content);
        formData.append("access_token", PAGE_ACCESS_TOKEN);
        formData.append("source", fileStream, media.originalFilename);

        const response = await fetch(
          `https://graph-video.facebook.com/v19.0/${PAGE_ID}/videos`,
          {
            method: "POST",
            body: formData,
          }
        );

        const data = await response.json();

        return res.status(200).json({
          success: true,
          type: "video",
          data,
        });
      }

      // =====================
      // IMAGE POST
      // =====================
      const imageForm = new FormData();

      imageForm.append("caption", content);
      imageForm.append("access_token", PAGE_ACCESS_TOKEN);
      imageForm.append("source", fileStream, media.originalFilename);

      const response = await fetch(
        `https://graph.facebook.com/v19.0/${PAGE_ID}/photos`,
        {
          method: "POST",
          body: imageForm,
        }
      );

      const data = await response.json();

      return res.status(200).json({
        success: true,
        type: "image",
        data,
      });
    } catch (error) {
      console.log(error);

      return res.status(500).json({
        success: false,
        error: "Server crashed while posting",
      });
    }
  });
}
