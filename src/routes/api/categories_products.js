const router = require('express').Router();

const {CategoryProd} = require('../../db/db');

router.get('/', async (req, res)=>{
    const categoryProds = await CategoryProd.findAll();
    res.json(categoryProds);
});

router.get('/:categoryProdId', async (req, res)=>{
    const {categoryProdId} = req.params;
    const categoryProd = await CategoryProd.findAll({where: {id: categoryProdId}});

    res.json(categoryProd);
});

router.post('/', async (req, res)=>{
    const categoryProd = CategoryProd.create(req.body);
    res.json(categoryProd);
});

router.put('/:categoryProdId', async (req, res)=>{
    const {categoryProdId} = req.params;
    const isFind = await CategoryProd.findOne({where: {id: categoryProdId}});

    if (!isFind) return res.status(404).send("Pregunta no encontrada");

     await CategoryProd.update(req.body, {
        where: {id: categoryProdId}
    });
    res.json({success: `se ha modificado ${categoryProdId}`});
})

router.delete('/:categoryProdId', async (req, res)=>{
    const {categoryProdId} = req.params;
    const isFind = await CategoryProd.findOne({where: {id: categoryProdId}});
    
    if (!isFind) return res.status(404).send("Pregunta no encontrada");

    await CategoryProd.destroy({where: {id: categoryProdId}});
})

module.exports = router;