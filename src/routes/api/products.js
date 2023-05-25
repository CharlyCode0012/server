const express = require("express");
const router = express.Router();
const { QueryTypes } = require('sequelize');

const {conn, Product, CatalogProduct, CategoryProd, Catalog } = require("../../db/db");


Catalog.belongsToMany(Product, { through: CatalogProduct });
Product.belongsToMany(Catalog, { through: CatalogProduct });

router.get("/", async (req, res) => {
  const order = req.query.order ?? "ASC"
  const catalogId = req.query.catalogId ?? "";
  let products;
  try {

     // Remplaza con la id del catálogo que deseas obtener
     if (catalogId !== "") {
      products = await conn.query(`
        SELECT p.*, cat.category_name AS category_name, cat.id AS id_category
        FROM products p
        LEFT JOIN catalog_products cp ON cp.id_product = p.id
        LEFT JOIN catalogs c ON c.id = cp.id_catalog
        LEFT JOIN categories_products cp2 ON cp2.id_product = p.id
        LEFT JOIN categories cat ON cat.id = cp2.id_category
        WHERE c.id = :catalogId
        ORDER BY p.product_name ASC
      `, {
        replacements: { catalogId },
        type: QueryTypes.SELECT,
      });
    } else {
      products = [];
    }

    products = products.reduce((uniqueProducts, product) => {
      if (!uniqueProducts.find(p => p.id === product.id)) {
        uniqueProducts.push(product);
      }
      return uniqueProducts;
    }, []);

    res.json(products);
  } catch (error) {
    res.json(error);
  }
  
 
});

router.get('/getByKeyWord/:keyWord', async (req, res) =>{
  const { productId } = req.query;

  const product = await Product.findAll({
    where: {id: productId}
  })

  if(!product) return res.json({error: 'No se encontro ese producto'});

  res.json(product);
})

router.post("/", async (req, res) => {
  const { categoryId, catalogId } = req.query;


  try {
    const product = await Product.create(req.body);
    const productId = product.id;
  
    await CatalogProduct.create({ id_product: productId, id_catalog: catalogId });
    await CategoryProd.create({ id_product: productId, id_catalog: categoryId });
  
    res.json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ocurrió un error al crear al producto' });
  }
});

router.put("/:productId", async (req, res) => {
  const { categoryId } = req.query;
  const { productId } = req.params;

  
  try {
    if (!productId) return res.status(404).send("Producto no encontrado");

    await Product.update(req.body, {
      where:{ id: productId}
    });

    const isFind = await CategoryProd.findOne({ where: {id_product: productId }})

  if(isFind){
    await CategoryProd.update({ id_category: categoryId }, {
      where: { id_product: productId }
    }) 
  }
  else await CategoryProd.create({ id_product: productId, id_category: categoryId});

  res.json({success: 'Se ha modificado'});
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ocurrió un error al actualizar el producto' });
  }
});

router.delete("/:productId", async (req, res) => {
    const { productId } = req.params;
    try {
      if (!productId) return res.status(404).send("Producto no encontrado");
  
      await Product.destroy({
        where:{ id: productId}
      });

      res.status(200).send();
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Ocurrió un error al eliminar el producto' });
    }
    
  });

module.exports = router;
