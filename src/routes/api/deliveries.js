const router = require('express').Router();

const { QueryTypes } = require('sequelize');
const {Delivery, Order, conn} = require('../../db/db');

router.get('/', async (req, res)=>{

    try {
        const deliveries = await conn.query(
            `
            SELECT deliveries.*, orders.state as order_state, products.key_word
            FROM deliveries
            INNER JOIN orders ON deliveries.id_order = orders.id
            INNER JOIN products ON deliveries.id_product = products.id
            `,
            { type: QueryTypes.SELECT }
        );
        
        const arrayDeliveries = deliveries.map((delivery) => {
            if (delivery.date_delivery === null) {
                return null;
            }

            return {
                id: delivery.id,
                folio: delivery.folio,
                date_delivery: delivery.date_delivery,
                rest: delivery.rest,
                state: delivery.state,
                id_order: delivery.id_order,
                order_state: delivery.order_state,
                createdAt: delivery.createdAt,
                updatedAt: delivery.updatedAt,
                key_word: delivery.key_word,
            };
        });

        res.json(arrayDeliveries.filter(Boolean));
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