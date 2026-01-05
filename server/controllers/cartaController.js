// server/controllers/cartaController.js
const fs = require("fs");
const path = require("path");
const PizZip = require("pizzip");
const Docxtemplater = require("docxtemplater");

exports.generarCarta = (req, res) => {
  try {
    const { nombre, cargo, motivo, fecha } = req.body;

    const templatePath = path.resolve("server/templates/carta_base.docx");
    const templateFile = fs.readFileSync(templatePath, "binary");

    const zip = new PizZip(templateFile);
    const doc = new Docxtemplater(zip, { paragraphLoop: true, linebreaks: true });

    doc.render({ nombre, cargo, motivo, fecha });

    const buffer = doc.getZip().generate({ type: "nodebuffer" });

    res.setHeader("Content-Disposition", "attachment; filename=Carta_Generada.docx");
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    );
    res.send(buffer);
  } catch (error) {
    console.error("❌ Error al generar carta:", error);
    res.status(500).json({ message: "Error al generar la carta" });
  }
};
