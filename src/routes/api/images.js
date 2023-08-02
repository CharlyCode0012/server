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

const PATH_IMG_PRODUCT = 'uploads/img/products';

// Configuración de las credenciales de AWS
const awsConfig = {
  accessKeyId: "YOUR_ACCESS_KEY_ID",
  secretAccessKey: "YOUR_SECRET_ACCESS_KEY",
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
async function downloadFile(filename) {
  const s3Params = {
    Bucket: "databot12",
    Key: filename,
  };

  try {
    // Verifica si el archivo existe en S3
    await s3Client.send(new HeadObjectCommand(s3Params));

    // Si el archivo existe, descárgalo y guárdalo en la ruta especificada
    const command = await s3Client.send(new GetObjectCommand(s3Params));
    const fileContent = command.Body;

    // Ruta donde deseas guardar el archivo
    const filePath = path.join(__dirname, PATH_IMG_PRODUCT, filename);

    fs.writeFile(filePath, fileContent, (err) => {
      if (err) {
        console.error("Error al guardar el archivo en el sistema de archivos:", err);
        // Manejar el error en caso de que ocurra
      } else {
        console.log("Archivo descargado y guardado exitosamente.");
      }
    });
  } catch (error) {
      // Si el archivo no existe en S3, descarga la imagen por defecto desde S3 y guárdala
      console.error("Error al descargar el archivo desde S3:", error);
      const defaultImageName = "default.jpg"; // Nombre de la imagen por defecto en S3
      const defaultImagePath = `uploads/imagenes/${defaultImageName}`;
  
      // Descarga la imagen por defecto desde S3 y guárdala en la ruta especificada
      const s3DefaultParams = {
        Bucket: "databot12",
        Key: defaultImageName,
      };
  
      try {
        const defaultCommand = await s3Client.send(new GetObjectCommand(s3DefaultParams));
        const defaultFileContent = defaultCommand.Body;
  
        fs.writeFile(defaultImagePath, defaultFileContent, (err) => {
          if (err) {
            console.error("Error al guardar la imagen por defecto en el sistema de archivos:", err);
          } else {
            console.log("Imagen por defecto descargada y guardada exitosamente.");
          }
        });
      } catch (defaultError) {
        console.error("Error al descargar la imagen por defecto desde S3:", defaultError);
        // Manejar el error en caso de que ocurra
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
    ACL: "public-read", // Si deseas que las imágenes sean públicas y accesibles sin autenticación
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
  const imagePath = path.join(__dirname, PATH_IMG_PRODUCT, imageName);

  try {
    // Verificar si el archivo ya existe localmente en la ruta "uploads/img/products"
    if (fs.existsSync(imagePath)) {
      // Si el archivo existe, enviarlo como respuesta
      res.sendFile(imagePath);
    } else {
      // Si el archivo no existe, descargarlo desde S3 y luego enviarlo como respuesta
      await downloadFile(imageName);
      res.sendFile(imagePath);
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
