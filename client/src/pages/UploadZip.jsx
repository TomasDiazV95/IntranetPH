import React, { useState } from 'react';
import axios from 'axios';

function UploadZip() {
  const [file, setFile] = useState(null);

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!file) return alert("Selecciona un archivo .zip");

    const formData = new FormData();
    formData.append('zip_file', file);

    try {
      const response = await axios.post('http://192.168.1.99:5555/upload', formData, {
        responseType: 'blob',
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      // Crear descarga
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'consolidado.xlsx');
      document.body.appendChild(link);
      link.click();
    } catch (err) {
      console.error(err);
      alert("Error al procesar el archivo");
    }
  };

  return (
    <form onSubmit={handleUpload}>
      <input type="file" accept=".zip" onChange={(e) => setFile(e.target.files[0])} required />
      <button type="submit">Subir y Consolidar</button>
    </form>
  );
}

export default UploadZip;
