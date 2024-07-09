const router = require("express").Router();
const { me } = require("../controllers/userController");
const { tokenCheck } = require("../middlewares/auth");

router.get("/me", tokenCheck, me);

module.exports = router;
