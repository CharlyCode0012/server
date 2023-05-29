const router = require('express').Router();

const {Delivery, Order} = require('../../db/db');

router.get('/', async (req, res)=>{

    try {
        const deliveries = await Delivery.findAll();

        const ordersIDS =  deliveries.map(( delivery ) => {
            return delivery.id_order;
        });

        const deliveriesRes = ordersIDS.map( async ( orderID, index ) => {

            const { state: order_state } = await Order.findOne({where: {id: orderID}});
            
            const obj = deliveries[index].dataValues.date_delivery === null ? null : {
                id: deliveries[index].dataValues.id,
                folio: deliveries[index].dataValues.folio,
                date_delivery: deliveries[index].dataValues.date_delivery,
                rest: deliveries[index].dataValues.rest,
                state: deliveries[index].dataValues.state,
                id_order: deliveries[index].dataValues.id_order,
                order_state,
                createdAt: deliveries[index].dataValues.createdAt,
                updatedAt: deliveries[index].dataValues.updatedAt,
            };

            return obj;

        });
        
        Promise.all(deliveriesRes)
        .then((resolvedDeliveries) => {
            const arrayDeliveries = resolvedDeliveries.filter(Boolean);
            res.json(arrayDeliveries);
        })
        .catch((error) => {
            console.log(error);
            res.send(error);
        });
        

    } catch (error) {
        res.send(error);
    }
    
});

router.get('/searchByState', async (req, res)=>{
    const {order, search} = req.params;
    const delivery = await Delivery.findAll({
        where: {state: search},
        order: [["date_delivery", order]]
    });

    res.json(delivery);
});

router.get('/searchByDate', async (req, res)=>{
    const {deliveryId} = req.params;
    const delivery = await Delivery.findAll({where: {id: deliveryId}});

    res.json(delivery);
});

router.get('/searchByPlace', async (req, res)=>{
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