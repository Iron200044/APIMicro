const mongoose = require('mongoose');

// Conexión a MongoDB
mongoose.connect('mongodb+srv://sacerogarcia:Yb8UBX2gOjVm3LXh@colorsmicro.wcyqg.mongodb.net/', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log('Conexión exitosa a MongoDB');
}).catch((error) => {
    console.error('Error al conectar a MongoDB:', error);
});

// Definición del esquema y modelo
const colorSchema = new mongoose.Schema({
    color: [Number],
    range: String,
    potable: Boolean,
    timestamp: String,
});

const Color = mongoose.model('Color', colorSchema);

module.exports = Color;
