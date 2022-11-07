const router = require('express').Router();

const {SoldProd} = require('../../db/db');

router.get('/', async (req, res)=>{
    const soldProds = await SoldProd.findAll();
    res.json(soldProds);
});

router.get('/:soldProdId', async (req, res)=>{
    const {soldProdId} = req.params;
    const soldProd = await SoldProd.findAll({where: {id: soldProdId}});

    res.json(soldProd);
});

router.post('/', async (req, res)=>{
    const soldProd = await SoldProd.create(req.body);
    res.json(soldProd);
});

router.put('/:soldProdId', async (req, res)=>{
    const {soldProdId} = req.params;
    const isFind = await SoldProd.findOne({where: {id: soldProdId}});

    if (!isFind) return res.status(404).send("Pregunta no encontrada");

     await SoldProd.update(req.body, {
        where: {id: soldProdId}
    });
    res.json({success: `se ha modificado ${soldProdId}`});
})

router.delete('/:soldProdId', async (req, res)=>{
    const {soldProdId} = req.params;
    const isFind = await SoldProd.findOne({where: {id: soldProdId}});
    
    if (!isFind) return res.status(404).send("Pregunta no encontrada");

    await SoldProd.destroy({where: {id: soldProdId}});
})

module.exports = router;