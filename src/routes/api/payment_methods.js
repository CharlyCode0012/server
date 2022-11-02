const router = require('express').Router();

const {Payment} = require('../../db/db');

router.get('/', async (req, res)=>{
    const payment = await Payment.findAll();
    res.json(payment);
});

router.get('/:paymentId', async (req, res)=>{
    const {paymentId} = req.params;
    const payment = await Payment.findAll({where: {id: paymentId}});

    res.json(payment);
});

router.post('/', async (req, res)=>{
    const payment = Payment.create(req.body);
    res.json(payment);
});

router.put('/:paymentId', async (req, res)=>{
    const {paymentId} = req.params;
    const isFind = await Payment.findOne({where: {id: paymentId}});

    if (!isFind) return res.status(404).send("Metodo no encontrada");

     await Payment.update(req.body, {
        where: {id: paymentId}
    });
    res.json({success: `se ha modificado ${paymentId}`});
})

router.delete('/:paymentId', async (req, res)=>{
    const {paymentId} = req.params;
    const isFind = await Payment.findOne({where: {id: paymentId}});
    
    if (!isFind) return res.status(404).send("Metodo no encontrada");

    await Payment.destroy({where: {id: paymentId}});
})

module.exports = router;