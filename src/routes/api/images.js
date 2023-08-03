const express = require("express");
const router = express.Router();
const path = require("path");
const multer = require("multer");
const fs = require("fs");
const {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  HeadObjectCommand
} = require("@aws-sdk/client-s3");
const { PassThrough } = require('stream'); // Asegúrate de incluir el módulo stream


const PATH_IMG_PRODUCT = 'uploads/img/products';

// Configuración de las credenciales de AWS
const awsConfig = {
  accessKeyId: "AKIAWVXP2LLB2CGRD6P6",
  secretAccessKey: "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",
  region: "us-west-1", // Por ejemplo, "us-east-1"
};

const s3Client = new S3Client({
  region: awsConfig.region,
  credentials: {
    accessKeyId: awsConfig.accessKeyId,
    secretAccessKey: awsConfig.secretAccessKey,
  },
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'src/routes/api/uploads/img/products');
  },
  filename: (req, file, cb) => {
    const fileName = file.originalname;
    const lastDotIndex = fileName.lastIndexOf('.');
    const extension = fileName.slice(lastDotIndex + 1);
    const id = req.query.id_product ?? Date.now();
    const name = `${id}.${extension}`;

    cb(null, name);
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/jpg'];

    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Formato de imagen no válido. Se permiten archivos JPEG y PNG.'));
    }
  }
});

// Función para descargar y guardar el archivo desde S3
async function downloadFileAsStream(filename) {
  const imageFile = filename + ".jpg"
  const s3Params = {
    Bucket: "databot12", // Reemplaza con el nombre de tu bucket en S3
    Key: imageFile,
  };

  try {
    // Verifica si el archivo existe en S3
    await s3Client.send(new HeadObjectCommand(s3Params));
    const imagePath = path.join(__dirname, PATH_IMG_PRODUCT, imageFile);

    // Si el archivo existe, descárgalo y guárdalo en un flujo de datos
    const command = new GetObjectCommand(s3Params);
    const result = await s3Client.send(command);

    const pass = new PassThrough();
    result.Body.pipe(pass);

    return pass; // Devuelve el flujo de datos que contiene el archivo
  } catch (error) {
    // Si el archivo no existe en S3, descarga la imagen por defecto desde S3 y guárdala en un flujo de datos
    const defaultImageName = "default.jpg"; // Nombre de la imagen por defecto en S3

    try {
      const command = new GetObjectCommand({Bucket: "databot12", Key: defaultImageName});
      const result = await s3Client.send(command);

      const pass = new PassThrough();
      result.Body.pipe(pass);

      return pass; // Devuelve el flujo de datos que contiene la imagen por defecto
    } catch (defaultError) {
      console.error("Error al descargar la imagen por defecto desde S3:", defaultError);
      throw defaultError;
    }
  }
}

// Ruta para cargar imágenes en Amazon S3
router.post("/", upload.single("image"), async (req, res) => {
  const { id_product } = req.query;
  const fileContent = req.file.buffer;
  const extension = req.file.originalname.split(".").pop();
  const fileName = `${id_product}.${extension}`;
  
  const s3Params = {
    Bucket: "databot12",
    Key: fileName,
    Body: fileContent,
    ContentType: req.file.mimetype,
  };

  try {
    // Cargar el archivo en S3
    await s3Client.send(new PutObjectCommand(s3Params));

    // Construir la URL pública de la imagen subida
   
    res.json({ image_url: id_product });
  } catch (error) {
    console.error("Error al cargar la imagen a S3:", error);
    res.status(500).json({ error: "Error al cargar la imagen a S3" });
  }
});

// Ruta para entregar imágenes desde el servidor local o descargarlas desde S3 si no existen localmente
router.get("/:imageName", async (req, res) => {
  const { imageName } = req.params;
  const imagePath = path.join(__dirname, PATH_IMG_PRODUCT, `${imageName}.jpg`);
  
  try {
    // Verificar si el archivo ya existe localmente en la ruta "uploads/img/products"
    if (fs.existsSync(imagePath)) {
      // Si el archivo existe, enviarlo como respuesta
      res.sendFile(imagePath);
    } else {
      // Si el archivo no existe, descargarlo desde S3 y luego enviarlo como respuesta
      const imageStream = await downloadFileAsStream(imageName);

      // Configurar los encabezados de la respuesta
      res.set('Content-Type', 'image/jpeg');
      res.set('Content-Disposition', `attachment; filename="${imageName}.jpg"`);

      // Enviar el flujo del archivo como respuesta
      imageStream.pipe(res);
    }
  } catch (error) {
    console.error("Error al enviar el archivo al cliente:", error);
    res.status(400).send("Error");
  }
});

router.get("/", (req, res) => {
  res.json({ img: "send image" });
});

module.exports = router;
