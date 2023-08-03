const express = require("express");
const router = express.Router();
const path = require("path");
const multer = require("multer");
const fs = require("fs");
require("dotenv").config();

const { S3Client, CreatePresignedPost, GetObjectCommand } = require("@aws-sdk/client-s3");

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

async function getPresignedUrl(key) {
  const params = {
    Bucket: "databot12",
    Fields: {
      key,
    },
    Conditions: [
      ["content-length-range", 0, 1000000], // limitar tamaño de archivo, e.g., 1MB
      ["starts-with", "$Content-Type", "image/"], // limitar a imágenes
    ],
  };

  try {
    const data = await CreatePresignedPost(s3Client, params);
    return data;
  } catch (error) {
    throw new Error(`Error al crear la URL prefirmada: ${error}`);
  }
}

router.get("/presigned-url", async (req, res) => {
  const { fileName } = req.query;
  try {
    const url = await getPresignedUrl(fileName);
    res.json(url);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

async function getPresignedDownloadUrl(bucketName, key) {
  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: key,
  });

  try {
    const url = await s3Client.getSignedUrl(command, { expiresIn: 3600 }); // 1 hora de validez
    return url;
  } catch (error) {
    throw new Error(`Error al crear la URL prefirmada para la descarga: ${error}`);
  }
}

router.get("/download", async (req, res) => {
  const { fileName } = req.query;
  try {
    console.log(`Descargando archivo: ${fileName}`); // Registro de diagnóstico
    const url = await getPresignedDownloadUrl("databot12", fileName);
    res.json({ url });
  } catch (error) {
    console.error(`Error al descargar archivo: ${error.message}`); // Registro de error
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
