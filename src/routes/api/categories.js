const router = require("express").Router();

const { Category } = require("../../db/db");

router.get("/", async (req, res) => {
  const order = req.query.order || "ASC";
  try {
    const categories = await Category.findAll({
      order: [["name", order]],
    });
    res.json(categories);
  } catch (error) {
    res.json({ error });
  }
});

router.get("/getCategoryByState/:categoryState", async (req, res) => {
  const { categoryState } = req.params;
  const order = req.query.order;

  try {
    const category = await Category.findAll({
      where: { state: categoryState },
      order: [["name", order]],
    });
    res.json(category);
  } catch (error) {
    res.json({ error });
  }
});

router.get("/getCategoryByName/:categoryName", async (req, res) => {
  const { categoryName } = req.params;
  const order = req.query.order;

  try {
    const category = await Category.findAll({
      where: { name: categoryName },
      order: [["name", order]],
    });
    res.json(category);
  } catch (error) {
    res.json({ error });
  }
});

router.get("/:categoryId", async (req, res) => {
  const { categoryId } = req.params;
  try {
    const category = await Category.findAll({ where: { id: categoryId } });

    res.json(category);
  } catch (error) {
    res.json({ error });
  }
});

router.post("/", async (req, res) => {
  try {
    const category = await Category.create(req.body);
    res.json(category);
  } catch (error) {
    res.json({ error });
  }
});

router.put("/:categoryId", async (req, res) => {
  const { categoryId } = req.params;

  try {
    const isFind = await Category.findOne({ where: { id: categoryId } });

    if (!isFind) return res.status(404).send("Categoria no encontrada");

    await Category.update(req.body, {
      where: { id: categoryId },
    });
    res.json({ success: `se ha modificado ${categoryId}` });
  } catch (error) {
    res.json({ error });
  }
});

router.delete("/:categoryId", async (req, res) => {
  const { categoryId } = req.params;
  try {
    const isFind = await Category.findOne({ where: { id: categoryId } });

    if (!isFind) return res.status(404).send("Categoria no encontrada");

    await Category.destroy({ where: { id: categoryId } });
  } catch (error) {
    res.json({ error });
  }
});

module.exports = router;
