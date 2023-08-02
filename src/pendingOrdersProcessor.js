const { Order, OrderDetails, Product } = require("./db/db");
const socketIO = require("socket.io");

Order.hasMany(OrderDetails, { foreignKey: "id_order" });

// En el modelo "OrderDetail"
OrderDetails.belongsTo(Order, { foreignKey: "id_order" });

const io = socketIO();

const processPendingOrders = async () => {
  try {
    const pendingOrders = await Order.findAll({
      where: {
        state: "NA",
      },
      include: OrderDetails,
      order: [["date_order", "ASC"]],
    });
    const currentDate = new Date().getTime();
    
    for (const order of pendingOrders) {
      const orderDate = new Date(order.date_order).getTime(); // Obtener la fecha de orden en milisegundos
      // Obtener la fecha actual en milisegundos

      const timeDiff = orderDate - currentDate + (24 * 60 * 60 * 1000) // Calcular la diferencia en milisegundos

      if (timeDiff <= 0) {
        console.log(
          `Han pasado 24 horas desde que mandaste tu pedido con folio ${order.folio} y no se ha confirmado tu pago.`
        );

        for (const orderDetail of order.order_details) {
          const product = await Product.findByPk(orderDetail.id_product);
          if (product) {
            const newStock = product.stock + orderDetail.quantity;
            await product.update({ stock: newStock });
          }
        }

        const products = await Promise.all(
          order.order_details.map(async (orderDetail) => {
            const product = await Product.findByPk(orderDetail.id_product);
            return {
              id: orderDetail.id_product,
              name: product.product_name,
              quantity: orderDetail.quantity,
            };
          })
        );
        //console.log(products);
        io.emit("orderProcessed", {
          folio: order.folio,
          to: order.id_client,
          products,
        });

        await order.destroy();
      } else {
        setTimeout(processPendingOrders, timeDiff); // Programar la siguiente ejecución después del período de tiempo restante
        break; // Salir del bucle, ya que se programó la siguiente ejecución
      }
    }
  } catch (error) {
    console.error("Error al procesar los pedidos pendientes:", error);
  }
};

setInterval(processPendingOrders, 24 * 60 * 60 * 1000); // Ejecutar cada 24 horas
//setInterval(processPendingOrders, 2 * 60 * 1000); // se ejecuta cada 2 min

io.on("connection", (socket) => {
  console.log("Cliente conectado");

  socket.emit("processPendingOrders");

  // Aquí puedes agregar más lógica de manejo de eventos de socket
});

module.exports = { processPendingOrders, io };
