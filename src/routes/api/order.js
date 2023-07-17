const router = require("express").Router();

const { QueryTypes, Op } = require("sequelize");
const { conn, Order, Delivery, OrderDetails, Product, PlaceDelivery } = require("../../db/db");
OrderDetails.belongsTo(Product, { foreignKey: 'id_product' });


router.get("/", async (req, res) => {
  const order = req.query.order ?? "ASC";
  try {
    const orders = await conn.query(
      `
            SELECT o.id, o.folio, o.date_order, o.total, o.amount, o.state, o.id_client, p.address AS place, p2.no_card AS payment
            FROM orders o
            LEFT JOIN places_deliveries p ON p.id = o.id_place
            LEFT JOIN payment_methods p2 ON p2.id = id_payment_method
            WHERE o.state = :state
            ORDER BY o.folio ${order === "ASC" ? "ASC" : "DESC"}
        `,
      {
        type: QueryTypes.SELECT,
        replacements: { state: "NA" },
      }
    );
    res.json(orders);
  } catch (error) {
    res.send(error);
  }
});

router.get("/searchByState", async (req, res) => {
  const { order, search } = req.query;
  try {
    const query = `
            SELECT o.id, o.folio, o.date_order, o.total, o.amount, o.state, o.id_client, p.address AS place, p2.no_card AS payment
            FROM orders o
            LEFT JOIN places_deliveries p ON p.id = o.id_place
            LEFT JOIN payment_methods p2 ON p2.id = o.id_payment_method
            WHERE o.state = :search
            ORDER BY o.folio ${order === "ASC" ? "ASC" : "DESC"}
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

router.get("/searchByPlace", async (req, res) => {
  const { order, search } = req.query;
  try {
    const orders = await conn.query(
      `
            SELECT o.id, o.folio, o.date_order, o.total, o.amount, o.state, o.id_client, p.address AS place, p2.no_card AS payment
            FROM orders o
            LEFT JOIN places_deliveries p ON p.id = o.id_place
            LEFT JOIN payment_methods p2 ON p2.id = o.id_payment_method
            WHERE p.address LIKE :search AND o.state = 'NA'
            ORDER BY o.folio ${order === "ASC" ? "ASC" : "DESC"}
        `,
      {
        replacements: { search: `%${search}%` },
        type: QueryTypes.SELECT,
      }
    );

    res.json(orders);
  } catch (error) {
    res.send(error);
  }
});

router.get("/searchByDate", async (req, res) => {
  const { order, search } = req.query;

  try {
    const orders = await conn.query(
      `
            SELECT o.id, o.folio, o.date_order, o.total, o.amount, o.state, o.id_client, p.address AS place, p2.no_card AS payment
            FROM orders o
            LEFT JOIN places_deliveries p ON p.id = o.id_place
            LEFT JOIN payment_methods p2 ON p2.id = o.id_payment_method
            WHERE o.date_order LIKE :search 
            ORDER BY o.folio ${order === "ASC" ? "ASC" : "DESC"}
        `,
      {
        replacements: { search: `%${search}%` },
        type: QueryTypes.SELECT,
      }
    );

    res.json(orders);
  } catch (error) {
    res.send(error);
  }
});

router.get("/searchByFolio", async (req, res) => {
  const { order, search } = req.query;
  try {
    const query = `
            SELECT o.id, o.folio, o.date_order, o.total, o.amount, o.state, o.id_client, p.address AS place, p2.no_card AS payment
            FROM orders o
            LEFT JOIN places_deliveries p ON p.id = o.id_place
            LEFT JOIN payment_methods p2 ON p2.id = o.id_payment_method
            WHERE o.folio = :search
            ORDER BY o.folio ${order === "ASC" ? "ASC" : "DESC"}
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

router.get("/orderByFolio", async (req, res) => {
  const { folio } = req.query;

  try {
    const order = await Order.findOne({
      where: { folio },
    });

    if (!order) {
      return res.status(404).json({ error: "Orden no encontrada" });
    }

    const orderDetails = await OrderDetails.findAll({
      where: { id_order: order.id },
      include: Product,
    });

    const deliveryLocation = await PlaceDelivery.findOne({
      where: { id: order.id_place },
    });

    res.json({
      order,
      order_details: orderDetails,
      delivery_location: deliveryLocation,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error");
  }
});

router.post("/", async (req, res) => {
  const orderData = req.body;
  const { cart, deliveryLocation, paymentMethod, folio } =
    orderData.userContext;
  const { clientId } = req.query;

  try {
    const order = await Order.create({
      folio: folio, // Genera un número de folio único para la orden (puedes implementar tu propia lógica aquí)
      date_order: new Date(),
      date_delivery: null, // Asigna la fecha de entrega correspondiente
      total: cart.totalPrice,
      amount: 0.0,
      state: "NA", // Asigna el estado inicial de la orden (puedes cambiarlo según tus necesidades)
      id_client: clientId, // Asegúrate de tener la variable clientId disponible en este punto
      id_place: deliveryLocation.id,
      id_payment_method: paymentMethod.id,
    });

    const orderDetails = cart.products.map((product) => {
      return {
        quantity: product.quantity,
        price: product.price,
        total_price: product.totalPrice,
        id_order: order.id,
        id_product: product.id,
      };
    });

    await OrderDetails.bulkCreate(orderDetails);

    res.json(order);
  } catch (error) {
    console.error(error);
    res.status(400).send("Error");
  }
});

router.put("/:orderId", async (req, res) => {
  const { state, amount } = req.body;
  const { folio } = req.query;
  const { orderId } = req.params;
  try {
    const isFind = await Order.findOne({ where: { id: orderId } });

    if (!isFind) return res.status(404).send("Categoria no encontrada");
    console.log(state);

    if (state !== "NA") {
      const isFolio = await Delivery.findOne({ where: { folio: folio } });
      const { total, id_place, id_client } = isFind ?? "";
      const rest = total - amount;

      if (!isFolio) {
        await Delivery.create({
          folio,
          rest,
          state: 0,
          id_order: orderId,
          id_client,
          id_place,
        });
      } else {
        await Delivery.update({ rest }, { where: { id_order: orderId } });
      }
    }

    await Order.update(req.body, {
      where: { id: orderId },
    });

    res.json({ success: `se ha modificado ${orderId}` });
  } catch (error) {
    console.log(error);
    res.send(error);
  }
});

router.delete("/:orderId", async (req, res) => {
  const { orderId } = req.params;
  try {
    const isFind = await Order.findOne({ where: { id: orderId } });

    if (!isFind) return res.status(404).send("Categoria no encontrada");

    await Order.destroy({ where: { id: orderId } });
  } catch (error) {
    res.send(error);
  }
});

module.exports = router;
