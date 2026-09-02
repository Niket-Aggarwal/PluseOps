require("dotenv").config();

const express = require("express")
const cors = require("cors");
const dbCollections = require("./Config/DatabaseConnection")
const auth = require("./Routes/Auth")
const projects = require("./Routes/Projects")
const publicRoutes = require("./Routes/Public")

const app = express()
const port = process.env.PORT || 3000

app.use(express.json())
app.use(cors());
dbCollections()

app.get("/", (req, res) => {
  res.status(200).send({
    Title: "PluseOps",
    Tagline: "Api Awake",
    message: "This is Base Url"
  });
});

app.use("/auth", auth)
app.use("/projects", projects)
app.use("/public", publicRoutes)

app.use((req, res) => {
  res.status(404).send({
    Title: "PluseOps",
    Tagline: "Api Awake",
    message: "Route not found"
  });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});