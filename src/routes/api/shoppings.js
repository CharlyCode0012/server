const router = require('express').Router();

const { QueryTypes, Op } = require('sequelize');
const {Product, Shopping, Client,conn} = require('../../db/db');

// Asociaciones entre los modelos (si no están definidas en los archivos de modelo)
Shopping.belongsTo(Product, { foreignKey: 'id_product' });
Shopping.belongsTo(Client, { foreignKey: 'id_client' });

// Función asincrónica para obtener la suma de las cantidades de productos comprados por un cliente en un período de tiempo
async function getProductsClient(clientId, timePeriod) {
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
  }

  const optionsWhere = timePeriod ?  {
    id_client: clientId,
    date_purchase: {
        [Op.gte]: startDate
    }
  } : {
    id_client: clientId,
  }

  try {
    const result = await Shopping.findAll({
      attributes: [
        [conn.literal('SUM(quantity)'), 'totalQuantity'],
        [conn.col('product.product_name'), 'product'],
        [conn.col('product.key_word'), 'keyWord'],
        [conn.col('shopping.date_purchase'), 'datePurchase'],
        [conn.col('shopping.id'), 'id']
      ],
      include: [
        {
          model: Product,
          attributes: [],
        },
      ],
      where: optionsWhere,
      group: ['id_product', 'shopping.date_purchase'], // Incluir shopping.date_purchase en el grupo
      raw: true,
    });

    return result;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

router.get('/', async (req, res)=>{
    const { clientId } = req.query;
    const timePeriod = req.query.timePeriod || null;

    try {
        const shoppings = await getProductsClient(clientId, timePeriod);
        res.json(shoppings);
    } catch (error) {
        res.status(400).send("Error");
    }
});

router.post('/', async (req, res)=>{
    try {
        const shopping = await Shopping.create(req.body);
        res.json(shopping);    
    } catch (error) {
        res.send(400).status("Error");
    }
});

router.put('/:shoppingId', async (req, res)=>{
    const {shoppingId} = req.params;
    try {
        
        const isFind = await Shopping.findOne({where: {id: shoppingId}});
    
        if (!isFind) return res.status(404).send("Pregunta no encontrada");
    
            await Shopping.update(req.body, {
            where: {id: shoppingId}
        });
        res.json({success: `se ha modificado ${shoppingId}`});
    } catch (error) {
        res.status(400).send("Error");
    }
})

router.delete('/:shoppingId', async (req, res)=>{
    const {shoppingId} = req.params;
    try {
        const isFind = await Shopping.findOne({where: {id: shoppingId}});
        
        if (!isFind) return res.status(404).send("Pregunta no encontrada");
    
        await Shopping.destroy({where: {id: shoppingId}});  
    } catch (error) {
        res.status(400).send("Error");
    }
})

module.exports = router;