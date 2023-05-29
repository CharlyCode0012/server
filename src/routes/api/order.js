const router = require('express').Router();

const { QueryTypes } = require('sequelize');
const {conn, Order, Delivery} = require('../../db/db');
const { Op } = require("sequelize");

router.get('/', async (req, res)=>{
    const order = req.query.order ?? "ASC";
    try {
        const orders = await conn.query(`
            SELECT o.id, o.folio, o.date_order, o.total, o.amount, o.state, o.id_client, p.address AS place, p2.no_card AS payment
            FROM orders o
            LEFT JOIN places_deliveries p ON p.id = o.id_place
            LEFT JOIN payment_methods p2 ON p2.id = id_payment_method
            WHERE o.state = 'NA'
            ORDER BY o.folio ${order}
        `, {
            replacements: { order },
            type: QueryTypes.SELECT,
        });
        res.json(orders);
    } catch (error) {
        res.send(error);
    }
    
});

router.get( '/searchByState', async ( req, res ) => {
    const { order, search } = req.query
    try {
        const query = `
            SELECT o.id, o.folio, o.date_order, o.total, o.amount, o.state, o.id_client, p.address AS place, p2.no_card AS payment
            FROM orders o
            LEFT JOIN places_deliveries p ON p.id = o.id_place
            LEFT JOIN payment_methods p2 ON p2.id = o.id_payment_method
            WHERE o.state LIKE :search
            ORDER BY o.folio ${order}
        `;
        const orders = await conn.query(query, {
            replacements: { search: `%${search}%` },
            type: QueryTypes.SELECT,
        });
        res.json(orders);
    } catch (error) {
        res.sendStatus(404);
    }  
});

router.get('/searchByPlace', async (req, res) => {
    const { order, search } = req.query;
    try {
        const orders = await conn.query(`
            SELECT o.id, o.folio, o.date_order, o.total, o.amount, o.state, o.id_client, p.address AS place, p2.no_card AS payment
            FROM orders o
            LEFT JOIN places_deliveries p ON p.id = o.id_place
            LEFT JOIN payment_methods p2 ON p2.id = o.id_payment_method
            WHERE p.address LIKE :search AND o.state = 'NA'
            ORDER BY o.folio ${order === 'DESC' ? 'DESC' : 'ASC'}
        `, {
            replacements: { search: `%${search}%` },
            type: QueryTypes.SELECT,
        });

        res.json(orders);
    } catch (error) {
        res.send(error);
    }
});


router.get('/searchByDate', async (req, res)=>{
    const { order, search } = req.query;

    try {
        const orders = await conn.query(`
            SELECT o.id, o.folio, o.date_order, o.total, o.amount, o.state, o.id_client, p.address AS place, p2.no_card AS payment
            FROM orders o
            LEFT JOIN places_deliveries p ON p.id = o.id_place
            LEFT JOIN payment_methods p2 ON p2.id = o.id_payment_method
            WHERE o.date_order LIKE :search 
            ORDER BY o.folio ${order === 'DESC' ? 'DESC' : 'ASC'}
        `, {
            replacements: { search: `%${search}%` },
            type: QueryTypes.SELECT,
        });
    
        res.json(orders);
    } catch (error) {
        res.send(error);
    }

    
});


router.post('/', async (req, res)=>{
    const order = await Order.create(req.body);
    res.json(order);
});

router.put('/:orderId', async (req, res)=>{
    const {state} = req.body;
    const {folio} = req.query;
    const {orderId} = req.params;
    try {
        const isFind = await Order.findOne({where: {id: orderId}});

    if (!isFind) return res.status(404).send("Categoria no encontrada");
    console.log(state);

    if(state !== "NA"){
        const isFolio = await Delivery.findOne({where: {folio: folio}});

        
        if(!isFolio)
        {
            const { total, amount } = isFind ?? "";
            const rest = total- amount;
            await Delivery.create({folio, rest, state: 0, id_order: orderId});
        }
    } 

    await Order.update(req.body, {
        where: {id: orderId}
    });

    res.json({success: `se ha modificado ${orderId}`});
    } catch (error) {
        console.log(error);
        res.send(error);
    }
    
});

router.delete('/:orderId', async (req, res)=>{
    const {orderId} = req.params;
    try {
        const isFind = await Order.findOne({where: {id: orderId}});
    
        if (!isFind) return res.status(404).send("Categoria no encontrada");

        await Order.destroy({where: {id: orderId}});
    } catch (error) {
        res.send(error);
    }
});

module.exports = router;