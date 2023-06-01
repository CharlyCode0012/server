const router = require('express').Router();

const {SoldProd} = require('../../db/db');

router.get('/', async (req, res)=>{
    try {
        const soldProds = await SoldProd.findAll();
        res.json(soldProds);
        
    } catch (error) {
        res.send(error);
    }
});

router.get('/:soldProdId', async (req, res)=>{
    const {soldProdId} = req.params;
    try {
        const soldProd = await SoldProd.findAll({where: {id: soldProdId}});
    
        res.json(soldProd);
        
    } catch (error) {
        res.status(400).send("Error");
    }
});

router.post('/', async (req, res)=>{
    try {
        const soldProd = await SoldProd.create(req.body);
        res.json(soldProd);
    } catch (error) {
        res.send("error");
    }
});

router.put('/:soldProdId', async (req, res)=>{
    const {soldProdId} = req.params;

    try {
        
        const isFind = await SoldProd.findOne({where: {id: soldProdId}});
    
        if (!isFind) return res.status(404).send("Pregunta no encontrada");
    
         await SoldProd.update(req.body, {
            where: {id: soldProdId}
        });
        res.json({success: `se ha modificado ${soldProdId}`});
    } catch (error) {
        res.status(400).send("Error");
    }
})

router.delete('/:soldProdId', async (req, res)=>{
    const {soldProdId} = req.params;
    try {
        const isFind = await SoldProd.findOne({where: {id: soldProdId}});
        
        if (!isFind) return res.status(404).send("Pregunta no encontrada");
    
        await SoldProd.destroy({where: {id: soldProdId}});
        
    } catch (error) {
        res.status(400).send("Error");
    }
})

module.exports = router;