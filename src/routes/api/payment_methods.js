const router = require("express").Router();
const ExcelJS = require("exceljs")

const { Payment } = require("../../db/db");
const { Op } = require("sequelize");

/**
 * Retrieves all the payment methods from the DB
 */
router.get("/", async (req, res) => {
  const order = req.query.order ?? "ASC"

  try {
    const paymentMethods = await Payment.findAll({
      order: [["name", order]]
    });

    res.json(paymentMethods);
  }
  catch {
    res.sendStatus(500);
  }
});

/**
 * Returns an xlsx file that contains the info of 
 * the existing payment methods in the DB 
 */
router.get("/download", async (req, res) => {

  // Get payment methods from DB
  const paymentMethodsQuery = await Payment.findAll()
  const paymentMethods = JSON.parse(JSON.stringify(paymentMethodsQuery))

  // Create excel workbook, where sheets will be stored
  const workbook = new ExcelJS.Workbook();

  // Create a sheet and assign to it some columns metadata to insert rows
  const worksheet = workbook.addWorksheet("Lugares de entrega")
  worksheet.columns = [
    { header: "ID", key: "id", width: 20 },
    { header: "Titular", key: "name", width: 25 },
    { header: "CLABE", key: "CLABE", width: 25 },
    { header: "No. Tarjeta", key: "no_card", width: 25 },
    { header: "Banco", key: "bank", width: 25 },
    { header: "Lugares para depositar", key: "subsidary", width: 30 },
  ]

  // Style each column
  const idColumn = worksheet.getColumn("id"),
        ownerColumn = worksheet.getColumn("name"),
        clabeColumn = worksheet.getColumn("CLABE"),
        cardNumberColumn = worksheet.getColumn("no_card"),
        bankColumn = worksheet.getColumn("bank"),
        subsidaryColumn = worksheet.getColumn("subsidary");

  const alignment = { horizontal: "center" };

  idColumn.alignment = alignment
  ownerColumn.alignment = alignment
  clabeColumn.alignment = alignment
  cardNumberColumn.alignment = alignment
  bankColumn.alignment = alignment
  subsidaryColumn.alignment = alignment

  // Style header row
  const headerRow = worksheet.getRow(1)
  headerRow.font = { bold: true, size: 14 };

  // Add data of every payment method
  for (const paymentMethod of paymentMethods)
    worksheet.addRow(paymentMethod)

  const fileBuffer = await workbook.xlsx.writeBuffer();

  res.attachment("Metodos de pago.xlsx")
  res.status(200).end(fileBuffer);
});

/**
 * Returns all the payment methods that match the given ID
 */
router.get("/searchByID", async (req, res) => {
  const { order, search } = req.query
  try {
    const paymentMethods = await Payment.findAll({ 
      where: { id: search }, 
      order: [["id", order]]
    });
    res.json(paymentMethods);
  }

  catch {
    res.sendStatus(404);
  }

});

/**
 * Returns all the payment methods that match the given owner
 */
router.get("/searchByOwner", async (req, res) => {
  const { order, search } = req.query
  try {
    const paymentMethods = await Payment.findAll({ 
      where: {
        name: { [Op.like]: `%${search}%` }
      },
      order: [["name", order]]
    });

    res.json(paymentMethods);
  }

  catch (error) {
    res.sendStatus(404);
  }
});

/**
 * Returns all the payment methods that match the given CLABE
 */
router.get("/searchByCLABE", async (req, res) => {
  const { order, search } = req.query
  try {
    const paymentMethods = await Payment.findAll({ 
      where: {
        CLABE: { [Op.like]: `%${search}%` }
      },
      order: [["CLABE", order]]
    });

    res.json(paymentMethods);
  }

  catch (error) {
    res.sendStatus(404);
  }
});

/**
 * Returns all the payment methods that match the given card number
 */
router.get("/searchByCardNumber", async (req, res) => {
  const { order, search } = req.query
  try {
    const paymentMethods = await Payment.findAll({ 
      where: {
        no_card: { [Op.like]: `%${search}%` }
      },
      order: [["no_card", order]]
    });

    res.json(paymentMethods);
  }

  catch (error) {
    res.sendStatus(404);
  }
});

/**
 * Returns all the payment methods that match the given bank
 */
router.get("/searchByBank", async (req, res) => {
  const { order, search } = req.query
  try {
    const paymentMethods = await Payment.findAll({ 
      where: {
        bank: { [Op.like]: `%${search}%` }
      },
      order: [["bank", order]]
    });

    res.json(paymentMethods);
  }

  catch (error) {
    res.sendStatus(404);
  }
});

/**
 * Creates a new payment method in the DB
 */
router.post("/", async (req, res) => {
  const paymentMethod = await Payment.create(req.body);
  res.json(paymentMethod);
});

/**
 * Updates a payment method in the DB
 */
router.put("/:methodId", async (req, res) => {
  const { methodId } = req.params;
  const isFind = await Payment.findOne({ where: { id: methodId } });

  if (!isFind) return res.status(404).send("Metodo de pago no encontrado");

  await Payment.update(req.body, {
    where: { id: methodId },
  });
  res.json({ success: `se ha modificado ${methodId}` });
});

/**
 * Deletes a payment method from the DB
 */
router.delete("/:methodId", async (req, res) => {
  const { methodId } = req.params;
  const isFind = await Payment.findOne({ where: { id: methodId } });

  if (!isFind) return res.status(404).send("Metodo de pago no encontrado");

  await Payment.destroy({ where: { id: methodId } });
  res.status(200).send();
});

module.exports = router;
