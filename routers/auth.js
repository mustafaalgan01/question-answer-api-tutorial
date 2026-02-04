const express = require("express");
const { register, login, logout, forgotpassword, resetPassword, imageUpload, getUser } = require("../controllers/auth");
const { getAccessToRoute } = require("../middlewares/authorization/auth");
const profileImageUpload = require("../middlewares/libraries/profileUploadImage");
const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/logout", logout);
router.post("/forgotpassword", forgotpassword);
router.put("/resetpassword", resetPassword);
router.get("/profile", getAccessToRoute, getUser);
router.post("/upload", [getAccessToRoute, profileImageUpload.single("profile_image")], imageUpload);
module.exports = router;