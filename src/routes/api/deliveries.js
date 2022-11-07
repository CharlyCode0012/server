const router = require('express').Router();

const {Delivery} = require('../../db/db');

router.get('/', async (req, res)=>{
    const deliveries = await Delivery.findAll();
    res.json(deliveries);
});

router.get('/:deliveryId', async (req, res)=>{
    const {deliveryId} = req.params;
    const delivery = await Delivery.findAll({where: {id: deliveryId}});

    res.json(delivery);
});

router.post('/', async (req, res)=>{
    const delivery = await Delivery.create(req.body);
    res.json(delivery);
});

router.put('/:deliveryId', async (req, res)=>{
    const {deliveryId} = req.params;
    const isFind = await Delivery.findOne({where: {id: deliveryId}});

    if (!isFind) return res.status(404).send("Pregunta no encontrada");

     await Delivery.update(req.body, {
        where: {id: deliveryId}
    });
    res.json({success: `se ha modificado ${deliveryId}`});
})

router.delete('/:deliveryId', async (req, res)=>{
    const {deliveryId} = req.params;
    const isFind = await Delivery.findOne({where: {id: deliveryId}});
    
    if (!isFind) return res.status(404).send("Pregunta no encontrada");

    await Delivery.destroy({where: {id: deliveryId}});
})

module.exports = router;