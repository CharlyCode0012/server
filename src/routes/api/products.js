const router = require("express").Router();
const { QueryTypes } = require('sequelize');

const { Product, CatalogProduct, CategoryProd } = require("../../db/db");

router.get("/", async (req, res) => {
  try {

  const {idCatalog} = req.query || '';

  const c_products = await CatalogProduct.findAll({where: {id_catalog: idCatalog}});
  let products = [];
  if(idCatalog!== ''){
    products.push(c_products.map( async(el)=>{
      try {
        return await Product.findOne({where: {id: el.id_product}});
      } catch (error) {
        return error;
      } 
    }));
    
  }
  
   res.json(products);
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
