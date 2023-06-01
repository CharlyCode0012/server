const router = require('express').Router();
const ExcelJS = require("exceljs")

const {Catalog} = require('../../db/db');

router.get('/', async (req, res)=>{
  try {
    const catalogs = await Catalog.findAll();
    res.json(catalogs);
  } catch (error) {
    res.status(400).send("Error al traer los datos");
  }
});



/**
 * Returns an xlsx file that contains the info of 
 * the existing categories in the DB 
 */
router.get("/download", async (req, res) => {

  try {
    // Get categories from DB
    const catalogsQuery = await Catalog.findAll()
    const categories = JSON.parse(JSON.stringify(catalogsQuery)).map(catalog=> ({
      "id": catalog.id,
      "name": catalog.name,
      "description": catalog.description,
      "state": catalog.state
    }))
  
    // Create excel workbook, where sheets will be stored
    const workbook = new ExcelJS.Workbook();
  
    // Create a sheet and assign to it some columns metadata to insert rows
    const worksheet = workbook.addWorksheet("Lista de Catalogos")
    worksheet.columns = [
      { header: "ID", key: "id", width: 20 },
      { header: "Nombre", key: "name", width: 25 },
      { header: "Descripcion", key: "description", width: 50 },
      { header: "Estado", key: "state", width: 30 },
    ]
  
    // Style each column
    const [ idColumn, nameColumn, stateColumn ] = [ worksheet.getColumn("id"), worksheet.getColumn("name"), worksheet.getColumn("description"), worksheet.getColumn("state") ];
    const alignment = { horizontal: "center" };
    [ idColumn.alignment, nameColumn.alignment, stateColumn.alignment ] = [ alignment, alignment, alignment ];
  
    // Style header row
    const headerRow = worksheet.getRow(1)
    headerRow.font = { bold: true, size: 14 };
  
    // Add data of every category
    for (const category of categories)
      worksheet.addRow(category)
  
    const fileBuffer = await workbook.xlsx.writeBuffer();
  
    res.setHeader('content-disposition', 'attachment; filename="Catalogos.xlsx"');
    res.setHeader('Access-Control-Expose-Headers', 'content-disposition');
    res.status(200).end(fileBuffer);
  } catch (error) {
    res.status(400).send("Error al descargar");
  }
  });

router.post('/', async (req, res)=>{
  try {
    const catalog = await Catalog.create(req.body);
    res.json(catalog);
  } catch (error) {
    res.status(400).send("Error al crear");
  }
});

router.put('/:catalogId', async (req, res)=>{
    const {catalogId} = req.params;

    try {
      const isFind = await Catalog.findOne({where: {id: catalogId}});
  
      if (!isFind) return res.status(404).send("Catalogo no encontrado");
  
      await Catalog.update(req.body, {
          where: {id: catalogId}
      });
      res.json({success: `se ha modificado ${catalogId}`});
    } catch (error) {
      res.status(400).send("Error al actualizar");
    }
})

router.delete('/:catalogId', async (req, res)=>{
    const {catalogId} = req.params;

    try {
      const isFind = await Catalog.findOne({where: {id: catalogId}});
      
      if (!isFind) return res.status(404).send("Catalogo no encontrado");
  
      await Catalog.destroy({where: {id: catalogId}});
      res.status(200).send();
    } catch (error) {
      res.status(400).send("Error al eliminar");
    }
})

module.exports = router;