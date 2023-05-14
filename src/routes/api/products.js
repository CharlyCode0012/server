const router = require("express").Router();
const { QueryTypes } = require('sequelize');

const { sequelize, Product, CatalogProduct, CategoryProd } = require("../../db/db");

router.get("/", async (req, res) => {
  const order = req.query.order ?? "ASC"
  const catalogId = req.query.idCatalog.toString() ?? "";
  let products;
  try {

     // Remplaza con la id del catálogo que deseas obtener
    if(catalogId !== ""){

        products = await sequelize.query(`
          SELECT p.*
          FROM products p
          INNER JOIN catalog_products cp ON cp.id_product = p.id
          INNER JOIN catalogs c ON c.id = cp.id_catalog
          WHERE c.id = :catalogId
      `, {
          replacements: { catalogId },
          type: QueryTypes.SELECT,
          model: Product,
          mapToModel: true,
      });
    }
    else{
      products = [];
    }
  //const products = await Product.findAll();
  
   res.json(catalogId);
  } catch (error) {
    res.json(error);
  }
  
 
});

router.get('/getByKeyWord/:keyWord', async (req, res) =>{
  const {productId} = req.params;

  const product = await Product.findAll({
    where: {id: productId}
  })

  if(!product) return res.json({error: 'No se encontro ese producto'});

  res.json(product);
})

router.post("/", async (req, res) => {
  const product = await Product.create(req.body);
  res.json(product);
});

router.put("/:productId", async (req, res) => {
  const { productId } = req.params;
  if (!productId) return res.status(404).send("Producto no encontrado");

  await Product.update(req.body, {
    where:{ id: productId}
  });
  res.json({success: 'Se ha modificado'})
});

router.delete("/:productId", async (req, res) => {
    const { productId } = req.params;
    if (!productId) return res.status(404).send("Producto no encontrado");
  
    await Product.destroy({
      where:{ id: productId}
    });
    res.json({success: 'Se ha eliminado'})
  });

module.exports = router;
