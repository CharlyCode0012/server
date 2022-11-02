const router = require('express').Router();

const {Catalog} = require('../../db/db');

router.get('/', async (req, res)=>{
    const catalogs = await Catalog.findAll();
    res.json(catalogs);
});

router.get('/:catalogId', async (req, res)=>{
    const {catalogId} = req.params;
    const catalog = await Catalog.findAll({where: {id: catalogId}});

    res.json(catalog);
});

router.post('/', async (req, res)=>{
    const catalog = Catalog.create(req.body);
    res.json(catalog);
});

router.put('/:catalogId', async (req, res)=>{
    const {catalogId} = req.params;
    const isFind = await Catalog.findOne({where: {id: catalogId}});

    if (!isFind) return res.status(404).send("Catalogo no encontrado");

     await Catalog.update(req.body, {
        where: {id: catalogId}
    });
    res.json({success: `se ha modificado ${catalogId}`});
})

router.delete('/:catalogId', async (req, res)=>{
    const {catalogId} = req.params;
    const isFind = await Catalog.findOne({where: {id: catalogId}});
    
    if (!isFind) return res.status(404).send("Catalogo no encontrado");

    await Catalog.destroy({where: {id: catalogId}});
})

module.exports = router;