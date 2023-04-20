const router = require("express").Router();
const ExcelJS = require("exceljs")

const upload = require("../../config.js");
const { PlaceDelivery } = require("../../db/db");
const { Op } = require("sequelize");

/**
 * Retrieves all the delivery places from the DB
 */
router.get("/", async (req, res) => {
  const order = req.query.order ?? "ASC"

  try {
    const places = await PlaceDelivery.findAll({
      order: [["name", order]]
    });

    res.json(places);
  }
  catch {
    res.sendStatus(500);
  }
});

/**
 * Returns an xlsx file that contains the info of 
 * the existing delivery places in the DB 
 */
router.get("/download", async (req, res) => {

  // Get places from DB
  const placesQuery = await PlaceDelivery.findAll()
  const places = JSON.parse(JSON.stringify(placesQuery)).map(place => {
    const [colony, street, homeNumber] = place.address.split(". ");

    return {
      id: place.id,
      township: place.name,
      street,
      colony,
      homeNumber,
      cp: place.cp,
      openingHour: place.open_h,
      closingHour: place.close_h
    };
  });

  // Create excel workbook, where sheets will be stored
  const workbook = new ExcelJS.Workbook();

  // Create a sheet and assign to it some columns metadata to insert rows
  const worksheet = workbook.addWorksheet("Lugares de entrega")
  worksheet.columns = [
    { header: "ID", key: "id", width: 20 },
    { header: "Municipio", key: "township", width: 25 },
    { header: "Calle", key: "street", width: 25 },
    { header: "Colonia", key: "colony", width: 25 },
    { header: "No. de Casa", key: "homeNumber", width: 25 },
    { header: "C. P.", key: "cp", width: 25 },
    { header: "Hora de apertura", key: "openingHour", width: 25 },
    { header: "Hora de cierre", key: "closingHour", width: 25 },
  ]

  // Style each column
  const idColumn = worksheet.getColumn("id"),
        townshipColumn = worksheet.getColumn("township"),
        streetColumn = worksheet.getColumn("street"),
        colonyColumn = worksheet.getColumn("colony"),
        homeNumberColumn = worksheet.getColumn("homeNumber"),
        cpColumn = worksheet.getColumn("cp"),
        openingHourColumn = worksheet.getColumn("openingHour"),
        closingHourColumn = worksheet.getColumn("closingHour");

  const alignment = { horizontal: "center" };

  idColumn.alignment = alignment
  townshipColumn.alignment = alignment
  streetColumn.alignment = alignment
  colonyColumn.alignment = alignment
  homeNumberColumn.alignment = alignment
  cpColumn.alignment = alignment
  openingHourColumn.alignment = alignment
  closingHourColumn.alignment = alignment

  // Style header row
  const headerRow = worksheet.getRow(1)
  headerRow.font = { bold: true, size: 14 };

  // Add data of every place
  for (const place of places)
    worksheet.addRow(place)

  const fileBuffer = await workbook.xlsx.writeBuffer();

  res.setHeader('content-disposition', 'attachment; filename="Lugares de entrega.xlsx"');
  res.setHeader('Access-Control-Expose-Headers', 'content-disposition');
  res.status(200).end(fileBuffer);
});

/**
 * Returns all the places that match the given ID
 */
router.get("/searchByID", async (req, res) => {
  const { order, search } = req.query
  try {
    const places = await PlaceDelivery.findAll({ 
      where: { id: search }, 
      order: [["id", order]]
    });
    res.json(places);
  }

  catch {
    res.sendStatus(404);
  }

});

/**
 * Returns all the places that match the given township
 */
router.get("/searchByTownship", async (req, res) => {
  const { order, search } = req.query
  try {
    const places = await PlaceDelivery.findAll({ 
      where: {
        name: { [Op.like]: `%${search}%` }
      },
      order: [["name", order]]
    });

    res.json(places);
  }

  catch (error) {
    res.sendStatus(404);
  }
});

/**
 * Returns all the places that match the given address
 */
router.get("/searchByAddress", async (req, res) => {
  const { order, search } = req.query
  try {
    const places = await PlaceDelivery.findAll({ 
      where: {
        address: { [Op.like]: `%${search}%` }
      },
      order: [["address", order]]
    });

    res.json(places);
  }

  catch (error) {
    res.sendStatus(404);
  }
});

/**
 * Returns all the places that match the given CP
 */
router.get("/searchByCP", async (req, res) => {
  const { order, search } = req.query
  try {
    const places = await PlaceDelivery.findAll({ 
      where: {
        cp: { [Op.like]: `%${search}%` }
      },
      order: [["cp", order]]
    });

    res.json(places);
  }

  catch (error) {
    res.sendStatus(404);
  }
});

/**
 * Creates a new place in the DB
 */
router.post("/", async (req, res) => {
  const place = await PlaceDelivery.create(req.body);
  res.json(place);
});

/**
 * Takes an excel file from the request, analices it's data and
 * - If correct, updates the table 
 * - If incorrect, returns the corresponding error to the client
 */
router.post("/upload", upload.single("excel_file"), async (req, res) => {
  const file = req.file

  // console.log(file);
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(file.path)

  const worksheet = workbook.getWorksheet(1);
  worksheet.eachRow(function(row, rowNumber) {
    console.log(`Row ${rowNumber}: ${JSON.stringify(row.values)}`);
  });
  res.sendStatus(200);
});

/**
 * Updates a place in the DB
 */
router.put("/:placeId", async (req, res) => {
  const { placeId } = req.params;
  const isFind = await PlaceDelivery.findOne({ where: { id: placeId } });

  if (!isFind) return res.status(404).send("Lugar no encontrado");

  await PlaceDelivery.update(req.body, {
    where: { id: placeId },
  });
  res.json({ success: `se ha modificado ${placeId}` });
});

/**
 * Deletes a place from the DB
 */
router.delete("/:placeId", async (req, res) => {
  const { placeId } = req.params;
  const isFind = await PlaceDelivery.findOne({ where: { id: placeId } });

  if (!isFind) return res.status(404).send("Lugar no encontrado");

  await PlaceDelivery.destroy({ where: { id: placeId } });
  res.status(200).send();
});

module.exports = router;
