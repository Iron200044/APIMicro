const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const Color = require('./config/database'); // Importa el modelo de la base de datos

const PORT = 3000;
const app = express();

// Middleware
app.use(bodyParser.json());
app.use(express.json());
app.use(cors());

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

// Endpoint para analizar y guardar el color
app.post('/color', async (req, res) => {
    const { color } = req.body;

    if (!color || !Array.isArray(color) || color.length !== 3) {
        return res.status(400).json({
            error: "Se requiere un campo 'color' con un array RGB [R, G, B].",
        });
    }

    // Determinar la dureza y potabilidad
    const hardnessInfo = getWaterHardness(color);

    // Crear el nuevo dato
    const newColor = new Color({
        color,
        range: hardnessInfo.range,
        potable: hardnessInfo.potable,
        timestamp: new Date().toISOString()
    });

    // Guardar en la base de datos
    try {
        await newColor.save();
        res.json(newColor);
    } catch (error) {
        console.error('Error al guardar en MongoDB:', error);
        res.status(500).json({ error: 'Error al guardar en la base de datos' });
    }
});

// Endpoint para obtener todos los datos guardados
app.get('/colors', async (req, res) => {
    try {
        const colors = await Color.find();
        res.json(colors);
    } catch (error) {
        console.error('Error al obtener datos de MongoDB:', error);
        res.status(500).json({ error: 'Error al obtener datos' });
    }
});

// Endpoint de prueba
app.get('/', (req, res) => {
    res.send('Hola mundo');
});

// Servidor corriendo
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
