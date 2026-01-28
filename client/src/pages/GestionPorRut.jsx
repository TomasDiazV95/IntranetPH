import { useState } from 'react';
import axios from 'axios';
import { Container, Form, Button } from 'react-bootstrap';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import 'react-datepicker/dist/react-datepicker.css';
import { nombreCarteras } from '../constants/carteras';

function limpiarRutSinDv(valor) {
  // deja SOLO números (sin puntos, sin guión, sin DV)
  return (valor || '').toString().replace(/\D/g, '');
}

function GestionPorRut() {
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [cartera, setCartera] = useState('');
  const [rut, setRut] = useState('');

  const descargarExcel = async () => {
    try {
      const rutLimpio = limpiarRutSinDv(rut);

      if (!rutLimpio) {
        alert('Debes ingresar un RUT (sin DV)');
        return;
      }

      const res = await axios.get('http://192.168.1.75:5555/gestionRut', {
        params: {
          fechaInicio,
          fechaFin,
          cartera,
          rut: rutLimpio, // ← rut sin dv
        },
      });

      const ws = XLSX.utils.json_to_sheet(res.data);
      const csvData = XLSX.utils.sheet_to_csv(ws, { FS: ';' });

      const nombre = nombreCarteras[cartera] || `Cartera_${cartera}`;
      const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });

      saveAs(blob, `Gestion_${nombre}_RUT_${rutLimpio}_${fechaInicio}.csv`);
    } /* catch (err) {
      alert('Error al descargar CSV');
      console.error(err);
    } */

    catch (err) {
    console.error("❌ Axios error completo:", err);

    const status = err?.response?.status;
    const data = err?.response?.data;
    const msg = err?.message;

    alert(
      `Error al descargar CSV\n` +
      `status: ${status ?? "sin status"}\n` +
      `msg: ${msg ?? "sin mensaje"}\n` +
      `data: ${data ? JSON.stringify(data) : "sin data"}`
    );
  }
  };

  return (
    <Container className="mt-5">
      <h3 className="mb-4 text-center">Descargar Gestión por RUT (sin DV)</h3>

      <Form className="mx-auto" style={{ maxWidth: '600px' }}>
        <Form.Group className="mb-3">
          <Form.Label>RUT (sin DV)</Form.Label>
          <Form.Control
            type="text"
            value={rut}
            inputMode="numeric"
            placeholder="Ej: 12345678"
            onChange={(e) => setRut(e.target.value)}
          />
          <Form.Text muted>
            Ingresa solo el número del RUT, sin puntos, sin guión y sin dígito verificador.
          </Form.Text>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Fecha Inicio</Form.Label>
          <Form.Control
            type="date"
            value={fechaInicio}
            onChange={(e) => setFechaInicio(e.target.value)}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Fecha Fin</Form.Label>
          <Form.Control
            type="date"
            value={fechaFin}
            onChange={(e) => setFechaFin(e.target.value)}
          />
        </Form.Group>

        <Form.Group className="mb-4">
          <Form.Label>Cartera</Form.Label>
          <Form.Select
            value={cartera}
            onChange={(e) => setCartera(e.target.value)}
          >
            <option value="">Seleccionar...</option>
            <option value="481">Caja 18</option>
            <option value="518">SC Judicial</option>
            <option value="519">Tanner</option>
            <option value="520">General Motors</option>
            <option value="521">Gm Judicial</option>
            <option value="522">Itaú Castigo</option>
            <option value="523">Itaú Vencida</option>
            <option value="525">SC Terreno</option>
            <option value="526">SC Telefonía</option>
            <option value="527">SC Anticipa</option>
            <option value="528">Porsche</option>
            <option value="529">Cpech</option>
            <option value="530">Santander Hipotecario</option>
            <option value="531">Caja la Araucana</option>
            <option value="532">Banco Internacional</option>
            <option value="266">Hipotecario C3</option>
          </Form.Select>
        </Form.Group>

        <div className="d-grid">
          <Button
            variant="success"
            onClick={descargarExcel}
            disabled={!rut || !fechaInicio || !fechaFin || !cartera}
          >
            Descargar Excel
          </Button>
        </div>
      </Form>
    </Container>
  );
}

export default GestionPorRut;
