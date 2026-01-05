// EmailConsulta.jsx
import React, { useState } from 'react';
import Papa from 'papaparse';
import axios from 'axios';
import { Button, Form, Container } from 'react-bootstrap';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

function EmailConsulta() {
  const [ruts, setRuts] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        const soloRuts = result.data.map(row => row.rut?.trim()).filter(Boolean);
        setRuts(soloRuts);
      },
    });
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (ruts.length === 0) {
      alert("Debes subir un archivo con RUTs.");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('http://192.168.1.8:5555/consulta-email', { ruts });
      const data = response.data;

      // 🟡 Formatear fechas en 'dd-mm-yyyy'
      const datosFormateados = data.map(item => ({
        ...item,
        fechaInsert: item.fechaInsert
        ? new Date(item.fechaInsert).toLocaleString('es-CL', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      }).replace(',', '') // quita la coma si aparece
    : ''
}));
      const worksheet = XLSX.utils.json_to_sheet(datosFormateados);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Resultado');

      const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([buffer], { type: 'application/octet-stream' });
      saveAs(blob, `Consulta_Email_${new Date().toISOString().slice(0, 10)}.xlsx`);
    } catch (error) {
      console.error("Error al consultar:", error);
      alert("Hubo un error en la consulta.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-4">
      <h2>Consulta de Email por RUT</h2>
      <Form onSubmit={handleSubmit}>
        <Form.Group controlId="formFile" className="mb-3">
          <Form.Label>Sube el archivo con RUTs (.txt o .csv con cabecera "rut")</Form.Label>
          <Form.Control type="file" accept=".txt,.csv" onChange={handleFileUpload} required />
        </Form.Group>
        <Button type="submit" variant="success" disabled={loading}>
          {loading ? 'Consultando...' : 'Exportar Excel'}
        </Button>
      </Form>
    </Container>
  );
}

export default EmailConsulta;
