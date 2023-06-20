const router = require('express').Router();

const upload = require("../../config.js");
const ExcelJS = require("exceljs")

const {Catalog} = require('../../db/db');
const { Op } = require('sequelize');

router.get('/', async (req, res)=>{
  const order  = req.query.order || "ASC";
  try {
    const catalogs = await Catalog.findAll({
      order: [['name', order]]
    });
    res.json(catalogs);
  } catch (error) {
    console.log(error);
    res.status(400).send("Error al traer los datos");
  }
});

router.get('/searchByName', async (req, res) => {
  const { order, search } = req.query;

  try {
    const catalogs = await Catalog.findAll({ 
      where: {
        name: { [Op.like]: `%${search}%` }
      },
      order: [['name', order]]
    });
    res.json(catalogs);
  } catch (error) {
    res.status(400).send("Error al traer los datos");
  }
});

router.get('/searchByState', async (req, res) => {
  const { order, search } = req.query;

  try {
    const catalogs = await Catalog.findAll({ 
      where: {
        state: search,
      },
      order: [['name', order]]
    });
    res.json(catalogs);
  } catch (error) {
    res.status(400).send("Error al traer los datos");
  }
});

/**
 * Returns an xlsx file that contains the info of 
 * the existing catalogs in the DB 
 */
router.get("/download", async (req, res) => {

  try {
    // Get catalogs from DB
    const catalogsQuery = await Catalog.findAll()
    const catalogs = JSON.parse(JSON.stringify(catalogsQuery)).map(catalog=> ({
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
  
    // Add data of every catalog
    for (const catalog of catalogs)
      worksheet.addRow(catalog)
  
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

router.post("/upload", upload.single("excel_file"), async (req, res) => {
  const file = req.file

  try {
    // Create excel info getter
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(file.path)
    const worksheet = workbook.getWorksheet(1);
    
    // Get every catalog from the excel
    const catalogs = []
    worksheet.eachRow(function(row, rowNumber) {
      if (rowNumber === 1) return
  
      const [, id, name, description, state] = row.values
  
      catalogs.push({
        id,
        name: name,
        description: description,
        state: state,
      })
    });
  
    // BUG: If validation is needed, it should go here
  
    // For every catalog, add it if ID not found, or update it if found
    for (const catalog of catalogs) {
      
      if (catalog.id !== undefined) // Place indeed exists, update its info
        await Catalog.update(catalog, {
          where: { id: catalog.id },
        });
  
      else // Place didn't exist, create a new one
        await Catalog.create({ 
          id: Date.now().toString(),
          name: catalog.name, 
          description: catalog.description,
          state: catalog.state,
        });
    }
  
    res.sendStatus(200);
    
  } catch (error) {
    res.status(400).send("Error al actualizar desde el archivo");
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