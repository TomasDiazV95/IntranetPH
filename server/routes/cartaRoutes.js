// server/routes/cartaRoutes.js
const express = require("express");
const router = express.Router();
const { generarCarta } = require("../controllers/cartaController");

router.post("/generar", generarCarta);

module.exports = router;
