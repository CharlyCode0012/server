const router = require("express").Router();
const { Payment } = require("../../db/db");
const { json } = require("sequelize");

router.get("/", async (req, res) => {
  const { order } = req.query || "ASC";
  try {
    const payments = await Payment.findAll({
      order: [
        ["name", order],
        ["bank", "ASC"],
      ],
    });
    res.json(payments);
  } catch (error) {}
});

router.get("/getMethodByCard/:cardPayment", async (req, res) => {
  const { cardPayment } = req.params;

  try {
    const payment = await Payment.findAll({
      where: { no_card: cardPayment },
    });

    if (!payment) return res.json({ error: "No se encontro ese usuario" });
    return res.json(payment);
  } catch (error) {
    return res.json({ error });
  }
});

router.get("/getMethodByName/:cardName", async (req, res) => {
  const { cardName } = req.params;
  const order = req.query.order || "ASC";
  try {
    const payment = await Payment.findAll({
      where: { name: cardName },
      order: [
        ["name", order],
        ["bank", "ASC"],
      ],
    });

    if (!payment) return res.json({ error: "No se encontro ese nombre" });
    return res.json(payment);
  } catch (error) {
    return res.json({ error });
  }
});

router.get("/:paymentId", async (req, res) => {
  const { paymentId } = req.params;
  const payment = await Payment.findAll({ where: { id: paymentId } });
  res.json(payment);
});

router.post("/", async (req, res) => {
  const { order } = req.query;

  try {
    const payment = await Payment.create(req.body);
    console.log(payment);
    return res.json(payment);
  } catch (error) {
    return res.json({ error });
  }
});

router.put("/:paymentId", async (req, res) => {
  const { paymentId } = req.params;
  try {
    const isFind = await Payment.findOne({ where: { id: paymentId } });

    if (!isFind) return res.status(404).send("Metodo no encontrada");

    await Payment.update(req.body, {
      where: { id: paymentId },
    });
    res.json({ success: `se ha modificado ${paymentId}` });
  } catch (error) {
    res.json({ error });
  }
});

router.delete("/:paymentId", async (req, res) => {
  const { paymentId } = req.params;
  try {
    const isFind = await Payment.findOne({ where: { id: paymentId } });

    if (!isFind) return res.status(404).send("Metodo no encontrada");

    await Payment.destroy({ where: { id: paymentId } });
  } catch (error) {
    res.json({ error });
  }
});

module.exports = router;
