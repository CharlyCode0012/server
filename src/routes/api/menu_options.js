const router = require("express").Router();
const socketIO = require("socket.io");
const { Op } = require("sequelize");

const { MenuOptions, MenuAndOptions, Catalog, Menu } = require("../../db/db");
const ExcelJS = require("exceljs");
const upload = require("../../config.js");
const io = socketIO();

// Función para manejar el evento 'menu_updated'
const handleMenuUpdated = () => {
  console.log("Socket functional");
  // Emitir evento de WebSocket a todos los clientes conectados
  io.emit("menu_updated_event");
};

// Inicializar el WebSocket
io.on("connection", (socket) => {
  console.log("Cliente conectado al socket");
});

// Escuchar evento 'menu_updated' desde el cliente
io.on("menu_updated", handleMenuUpdated);

// Agregar el middleware de Socket.IO
router.use((req, res, next) => {
  // Verificar si la solicitud es un POST, PUT o DELETE en las rutas específicas
  const shouldUseSocket =
    (req.method === "POST" ||
      req.method === "PUT" ||
      req.method === "DELETE") &&
    (req.path === "/" ||
      req.path === `/${req.query?.menuResId}` ||
      req.path === "/upload"); // Rutas que modifican la base de datos

  if (shouldUseSocket) {
    // Establecer una conexión de Socket.IO para esta solicitud
    req.isSocketRequest = true;
  }

  console.log(
    "shouldUseSocket: ",
    shouldUseSocket,
    "\nisSocketRequest: ",
    req.isSocketRequest
  );

  next();
});

router.get("/", async (req, res) => {
  const { menuID, order } = req.query;
  try {
    const menuOptions = await MenuAndOptions.findAll({
      where: { menuID: menuID },
      include: [
        {
          model: MenuOptions,
          as: "menuOption", // Especifica el alias correcto aquí
          attributes: [
            "id",
            "answer",
            "option",
            "keywords",
            "action_type",
            "reference",
          ],
          include: [
            {
              model: Catalog,
              attributes: ["name"],
              as: "catalog",
            },
            {
              model: Menu,
              attributes: ["name"],
              as: "submenu",
            },
          ],
        },
      ],
    });

    const options = menuOptions.map((menuOption) => {
      const resolvedMenuOption = menuOption.menuOption;
      const typeAction = resolvedMenuOption.action_type;
      const reference = resolvedMenuOption.reference;
      let referenceName = "";

      if (typeAction === "catalog" && resolvedMenuOption.catalog) {
        referenceName = resolvedMenuOption.catalog.name;
      } else if (typeAction === "Submenu" && resolvedMenuOption.submenu) {
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

    if (order === "ASC") {
      options.sort((a, b) => b.option.localeCompare(a.option));
    } else {
      options.sort((a, b) => a.option.localeCompare(b.option));
    }

    res.json(options);
  } catch (error) {
    console.error(error);
    res.status(400).send("Error al traer");
  }
});

router.get("/searchByKeyWord", async (req, res) => {
  const { menuID, search, order } = req.query;
  try {
    const menuOptions = await MenuAndOptions.findAll({
      where: { menuID: menuID },
      include: [
        {
          model: MenuOptions,
          as: "menuOption", // Especifica el alias correcto aquí
          where: { keywords: { [Op.like]: `%${search}%` } },
          attributes: [
            "id",
            "answer",
            "option",
            "keywords",
            "action_type",
            "reference",
          ],
          include: [
            {
              model: Catalog,
              attributes: ["name"],
              as: "catalog",
            },
            {
              model: Menu,
              attributes: ["name"],
              as: "submenu",
            },
          ],
        },
      ],
    });

    const options = menuOptions.map((menuOption) => {
      const resolvedMenuOption = menuOption.menuOption;
      const typeAction = resolvedMenuOption.action_type;
      const reference = resolvedMenuOption.reference;
      let referenceName = "";

      if (typeAction === "catalog" && resolvedMenuOption.catalog) {
        referenceName = resolvedMenuOption.catalog.name;
      } else if (typeAction === "Submenu" && resolvedMenuOption.submenu) {
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

    if (order === "ASC") {
      options.sort((a, b) => b.option.localeCompare(a.option));
    } else {
      options.sort((a, b) => a.option.localeCompare(b.option));
    }

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
    const menuOptions = await MenuAndOptions.findAll({
      where: { menuID: menuID },
    });

    const options = await Promise.all(
      menuOptions.map(async (menuOption) => {
        const resolvedMenuOption = await MenuOptions.findOne({
          where: { id: menuOption.menuOptionsID },
        });
        return resolvedMenuOption.dataValues;
      })
    );
    const opciones = JSON.parse(JSON.stringify(options));

    // Create excel workbook, where sheets will be stored
    const workbook = new ExcelJS.Workbook();

    // Create a sheet and assign to it some columns metadata to insert rows
    const worksheet = workbook.addWorksheet("Opciones");
    worksheet.columns = [
      { header: "ID", key: "id", width: 20 },
      { header: "Opción", key: "option", width: 25 },
      { header: "Respuesta", key: "answer", width: 30 },
      { header: "Palabra clave", key: "keywords", width: 25 },
      { header: "Acción", key: "action_type", width: 25 },
      { header: "Referencia ID", key: "reference", width: 25 },
    ];

    // Style each column
    const idColumn = worksheet.getColumn("id"),
      optionColumn = worksheet.getColumn("option"),
      answerColumn = worksheet.getColumn("answer"),
      keyWordColumn = worksheet.getColumn("keywords"),
      actionTypeColumn = worksheet.getColumn("action_type"),
      referenceColumn = worksheet.getColumn("reference");

    const alignment = { horizontal: "center" };

    idColumn.alignment = alignment;
    optionColumn.alignment = alignment;
    keyWordColumn.alignment = alignment;
    actionTypeColumn.alignment = alignment;
    answerColumn.alignment = alignment;
    referenceColumn.alignment = alignment;

    // Style header row
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true, size: 14 };

    // Add data of every payment method
    for (const option of opciones) worksheet.addRow(option);

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
      'attachment; filename="Opciones Menu ID ' + menuID + '.xlsx"'
    );
    res.setHeader("Access-Control-Expose-Headers", "content-disposition");
    res.status(200).end(fileBuffer);
  } catch (error) {
    res.status(400).send("Error al descargar el archivo");
  }
});

router.post("/", async (req, res) => {
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
    if (typeAction === "catalog") {
      // Crear la asociación con Catalog
      const catalog = await Catalog.findByPk(referenceID);
      if (catalog) {
        await menuOptionRes.setCatalog(catalog.id);
      }
    } else if (typeAction === "Submenu") {
      // Crear la asociación con Menu
      const menu = await Menu.findByPk(referenceID);
      console.log("menu creado: ", menu);
      if (menu) {
        await menuOptionRes.setSubmenu(menu.id);
      }
    }

    // Crear la asociación con MenuAndOptions
    await MenuAndOptions.create({ menuID, menuOptionsID: optionID });

    if (req.isSocketRequest) {
      handleMenuUpdated(); // Llamar a la función de manejo de evento 'menu_updated'
    }

    res.json(menuOptionRes);
  } catch (error) {
    res.status(400).send("Error al crear");
    console.error(error);
  }
});
/**
 * Takes an excel file from the request, analices it's data and
 * - If correct, updates the table
 * - If incorrect, returns the corresponding error to the client
 */
router.post("/upload", upload.single("excel_file"), async (req, res) => {
  const file = req.file;
  const menuID = req.query.info;

  try {
    // Create excel info getter
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(file.path);
    const worksheet = workbook.getWorksheet(1);

    // Get every menu from the excel
    const menuOptions = [];
    worksheet.eachRow(function (row, rowNumber) {
      if (rowNumber === 1) return;

      const [, id, option, answer, keywords, action_type, reference] =
        row.values;

      menuOptions.push({
        id: id,
        answer: answer,
        option: option,
        keywords: keywords,
        action_type: action_type,
        reference: reference,
      });
    });

    // For every menu, add it if ID not found, or update it if found
    for (const menuOption of menuOptions) {
      if (menuOption.id !== undefined) {
        // Menu indeed exists, update its info
        await MenuOptions.update(menuOption, {
          where: { id: menuOption.id },
        });
        // Menu didn't exist, create a new one
      } else {
        const id = Date.now().toString();
        const menuOptionRes = await MenuOptions.create({
          id: id,
          answer: menuOption.answer,
          option: menuOption.option,
          keywords: menuOption.keywords,
          action_type: menuOption.action_type,
          reference: menuOption.reference,
        });

        const typeAction = menuOption.action_type;
        const referenceID = menuOption.reference;
        console.log("typeAction", typeAction, "\n\nreferenceID: ", referenceID);
        // Verificar el tipo de acción y crear la asociación correspondiente
        if (typeAction === "catalog") {
          // Crear la asociación con Catalog
          const catalog = await Catalog.findByPk(referenceID);
          if (catalog) {
            await menuOptionRes.setCatalog(catalog.id);
          }
        } else if (typeAction === "Submenu") {
          // Crear la asociación con Menu
          const menu = await Menu.findByPk(referenceID);
          console.log("menu creado: ", menu);
          if (menu) {
            await menuOptionRes.setSubmenu(menu.id);
          }
        }

        await MenuAndOptions.create({
          menuID: menuID,
          menuOptionsID: id,
        });
      }
    }

    if (req.isSocketRequest) {
      handleMenuUpdated(); // Llamar a la función de manejo de evento 'menu_updated'
    }

    res.sendStatus(200);
  } catch (error) {
    console.log(error);
    res.status(400).send("Error al actualizar desde el archivo");
  }
});

router.put("/", async (req, res) => {
  const { menuResId } = req.query;

  try {
    const isFind = await MenuOptions.findOne({ where: { id: menuResId } });

    if (!isFind) return res.status(404).send("Pregunta no encontrada");

    await MenuOptions.update(req.body, {
      where: { id: menuResId },
    });

    const updatedMenuOptionRes = await MenuOptions.findByPk(menuResId); // Obtener el objeto MenuOptions actualizado

    const typeAction = req.body.action_type;
    const referenceID = req.body.reference;

    if (typeAction === "catalog") {
      // Crear la asociación con Catalog
      const catalog = await Catalog.findByPk(referenceID);
      if (catalog) {
        await updatedMenuOptionRes.setCatalog(catalog.id);
      }
    } else if (typeAction === "Submenu") {
      // Crear la asociación con Menu
      const menu = await Menu.findByPk(referenceID);
      console.log("menu creado: ", menu);
      if (menu) {
        await updatedMenuOptionRes.setSubmenu(menu.id);
      }
    }

    if (req.isSocketRequest) {
      handleMenuUpdated(); // Llamar a la función de manejo de evento 'menu_updated'
    }

    res.json({ success: `se ha modificado ${menuResId}` });
  } catch (error) {
    console.log(error);
    res.status(400).send("Error al actualizar");
  }
});

router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    // Verificar si el registro existe
    const menuOption = await MenuOptions.findByPk(id);
    if (!menuOption) {
      return res.status(404).json({ message: "Registro no encontrado" });
    }

    // Eliminar la asociación con MenuAndOptions
    await MenuAndOptions.destroy({ where: { menuOptionsID: id } });

    // Eliminar el registro de MenuOptions
    await menuOption.destroy();

    if (req.isSocketRequest) {
      handleMenuUpdated(); // Llamar a la función de manejo de evento 'menu_updated'
    }

    res.json({ message: "Registro eliminado exitosamente" });
  } catch (error) {
    res.status(400).send("Error al eliminar");
    console.error(error);
  }
});

module.exports = { router, io };
