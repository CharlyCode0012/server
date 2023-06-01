const router = require('express').Router();

const {Shopping} = require('../../db/db');

router.get('/', async (req, res)=>{
    try {
        const shoppings = await Shopping.findAll();
        res.json(shoppings);
        
    } catch (error) {
        res.status(400).send("Error");
    }
});

router.post('/', async (req, res)=>{
    try {
        const shopping = await Shopping.create(req.body);
        res.json(shopping);    
    } catch (error) {
        res.send(400).status("Error");
    }
});

router.put('/:shoppingId', async (req, res)=>{
    const {shoppingId} = req.params;
    try {
        
        const isFind = await Shopping.findOne({where: {id: shoppingId}});
    
        if (!isFind) return res.status(404).send("Pregunta no encontrada");
    
            await Shopping.update(req.body, {
            where: {id: shoppingId}
        });
        res.json({success: `se ha modificado ${shoppingId}`});
    } catch (error) {
        res.status(400).send("Error");
    }
})

router.delete('/:shoppingId', async (req, res)=>{
    const {shoppingId} = req.params;
    try {
        const isFind = await Shopping.findOne({where: {id: shoppingId}});
        
        if (!isFind) return res.status(404).send("Pregunta no encontrada");
    
        await Shopping.destroy({where: {id: shoppingId}});  
    } catch (error) {
        res.status(400).send("Error");
    }
})

module.exports = router;