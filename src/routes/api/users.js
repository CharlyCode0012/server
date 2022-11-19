const router = require("express").Router();
const bcrypt = require("bcryptjs");
const { User } = require("../../db/db");
const { check, validationResult } = require("express-validator");
const moment = require("moment");
const jwt = require("jwt-simple");
const { json } = require("sequelize");

const createToken = (user) => {
  const payload = {
    id: user.id,
    createdAt: moment().unix(),
    expiredAt: moment().add(5, "minutes").unix(),
  };

  return jwt.encode(payload, "secret sentence");
};

router.get("/", async (req, res) => {
  const order = req.query.order || "ASC";
  try {
    const users = await User.findAll({ order: [["name", order]] });

    return res.json(users);
  } catch (error) {
    return res.json({ error });
  }
});

router.get("/getUserByName/:userName", async (req, res) => {
  const { userName } = req.params;
  const order = req.query.order;
  try {
    const user = await User.findAll({
      where: { name: userName },
      order: [["name", order]],
    });

    if (!user) return res.json({ error: "No se encontro ese usuario" });
    return res.json(user);
  } catch (error) {
    return res.json({ error });
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

router.get("/getUserByCel/:userCel", async (req, res) => {
  let { userCel } = req.params;
  userCel = userCel.replace(/[-]/g, "");
  const {order} = req.query || "ASC"
  try {
    /* const user = await User.findAll({
      where: { cel: userCel },
    }); */

    const Users= await User.findAll({order:[["name", order]]});

    let users = Users.map((user, index)=>{
      user.cel = user.cel.replace(/[-]/g, "");
      if(user.cel.includes(userCel)){
        user.cel = formatCel(user.cel);
        return user;
      }
    })
    users = users.filter(Boolean);

    if (!users) return res.json({ error: "No se encontro ese usuario" });
    return res.json(users);
  } catch (error) {
    return res.json({ error });
  }
});

router.post("/", async (req, res) => {
  try {
    const cel = req.body.cel;

    const exist = await User.findAll({ where: { cel: cel } });

    if (exist.length > 0) {
      return res.json({ err: true, status: 400, statusText: "Ya hay un usuario con ese numero" });
    } else {
      const user = await User.create(req.body);
      return res.json(user);
    }
  } catch (error) {
    return console.log(json({ error }));
  }
});

router.put("/:userId", async (req, res) => {
  const { userId } = req.params;

  if (!userId) return res.status(404).send("Usuario no encontrado");
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
  if (!userId) return res.status(404).send("Usuario no encontrado");

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
  const cel = req.body.cel || '';
  const pass = req.body.pass || '';
  const name = req.body.name || '';

  try {
    const user = await User.findOne({ where: { cel: cel } });
    if (!user) throw {statusText: 'Error en cel'};

    const equals = user.pass;
    const equalsName = user.name;
    
    if(!(equalsName === name)) throw {statusText: 'Error en el nombre de usuario'};
    
    if (!(equals === pass)) throw {statusText: 'Error en contraseña'};

    res.json({ success: user });
  } catch (error) {
    error.status = 400;
    error.err = true;
    res.json(error);
  }
});

module.exports = router;
