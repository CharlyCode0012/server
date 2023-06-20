const router = require("express").Router();

const ExcelJS = require("exceljs")
const upload = require("../../config.js");

const { Category } = require("../../db/db");

router.get("/", async (req, res) => {
  const order = req.query.order || "ASC";
  try {
    let categories = await Category.findAll({
      order: [["category_name", order]],
    });


    res.json(categories);
  } catch (error) {
    res.json(error);
  }
});

/**
 * Returns an xlsx file that contains the info of 
 * the existing categories in the DB 
 */
router.get("/download", async (req, res) => {

  // Get categories from DB
  try {
    const categoriesQuery = await Category.findAll()
    const categories = JSON.parse(JSON.stringify(categoriesQuery)).map(category => ({
      "id": category.id,
      "category_name": category.category_name,
      "state": category.state
    }))
  
    // Create excel workbook, where sheets will be stored
    const workbook = new ExcelJS.Workbook();
  
    // Create a sheet and assign to it some columns metadata to insert rows
    const worksheet = workbook.addWorksheet("Lista de Categorias")
    worksheet.columns = [
      { header: "ID", key: "id", width: 20 },
      { header: "Nombre", key: "category_name", width: 25 },
      { header: "Estado", key: "state", width: 30 },
    ]
  
    // Style each column
    const [ idColumn, nameColumn, stateColumn ] = [ worksheet.getColumn("id"), worksheet.getColumn("category_name"), worksheet.getColumn("state") ];
    const alignment = { horizontal: "center" };
    [ idColumn.alignment, nameColumn.alignment, stateColumn.alignment ] = [ alignment, alignment, alignment ];
  
    // Style header row
    const headerRow = worksheet.getRow(1)
    headerRow.font = { bold: true, size: 14 };
  
    // Add data of every category
    for (const category of categories)
      worksheet.addRow(category)
  
    const fileBuffer = await workbook.xlsx.writeBuffer();
  
    res.setHeader('content-disposition', 'attachment; filename="Categorias.xlsx"');
    res.setHeader('Access-Control-Expose-Headers', 'content-disposition');
    res.status(200).end(fileBuffer);
  } catch (error) {
    res.status(400).send("Error al descargar");
  }
});

router.get("/categoryByState/:categoryState", async (req, res) => {
  let { categoryState } = req.params;
  categoryState = categoryState == "false" || categoryState == "0" ? 0 : 1;
  const order = req.query.order;

  try {
    const category = await Category.findAll({
      where: { state: categoryState },
      order: [["category_name", order]],
    });
    res.json(category);
  } catch (error) {
    res.json(error );
  }
});

router.get("/categoryByName/:categoryName", async (req, res) => {
  const { categoryName } = req.params;
  const order = req.query.order;

  try {
    const category = await Category.findAll({
      where: { category_name: categoryName },
      order: [["category_name", order]],
    });
    res.json(category);
  } catch (error) {
    res.json(error);
  }
});

router.get("/:categoryId", async (req, res) => {
  const { categoryId } = req.params;
  try {
    const category = await Category.findAll({ where: { id: categoryId } });

    res.json(category);
  } catch (error) {
    res.json(error);
  }
});

router.post("/", async (req, res) => {
  try {
    const category = await Category.create(req.body);
    res.json(category);
  } catch (error) {
    res.json( error );
  }
});

router.post("/upload", upload.single("excel_file"), async (req, res) => {
  const file = req.file

  try {
    // Create excel info getter
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(file.path)
    const worksheet = workbook.getWorksheet(1);
    
    // Get every category from the excel
    const categories = []
    worksheet.eachRow(function(row, rowNumber) {
      if (rowNumber === 1) return
  
      const [, id, category_name, state] = row.values
  
      categories.push({
        id,
        category_name: category_name,
        state: state,
      })
    });
  
    // BUG: If validation is needed, it should go here
  
    // For every category, add it if ID not found, or update it if found
    for (const category of categories) {
      
      if (category.id !== undefined) // Place indeed exists, update its info
        await Category.update(category, {
          where: { id: category.id },
        });
  
      else // Place didn't exist, create a new one
        await Category.create({ 
          id: Date.now().toString(),
          category_name: category.category_name, 
          state: category.state,
        });
    }
  
    res.sendStatus(200);
    
  } catch (error) {
    res.status(400).send("Error al actualizar desde el archivo");
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
    res.json(`se ha modificado ${categoryId}`);
  } catch (error) {
    res.json( error );
  }
});

router.delete("/:categoryId", async (req, res) => {
  const { categoryId } = req.params;
  try {
    const isFind = await Category.findOne({ where: { id: categoryId } });

    if (!isFind) return res.status(404).send("Categoria no encontrada");

    await Category.destroy({ where: { id: categoryId } });
    res.json(`se ha eliminado ${categoryId}`)
  } catch (error) {
    res.json( error );
  }
});

module.exports = router;
