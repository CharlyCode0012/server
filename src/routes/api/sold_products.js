const router = require('express').Router();
const Sequelize = require('sequelize');

const { SoldProd, Product, Category, conn } = require('../../db/db');

// Relaciones entre los modelos
SoldProd.belongsTo(Product, { foreignKey: 'id_product' });
SoldProd.belongsTo(Category, { foreignKey: 'id_category' , as: 'category' });

// Función para obtener los productos vendidos en un período de tiempo determinado
async function getProductSales(timePeriod, order, options = null) {
  try {
    let startDate;
    const total_sold = options?.total_sold ?? null;
  

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
  
    const optionsWhere = {
      date_purchase: {
        [Sequelize.Op.gte]: startDate,
      },
    };

    if (options && options.category) {
      optionsWhere['$category.category_name$'] = {
        [Sequelize.Op.like]: `%${options.category}%`,
      };
    }

    let optionsHaving = {};

    if (options && !isNaN(parseInt(options.total_sold))) {
      const totalSold = parseInt(options.total_sold);
      const rangeStart = Math.floor(totalSold / 10) * 10;
      const rangeEnd = rangeStart + 9;
      
      optionsHaving = {
        total_sold: {
          [Sequelize.Op.gte]: rangeStart,
          [Sequelize.Op.lte]: rangeEnd,
        },
      };
    }
  
    // Consulta a la base de datos para obtener los productos vendidos
    const result = await SoldProd.findAll({
      attributes: [
        'id_product',
        [conn.fn('SUM', conn.col('quantity')), 'total_sold'],
        'date_purchase',
        'id_category',
        [Sequelize.col('product.product_name'), 'product'],
        [Sequelize.col('product.key_word'), 'key_word'],
      ],
      where: optionsWhere,
      include: [
        {
          model: Product,
          attributes: [],
        },
        {
          model: Category,
          attributes: ['category_name'],
          as: 'category',
        },
      ],
      group: ['id_product', 'product.product_name', 'category.id'],
      having: optionsHaving,
      order: [[conn.literal('total_sold'), order]],
      raw: true,
    });
  
    // Mapear los resultados y devolverlos
    const products = result.map((row) => ({
      id: row.id_product,
      quantity: row.quantity,
      date_purchase: row.date_purchase,
      category: row['category.category_name'],
      total_sold: row.total_sold,
      product: row.product,
      key_word: row.key_word,
    }));
    return products;
  } catch (error) {
    console.log(error);
  }
}

// Ruta para obtener los productos vendidos en un período de tiempo determinado
router.get('/', async (req, res) => {
  const { timePeriod, order } = req.query;

  try {
    const products = await getProductSales(timePeriod, order ?? "DESC");
    res.json(products);
  } catch (error) {
    console.error('Error al obtener los productos vendidos:', error);
    res.status(500).json({ error: 'Error al obtener los productos vendidos' });
  }
});

router.get('/searchByStock', async (req, res) => {
  const { timePeriod, order, search} = req.query;
  const options = {total_sold: search}

  try {
    const products = await getProductSales(timePeriod, order ?? "DESC", options);
    res.json(products);
  } catch (error) {
    console.error('Error al obtener los productos vendidos:', error);
    res.status(500).json({ error: 'Error al obtener los productos vendidos' });
  }
});

router.get('/searchByCategory', async (req, res) => {
  const { timePeriod, order, search } = req.query;
  const options = { category: search };

  try {
    const products = await getProductSales(timePeriod, order ?? "DESC", options);
    res.json(products);
  } catch (error) {
    console.error('Error al obtener los productos vendidos:', error);
    res.status(500).json({ error: 'Error al obtener los productos vendidos' });
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
        console.log(error);
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