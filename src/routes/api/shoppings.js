const router = require('express').Router();

const {Shopping} = require('../../db/db');

router.get('/', async (req, res)=>{
    const shoppings = await Shopping.findAll();
    res.json(shoppings);
});

router.get('/:shoppingId', async (req, res)=>{
    const {shoppingId} = req.params;
    const shopping = await Shopping.findAll({where: {id: shoppingId}});

    res.json(shopping);
});

router.post('/', async (req, res)=>{
    const shopping = await Shopping.create(req.body);
    res.json(shopping);
});

router.put('/:shoppingId', async (req, res)=>{
    const {shoppingId} = req.params;
    const isFind = await Shopping.findOne({where: {id: shoppingId}});

    if (!isFind) return res.status(404).send("Pregunta no encontrada");

     await Shopping.update(req.body, {
        where: {id: shoppingId}
    });
    res.json({success: `se ha modificado ${shoppingId}`});
})

router.delete('/:shoppingId', async (req, res)=>{
    const {shoppingId} = req.params;
    const isFind = await Shopping.findOne({where: {id: shoppingId}});
    
    if (!isFind) return res.status(404).send("Pregunta no encontrada");

    await Shopping.destroy({where: {id: shoppingId}});
})

module.exports = router;