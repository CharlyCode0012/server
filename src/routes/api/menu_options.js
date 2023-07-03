const router = require('express').Router();

const {MenuOptions, MenuAndOptions, Catalog, Menu} = require('../../db/db');
const ExcelJS = require("exceljs");


router.get('/', async (req, res) => {
    const { menuID } = req.query;
    try {
        const menuOptions = await MenuAndOptions.findAll({
            where: { menuID: menuID },
            include: [
                {
                    model: MenuOptions,
                    as: 'menuOption', // Especifica el alias correcto aquí
                    attributes: ['id', "answer",'option', 'keywords', 'action_type', 'reference'],
                    include: [
                        {
                            model: Catalog,
                            attributes: ['name'],
                            as: 'catalog',
                        },
                        {
                            model: Menu,
                            attributes: ['name'],
                            as: 'submenu',
                        },
                    ],
                },
            ],
        });

        const options = menuOptions.map((menuOption) => {
            const resolvedMenuOption = menuOption.menuOption;
            const typeAction = resolvedMenuOption.action_type;
            const reference = resolvedMenuOption.reference;
            let referenceName = '';

            if (typeAction === 'catalog' && resolvedMenuOption.catalog) {
                referenceName = resolvedMenuOption.catalog.name;
            } else if (typeAction === 'Submenu' && resolvedMenuOption.submenu) {
                referenceName = resolvedMenuOption.submenu.name;
            }

            return {
                id: resolvedMenuOption.id,
                answer: resolvedMenuOption.answer,
                option: resolvedMenuOption.option,
                keywords: resolvedMenuOption.keywords,
                action_type: typeAction,
                reference: reference,
                referenceName: referenceName,
            };
        });

        console.log(options);
        res.json(options);
    } catch (error) {
        console.error(error);
        res.status(400).send("Error al traer");
    }
});

/**
 * Returns an xlsx file that contains the info of 
 * the existing payment methods in the DB 
 */
router.get("/download", async (req, res) => {
    const menuID = req.query.info;

    try {
        // Get payment methods from DB
        const menuOptions = await MenuAndOptions.findAll({ where: { menuID: menuID } });

        const options = await Promise.all(menuOptions.map(async (menuOption) => {
            const resolvedMenuOption = await MenuOptions.findOne({ where: { id: menuOption.menuOptionsID } });
            return resolvedMenuOption.dataValues;
        }));
        const opciones = JSON.parse(JSON.stringify(options));

        // Create excel workbook, where sheets will be stored
        const workbook = new ExcelJS.Workbook();

        // Create a sheet and assign to it some columns metadata to insert rows
        const worksheet = workbook.addWorksheet("Opciones")
        worksheet.columns = [
            { header: "ID", key: "id", width: 20 },
            { header: "Opción", key: "option", width: 25 },
            { header: "Palabra clave", key: "keywords", width: 25 },
            { header: "Acción", key: "action_type", width: 25 },
            { header: "Respuesta", key: "answer", width: 30 },
        ]

        // Style each column
        const idColumn = worksheet.getColumn("id"),
            optionColumn = worksheet.getColumn("option"),
            keyWordColumn = worksheet.getColumn("keywords"),
            actionTypeColumn = worksheet.getColumn("action_type"),
            answerColumn = worksheet.getColumn("answer");

        const alignment = { horizontal: "center" };

        idColumn.alignment = alignment
        optionColumn.alignment = alignment
        keyWordColumn.alignment = alignment
        actionTypeColumn.alignment = alignment
        answerColumn.alignment = alignment

        // Style header row
        const headerRow = worksheet.getRow(1)
        headerRow.font = { bold: true, size: 14 };

        // Add data of every payment method
        for (const option of opciones)
            worksheet.addRow(option);

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

        res.setHeader('content-disposition', 'attachment; filename="Opciones Menu ID '+menuID+'.xlsx"');
        res.setHeader('Access-Control-Expose-Headers', 'content-disposition');
        res.status(200).end(fileBuffer);
    } catch (error) {
        res.status(400).send("Error al descargar el archivo");
    }
});


router.post('/', async (req, res) => {
	const { menuID } = req.query;
	console.log(req.body);
	const optionID = req.body.id;

	try {
		// Crear el registro de MenuOptions
		const menuOptionRes = await MenuOptions.create(req.body);

		// Obtener el tipo de acción y el ID de referencia
		const typeAction = req.body.action_type;
		const referenceID = req.body.reference;

		// Verificar el tipo de acción y crear la asociación correspondiente
		if (typeAction === 'catalog') {
			// Crear la asociación con Catalog
			const catalog = await Catalog.findByPk(referenceID);
			if (catalog) {
				await menuOptionRes.setCatalog(catalog.id);
			}
		} else if (typeAction === 'Submenu') {
			// Crear la asociación con Menu
			const menu = await Menu.findByPk(referenceID);
            console.log("menu creado: ", menu);
			if (menu) {
				await menuOptionRes.setSubmenu(menu.id);
			}
		}

		// Crear la asociación con MenuAndOptions
		await MenuAndOptions.create({ menuID, menuOptionsID: optionID });

		res.json(menuOptionRes);
	} catch (error) {
		res.status(400).send("Error al crear");
		console.error(error);
	}
});


router.put('/:menuResId', async (req, res)=>{
    const {menuResId} = req.params;

    try {
        const isFind = await MenuOptions.findOne({where: {id: menuResId}});
    
        if (!isFind) return res.status(404).send("Pregunta no encontrada");
    
        await MenuOptions.update(req.body, {
            where: {id: menuResId}
        });
        res.json({success: `se ha modificado ${menuResId}`});
        
    } catch (error) {
        res.status(400).send("Error al actualizar");
    }
})

router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        // Verificar si el registro existe
        const menuOption = await MenuOptions.findByPk(id);
        if (!menuOption) {
            return res.status(404).json({ message: 'Registro no encontrado' });
        }

        // Eliminar la asociación con MenuAndOptions
        await MenuAndOptions.destroy({ where: { menuOptionsID: id } });

        // Eliminar el registro de MenuOptions
        await menuOption.destroy();

        res.json({ message: 'Registro eliminado exitosamente' });
    } catch (error) {
        res.status(400).send("Error al eliminar");
        console.error(error);
    }
});


module.exports = router;