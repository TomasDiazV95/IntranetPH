const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const AdmZip = require('adm-zip');
const XLSX = require('xlsx');

const app = express();
require('dotenv').config();
const db = require('./db'); 
const PORT = process.env.PORT || 5555;

// Nueva importación de rutas
const cartaRoutes = require('./routes/cartaRoutes');

app.use(cors());

// AUMENTAR LÍMITE DE TAMAÑO DE REQUEST
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));


// Login
app.post('/login', (req, res) => {
    const { username, password } = req.body;
  
    // Simulación: reemplaza con tu lógica real si tienes usuarios en DB
    if (username === 'admin' && password === '12345') {
      return res.json({ success: true, user: username });
    } else {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }
  });
  

// Ruta Gestion
app.get('/gestion', async (req, res) => {
    const { fechaInicio, fechaFin, cartera } = req.query;
  
    if (!fechaInicio || !fechaFin || !cartera) {
      return res.status(400).json({ error: 'Parámetros requeridos: fechaInicio, fechaFin, cartera' });
    }
  
    const query = `
      SELECT
          cliente.rut,
          cliente.dv,
          cliente.nombreCliente,
          UPPER(gestion.username) AS UsuarioGestion, 
          tipogestion.nombre AS AccionGestion,
          tipodeudor.nombre AS ContactoGestion,
          respuesta.nombre AS RespuestaGestion,
          gestion.observaciones,
          DATE_FORMAT( gestion.fechaInsert, '%d-%m-%Y' ) AS GestionFecha,
          DATE_FORMAT( gestion.fechaInsert, '%T' ) AS GestionHora,
          gestion.nroDocumento,
          IF(telefono.telefono IS NULL, gestion.fono, telefono.telefono) as telefono
      FROM
          gestion
      LEFT JOIN cliente on gestion.rut=cliente.rut
      LEFT JOIN tipogestion on gestion.idTipoGestion=tipogestion.idTipoGestion
      LEFT JOIN tipodeudor on gestion.idTipoDeudor=tipodeudor.idTipoDeudor
      LEFT JOIN respuesta on gestion.idRespuesta=respuesta.idRespuesta
      LEFT JOIN telefono on gestion.idTelefono=telefono.idTelefono
      WHERE gestion.idCartera IN (?) AND gestion.fechaInsert BETWEEN CONCAT(?, ' 00:00:00') AND CONCAT(?, ' 23:59:59')
      GROUP BY 1,9,10,12
  
      UNION ALL
  
      SELECT
          cliente.rut,
          cliente.dv,
          cliente.nombreCliente as nombreCliente,
          vicidial_log.user AS UsuarioGestion,
          'Gestion Discador' AS AccionGestion,
          'Gestion Discador' AS ContactoGestion,
          vicidial_log.status AS RespuestaGestion,
          'Llamada por Discador' as obs,
          DATE_FORMAT( vicidial_log.call_date, '%d-%m-%Y' ) AS GestionFecha,
          DATE_FORMAT( vicidial_log.call_date, '%T' ) AS GestionHora,
          '' as datadocu,
          vicidial_log.phone_number
      FROM
          vicidial_log
      LEFT JOIN vicidial_list on vicidial_log.lead_id=vicidial_list.lead_id
      LEFT JOIN cliente on vicidial_list.vendor_lead_code=cliente.rut
      WHERE vicidial_log.user='VDAD' AND
          vicidial_list.postal_code IN (?) AND vicidial_log.call_date BETWEEN CONCAT(?, ' 00:00:00') AND CONCAT(?, ' 23:59:59');
    `;
  
    try {
        const [rows] = await db.query(query, [
          cartera, fechaInicio, fechaFin,
          cartera, fechaInicio, fechaFin
        ]);
        res.json(rows);
      } catch (error) {
        console.error('❌ Error al ejecutar consulta /gestion:', error);  // 👈 esto mostrará el detalle
        res.status(500).json({ error: 'Error al obtener datos de gestión' });
      }
    });


// Ruta Contacto Directo

function limpiarTelefono(fono) {
  if (!fono) return null;

  const blacklist = [
    '27272727',
    '69696969',
    '11111111',
    '22222222',
    '33333333',
    '44444444',
    '55555555',
    '66666666',
    '77777777',
    '88888888',
    '99999999',
    '932323232',
    '927272727',
    '969696969',
    '999991100',
    '989898989',
    '225333333',
    '212345678',
    '221111111',
    '220222222',
    '221212112',
    '220002000',
    '220200000',
    '220202000',
    '212211221',
    '220202020',
    '222101111',
    '220020000',
    '221234567',
    '221160000',
    '912345678',
    '996969696',
    '969696969',
    '222222226',
    '999435440',
    '911111111',
    '345432345',
    '223232323',
    '998847842',
    '951212121',
    '222334455',
    '223456789',
    '988887777',
    '988888888',
    '222345678',
    '222531231',
    '987654345',
    '934010288',
    '227381000',
    '222005000',
    '989898989',
    '997381818',
    '987654321',
    '223851000',
    '955882358',
    '222999700',
    '512531231',
    '222005556',
    '987620592',
    '985374360',
    '642200835',


    // Puedes agregar más según detectes patrones falsos
  ];

  // Elimina todo lo que no sea número
  const limpio = fono.replace(/\D/g, '')

  // Reglas: largo válido
  if (limpio.length < 8 || limpio.length > 11) return null;

  // Evitar números con todos los dígitos iguales (ej: 99999999)
  if (/^(\d)\1+$/.test(limpio)) return null;

  // Eliminar si está en la blacklist exacta
  if (blacklist.includes(limpio)) return null;

  return limpio;
}

/* app.post('/contacto-directo', async (req, res) => {
    const { fechaInicio, fechaFin, carteras, tipificaciones } = req.body;
  
    try {
      const [rows] = await db.execute(
        `
        SELECT
            cliente.rut,
            tipogestion.nombre AS AccionGestion,
            tipodeudor.nombre AS ContactoGestion,
            DATE_FORMAT(gestion.fechaInsert, '%d-%m-%Y') AS GestionFecha,
            DATE_FORMAT(gestion.fechaInsert, '%T') AS GestionHora,
            IF(telefono.telefono IS NULL, gestion.fono, telefono.telefono) AS telefono
        FROM
            gestion
        LEFT JOIN cliente ON gestion.rut = cliente.rut
        LEFT JOIN tipogestion ON gestion.idTipoGestion = tipogestion.idTipoGestion
        LEFT JOIN tipodeudor ON gestion.idTipoDeudor = tipodeudor.idTipoDeudor
        LEFT JOIN telefono ON gestion.idTelefono = telefono.idTelefono
        WHERE
            gestion.idGestion IN (
                SELECT MIN(g2.idGestion)
                FROM gestion g2
                LEFT JOIN telefono t2 ON g2.idTelefono = t2.idTelefono
                WHERE
                    g2.fechaInsert BETWEEN ? AND ?
                    AND FIND_IN_SET(g2.idCartera, ?)
                GROUP BY
                    g2.rut,
                    IF(t2.telefono IS NULL, g2.fono, t2.telefono)
            )
            AND FIND_IN_SET(tipodeudor.nombre COLLATE utf8_general_ci, ?)
        ORDER BY cliente.rut;
        `,
        [
          `${fechaInicio} 00:00:00`,
          `${fechaFin} 23:59:59`,
          carteras,
          tipificaciones,
        ]
      );
  
      res.json(rows);
    } catch (error) {
      console.error('❌ Error en /contacto-directo:', error);
      res.status(500).json({ error: 'Error al ejecutar la consulta.' });
    }
  });
 */
app.post('/contacto-directo', async (req, res) => {
  let { ruts, fechaInicio, fechaFin, tipoDeudor } = req.body;

  // Validaciones iniciales
  if (!Array.isArray(ruts) || ruts.length === 0) {
    return res.status(400).json({ error: 'Lista de RUTs vacía o inválida' });
  }

  if (!fechaInicio || !fechaFin || typeof tipoDeudor !== 'string' || tipoDeudor.trim() === '') {
    return res.status(400).json({ error: 'Debes enviar fechaInicio, fechaFin y tipoDeudor válidos' });
  }

  // Validar rango de fechas
  const start = new Date(fechaInicio);
  const end = new Date(fechaFin);
  const diffMonths = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());

  if (diffMonths > 7) {
    return res.status(400).json({ error: 'El rango máximo permitido es de 7 meses' });
  }

  // Limpiar y validar los RUTs recibidos
  const rutsLimpios = ruts
    .filter(rut => typeof rut === 'string' && rut.trim() !== '')
    .map(rut => rut.trim());

  if (rutsLimpios.length === 0) {
    return res.status(400).json({ error: 'Todos los RUTs son inválidos' });
  }

  const fechaInicioSQL = `${fechaInicio} 00:00:00`;
  const fechaFinSQL = `${fechaFin} 23:59:59`;

  // Parámetros para la consulta
  const params = [...rutsLimpios, tipoDeudor.trim(), fechaInicioSQL, fechaFinSQL];

  // Log de control
  console.log('🟡 Parámetros enviados a la consulta:', params);
  if (params.includes(undefined)) {
    console.error('‼️ Hay un valor undefined en los parámetros SQL:', params);
    return res.status(400).json({ error: 'Uno o más parámetros son inválidos (undefined)' });
  }

  const placeholders = rutsLimpios.map(() => '?').join(',');

  const sql = `
    SELECT
      cliente.rut,
      IF(telefono.telefono IS NULL, gestion.fono, telefono.telefono) AS telefono
    FROM gestion
    LEFT JOIN cliente ON gestion.rut = cliente.rut
    LEFT JOIN tipodeudor ON gestion.idTipoDeudor = tipodeudor.idTipoDeudor
    LEFT JOIN telefono ON gestion.idTelefono = telefono.idTelefono
    WHERE gestion.rut IN (${placeholders})
      AND tipodeudor.nombre = ?
      AND gestion.fechaInsert BETWEEN ? AND ?
    GROUP BY cliente.rut, telefono
    ORDER BY cliente.rut
  `;

try {
  const [rows] = await db.query(sql, params);

  const resultadosLimpios = rows
    .map(row => {
      const fonoLimpio = limpiarTelefono(row.telefono);
      if (!fonoLimpio) return null; // descarta fonos inválidos
      return {
        rut: row.rut,
        telefono: fonoLimpio
      };
    })
    .filter(row => row !== null); // filtra los que quedaron como null

  res.json(resultadosLimpios);
  } catch (err) {
    console.error('❌ Error en la consulta:', err);
    res.status(500).json({ error: 'Error al ejecutar la consulta SQL' });
  }
});


// Ruta Fecha Compromiso
app.get('/fecha-compromiso', async (req, res) => {
    const { fechaInicio, fechaFin, cartera } = req.query;
  
    if (!fechaInicio || !fechaFin || !cartera) {
      return res.status(400).json({ error: 'Faltan parámetros requeridos.' });
    }
  
    const query = `
      SELECT
        cartera.nombre AS NombreCartera,
        CONCAT(DATE_FORMAT(gestion.fechaInsert, '%d-%m-%Y'), ' ', DATE_FORMAT(gestion.fechaInsert, '%T')) AS FechaGestion,
        DATE_FORMAT(compromiso.fechaCompromiso, '%d-%m-%Y') AS FechaCompromiso,
        compromiso.monto AS MontoCompromiso,
        cliente.rut AS RutCliente,
        gestion.nroDocumento AS NroOperacion,
        UPPER(gestion.username) AS UsuarioGestion
      FROM gestion
      LEFT JOIN cliente ON gestion.rut = cliente.rut
      LEFT JOIN compromiso ON gestion.idGestion = compromiso.idGestion
      LEFT JOIN cartera ON gestion.idCartera = cartera.idCartera
      WHERE
        gestion.idCartera IN (?) AND
        gestion.fechaInsert BETWEEN CONCAT(?, ' 00:00:00') AND CONCAT(?, ' 23:59:59') AND
        compromiso.fechaCompromiso IS NOT NULL
    `;
  
    try {
      const [rows] = await db.execute(query, [cartera, fechaInicio, fechaFin]);
      res.json(rows);
    } catch (error) {
      console.error('❌ Error en /fecha-compromiso:', error);
      res.status(500).json({ error: 'Error al obtener datos' });
    }
  });


// Rut Gestion + Fecha de Compromiso
app.get('/gestion-compromiso', async (req, res) => {
    const { fechaInicio, fechaFin, cartera } = req.query;
  
    if (!fechaInicio || !fechaFin || !cartera) {
      return res.status(400).json({ error: 'Parámetros requeridos: fechaInicio, fechaFin, cartera' });
    }
  
    const query = `
      SELECT
        cliente.rut,
        cliente.dv,
        cliente.nombreCliente,
        UPPER(gestion.username) AS UsuarioGestion, 
        tipogestion.nombre AS AccionGestion,
        tipodeudor.nombre AS ContactoGestion,
        respuesta.nombre AS RespuestaGestion,
        gestion.observaciones,
        DATE_FORMAT(gestion.fechaInsert, '%d-%m-%Y') AS GestionFecha,
        DATE_FORMAT(gestion.fechaInsert, '%T') AS GestionHora,
        gestion.nroDocumento,
        IF(telefono.telefono IS NULL, gestion.fono, telefono.telefono) AS telefono,
        DATE_FORMAT(compromiso.fechaCompromiso,'%d-%m-%Y') AS Fecha_compromiso,
        compromiso.monto AS Monto_Compromiso
  
      FROM gestion
      LEFT JOIN cliente ON gestion.rut = cliente.rut
      LEFT JOIN tipogestion ON gestion.idTipoGestion = tipogestion.idTipoGestion
      LEFT JOIN tipodeudor ON gestion.idTipoDeudor = tipodeudor.idTipoDeudor
      LEFT JOIN respuesta ON gestion.idRespuesta = respuesta.idRespuesta
      LEFT JOIN telefono ON gestion.idTelefono = telefono.idTelefono
      LEFT JOIN compromiso ON gestion.idGestion = compromiso.idGestion
      WHERE
        gestion.idCartera IN (?) AND
        gestion.fechaInsert BETWEEN CONCAT(?, ' 00:00:00') AND CONCAT(?, ' 23:59:00')
      GROUP BY 1, 9, 10, 12
  
      UNION ALL
  
      SELECT
        cliente.rut,
        cliente.dv,
        cliente.nombreCliente,
        vicidial_log.user AS UsuarioGestion,
        'Gestion Discador',
        'Gestion Discador',
        vicidial_log.status,
        'Llamada por Discador',
        DATE_FORMAT(vicidial_log.call_date, '%d-%m-%Y'),
        DATE_FORMAT(vicidial_log.call_date, '%T'),
        '',
        vicidial_log.phone_number,
        '',
        NULL
      FROM vicidial_log
      LEFT JOIN vicidial_list ON vicidial_log.lead_id = vicidial_list.lead_id
      LEFT JOIN cliente ON vicidial_list.vendor_lead_code = cliente.rut
      WHERE
        vicidial_log.user = 'VDAD' AND
        vicidial_list.postal_code IN (?) AND
        vicidial_log.call_date BETWEEN CONCAT(?, ' 00:00:00') AND CONCAT(?, ' 23:59:00')
    `;
  
    try {
      const [rows] = await db.query(query, [
        cartera, fechaInicio, fechaFin,
        cartera, fechaInicio, fechaFin
      ]);
      res.json(rows);
    } catch (err) {
      console.error('❌ Error en /gestion-compromiso:', err);
      res.status(500).json({ error: 'Error al obtener datos' });
    }
  });
  
// Consolidado

const upload = multer({ dest: 'uploads/' });

app.post('/upload', upload.single('zip_file'), (req, res) => {
  const zip = new AdmZip(req.file.path);
  const zipEntries = zip.getEntries();

  const allData = [];
  let headerIncluded = false;

  zipEntries.forEach((entry) => {
    if (entry.entryName.endsWith('.txt')) {
      const content = zip.readAsText(entry);
      const lines = content.split('\n').filter(Boolean);
      lines.forEach((line, index) => {
        const row = line.split('|');
        if (index === 0 && !headerIncluded) {
          allData.push(row);
          headerIncluded = true;
        } else if (index > 0 || !headerIncluded) {
          allData.push(row);
        }
      });
    }
  });

  // Crear workbook Excel
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(allData);
  XLSX.utils.book_append_sheet(wb, ws, 'Consolidado');

  const outputPath = path.join(__dirname, 'consolidado.xlsx');
  XLSX.writeFile(wb, outputPath);

  res.download(outputPath, 'consolidado.xlsx', () => {
    fs.unlinkSync(req.file.path);      // limpia archivo subido
    fs.unlinkSync(outputPath);         // limpia archivo generado
  });
});

// Rutero Mail

app.post('/consulta-email', async (req, res) => {
  const { ruts } = req.body;
  if (!ruts || !Array.isArray(ruts) || ruts.length === 0) {
    return res.status(400).json({ error: 'Lista de RUTs vacía o inválida' });
  }

  const placeholders = ruts.map(() => '?').join(',');

  const sql = `
    SELECT 
      rut, 
      email, 
      DATE_FORMAT(fechaInsert, '%d-%m-%Y %H:%i') AS fechaInsert
    FROM email
    WHERE rut IN (${placeholders})
    GROUP BY rut, email
  `;

    /*const sql = `
    SELECT 
      rut, 
      email, 
      'Ingresado por ejecutivo' AS fechaInsert
    FROM email
    WHERE rut IN (${placeholders})
    GROUP BY rut, email
  `;*/

  try {
    const [rows] = await db.execute(sql, ruts);
    res.json(rows);
  } catch (error) {
    console.error('Error en /consulta-email:', error);
    res.status(500).json({ error: 'Error al ejecutar la consulta' });
  }
});

// Rutas nuevas de carta automática
app.use("/carta", cartaRoutes);





// Aquí irán tus rutas de consulta
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor backend en puerto http://0.0.0.0:${PORT}`);
});
