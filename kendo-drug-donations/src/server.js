import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();
const app = express();

app.use(cors()); // allow React dev server
app.use(express.json());

app.post("/api/search", async (req, res) => {
    try {
        const response = await fetch(
            "https://aws-us-east-2-1.rag.progress.cloud/api/v1/kb/739e03a5-97e5-4ead-86ac-1c55c3ee6ede/search",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${process.env.NUCLIA_API_KEY}`, // ✅ works!
                },
                body: JSON.stringify(req.body),
            }
        );

        const text = await response.text();
        res.status(response.status).send(text);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(5000, () =>
    console.log("Proxy running → http://localhost:5000/api/search")
);
