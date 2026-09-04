require("dotenv").config();

const express = require("express");
const cors = require("cors");
const dbCollections = require("./Config/DatabaseConnection");
const auth = require("./Routes/Auth");
const projects = require("./Routes/Projects");
const publicRoutes = require("./Routes/Public");

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());
dbCollections();

app.get("/", (req, res) => {
  res.status(200).send({
    Title: "PulseOps",
    Tagline: "Api Awake",
    message: "This is Base Url"
  });
});

// Standard route mounts
app.use("/auth", auth);
app.use("/projects", projects);
app.use("/public", publicRoutes);

// Optional /api prefix alias mounts for frontend flexibility
app.use("/api/auth", auth);
app.use("/api/projects", projects);
app.use("/api/public", publicRoutes);

app.use((req, res) => {
  res.status(404).send({
    Title: "PulseOps",
    Tagline: "Api Awake",
    message: "Route not found"
  });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});