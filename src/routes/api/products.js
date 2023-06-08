const express = require("express");
const router = express.Router();
const { QueryTypes, Op } = require('sequelize');


const {conn, Product, CatalogProduct, CategoryProd, Catalog } = require("../../db/db");


Catalog.belongsToMany(Product, { through: CatalogProduct });
Product.belongsToMany(Catalog, { through: CatalogProduct });

async function keyWordExists(keyWord, productID = null){
  try { 
    const isFindKey = productID
    ? await Product.findOne({ where: {
        key_word: keyWord,
        id:{
          [Op.ne]: productID
        }
    }}) 
    : await Product.findOne({ where: {key_word: keyWord }});

    return isFindKey? true  : false;
  } catch (error) {
    console.log(error);
    return true;
  }  
}

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
        ORDER BY p.product_name ${order}
      `, {
        replacements: { catalogId, order },
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

router.get('/searchByKeyWord', async (req, res) =>{
  const { order, search, catalogId } = req.query;
  let products = [];

  try {
    if (catalogId !== "") {
      products = await conn.query(`
        SELECT p.*, cat.category_name AS category_name, cat.id AS id_category
        FROM products p
        LEFT JOIN catalog_products cp ON cp.id_product = p.id
        LEFT JOIN catalogs c ON c.id = cp.id_catalog
        LEFT JOIN categories_products cp2 ON cp2.id_product = p.id
        LEFT JOIN categories cat ON cat.id = cp2.id_category
        WHERE p.key_word = :search
        ORDER BY p.product_name ${order === 'ASC' ? 'ASC' : 'DESC'}
      `, {
        replacements: { search },
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
    return res.status(400).send({ error: 'Un error en la busqueda'});
  }
  
});

router.get('/searchByStock', async (req, res) =>{
  const { order, search, catalogId } = req.query;
  let products = [];

  try {
    if (catalogId !== "") {
      products = await conn.query(`
        SELECT p.*, cat.category_name AS category_name, cat.id AS id_category
        FROM products p
        LEFT JOIN catalog_products cp ON cp.id_product = p.id
        LEFT JOIN catalogs c ON c.id = cp.id_catalog
        LEFT JOIN categories_products cp2 ON cp2.id_product = p.id
        LEFT JOIN categories cat ON cat.id = cp2.id_category
        WHERE p.stock = :search
        ORDER BY p.product_name ${order === 'ASC' ? 'ASC' : 'DESC'}
      `, {
        replacements: { search },
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
    return res.status(400).send({ error: 'Un error en la busqueda'});
  }
  
});

router.get('/searchByName', async (req, res) =>{
  const { order, search, catalogId } = req.query;
  let products = [];

  try {
    if (catalogId !== "") {
      products = await conn.query(`
        SELECT p.*, cat.category_name AS category_name, cat.id AS id_category
        FROM products p
        LEFT JOIN catalog_products cp ON cp.id_product = p.id
        LEFT JOIN catalogs c ON c.id = cp.id_catalog
        LEFT JOIN categories_products cp2 ON cp2.id_product = p.id
        LEFT JOIN categories cat ON cat.id = cp2.id_category
        WHERE p.product_name LIKE :search
        ORDER BY p.product_name ${order === 'ASC' ? 'ASC' : 'DESC'}
      `, {
        replacements: { search: `%${ search }%` },
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
    return res.status(400).send({ error: 'Un error en la busqueda'});
  }
  
});


router.get('/searchByPrice', async (req, res) =>{
  const { order, search, catalogId } = req.query;
  let products = [];

  try {
    if (catalogId !== "") {
      products = await conn.query(`
        SELECT p.*, cat.category_name AS category_name, cat.id AS id_category
        FROM products p
        LEFT JOIN catalog_products cp ON cp.id_product = p.id
        LEFT JOIN catalogs c ON c.id = cp.id_catalog
        LEFT JOIN categories_products cp2 ON cp2.id_product = p.id
        LEFT JOIN categories cat ON cat.id = cp2.id_category
        WHERE p.price = :search
        ORDER BY p.product_name ${order === 'ASC' ? 'ASC' : 'DESC'}
      `, {
        replacements: { search },
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
    return res.status(400).send({ error: 'Un error en la busqueda'});
  }
  
})

router.post("/", async (req, res) => {
  const { categoryId, catalogId } = req.query;
  const { key_word } = req.body;

  try {
    if(! await keyWordExists(key_word ?? "")){
      const product = await Product.create(req.body);
      const productId = product.id;
  
      await CatalogProduct.create({ id_product: productId, id_catalog: catalogId });
      await CategoryProd.create({ id_product: productId, id_catalog: categoryId });
  
      res.json(product);
    }
    else
      throw({statusText: "Ya existe un producto con esa palabra clave"});
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ocurrió un error al crear al producto' });
  }
});

router.put("/:productId", async (req, res) => {
  const { categoryId } = req.query;
  const { productId } = req.params;
  const { key_word } = req.body;
  try {
    if (!productId) return res.status(404).send("Producto no encontrado");

    if(! await keyWordExists(key_word ?? "", productId)){

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
    }
    else
      throw({statusText: "Ya existe un producto con esa palabra clave"});
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
