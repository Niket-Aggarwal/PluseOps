const express = require("express")
const { Base, ActiveSession, GoogleLogin } = require("../Controllers/authController")
const router = express.Router()

router.get("/", Base)
router.post("/login", GoogleLogin)
router.get("/session", ActiveSession)

module.exports = router