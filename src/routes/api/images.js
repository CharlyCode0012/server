const express = require("express");
const router = express.Router();
const path = require("path");
const multer = require("multer");
const fs = require("fs");
const sharp = require("sharp");

const PATH_IMG_PRODUCT = 'uploads/img/products';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, PATH_IMG_PRODUCT);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif'];

    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Formato de imagen no válido. Se permiten archivos JPEG, PNG y GIF.'));
    }
  }
});

// Ruta para cargar imágenes
router.post("/", upload.single("image"), async (req, res) => {
  const { path: imagePath, destination, filename } = req.file;
  const resizedImagePath = path.join(destination, "resized", filename);

  try {
    // Redimensionar la imagen a 500x500 píxeles y guardarla
    await sharp(imagePath).resize(160, 160).toFile(resizedImagePath);

    res.json({ success: true });
  } catch (error) {
    res.json({ success: false, error: "Error al redimensionar la imagen" });
  }
});

// Ruta para entregar imágenes
router.get("/:imageName", (req, res) => {
  const { imageName } = req.params;
  const imagePath = path.join(__dirname, PATH_IMG_PRODUCT, imageName).concat('.jpg');

  console.log(imagePath);

  // Verificar si el archivo existe
  if (fs.existsSync(imagePath)) {
    // Si el archivo existe, enviarlo como respuesta
    res.sendFile(imagePath);
  } else {
    // Si el archivo no existe, enviar la imagen por defecto
    const defaultImagePath = path.join(__dirname, PATH_IMG_PRODUCT, "default.jpg");
    res.sendFile(defaultImagePath);
  }
});

router.get("/", (req, res) => {
  res.json({img: "send image"});
});

module.exports = router;