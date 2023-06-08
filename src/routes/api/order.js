const router = require('express').Router();

const { QueryTypes, Op } = require('sequelize');
const {conn, Order, Delivery} = require('../../db/db');

router.get('/', async (req, res)=>{
    const order = req.query.order ?? "ASC";
    try {
        const orders = await conn.query(`
            SELECT o.id, o.folio, o.date_order, o.total, o.amount, o.state, o.id_client, p.address AS place, p2.no_card AS payment
            FROM orders o
            LEFT JOIN places_deliveries p ON p.id = o.id_place
            LEFT JOIN payment_methods p2 ON p2.id = id_payment_method
            WHERE o.state = :state
            ORDER BY o.folio ${order === 'ASC' ? 'ASC' : 'DESC'}
        `, {
            type: QueryTypes.SELECT,
            replacements: { state: 'NA' }
        });
        res.json(orders);
    } catch (error) {
        res.send(error);
    }
    
});

router.get( '/searchByState', async ( req, res ) => {
    const { order, search } = req.query;
    try {
        const query = `
            SELECT o.id, o.folio, o.date_order, o.total, o.amount, o.state, o.id_client, p.address AS place, p2.no_card AS payment
            FROM orders o
            LEFT JOIN places_deliveries p ON p.id = o.id_place
            LEFT JOIN payment_methods p2 ON p2.id = o.id_payment_method
            WHERE o.state = :search
            ORDER BY o.folio ${order === 'ASC' ? 'ASC' : 'DESC'}
        `;
        const orders = await conn.query(query, {
            replacements: { search: search },
            type: QueryTypes.SELECT,
        });
        res.json(orders);
    } catch (error) {
        res.status(400).send(error);
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
            ORDER BY o.folio ${order === 'ASC' ? 'ASC' : 'DESC'}
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
            ORDER BY o.folio ${order === 'ASC' ? 'ASC' : 'DESC'}
        `, {
            replacements: { search: `%${search}%` },
            type: QueryTypes.SELECT,
        });
    
        res.json(orders);
    } catch (error) {
        res.send(error);
    }

    
});

router.get( '/searchByFolio', async ( req, res ) => {
    const { order, search } = req.query;
    try {
        const query = `
            SELECT o.id, o.folio, o.date_order, o.total, o.amount, o.state, o.id_client, p.address AS place, p2.no_card AS payment
            FROM orders o
            LEFT JOIN places_deliveries p ON p.id = o.id_place
            LEFT JOIN payment_methods p2 ON p2.id = o.id_payment_method
            WHERE o.folio = :search
            ORDER BY o.folio ${order === 'ASC' ? 'ASC' : 'DESC'}
        `;
        const orders = await conn.query(query, {
            replacements: { search: search },
            type: QueryTypes.SELECT,
        });
        res.json(orders);
    } catch (error) {
        res.status(400).send(error);
    }  
});

router.post('/', async (req, res)=>{
    try {
        const order = await Order.create(req.body);
        res.json(order);      
    } catch (error) {
        res.status(400).send("Error");
    }
});

router.put('/:orderId', async (req, res)=>{
    const {state, amount} = req.body;
    const {folio} = req.query;
    const {orderId} = req.params;
    try {
        const isFind = await Order.findOne({where: {id: orderId}});

    if (!isFind) return res.status(404).send("Categoria no encontrada");
    console.log(state);

    if(state !== "NA"){
        const isFolio = await Delivery.findOne({where: {folio: folio}});
        const { total, id_place, id_client } = isFind ?? "";
        const rest = total - amount;
        
        if(!isFolio)
        {
            await Delivery.create({folio, rest, state: 0, id_order: orderId, id_client, id_place});
        }
        else 
        {
            await Delivery.update({rest}, {where: {id_order: orderId}});
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