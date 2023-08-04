const socketIO = require("socket.io");
const router = require("express").Router();
const { Op } = require("sequelize");

const { Menu, MenuOptions } = require("../../db/db");
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
      req.path === `/${req.query?.menuId}` ||
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
  const { order } = req.query;
  try {
    const menus = await Menu.findAll({
      order: [
        ["principalMenu", "DESC"],
        ["name", order === "ASC" ? "ASC" : "DESC"],
      ],
    });
    res.json(menus);
  } catch (error) {
    res.status(400).json(error);
  }
});

router.get("/searchWithName", async (req, res) => {
  const { order, search } = req.query;
  try {
    const menus = await Menu.findAll({
      where: { name: { [Op.like]: `%${search}%` } },
      order: [["name", order === "ASC" ? "ASC" : "DESC"]],
    });
    res.json(menus);
  } catch (error) {
    res.status(400).json(error);
  }
});

router.get("/searchWithText", async (req, res) => {
  const { order, search } = req.query;
  try {
    const menus = await Menu.findAll({
      where: { answer: { [Op.like]: `%${search}%` } },
      order: [["name", order === "ASC" ? "ASC" : "DESC"]],
    });
    res.json(menus);
  } catch (error) {
    res.status(400).json(error);
  }
});

router.get("/withID", async (req, res) => {
  const { menuID } = req.query;

  try {
    const menu = await Menu.findOne({ where: { id: menuID } });
    res.json(menu);
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
    const worksheet = workbook.addWorksheet("Menus");
    worksheet.columns = [
      { header: "ID", key: "id", width: 20 },
      { header: "Título", key: "name", width: 25 },
      { header: "Respuesta", key: "answer", width: 25 },
    ];

    const idColumnIndex = worksheet.getColumn("id").number;
    const idColumnCells = worksheet.getColumn(idColumnIndex);
    idColumnCells.eachCell((cell) => {
      cell.protection = {
        locked: true,
      };
    });

    // Style each column
    const idColumn = worksheet.getColumn("id"),
      titleColumn = worksheet.getColumn("name"),
      answerColumn = worksheet.getColumn("answer");

    const alignment = { horizontal: "center" };

    idColumn.alignment = alignment;
    titleColumn.alignment = alignment;
    answerColumn.alignment = alignment;

    // Style header row
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true, size: 14 };

    // Add data of every payment method
    for (const menu of menus) worksheet.addRow(menu);

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

    res.setHeader("content-disposition", 'attachment; filename="Menus.xlsx"');
    res.setHeader("Access-Control-Expose-Headers", "content-disposition");
    res.status(200).end(fileBuffer);
  } catch (error) {
    res.status(400).send("Error al descargar el archivo");
  }
});

router.post("/", async (req, res) => {
  try {
    const menu = await Menu.create(req.body);

    if (req.isSocketRequest) {
      handleMenuUpdated(); // Llamar a la función de manejo de evento 'menu_updated'
    }

    res.json(menu);
  } catch (error) {
    res.status(400).send("Error al traer");
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

    // Get every menu from the excel
    const menus = [];
    worksheet.eachRow(function (row, rowNumber) {
      if (rowNumber === 1) return;

      const [, id, name, answer] = row.values;

      menus.push({
        id,
        name: name,
        answer: answer,
      });
    });

    // For every menu, add it if ID not found, or update it if found
    for (const menu of menus) {
      if (menu.id !== undefined)
        // Menu indeed exists, update its info
        await Menu.update(menu, {
          where: { id: menu.id },
        });
      // Menu didn't exist, create a new one
      else
        await Menu.create({
          id: Date.now().toString(),
          name: menu.name,
          answer: menu.answer,
          principalMenu: 0,
        });
    }

    if (req.isSocketRequest) {
      handleMenuUpdated(); // Llamar a la función de manejo de evento 'menu_updated'
    }

    res.sendStatus(200);
  } catch (error) {
    res.status(400).send("Error al actualizar desde el archivo");
  }
});

router.put("/", async (req, res) => {
  const { menuId } = req.query;

  try {
    const isFind = await Menu.findOne({ where: { id: menuId } });

    if (!isFind) return res.status(404).send("Pregunta no encontrada");

    await Menu.update(req.body, {
      where: { id: menuId },
    });

    if (req.isSocketRequest) {
      handleMenuUpdated(); // Llamar a la función de manejo de evento 'menu_updated'
    }

    res.json({ success: `se ha modificado ${menuId}` });
  } catch (error) {
    res.status(400).send("Error al actualizar");
  }
});

router.delete("/:menuId", async (req, res) => {
  const { menuId } = req.params;
  try {
    const isFind = await Menu.findOne({ where: { id: menuId } });

    if (!isFind) return res.status(404).send("Pregunta no encontrada");

    const Options = await MenuOptions.findAll({ where: { reference: menuId } });

    for (let option of Options) {
      await MenuOptions.destroy({ where: { id: option.id } });
    }

    await Menu.destroy({ where: { id: menuId } });

    if (req.isSocketRequest) {
      handleMenuUpdated(); // Llamar a la función de manejo de evento 'menu_updated'
    }

    res.status(200).send("Se elimino");
  } catch (error) {
    console.log(error);
    res.status(400).send(error);
  }
});

module.exports = { router, io };
