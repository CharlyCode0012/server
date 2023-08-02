const express = require("express");
const router = express.Router();
const multer = require("multer");
const fs = require("fs");
const {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  HeadObjectCommand
} = require("@aws-sdk/client-s3");

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

const storage = multer.diskStorage();

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = ["image/jpeg", "image/png", "image/jpg"];

    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          "Formato de imagen no válido. Se permiten archivos JPEG y PNG."
        )
      );
    }
  },
});

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
    const filePath = `uploads/imagenes/${filename}`;

    fs.writeFile(filePath, fileContent, (err) => {
      if (err) {
        console.error("Error al guardar el archivo en el sistema de archivos:", err);
        // Manejar el error en caso de que ocurra
      } else {
        console.log("Archivo descargado y guardado exitosamente.");
      }
    });
  } catch (error) {
    // Si el archivo no existe, descarga la imagen por defecto y guárdala
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
    await s3Client.send(new PutObjectCommand(s3Params));
    const imageUrl = `https://${s3Params.Bucket}.s3.amazonaws.com/${fileName}`;
    res.json({ image_url: imageUrl });
  } catch (error) {
    console.error("Error al cargar la imagen a S3:", error);
    res.status(500).json({ error: "Error al cargar la imagen a S3" });
  }
});

// Ruta para entregar imágenes desde Amazon S3
router.get("/:imageName", async (req, res) => {
  const { imageName } = req.params;
  const imagePath = `./uploads/img/products/${imageName}.jpg`;

  try {
    // Verificar si el archivo ya existe localmente en la ruta "uploads/imagenes"
    if (fs.existsSync(imagePath)) {
      // Si el archivo existe, enviarlo como respuesta
      res.sendFile(imagePath);
    } else {
      // Si el archivo no existe, descargarlo y luego enviarlo como respuesta
      await downloadFile(`${imageName}.jpg`);
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
