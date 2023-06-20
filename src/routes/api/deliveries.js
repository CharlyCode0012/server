const router = require('express').Router();
const moment = require('moment');

const { QueryTypes } = require('sequelize');
const {Delivery, Order, conn} = require('../../db/db');

router.get('/', async (req, res)=>{
    const { order } = req.query;

    try {
        const deliveries = await conn.query(
            
            `
            SELECT d.*, orders.state as order_state, order_details.quantity, order_details.price, products.key_word, places.address as place, orders.id_client
            FROM deliveries d
            INNER JOIN orders ON d.id_order = orders.id
            INNER JOIN order_details ON orders.id = order_details.id_order
            INNER JOIN products ON order_details.id_product = products.id
            INNER JOIN places_deliveries places ON orders.id_place = places.id
            ORDER BY d.date_delivery ${order === 'ASC' ? 'ASC' : 'DESC'}
            `,
            { type: QueryTypes.SELECT }
        );

        const arrayDeliveries = deliveries.map((delivery) => {
            if (delivery.date_delivery === null) {
                return null;
            }

            // Agrupar las palabras clave por folio
            const keyWords = deliveries
                .filter((d) => d.folio === delivery.folio)
                .map((d) => d.key_word)
                .join(", ");

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
                key_word: keyWords,
                place: delivery.place,
                id_client: delivery.id_client,
            };
        });
        

        const filteredDeliveries = arrayDeliveries.filter((delivery, index, self) => {
            // Filtrar el primer elemento con el mismo folio encontrado
            return (
                self.findIndex((d) => delivery !== null && d.folio === delivery.folio) === index
            );
        });
        
        res.json(filteredDeliveries);
    } catch (error) {
        res.send(error);
    }
    
});

router.get('/searchByFolio', async (req, res)=>{
    const {order, search} = req.query;
    try {
        const deliveries = await conn.query(
            `
            SELECT d.*, orders.state as order_state, order_details.quantity, order_details.price, products.key_word as key_word, places.address as place, orders.id_client
            FROM deliveries d
            INNER JOIN orders ON d.id_order = orders.id
            INNER JOIN order_details ON orders.id = order_details.id_order
            INNER JOIN products ON order_details.id_product = products.id
            INNER JOIN places_deliveries places ON orders.id_place = places.id
            WHERE d.folio LIKE :search
            ORDER BY d.state ${order === 'ASC' ? 'ASC' : 'DESC'}
            `,
            { 
                type: QueryTypes.SELECT,
                replacements: { search: search} 
            }
        );

        const arrayDeliveries = deliveries.map((delivery) => {

            /* const keyWords = deliveries
                .filter((d) => d.folio === delivery.folio)
                .map((d) => d.key_word)
                .join(", "); */

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
                //key_word: keyWords,
                key_word: delivery.key_word,
                place: delivery.place,
                id_client: delivery.id_client,
            };
        });

        /* const filteredDeliveries = arrayDeliveries.filter((delivery, index, self) => {
            // Filtrar el primer elemento con el mismo folio encontrado
            return (
                self.findIndex((d) => d.folio === delivery.folio && d.id !== null) === index
            );
        }); */

        res.json(arrayDeliveries);
    } catch (error) {
        res.send(error);
    }
    
});

router.get('/searchByState', async (req, res)=>{
    const {order, search} = req.query;
    const searchLowerCase = search.toLocaleLowerCase().trim();
    try {
        if(searchLowerCase === "entregado" || searchLowerCase === "sin entregar"){
            const state = searchLowerCase === "entregado" ? 1 : 0;
            const deliveries = await conn.query(
                `
                SELECT d.*, orders.state as order_state, order_details.quantity, order_details.price, products.key_word as key_word, places.address as place, orders.id_client
                FROM deliveries d
                INNER JOIN orders ON d.id_order = orders.id
                INNER JOIN order_details ON orders.id = order_details.id_order
                INNER JOIN products ON order_details.id_product = products.id
                INNER JOIN places_deliveries places ON orders.id_place = places.id
                WHERE d.state LIKE :search
                ORDER BY d.state ${order === 'ASC' ? 'ASC' : 'DESC'}
                `,
                { 
                    type: QueryTypes.SELECT,
                    replacements: { search: state}
                }
            );
        
            const arrayDeliveries = deliveries.map((delivery) => {
                if (delivery.date_delivery === null) {
                    return null;
                }

                const keyWords = deliveries
                .filter((d) => d.folio === delivery.folio)
                .map((d) => d.key_word)
                .join(", ");

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
                    key_word: keyWords,
                    place: delivery.place,
                    id_client: delivery.id_client,
                };
            });

            const filteredDeliveries = arrayDeliveries.filter((delivery, index, self) => {
                // Filtrar el primer elemento con el mismo folio encontrado
                return (
                    self.findIndex((d) => delivery !== null && d.folio === delivery.folio) === index
                );
            });

            res.json(filteredDeliveries);
        }
        else
            throw("Ingrese un valor valido");
    } catch (error) {
        console.log(error);
        res.status(400).send("Error al buscar por Estado")
    }
    
});

router.get('/searchByDate', async (req, res)=>{
    const {order, search} = req.query;
    try {
        const deliveries = await conn.query(
            `
            SELECT d.*, orders.state as order_state, order_details.quantity, order_details.price, products.key_word as key_word, places.address as place, orders.id_client
            FROM deliveries d
            INNER JOIN orders ON d.id_order = orders.id
            INNER JOIN order_details ON orders.id = order_details.id_order
            INNER JOIN products ON order_details.id_product = products.id
            INNER JOIN places_deliveries places ON orders.id_place = places.id
            WHERE d.date_delivery LIKE :search
            ORDER BY d.date_delivery ${order === 'ASC' ? 'ASC' : 'DESC'}
            `,

            { 
                type: QueryTypes.SELECT,
                replacements: { search: search}
            }
        );
        
        const arrayDeliveries = deliveries.map((delivery) => {
            if (delivery.date_delivery === null) {
                return null;
            }

            const keyWords = deliveries
                .filter((d) => d.folio === delivery.folio)
                .map((d) => d.key_word)
                .join(", ");
            
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
                key_word: keyWords,
                place: delivery.place,
                id_client: delivery.id_client,
            };
        });

        const filteredDeliveries = arrayDeliveries.filter((delivery, index, self) => {
            // Filtrar el primer elemento con el mismo folio encontrado
            return (
                self.findIndex((d) => delivery !== null && d.folio === delivery.folio) === index
            );
        });
        res.json(filteredDeliveries);
    } catch (error) {
        res.status(400).send("Error al obtener la busqueda");
    }
});

router.get('/searchByPlace', async (req, res)=>{
    const {order, search} = req.query;
    try {
        const deliveries = await conn.query(
            `
            SELECT d.*, orders.state as order_state, order_details.quantity, order_details.price, products.key_word as key_word, places.address as place, orders.id_client
            FROM deliveries d
            INNER JOIN orders ON d.id_order = orders.id
            INNER JOIN order_details ON orders.id = order_details.id_order
            INNER JOIN products ON order_details.id_product = products.id
            INNER JOIN places_deliveries places ON orders.id_place = places.id
            WHERE d.date_delivery LIKE :search
            ORDER BY d.date_delivery ${order === 'ASC' ? 'ASC' : 'DESC'}
            `,

            { 
                type: QueryTypes.SELECT,
                replacements: { search: search}
            }
        );
        
        const arrayDeliveries = deliveries.map((delivery) => {
            if (delivery.date_delivery === null) {
                return null;
            }

            const keyWords = deliveries
                .filter((d) => d.folio === delivery.folio)
                .map((d) => d.key_word)
                .join(", ");

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
                key_word: keyWords,
                place: delivery.place,
                id_client: delivery.id_client,
            };
        });

        const filteredDeliveries = arrayDeliveries.filter((delivery, index, self) => {
            // Filtrar el primer elemento con el mismo folio encontrado
            return (
                self.findIndex((d) => delivery !== null && d.folio === delivery.folio) === index
            );
        });
        res.json(filteredDeliveries);
    } catch (error) {
        res.status(400).send("Error al obtener la busqueda");
    }
});


router.post('/', async (req, res)=>{
    try {
        const delivery = await Delivery.create(req.body);
        res.json(delivery);
        
    } catch (error) {
        res.status(400).send("Error al crear");
    }
});

router.put('/id/:deliveryId', async (req, res)=>{
    try {
        const {deliveryId} = req.params;
        const isFind = await Delivery.findOne({where: {id: deliveryId}});
    
        if (!isFind) return res.status(404).send("Pregunta no encontrada");
    
        await Delivery.update(req.body, {
            where: {id: deliveryId}
        });
        res.json({success: `se ha modificado ${deliveryId}`});
        
    } catch (error) {
        res.status(400).send("Error al actualizar");
    }
})

router.put('/folio/:deliveryFolio', async (req, res)=>{

    try {
        
        const { deliveryFolio } = req.params;
        const isFind = await Delivery.findOne({ where: { folio: deliveryFolio } });

        if (!isFind) return res.status(404).send("Pregunta no encontrada");
    
        const updatedDelivery = { ...req.body };
    
        if (updatedDelivery.date_delivery) {
            const formattedDate = moment(updatedDelivery.date_delivery, 'DD/MM/YYYY', true);

            if (formattedDate.isValid()) {
                updatedDelivery.date_delivery = formattedDate.toDate();
            } else {
                console.log("Formato no valido");
                return res.status(400).send("Formato de fecha inválido");
            }
        }

        await Delivery.update(updatedDelivery, {
            where: { folio: deliveryFolio }
        });

        res.json({success: `se ha modificado ${deliveryFolio}`});
    } catch (error) {
        res.status(400).send("Error al actualizar por medio de folio");
    }
})

router.delete('/:deliveryId', async (req, res)=>{
    try {
        
        const {deliveryId} = req.params;
        const isFind = await Delivery.findOne({where: {id: deliveryId}});
        
        if (!isFind) return res.status(404).send("Pregunta no encontrada");
    
        await Delivery.destroy({where: {id: deliveryId}});
        res.status(200).send("Exito al eliminar");
    } catch (error) {
        res.status(400).send("Error al eliminar");
    }
})

module.exports = router;