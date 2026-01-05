/* import React, { useState } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

function ContactoDirecto() {
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [loading, setLoading] = useState(false);

  const carteras = '520,521,522,523,524,525,526,527,530';
  const tipificaciones = 'TITULAR,CONTACTO_VALIDO,CONTACTO TITULAR';

  const validarRangoFechas = () => {
    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);
    const diferencia = (fin - inicio) / (1000 * 60 * 60 * 24);
    return diferencia <= 30 && diferencia >= 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validarRangoFechas()) {
      alert('El rango entre las fechas no puede ser mayor a 30 días ni negativo.');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('http://192.168.1.99:5555/contacto-directo', {
        fechaInicio,
        fechaFin,
        carteras,
        tipificaciones,
      });

      const data = response.data;
      if (data.length === 0) {
        alert('No se encontraron resultados.');
        return;
      }

      // Eliminar duplicados por RUT + teléfono
      const sinDuplicados = [];
      const claves = new Set();

      for (const item of data) {
        const clave = `${item.rut}_${item.telefono}`;
        if (!claves.has(clave)) {
          claves.add(clave);
          sinDuplicados.push(item);
        }
      }

      const worksheet = XLSX.utils.json_to_sheet(sinDuplicados);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Consulta');

      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
      const dia = new Date().toISOString().slice(0, 10);
      saveAs(blob, `Consolidados_ContactoDirecto_${dia}.xlsx`);
    } catch (error) {
      console.error('Error al realizar la consulta:', error);
      alert('Hubo un error al consultar los datos.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-4">
      <h1 className="mb-2">Exportar Contactos Directos</h1>
      <h5 className="mb-4 text-muted">Santander Consumer, Itaú, GM y Judicial</h5>

      <form onSubmit={handleSubmit} className="row g-3" style={{ maxWidth: '600px', margin: '0 auto' }}>
        <div className="col-md-6">
          <label className="form-label">Fecha Inicio:</label>
          <input
            type="date"
            className="form-control"
            value={fechaInicio}
            onChange={(e) => setFechaInicio(e.target.value)}
            required
          />
        </div>
        <div className="col-md-6">
          <label className="form-label">Fecha Fin:</label>
          <input
            type="date"
            className="form-control"
            value={fechaFin}
            onChange={(e) => setFechaFin(e.target.value)}
            required
          />
        </div>

        <div className="col-12 d-flex justify-content-center">
          <button type="submit" className="btn btn-success px-4">
            {loading ? 'Generando Excel...' : 'Exportar Excel'}
          </button>
        </div>
      </form>

      <div className="col-12 mt-5 text-center">
        <h6 className="text-muted">Desarrollado por: Tomás Ignacio Díaz</h6>
        
      </div>
    </div>
  );
}

export default ContactoDirecto;
 */

import React, { useState } from 'react';
import Papa from 'papaparse';
import axios from 'axios';
import { Form, Button, Container, Row, Col } from 'react-bootstrap';

const ContactoDirecto = () => {
  const [ruts, setRuts] = useState([]);
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [tipoDeudor, setTipoDeudor] = useState('TITULAR');
  const [isDownloading, setIsDownloading] = useState(false);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    if (file.name.endsWith('.csv')) {
      Papa.parse(file, {
        complete: (result) => {
          const datos = result.data.flat().map(rut => rut.replace(/\D/g, '')).filter(Boolean);
          setRuts(datos);
        }
      });
    } else if (file.name.endsWith('.txt')) {
      reader.onload = (e) => {
        const content = e.target.result;
        const datos = content.split(/\r?\n/).map(rut => rut.replace(/\D/g, '')).filter(Boolean);
        setRuts(datos);
      };
      reader.readAsText(file);
    } else {
      alert('Formato no compatible. Usa .txt o .csv');
    }
  };

  const validarRango = () => {
    const start = new Date(fechaInicio);
    const end = new Date(fechaFin);
    const diffMonths = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
    return diffMonths <= 7;
  };

  const handleDownload = async () => {
    if (ruts.length === 0 || !fechaInicio || !fechaFin || !tipoDeudor) {
      alert('Debes subir RUTs, seleccionar fechas y tipo de gestión.');
      return;
    }

    if (!validarRango()) {
      alert('El rango máximo permitido es de 7 meses');
      return;
    }

    setIsDownloading(true);

    try {
      const { data } = await axios.post('http://192.168.1.8:5555/contacto-directo', {
        ruts,
        fechaInicio,
        fechaFin,
        tipoDeudor
      });

      const csv = Papa.unparse(data, { delimiter: ';' });
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `resultado_${new Date().toISOString().slice(0,10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error en descarga:', error);
      alert('Hubo un error al consultar los datos');
    } finally {
      setIsDownloading(false);
    }
  };

  const CARTERAS = ['Santander e Itau', 'GM y GM Judicial', 'Bco Santander', 'Bco Internacional', 'Caja La Araucana y Cpech', 'Tanner y Prosche'];
  const TIPOS_GESTION = ['TITULAR', 'CONTACTO_VALIDO', 'CONTACTO TITULAR', 'Contactado', 'CONTACTO DIRECTO', 'DIRECTO'];


  return (
    <Container className="py-4">
      <h2>Consulta de Fono</h2>

      <Form.Group className="mb-3">
        <Form.Label>Sube archivo con RUTs (.txt o .csv)</Form.Label>
        <Form.Control type="file" accept=".txt,.csv" onChange={handleFileUpload} />
      </Form.Group>

      <Row className="mb-3">
        <Col>
          <Form.Label>Fecha inicio</Form.Label>
          <Form.Control
            type="date"
            value={fechaInicio}
            onChange={(e) => setFechaInicio(e.target.value)}
          />
        </Col>
        <Col>
          <Form.Label>Fecha fin</Form.Label>
          <Form.Control
            type="date"
            value={fechaFin}
            onChange={(e) => setFechaFin(e.target.value)}
          />
        </Col>
        <Col>
          <Form.Label>Tipo de gestión</Form.Label>
          <Form.Select value={tipoDeudor} onChange={(e) => setTipoDeudor(e.target.value)}>
            <option value="TITULAR">TITULAR</option>
            <option value="CONTACTO_VALIDO">CONTACTO_VALIDO</option>
            <option value="CONTACTO TITULAR">CONTACTO TITULAR</option>
            <option value="Contactado">Contactado</option>
            <option value="CONTACTO DIRECTO">CONTACTO DIRECTO</option>
            <option value="DIRECTO">DIRECTO</option>
          </Form.Select>
        </Col>
      </Row>

      <Button
        variant="success"
        onClick={handleDownload}
        disabled={isDownloading || ruts.length === 0}
      >
        {isDownloading ? 'Generando CSV...' : 'Descargar CSV'}
      </Button>

      {isDownloading && (
        <div className="mt-3">
          <img src="https://i.gifer.com/YCZH.gif" alt="Descargando..." width="60" />
          <p>Generando archivo, por favor espera...</p>
        </div>
      )}

      <div className="mt-4">
        <h5>Opciones disponibles</h5>
        <table className="table table-bordered table-sm">
          <thead>
            <tr>
              <th>Carteras disponibles</th>
              <th>Tipos de gestión disponibles</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: Math.max(CARTERAS.length, TIPOS_GESTION.length) }).map((_, idx) => (
              <tr key={idx}>
                <td>{CARTERAS[idx] || ''}</td>
                <td>{TIPOS_GESTION[idx] || ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </Container>
  );
};

export default ContactoDirecto;