const router = require('express').Router();

const {CatalogProduct} = require('../../db/db');

router.get('/', async (req, res)=>{
    const catalogPrs = await CatalogProduct.findAll();
    res.json(catalogPrs);
});

router.get('/:catalogPrId', async (req, res)=>{
    const {catalogPrId} = req.params;
    const catalogPr = await CatalogProduct.findAll({where: {id: catalogPrId}});

    res.json(catalogPr);
});

router.post('/', async (req, res)=>{
    const catalogPr = CatalogProduct.create(req.body);
    res.json(catalogPr);
});

router.put('/:catalogPrId', async (req, res)=>{
    const {catalogPrId} = req.params;
    const isFind = await CatalogProduct.findOne({where: {id: catalogPrId}});

    if (!isFind) return res.status(404).send("Pregunta no encontrada");

     await CatalogProduct.update(req.body, {
        where: {id: catalogPrId}
    });
    res.json({success: `se ha modificado ${catalogPrId}`});
})

router.delete('/:catalogPrId', async (req, res)=>{
    const {catalogPrId} = req.params;
    const isFind = await CatalogProduct.findOne({where: {id: catalogPrId}});
    
    if (!isFind) return res.status(404).send("Pregunta no encontrada");

    await CatalogProduct.destroy({where: {id: catalogPrId}});
})

module.exports = router;