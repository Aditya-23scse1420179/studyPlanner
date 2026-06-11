const express = require("express");
const router = express.Router();

const {
  getSkills,
  getTrendingSkills,
} = require("../controllers/knowledge.controller");

const { isAuthenticated } = require("../middlewares/auth");

// All knowledge routes are protected
router.use(isAuthenticated);

// GET /api/v1/skills?search=string
router.get("/", getSkills);

// GET /api/v1/skills/trending
router.get("/trending", getTrendingSkills);

module.exports = router;