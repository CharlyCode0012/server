const router = require("express").Router();
const bcrypt = require("bcryptjs");
const { User } = require("../../db/db");
const { check, validationResult } = require("express-validator");
const moment = require("moment");
const jwt = require("jwt-simple");
const { json } = require("sequelize");

const createToken = (user) => {
  const payload = {
    userId: user.id,
    createdAt: moment().unix(),
    expiredAt: moment().add(5, "minutes").unix(),
  };

  return jwt.encode(payload, "secret sentence");
};

router.get("/", async (req, res) => {
  try {
    const users = await User.findAll();
    return res.json(users);
  } catch (error) {
    return res.json({ error });
  }
});

router.get("/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findAll({
      where: { id: userId },
    });

    if (!user) return res.json({ error: "No se encontro ese usero" });

    return res.json(user);
    
  } catch (error) {
    return res.json({error});
  }
});

router.post("/", async (req, res) => {
  try {
    const user = await User.create(req.body);
    return res.json(user);
  } catch (error) {
    return console.log(json({ error }));
  }
});

router.put("/:userId", async (req, res) => {
  const { userId } = req.params;
  if (!userId) return res.status(404).send("Usero no encontrado");
  try {
    await User.update(req.body, {
      where: { id: userId },
    });

    return res.json({ success: "Se ha modificado" });
  } catch (error) {
    return res.json({ error });
  }
});

router.delete("/:userId", async (req, res) => {
  const { userId } = req.params;
  if (!userId) return res.status(404).send("Usero no encontrado");

  try {
    await User.destroy({
      where: { id: userId },
    });

    return res.json({ success: "Se ha eliminado" });
  } catch (error) {
    return res.json({ error });
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
      return res.status(422).json({ errores: errors.array() });
    }

    req.body.pass = bcrypt.hashSync(req.body.pass, 10);
    const user = await User.create(req.body);
    res.json(user);
  }
);

router.post("/login", async (req, res) => {
  const email = req.body.email || "";
  const pass = req.body.pass || "";
  const user = await User.findOne({ where: { email: email } });

  try {
    if (!user) throw "Error en email";

    const equals = bcrypt.compareSync(pass, user.pass);

    if (!equals) throw "Error en contraseña";

    res.json({ success: createToken(user) });
  } catch (error) {
    res.json({ error });
  }
});

module.exports = router;
