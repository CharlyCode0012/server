const router = require("express").Router();
const ExcelJS = require("exceljs")

const { Category } = require("../../db/db");

router.get("/", async (req, res) => {
  const order = req.query.order || "ASC";
  try {
    const categories = await Category.findAll({
      order: [["name", order]],
    });
    res.json(categories);
  } catch (error) {
    res.json({ error });
  }
});

/**
 * Returns an xlsx file that contains the info of 
 * the existing categories in the DB 
 */
router.get("/download", async (req, res) => {

  // Get categories from DB
  const categoriesQuery = await Category.findAll()
  const categories = JSON.parse(JSON.stringify(categoriesQuery)).map(category => ({
    "id": category.id,
    "name": category.name,
    "state": category.state
  }))

  // Create excel workbook, where sheets will be stored
  const workbook = new ExcelJS.Workbook();

  // Create a sheet and assign to it some columns metadata to insert rows
  const worksheet = workbook.addWorksheet("Lista de Categorias")
  worksheet.columns = [
    { header: "ID", key: "id", width: 20 },
    { header: "Nombre", key: "name", width: 25 },
    { header: "Estado", key: "state", width: 10 },
  ]

  // Style each column
  const [ idColumn, nameColumn, stateColumn ] = [ worksheet.getColumn("id"), worksheet.getColumn("name"), worksheet.getColumn("state") ];
  const alignment = { horizontal: "center" };
  [ idColumn.alignment, nameColumn.alignment, stateColumn.alignment ] = [ alignment, alignment, alignment ];

  // Style header row
  const headerRow = worksheet.getRow(1)
  headerRow.font = { bold: true, size: 14 };

  // Add data of every category
  for (const category of categories)
    worksheet.addRow(category)

  const fileBuffer = await workbook.xlsx.writeBuffer();

  res.attachment("Categorias.xlsx")
  res.status(200).end(fileBuffer);
})

router.get("/getCategoryByState/:categoryState", async (req, res) => {
  const { categoryState } = req.params;
  const order = req.query.order;

  try {
    const category = await Category.findAll({
      where: { state: categoryState },
      order: [["name", order]],
    });
    res.json(category);
  } catch (error) {
    res.json({ error });
  }
});

router.get("/getCategoryByName/:categoryName", async (req, res) => {
  const { categoryName } = req.params;
  const order = req.query.order;

  try {
    const category = await Category.findAll({
      where: { name: categoryName },
      order: [["name", order]],
    });
    res.json(category);
  } catch (error) {
    res.json({ error });
  }
});

router.get("/:categoryId", async (req, res) => {
  const { categoryId } = req.params;
  try {
    const category = await Category.findAll({ where: { id: categoryId } });

    res.json(category);
  } catch (error) {
    res.json({ error });
  }
});

router.post("/", async (req, res) => {
  try {
    const category = await Category.create(req.body);
    res.json(category);
  } catch (error) {
    res.json({ error });
  }
});

router.put("/:categoryId", async (req, res) => {
  const { categoryId } = req.params;

  try {
    const isFind = await Category.findOne({ where: { id: categoryId } });

    if (!isFind) return res.status(404).send("Categoria no encontrada");

    await Category.update(req.body, {
      where: { id: categoryId },
    });
    res.json({ success: `se ha modificado ${categoryId}` });
  } catch (error) {
    res.json({ error });
  }
});

router.delete("/:categoryId", async (req, res) => {
  const { categoryId } = req.params;
  try {
    const isFind = await Category.findOne({ where: { id: categoryId } });

    if (!isFind) return res.status(404).send("Categoria no encontrada");

    await Category.destroy({ where: { id: categoryId } });
  } catch (error) {
    res.json({ error });
  }
});

module.exports = router;
