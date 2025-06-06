const router = require("express").Router();

const { Op } = require("sequelize");

const { Client } = require("../../db/db");

router.get("/", async (req, res) => {
  const { order } = req.query;
  try {
    const clients = await Client.findAll({
      order: [["purcharses", order === "ASC" ? "ASC" : "DESC"]],
    });
    res.json(clients);
  } catch (error) {
    res.status(400).send("Error al traer los datos");
  }
});

router.get("/searchByNumber", async (req, res) => {
  const { order, search } = req.query;
  try {
    const clients = await Client.findAll({
      where: { number: { [Op.like]: `%${search}%` } },
      order: [["purcharses", order === "ASC" ? "ASC" : "DESC"]],
    });
    res.json(clients);
  } catch (error) {
    res.status(400).send("Error al traer los datos");
  }
});

router.get("/searchByQuantity", async (req, res) => {
  const { order, search } = req.query;
  try {
    const clients = await Client.findAll({ where: { purcharses: search } });
    res.json(clients);
  } catch (error) {
    res.status(400).send("Error al traer los datos");
  }
});

router.post("/", async (req, res) => {
  try {
    const Client = await Client.create(req.body);
    res.json(Client);
  } catch (error) {
    res.status(400).send("Error al crear");
  }
});

router.put("/:clientId", async (req, res) => {
  const { clientId } = req.params;

  try {
    const isFind = await Client.findOne({ where: { number: clientId } });

    if (!isFind) return res.status(404).send("Client@ no encontrad@");

    await Client.update(req.body, {
      where: { number: clientId },
    });
    res.json({ success: `se ha modificado ${clientId}` });
  } catch (error) {
    res.status(400).send("Errro al actualizar");
  }
});

router.delete("/:clientId", async (req, res) => {
  const { clientId } = req.params;

  try {
    const isFind = await Client.findOne({ where: { number: clientId } });

    if (!isFind) return res.status(404).send("Client@ no encontrad@");

    await Client.destroy({ where: { number: clientId } });
  } catch (error) {
    res.status(400).send("Error al borrar");
  }
});

module.exports = router;
