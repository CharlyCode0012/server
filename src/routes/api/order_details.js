const router = require('express').Router();

const {OrderDetails} = require('../../db/db');

router.get('/', async (req, res)=>{
    try {
        const orderDetails = await OrderDetails.findAll();
        res.json(orderDetails);
        
    } catch (error) {
        res.status(400).send("Erro al traer los datos");
    }
});

router.post('/', async (req, res)=>{
    try {
        const orderDetails = await OrderDetails.create(req.body);
        res.json(orderDetails);
        
    } catch (error) {
        res.status(400).send("Error al crear");
    }
});

router.put('/:orderDetailsId', async (req, res)=>{
    const {orderDetailsId} = req.params;

    try {
        
        const isFind = await OrderDetails.findOne({where: {id: orderDetailsId}});
    
        if (!isFind) return res.status(404).send("Pregunta no encontrada");
    
        await OrderDetails.update(req.body, {
            where: {id: orderDetailsId}
        });
        res.json({success: `se ha modificado ${orderDetailsId}`});
    } catch (error) {
        res.status(400).send("Error al actualizar");
    }
})

router.delete('/:orderDetailsId', async (req, res)=>{
    const {orderDetailsId} = req.params;

    try {
        const isFind = await OrderDetails.findOne({where: {id: orderDetailsId}});
        
        if (!isFind) return res.status(404).send("Pregunta no encontrada");
    
        await OrderDetails.destroy({where: {id: orderDetailsId}});
        res.status(200).send();
        
    } catch (error) {
        res.status(400).send("Error al eliminar");
    }
})

module.exports = router;