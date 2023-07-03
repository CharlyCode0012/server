const router = require('express').Router();

const {Menu} = require('../../db/db');
const ExcelJS = require("exceljs");

router.get('/', async (req, res)=>{
    try {
        const menus = await Menu.findAll();
        res.json(menus);
        
    } catch (error) {
        res.status(400).json(error);
    }
});

/**
 * Returns an xlsx file that contains the info of 
 * the existing payment methods in the DB 
 */
router.get("/download", async (req, res) => {

    try {
        // Get payment methods from DB
        const menusQuery = await Menu.findAll();
        const menus = JSON.parse(JSON.stringify(menusQuery));

        // Create excel workbook, where sheets will be stored
        const workbook = new ExcelJS.Workbook();

        // Create a sheet and assign to it some columns metadata to insert rows
        const worksheet = workbook.addWorksheet("Menus")
        worksheet.columns = [
            { header: "ID", key: "id", width: 20 },
            { header: "Título", key: "name", width: 25 },
            { header: "Respuesta", key: "answer", width: 25 },
        ]

        // Style each column
        const idColumn = worksheet.getColumn("id"),
            titleColumn = worksheet.getColumn("name"),
            answerColumn = worksheet.getColumn("answer");

        const alignment = { horizontal: "center" };

        idColumn.alignment = alignment
        titleColumn.alignment = alignment
        answerColumn.alignment = alignment

        // Style header row
        const headerRow = worksheet.getRow(1)
        headerRow.font = { bold: true, size: 14 };

        // Add data of every payment method
        for (const menu of menus)
            worksheet.addRow(menu);

        // Auto-size columns to fit the content and headers
        worksheet.columns.forEach((column) => {
            column.header = column.header.toString(); // Convert header to string
            column.width = Math.max(column.header.length, 12); // Set minimum width based on header length

            column.eachCell({ includeEmpty: true }, (cell) => {
                cell.alignment = {
                    vertical: "middle",
                    horizontal: "center",
                    wrapText: true // Enable text wrapping
                };
                column.width = Math.max(column.width, cell.value ? cell.value.toString().length + 2 : 10); // Adjust width based on cell content
            });
        });

        const fileBuffer = await workbook.xlsx.writeBuffer();

        res.setHeader('content-disposition', 'attachment; filename="Menus.xlsx"');
        res.setHeader('Access-Control-Expose-Headers', 'content-disposition');
        res.status(200).end(fileBuffer);
    } catch (error) {
        res.status(400).send("Error al descargar el archivo");
    }
});


router.post('/', async (req, res)=>{
    try {
        const menu = await Menu.create(req.body);
        res.json(menu);   
    } catch (error) {
        res.status(400).send("Error al traer");
    }
});

router.put('/:menuId', async (req, res)=>{
    const {menuId} = req.params;
    try {
        const isFind = await Menu.findOne({where: {id: menuId}});
    
        if (!isFind) return res.status(404).send("Pregunta no encontrada");
    
        await Menu.update(req.body, {
            where: {id: menuId}
        });
        res.json({success: `se ha modificado ${menuId}`}); 
    } catch (error) {
        res.status(400).send("Error al actualizar");
    }
})

router.delete('/:menuId', async (req, res)=>{
    const {menuId} = req.params;
    try {
        const isFind = await Menu.findOne({where: {id: menuId}});
        
        if (!isFind) return res.status(404).send("Pregunta no encontrada");
    
        await Menu.destroy({where: {id: menuId}});
        res.status(200).send("Se elimino");    
    } catch (error) {
        res.status(400).send("Error al eliminar");
    }
})

module.exports = router;