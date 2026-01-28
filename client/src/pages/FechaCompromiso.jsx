import React, { useState } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { Container, Form, Button } from 'react-bootstrap';
import { nombreCarteras } from '../constants/carteras';

console.log(nombreCarteras)
/* const nombreCarteras = {
    481: 'Caja18',
    518: 'SCJudicial',
    519: 'Tanner',
    520: 'GeneralMotors',
    521: 'GMJudicial',
    522: 'ItauCastigo',
    523: 'ItauVencida',
    525: 'SCTerreno',
    526: 'SCTelefonia',
    527: 'SCAnticipa',
    528: 'Porsche',
    529: 'Cpech',
    530: 'Hipotecario',
    531: 'CajaLaAraucana',
    532: 'BancoInternacional',
    266: 'Hipotecario C3'
}; */

function FechaCompromiso() {
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [cartera, setCartera] = useState('');
  const [loading, setLoading] = useState(false);

  const descargarExcel = async () => {
    if (!fechaInicio || !fechaFin || !cartera) {
      alert('Debe completar todos los campos.');
      return;
    }

    setLoading(true);
    try {
      const res = await axios.get('http://192.168.1.75:5555/fecha-compromiso', {
        params: { fechaInicio, fechaFin, cartera }
      });

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(res.data);
      XLSX.utils.book_append_sheet(wb, ws, 'FechaCompromiso');

      const blob = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const nombre = nombreCarteras[cartera] || `Cartera_${cartera}`;
      saveAs(new Blob([blob]), `FechaCompromiso_${nombre}_${fechaInicio}.xlsx`);
    } catch (err) {
      alert('Error al generar el Excel');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="mt-4">
      <h3>Descargar Fecha de Compromiso</h3>
      <Form>
        <Form.Group className="mb-3">
          <Form.Label>Fecha Inicio</Form.Label>
          <Form.Control type="date" value={fechaInicio} onChange={e => setFechaInicio(e.target.value)} />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Fecha Fin</Form.Label>
          <Form.Control type="date" value={fechaFin} onChange={e => setFechaFin(e.target.value)} />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Cartera</Form.Label>
          <Form.Select value={cartera} onChange={e => setCartera(e.target.value)}>
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

        <Button variant="success" onClick={descargarExcel} disabled={loading}>
          {loading ? 'Generando Excel...' : 'Descargar Excel'}
        </Button>
      </Form>
    </Container>
  );
}

export default FechaCompromiso;
