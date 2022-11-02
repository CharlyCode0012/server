const router = require('express').Router();

const {OrderDetails} = require('../../db/db');

router.get('/', async (req, res)=>{
    const orderDetails = await OrderDetails.findAll();
    res.json(orderDetails);
});

router.get('/:orderDetailsId', async (req, res)=>{
    const {orderDetailsId} = req.params;
    const orderDetails = await OrderDetails.findAll({where: {id: orderDetailsId}});

    res.json(orderDetails);
});

router.post('/', async (req, res)=>{
    const orderDetails = OrderDetails.create(req.body);
    res.json(orderDetails);
});

router.put('/:orderDetailsId', async (req, res)=>{
    const {orderDetailsId} = req.params;
    const isFind = await OrderDetails.findOne({where: {id: orderDetailsId}});

    if (!isFind) return res.status(404).send("Pregunta no encontrada");

     await OrderDetails.update(req.body, {
        where: {id: orderDetailsId}
    });
    res.json({success: `se ha modificado ${orderDetailsId}`});
})

router.delete('/:orderDetailsId', async (req, res)=>{
    const {orderDetailsId} = req.params;
    const isFind = await OrderDetails.findOne({where: {id: orderDetailsId}});
    
    if (!isFind) return res.status(404).send("Pregunta no encontrada");

    await OrderDetails.destroy({where: {id: orderDetailsId}});
})

module.exports = router;