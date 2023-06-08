const router = require('express').Router();
const Sequelize = require('sequelize');

const {SoldProd, Product, Category, conn} = require('../../db/db');

// Relaciones entre los modelos
SoldProd.belongsTo(Product, { foreignKey: 'id_product' });
SoldProd.belongsTo(Category, { foreignKey: 'id_category' });



// Función para obtener los productos vendidos en un período de tiempo determinado
async function getProductSales(timePeriod) {
    let startDate;

// Obtener la fecha de inicio según el período de tiempo seleccionado
    switch (timePeriod) {
        case '1 semana':
            startDate = new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
        case '1 mes':
            startDate = new Date(new Date().getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
        case '2 meses':
            startDate = new Date(new Date().getTime() - 60 * 24 * 60 * 60 * 1000);
        break;
        case '6 meses':
            startDate = new Date(new Date().getTime() - 180 * 24 * 60 * 60 * 1000);
        break;
        default:
            throw new Error('Período de tiempo inválido');
}

// Consulta a la base de datos para obtener los productos vendidos
    const result = await SoldProd.findAll({
        attributes: [
            'id_product',
            'quantity',
            'date_purchase',
            'id_category',
            [Sequelize.col('product.product_name'), 'product'],
            [Sequelize.col('product.key_word'), 'key_word'],
        ],
        where: {
            date_purchase: {
                [Sequelize.Op.gte]: startDate,
            },
        },
        include: [
        {
            model: Product,
            attributes: [],
        },
        {
            model: Category,
            attributes: ['category_name'],
        }],
        raw: true,
    });

// Mapear los resultados y devolverlos
    const products = result.map((row) => ({
        id: row.id_product,
        quantity: row.quantity,
        date_purchase: row.date_purchase,
        category: row['category.category_name'],
        product: row.product,
        key_word: row.key_word,
    }));
    return products;
}

// Ruta para obtener los productos vendidos en un período de tiempo determinado
router.get('/', async (req, res) => {
    const { timePeriod } = req.query;

    try {
        const products = await getProductSales(timePeriod);
        res.json(products);
    } catch (error) {
        console.error('Error al obtener los productos vendidos:', error);
        res.status(500).json({ error: 'Error al obtener los productos vendidos' });
    }
});


router.get('/:soldProdId', async (req, res)=>{
    const {soldProdId} = req.params;
    try {
        const soldProd = await SoldProd.findAll({where: {id: soldProdId}});
    
        res.json(soldProd);
        
    } catch (error) {
        res.status(400).send("Error");
    }
});

router.post('/', async (req, res)=>{
    try {
        const soldProd = await SoldProd.create(req.body);
        res.json(soldProd);
    } catch (error) {
        res.send("error");
    }
});

router.put('/:soldProdId', async (req, res)=>{
    const {soldProdId} = req.params;

    try {
        
        const isFind = await SoldProd.findOne({where: {id: soldProdId}});
    
        if (!isFind) return res.status(404).send("Pregunta no encontrada");
    
         await SoldProd.update(req.body, {
            where: {id: soldProdId}
        });
        res.json({success: `se ha modificado ${soldProdId}`});
    } catch (error) {
        res.status(400).send("Error");
    }
})

router.delete('/:soldProdId', async (req, res)=>{
    const {soldProdId} = req.params;
    try {
        const isFind = await SoldProd.findOne({where: {id: soldProdId}});
        
        if (!isFind) return res.status(404).send("Pregunta no encontrada");
    
        await SoldProd.destroy({where: {id: soldProdId}});
        
    } catch (error) {
        res.status(400).send("Error");
    }
})

module.exports = router;