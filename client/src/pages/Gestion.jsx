import { useState } from 'react';
import axios from 'axios';
import { Container, Form, Button } from 'react-bootstrap';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { nombreCarteras } from '../constants/carteras';


function Gestion() {
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [cartera, setCartera] = useState('');
  console.log(nombreCarteras);
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

  

/*   const descargarExcel = async () => {
    try {
        const fechaIniStr = fechaInicio;
        const fechaFinStr = fechaFin;
  
      const res = await axios.get('http://192.168.1.99:5555/gestion', {
        params: {
          fechaInicio: fechaIniStr,
          fechaFin: fechaFinStr,
          cartera
        }
      });
  
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(res.data);
      XLSX.utils.book_append_sheet(wb, ws, 'Gestion');
  
      const nombre = nombreCarteras[cartera] || `Cartera_${cartera}`;
      saveAs(new Blob([XLSX.write(wb, { bookType: 'xlsx', type: 'array' })]), `Gestion_${nombre}_${fechaIniStr}.xlsx`);
    } catch (err) {
      alert('Error al descargar Excel');
      console.error(err);
    }
  }; */

  const descargarExcel = async () => {
  try {
    const fechaIniStr = fechaInicio;
    const fechaFinStr = fechaFin;

    const res = await axios.get('http://192.168.1.8:5555/gestion', {
      params: {
        fechaInicio: fechaIniStr,
        fechaFin: fechaFinStr,
        cartera
      }
    });

    const ws = XLSX.utils.json_to_sheet(res.data);
    const csvData = XLSX.utils.sheet_to_csv(ws, { FS: ';' }); // ← separador personalizado

    const nombre = nombreCarteras[cartera] || `Cartera_${cartera}`;
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });

    saveAs(blob, `Gestion_${nombre}_${fechaIniStr}.csv`);
  } catch (err) {
    alert('Error al descargar CSV');
    console.error(err);
  }
};

  return (
    <Container className="mt-5">
      <h3 className="mb-4 text-center">Descargar Gestión</h3>
      <Form className="mx-auto" style={{ maxWidth: '600px' }}>
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
          <Button variant="success" onClick={descargarExcel}>
            Descargar Excel
          </Button>
        </div>
      </Form>

      
    </Container>
  );
  
}

export default Gestion;
