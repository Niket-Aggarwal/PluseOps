require("dotenv").config();

const express = require("express")
const cors = require("cors");


const app = express()
const port = process.env.Port || 3000


app.use(express.json())
app.use(cors());


app.get("/", (req, res) => {
  res.status(200).send({
    Title: "PluseOps",
    Tagline: "Api Awake",
    message: "This is Base Url"
  });
});


app.use((req, res) => {
  res.status(200).send({
    Title: "PluseOps",
    Tagline: "Api Awake",
    message: "Route no created"
  });
});


app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});