const router = require("express").Router();
const ExcelJS = require("exceljs")
const { User } = require("../../db/db");
const { check, validationResult } = require("express-validator");
const { Op } = require("sequelize");

/**
 * Retrieves all the users from the DB
 */
router.get("/", async (req, res) => {
  const order = req.query.order ?? "ASC"

  try {
    const users = await User.findAll({
      order: [["name", order]]
    });

    res.json(users);
  }
  catch {
    res.sendStatus(500);
  }
});

/**
 * Returns an xlsx file that contains the info of 
 * the existing users in the DB 
 */
router.get("/download", async (req, res) => {
  try {
    // Get users from DB
    const usersQuery = await User.findAll()
    const users = JSON.parse(JSON.stringify(usersQuery))
  
    // Create excel workbook, where sheets will be stored
    const workbook = new ExcelJS.Workbook();
  
    // Create a sheet and assign to it some columns metadata to insert rows
    const worksheet = workbook.addWorksheet("Lugares de entrega")
    worksheet.columns = [
      { header: "ID", key: "id", width: 20 },
      { header: "Nombre", key: "name", width: 25 },
      { header: "Fecha de nacimiento", key: "date_B", width: 25 },
      { header: "Tipo de usuario", key: "type_use", width: 25 },
      { header: "Correo", key: "e_mail", width: 25 },
      { header: "Contraseña", key: "pass", width: 30 },
      { header: "Celular", key: "cel", width: 30 },
    ]
  
    // Style each column
    const idColumn = worksheet.getColumn("id"),
          nameColumn = worksheet.getColumn("name"),
          birthdayColumn = worksheet.getColumn("date_B"),
          userTypeColumn = worksheet.getColumn("type_use"),
          emailColumn = worksheet.getColumn("e_mail"),
          passwordColumn = worksheet.getColumn("pass"),
          cellphoneColumn = worksheet.getColumn("cel");
  
    const alignment = { horizontal: "center" };
  
    idColumn.alignment = alignment
    nameColumn.alignment = alignment
    birthdayColumn.alignment = alignment
    userTypeColumn.alignment = alignment
    emailColumn.alignment = alignment
    passwordColumn.alignment = alignment
    cellphoneColumn.alignment = alignment
  
    // Style header row
    const headerRow = worksheet.getRow(1)
    headerRow.font = { bold: true, size: 14 };
  
    // Add data of every user
    for (const user of users)
      worksheet.addRow(user)
  
    const fileBuffer = await workbook.xlsx.writeBuffer();
  
    res.attachment("Usuarios.xlsx")
    res.status(200).end(fileBuffer);
    
  } catch (error) {
    res.status(400).send(error);
  }

});

/**
 * Returns all the users that match the given ID
 */
router.get("/searchByID", async (req, res) => {
  const { order, search } = req.query
  try {
    const users = await User.findAll({ 
      where: { id: search }, 
      order: [["id", order]]
    });
    res.json(users);
  }

  catch {
    res.sendStatus(404);
  }

});

/**
 * Returns all the users that match the given name
 */
router.get("/searchByName", async (req, res) => {
  const { order, search } = req.query
  try {
    const users = await User.findAll({ 
      where: {
        name: { [Op.like]: `%${search}%` }
      },
      order: [["name", order]]
    });

    res.json(users);
  }

  catch (error) {
    res.sendStatus(404);
  }
});

/**
 * Creates a new user in the DB except when there is already
 * a user with the given cellphone
 */
router.post("/", async (req, res) => {
  const cel = req.body.cel;
  try {
    const cellphoneAlreadyTaken = (await User.findAll({ where: { cel: cel } })).length > 0;
  
    if (cellphoneAlreadyTaken) 
      return res.status(409).json({ error: "Ya hay un usuario con ese numero" });
        
    const user = await User.create(req.body);
    return res.json(user);
  } catch (error) {
    res.status(400).send("No se pudo crear");
  }
});

/**
 * Updates the password and cellphone of a user who updated
 * them in their profile
 */
router.put("/updateProfile", async (req, res) => {
  const userId = req.body.id;
  try {
      // Check if user exists
      
      const isFind = await User.findOne({ where: { id: userId } });
    
      if (!isFind) return res.status(404).send("Usuario no encontrado");
    
      // Check if cellphone repeats
      const cel = req.body.cel;
      const cellphoneAlreadyTaken = await User.findAll({ where: { cel: cel } });
    
      if (cellphoneAlreadyTaken && cellphoneAlreadyTaken.some(user => user.id !== userId)) {
        return res.status(409).json({ error: "Ya hay un usuario con ese numero" });
      }
    
      // Everything OK, update user
      await User.update({
        pass: req.body.pass,
        cel: req.body.cel,
      }, {
        where: { id: userId },
      });

      const user = await User.findOne({ where: {id: userId} });
      //console.log(JSON.stringify(user));
      res.json(user);
    } catch (error) {
      console.log(error);
      res.status(400).send("Error");
    }
})

/**
 * Updates a user in the DB
 */
router.put("/", async (req, res) => {
  const { userId } = req.query;
  try {
    // Check if user exists
    const isFind = await User.findOne({ where: { id: userId } });
    
    if (!isFind) return res.status(404).send("Usuario no encontrado");
  
    // Check if cellphone repeats
    const cel = req.body.cel;
    const cellphoneAlreadyTaken = await User.findAll({ where: { cel: cel } });
  
    if (cellphoneAlreadyTaken && cellphoneAlreadyTaken.some(user => user.id !== userId)) {
      return res.status(409).json({ error: "Ya hay un usuario con ese numero" });
    }
  
    // Everything OK, update user
    await User.update(req.body, {
      where: { id: userId },
    });
    res.json({ success: `se ha modificado ${userId}` });
  } catch (error) {
    console.log(error);
    res.status(400).send("Error");
  }
});

/**
 * Deletes a user from the DB
 */
router.delete("/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const isFind = await User.findOne({ where: { id: userId } });

    if (!isFind) return res.status(404).send("Usuario no encontrado");
  
    await User.destroy({ where: { id: userId } });
    res.status(200).send();
  } catch (error) {
    res.status(400).send("No se pudo borrar");
  }
});

router.post(
  "/register",
  [
    check("name", "El nombre de usuario es obligatorio").not().isEmpty(),
    check("pass", "La contraseña es obligatoria").not().isEmpty(),
    check("email", "El e-mail debe ser correcto").isEmail(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errores: errors.array() });
    }

    try {
      const user = await User.create(req.body);
      return res.json(user);
    } catch (error) {
      return res.json(error);
    }
    
  }
);


router.post("/login", async (req, res) => {
  const cel = req.body.cell ?? '';
  const pass = req.body.pass ?? '';
  const name = req.body.name ?? '';

  try {
    const user = await User.findOne({ where: { cel: cel } });
    if (!user) throw {statusText: 'Error en cel', cel: cel};

    const equals = user.pass;
    const equalsName = user.name;
    
    if(!(equalsName === name)) throw {statusText: 'Error en el nombre de usuario'};
    
    if (!(equals === pass)) throw {statusText: 'Error en contraseña'};

    res.json({ success: user, err: false });
  } catch (error) {
    error.status = 400;
    error.err = true;
    res.json(error);
  }
});

module.exports = router;
