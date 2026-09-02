const express = require("express");
const router = express.Router();
const { getPublicStatus } = require("../Controllers/publicController");

router.get("/status/:publicStatusId", getPublicStatus);

module.exports = router;