const express = require("express");
const router = express.Router();
const path = require("path");
const multer = require("multer");
const fs = require("fs");

const PATH_IMG_PRODUCT = 'uploads/img/products';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'src/routes/api/uploads/img/products');
  },
  filename: (req, file, cb) => {
    const fileName = file.originalname;
    const lastDotIndex = fileName.lastIndexOf('.');
    //const name = fileName.slice(0, lastDotIndex);
    const extension = fileName.slice(lastDotIndex + 1);
    const id = req.query.id_product ?? Date.now();
    const name = `${id}.${extension}`;

    cb(null, name);
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/jpg'];

    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Formato de imagen no válido. Se permiten archivos JPEG, PNG y GIF.'));
    }
  }
});

// Ruta para cargar imágenes
router.post("/", upload.single("image"), async (req, res) => {
  const { id_product } = req.query;

  res.json({image_url: id_product});
});

// Ruta para entregar imágenes
router.get("/:imageName", (req, res) => {
  const { imageName } = req.params;
  const imagePath = path.join(__dirname, PATH_IMG_PRODUCT, imageName).concat('.jpg');


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