const express = require("express");
router = express.Router();
controller = require("../controller/controller");
authController = require("../controller/authController");

// Auth routes
router.post("/api/register", authController.registerUser);
router.post("/api/login", authController.loginUser);
router.post("/api/logout", authController.logoutUser);

// Main routes
router.get("/",controller.home)

// Protected meeting routes
router.post("/newMeeting", authController.requireAuth, controller.newMeeting);
router.post("/joinMeeting", authController.requireAuth, controller.joinMeeting);
router.post("/inviteParticipant", authController.requireAuth, controller.inviteParticipant);
router.get("/:room", authController.requireAuth, controller.joinMeetingRoom);

module.exports = router;