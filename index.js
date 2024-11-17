const express = require('express');
const cors = require('cors');
const PORT = 3000;
const app = express();
const bodyParser = require('body-parser');
const fs = require('fs');

// Middleware para parsear JSON
app.use(bodyParser.json());

app.use(
    cors({
      origin: '*',
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // Include OPTIONS method
    })
  );

// Archivo donde se guardarán los datos
const DATA_FILE = './colors.json';

// Rango aproximado basado en las tiras
const HARDNESS_RANGES = [
    { range: "0 ppm", rgb: [255, 255, 255], potable: true },
    { range: "50 ppm", rgb: [255, 255, 153], potable: true },
    { range: "120 ppm", rgb: [255, 204, 0], potable: true },
    { range: "250 ppm", rgb: [255, 128, 0], potable: false },
    { range: "425 ppm", rgb: [255, 0, 0], potable: false }
];

// Función para determinar la dureza del agua y si es potable
function getWaterHardness(color) {
    let closestMatch = HARDNESS_RANGES[0];
    let minDistance = Number.MAX_VALUE;

    HARDNESS_RANGES.forEach((range) => {
        const distance = Math.sqrt(
            Math.pow(color[0] - range.rgb[0], 2) +
            Math.pow(color[1] - range.rgb[1], 2) +
            Math.pow(color[2] - range.rgb[2], 2)
        );

        if (distance < minDistance) {
            minDistance = distance;
            closestMatch = range;
        }
    });

    return closestMatch;
}

// Función para leer datos del archivo JSON
function readDataFromFile() {
    if (!fs.existsSync(DATA_FILE)) {
        return []; // Si el archivo no existe, retorna una lista vacía
    }
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(data);
}

// Función para escribir datos en el archivo JSON
function writeDataToFile(data) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// Endpoint para analizar y guardar el color
app.post('/color', (req, res) => {
    const { color } = req.body;

    if (!color || !Array.isArray(color) || color.length !== 3) {git 
        return res.status(400).json({
            error: "Se requiere un campo 'color' con un array RGB [R, G, B].",
        });
    }

    // Determinar la dureza y potabilidad
    const hardnessInfo = getWaterHardness(color);

    // Lee los datos actuales del archivo
    const data = readDataFromFile();

    // Agrega el nuevo dato
    const newEntry = { 
        color, 
        range: hardnessInfo.range, 
        potable: hardnessInfo.potable, 
        timestamp: new Date().toISOString() 
    };
    data.push(newEntry);

    // Escribe los datos actualizados en el archivo
    writeDataToFile(data);

    res.json(newEntry);
});

// Endpoint para obtener todos los datos guardados
app.get('/colors', (req, res) => {
    const data = readDataFromFile();
    res.json(data);
});

app.get('/',(re, res)=>{
    res.send('Hola mundo')
});

// Servidor corriendo
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
