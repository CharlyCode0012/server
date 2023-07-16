const router = require("express").Router();
const ExcelJS = require("exceljs");

const upload = require("../../config.js");
const { PlaceDelivery } = require("../../db/db");
const { Op } = require("sequelize");

/**
 * Retrieves all the delivery places from the DB
 */
router.get("/", async (req, res) => {
  const order = req.query.order ?? "ASC";

  try {
    const places = await PlaceDelivery.findAll({
      order: [["name", order]],
    });

    res.json(places);
  } catch {
    res.sendStatus(500);
  }
});

/**
 * Returns an xlsx file that contains the info of
 * the existing delivery places in the DB
 */
router.get("/download", async (req, res) => {
  try {
    // Get places from DB
    const placesQuery = await PlaceDelivery.findAll();
    const places = JSON.parse(JSON.stringify(placesQuery)).map((place) => {
      const [colony, street, homeNumber] = place.address.split(". ");

      return {
        id: place.id,
        township: place.name,
        street,
        colony,
        homeNumber,
        cp: place.cp,
        openingHour: place.open_h,
        closingHour: place.close_h,
      };
    });

    // Create excel workbook, where sheets will be stored
    const workbook = new ExcelJS.Workbook();

    // Create a sheet and assign to it some columns metadata to insert rows
    const worksheet = workbook.addWorksheet("Lugares de entrega");
    worksheet.columns = [
      { header: "ID", key: "id", width: 20 },
      { header: "Municipio", key: "township", width: 25 },
      { header: "Calle", key: "street", width: 25 },
      { header: "Colonia", key: "colony", width: 25 },
      { header: "No. de Casa", key: "homeNumber", width: 25 },
      { header: "C. P.", key: "cp", width: 25 },
      { header: "Hora de apertura", key: "openingHour", width: 25 },
      { header: "Hora de cierre", key: "closingHour", width: 25 },
    ];

    // Style each column
    const columns = worksheet.columns;
    const alignment = { horizontal: "center" };

    for (const column of columns) {
      column.alignment = alignment;
    }

    // Style header row
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true, size: 14 };

    // Add data of every place
    for (const place of places) worksheet.addRow(place);

    // Auto-size columns to fit the content and headers
    worksheet.columns.forEach((column) => {
      column.header = column.header.toString(); // Convert header to string
      column.width = Math.max(column.header.length, 12); // Set minimum width based on header length

      column.eachCell({ includeEmpty: true }, (cell) => {
        cell.alignment = {
          vertical: "middle",
          horizontal: "center",
          wrapText: true, // Enable text wrapping
        };
        column.width = Math.max(
          column.width,
          cell.value ? cell.value.toString().length + 2 : 10
        ); // Adjust width based on cell content
      });
    });

    const fileBuffer = await workbook.xlsx.writeBuffer();

    res.setHeader(
      "content-disposition",
      'attachment; filename="Lugares de entrega.xlsx"'
    );
    res.setHeader("Access-Control-Expose-Headers", "content-disposition");
    res.status(200).end(fileBuffer);
  } catch (error) {
    res.status(400).send("Error");
  }
});

/**
 * Returns all the places that match the given ID
 */
router.get("/searchByID", async (req, res) => {
  const { order, search } = req.query;
  try {
    const places = await PlaceDelivery.findAll({
      where: { id: search },
      order: [["id", order]],
    });
    res.json(places);
  } catch {
    res.sendStatus(404);
  }
});

/**
 * Returns all the places that match the given township
 */
router.get("/searchByTownship", async (req, res) => {
  const { order, search } = req.query;
  try {
    const places = await PlaceDelivery.findAll({
      where: {
        name: { [Op.like]: `%${search}%` },
      },
      order: [["name", order]],
    });

    res.json(places);
  } catch (error) {
    res.sendStatus(404);
  }
});

/**
 * Returns all the places that match the given address
 */
router.get("/searchByAddress", async (req, res) => {
  const { order, search } = req.query;
  try {
    const places = await PlaceDelivery.findAll({
      where: {
        address: { [Op.like]: `%${search}%` },
      },
      order: [["address", order]],
    });

    res.json(places);
  } catch (error) {
    res.sendStatus(404);
  }
});

/**
 * Returns all the places that match the given CP
 */
router.get("/searchByCP", async (req, res) => {
  const { order, search } = req.query;
  try {
    const places = await PlaceDelivery.findAll({
      where: {
        cp: { [Op.like]: `%${search}%` },
      },
      order: [["cp", order]],
    });

    res.json(places);
  } catch (error) {
    res.sendStatus(404);
  }
});

/**
 * Creates a new place in the DB
 */
router.post("/", async (req, res) => {
  try {
    const place = await PlaceDelivery.create(req.body);
    res.json(place);
  } catch (error) {
    res.status(400).send("Error al crear");
  }
});

/**
 * Takes an excel file from the request, analices it's data and
 * - If correct, updates the table
 * - If incorrect, returns the corresponding error to the client
 */
router.post("/upload", upload.single("excel_file"), async (req, res) => {
  const file = req.file;

  try {
    // Create excel info getter
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(file.path);
    const worksheet = workbook.getWorksheet(1);

    // Get every place from the excel
    const places = [];
    worksheet.eachRow(function (row, rowNumber) {
      if (rowNumber === 1) return;

      const [
        ,
        id,
        township,
        street,
        colony,
        homeNumber,
        cp,
        openingHour,
        closingHour,
      ] = row.values;

      let formattedOpeningHour = openingHour;
      let formattedClosingHour = closingHour;

      if (openingHour instanceof Date) {
        const opHours = openingHour?.getUTCHours(),
          opMinutes = openingHour?.getUTCMinutes();
        const clHours = closingHour?.getUTCHours(),
          clMinutes = closingHour?.getUTCMinutes();

        formattedOpeningHour = `${opHours
          .toString()
          .padStart(2, "0")}:${opMinutes.toString().padStart(2, "0")}`;
        formattedClosingHour = `${clHours
          .toString()
          .padStart(2, "0")}:${clMinutes.toString().padStart(2, "0")}`;
      }

      places.push({
        id,
        name: township,
        address: `${colony}. ${street}. ${homeNumber}`,
        cp: cp,
        open_h: formattedOpeningHour,
        close_h: formattedClosingHour,
      });
    });

    // BUG: If validation is needed, it should go here

    // For every place, add it if ID not found, or update it if found
    for (const place of places) {
      if (place.id !== undefined)
        // Place indeed exists, update its info
        await PlaceDelivery.update(place, {
          where: { id: place.id },
        });
      // Place didn't exist, create a new one
      else
        await PlaceDelivery.create({
          id: Date.now().toString(),
          name: place.name,
          address: place.address,
          cp: place.cp,
          open_h: place.open_h,
          close_h: place.close_h,
        });
    }

    res.sendStatus(200);
  } catch (error) {
    res.status(400).send("Error al actualizar desde el archivo");
    console.log(error);
  }
});

/**
 * Updates a place in the DB
 */
router.put("/:placeId", async (req, res) => {
  const { placeId } = req.params;

  try {
    const isFind = await PlaceDelivery.findOne({ where: { id: placeId } });

    if (!isFind) return res.status(404).send("Lugar no encontrado");

    await PlaceDelivery.update(req.body, {
      where: { id: placeId },
    });
    res.json({ success: `se ha modificado ${placeId}` });
  } catch (error) {
    res.status(400).send("Error al actualizar");
  }
});

/**
 * Deletes a place from the DB
 */
router.delete("/:placeId", async (req, res) => {
  const { placeId } = req.params;

  try {
    const isFind = await PlaceDelivery.findOne({ where: { id: placeId } });

    if (!isFind) return res.status(404).send("Lugar no encontrado");

    await PlaceDelivery.destroy({ where: { id: placeId } });
    res.status(200).send();
  } catch (error) {
    res.status(400).send("Error al eliminar");
  }
});

module.exports = router;
