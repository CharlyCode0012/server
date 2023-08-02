const express = require("express");
const router = express.Router();
const multer = require("multer");
const {
  S3Client,
  PutObjectCommand,
  HeadObjectCommand,
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

const storage = multer.memoryStorage();

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
    res.status(500).json({ error: "Error al cargar la imagen a S3" });
  }
});

// Ruta para entregar imágenes desde Amazon S3
router.get("/:imageName", async (req, res) => {
  const { imageName } = req.params;
  const imagePath = `${imageName}.jpg`;

  const s3Params = {
    Bucket: "databot12", // Reemplaza "databot12" con el nombre de tu bucket en Amazon S3
    Key: imagePath,
  };

  try {
    await s3Client.send(new HeadObjectCommand(s3Params));
    const imageUrl = `https://${s3Params.Bucket}.s3.amazonaws.com/${imagePath}`;
    res.redirect(imageUrl);
  } catch (error) {
    // Si la imagen solicitada no existe, redirige a la imagen por defecto
    const defaultImageUrl =
      "https://${s3Params.Bucket}.s3.amazonaws.com/defualt.jp";
    res.redirect(defaultImageUrl);
  }
});

router.get("/", (req, res) => {
  res.json({ img: "send image" });
});

module.exports = router;
