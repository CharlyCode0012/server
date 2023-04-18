const router = require("express").Router();
const { User } = require("../../db/db");
const { check, validationResult } = require("express-validator");
const { json } = require("sequelize");
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

const formatCel = (text) => {
  let temp = text.replace(/[\s-]/g, "");

  let numbers = temp.substring(0,2);
  let restNumber = temp.substring(2);
  restNumber = restNumber.match(/.{1,4}/g);

  if(Array.isArray(restNumber))
    restNumber = restNumber.join("-");
  
  if(restNumber != null) numbers = numbers + "-" + restNumber;

  return numbers;
}

/**
 * Creates a new user in the DB except when there is already
 * a user with the given cellphone
 */
router.post("/", async (req, res) => {
  const cel = req.body.cel;
  const cellphoneAlreadyTaken = (await User.findAll({ where: { cel: cel } })).length > 0;

  if (cellphoneAlreadyTaken) 
    return res.status(409).json({ error: "Ya hay un usuario con ese numero" });
      
  const user = await User.create(req.body);
  return res.json(user);
});

/**
 * Updates a user in the DB
 */
router.put("/:userId", async (req, res) => {
  // Check if user exists
  const { userId } = req.params;
  const isFind = await User.findOne({ where: { id: userId } });

  if (!isFind) return res.status(404).send("Usuario no encontrado");

  // Check if cellphone repeats
  const cel = req.body.cel;
  const cellphoneAlreadyTaken = (await User.findAll({ where: { cel: cel } })).length > 0;

  if (cellphoneAlreadyTaken) 
    return res.status(409).json({ error: "Ya hay un usuario con ese numero" });

  // Everything OK, update user
  await User.update(req.body, {
    where: { id: userId },
  });
  res.json({ success: `se ha modificado ${userId}` });
});

/**
 * Deletes a user from the DB
 */
router.delete("/:userId", async (req, res) => {
  const { userId } = req.params;
  const isFind = await User.findOne({ where: { id: userId } });

  if (!isFind) return res.status(404).send("Usuario no encontrado");

  await User.destroy({ where: { id: userId } });
  res.status(200).send();
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
