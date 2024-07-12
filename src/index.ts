import express from "express";
import dotenv from "dotenv";
import scraping from "./scrap";

dotenv.config();

const app = express();
const port = 3000;
const url = process.env.BASE_URL;

const requiredHashLength = 8;

app.get("/data/:hash", async (req, res) => {
  try {
    const hash = req.params.hash;
    const fullUrl = `${url}${hash}`;

    if (!hash) {
      return res.status(400).send("Missing hash parameter");
    }

    if (hash.length !== requiredHashLength) {
      return res
        .status(400)
        .send(`Invalid hash length. Expected ${requiredHashLength} characters`);
    }

    const scrappe = await scraping(fullUrl);

    if (!scrappe) {
      return res.status(404).send("Unavailable data");
    }

    res.json(scrappe);
  } catch (error) {
    console.error("Scraping error:", error);
    res.status(500).send("Error retrieving the data");
  }
});

app.listen(port, () => {
  console.log(`listening on port ${port}`);
});
