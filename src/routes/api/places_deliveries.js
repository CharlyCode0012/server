const router = require("express").Router();
const ExcelJS = require("exceljs")

const { PlaceDelivery } = require("../../db/db");

/**
 * Retrieves all the delivery places from the DB
 */
router.get("/", async (req, res) => {
  const places = await PlaceDelivery.findAll();
  res.json(places);
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

  res.attachment("Lugares de entrega.xlsx")
  res.status(200).end(fileBuffer);
});

router.get("/:placeId", async (req, res) => {
  const { placeId } = req.params;
  const place = await PlaceDelivery.findAll({ where: { id: placeId } });

  res.json(place);
});

router.get("/getPlaceByCP/:cp", async (req, res) => {
  const { cp } = req.params;

  try {
    const place = await PlaceDelivery.findAll({
      where: { cp: cp },
    });

    if (!place) return res.json({ error: "No se encontro ese lugar" });
    return res.json(place);
  } catch (error) {
    return res.json({ error });
  }
});

router.get("/getPlaceByAdress/:address", async (req, res) => {
  const { address } = req.params;
  const order = req.query.order || "ASC";
  try {
    const Places = await PlaceDelivery.findAll({
      order: [["name", order]],
    });

    let places = Places.map((place)=>{
      if(place.address.includes(address)){
        return place;
      }
    })

    places = places.filter(Boolean);


    if (!places) return res.json({ error: "No se encontro ese nombre" });
    return res.json(places);
  } catch (error) {
    return res.json({ error });
  }
});

router.post("/", async (req, res) => {
  const place = await PlaceDelivery.create(req.body);
  res.json(place);
});

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
