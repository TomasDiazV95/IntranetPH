// client/src/pages/CartaAutomatica.jsx
import React, { useState } from "react";
import axios from "axios";
import { saveAs } from "file-saver";

const CartaAutomatica = () => {
  const [formData, setFormData] = useState({
    nombre: "",
    cargo: "",
    motivo: "",
    fecha: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(
        "http://192.168.1.8:5555/carta",
        formData,
        { responseType: "blob" } // recibe archivo
      );
      saveAs(response.data, "Carta_Generada.docx");
    } catch (error) {
      console.error("Error al generar la carta:", error);
      alert("Ocurrió un error al generar la carta.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ padding: "20px" }}>
      <h2>Generador de Carta Automática</h2>
      <form onSubmit={handleSubmit} style={{ marginTop: "20px" }}>
        <div>
          <label>Nombre:</label>
          <input
            type="text"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label>Cargo:</label>
          <input
            type="text"
            name="cargo"
            value={formData.cargo}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label>Motivo:</label>
          <textarea
            name="motivo"
            value={formData.motivo}
            onChange={handleChange}
            required
          ></textarea>
        </div>

        <div>
          <label>Fecha:</label>
          <input
            type="date"
            name="fecha"
            value={formData.fecha}
            onChange={handleChange}
            required
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Generando..." : "Generar Carta"}
        </button>
      </form>
    </div>
  );
};

export default CartaAutomatica;
