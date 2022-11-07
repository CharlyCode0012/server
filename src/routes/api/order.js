const router = require('express').Router();
const { json } = require("sequelize");
const {Order} = require('../../db/db');

router.get('/', async (req, res)=>{
    const orders = await Order.findAll();
    res.json(orders);
});

router.get('/:orderId', async (req, res)=>{
    const {orderId} = req.params;
    const order = await Order.findAll({where: {id: orderId}});

    res.json(order);
});

router.post('/', async (req, res)=>{
    const order = await Order.create(req.body);
    res.json(order);
});

router.put('/:orderId', async (req, res)=>{
    const {orderId} = req.params;
    const isFind = await Order.findOne({where: {id: orderId}});

    if (!isFind) return res.status(404).send("Categoria no encontrada");

     await Order.update(req.body, {
        where: {id: orderId}
    });
    res.json({success: `se ha modificado ${orderId}`});
})

router.delete('/:orderId', async (req, res)=>{
    const {orderId} = req.params;
    const isFind = await Order.findOne({where: {id: orderId}});
    
    if (!isFind) return res.status(404).send("Categoria no encontrada");

    await Order.destroy({where: {id: orderId}});
})

module.exports = router;