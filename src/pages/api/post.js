export const config = {
  api: {
    bodyParser: true,
  },
};

// ⚠️ PUT YOUR VALUES HERE
const PAGE_ID = "YOUR_PAGE_ID_HERE";
const PAGE_ACCESS_TOKEN = "YOUR_PAGE_ACCESS_TOKEN_HERE";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Only POST allowed" });
  }

  try {
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({
        success: false,
        message: "No content provided",
      });
    }

    // =====================
    // TEXT POST ONLY
    // =====================
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
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      error: "Server error while posting",
    });
  }
}
