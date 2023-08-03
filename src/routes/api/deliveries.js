const router = require("express").Router();
const moment = require("moment");
const ExcelJS = require("exceljs");
const { QueryTypes, Op } = require("sequelize");
const {
  Delivery,
  SoldProd,
  Shopping,
  Order,
  OrderDetails,
  Client,
  CategoryProd,
  conn,
} = require("../../db/db");

router.get("/", async (req, res) => {
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
            ORDER BY d.date_delivery ${order === "ASC" ? "ASC" : "DESC"}
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

    const filteredDeliveries = arrayDeliveries.filter(
      (delivery, index, self) => {
        // Filtrar el primer elemento con el mismo folio encontrado
        return (
          self.findIndex(
            (d) => delivery !== null && d.folio === delivery.folio
          ) === index
        );
      }
    );

    res.json(filteredDeliveries);
  } catch (error) {
    console.log(error);
    res.send(error);
  }
});

router.get("/download", async (req, res) => {
  try {
    // Get deliveries data
    const deliveries = await conn.query(
      `
        SELECT d.*, orders.state as order_state, order_details.quantity, order_details.price, products.key_word, places.address as place, orders.id_client
        FROM deliveries d
        INNER JOIN orders ON d.id_order = orders.id
        INNER JOIN order_details ON orders.id = order_details.id_order
        INNER JOIN products ON order_details.id_product = products.id
        INNER JOIN places_deliveries places ON orders.id_place = places.id
        WHERE d.state = 0
        ORDER BY d.date_delivery DESC
        `,
      { type: QueryTypes.SELECT }
    );

    // Modify the deliveries data to match the desired structure
    const arrayDeliveries = deliveries.map((delivery) => {
      if (delivery.date_delivery === null) {
        return null;
      }

      // Aggregate the key words by folio
      const keyWords = deliveries
        .filter((d) => d.folio === delivery.folio)
        .map((d) => d.key_word)
        .join(", ");

      return {
        id: delivery.id,
        folio: delivery.folio,
        date_delivery: delivery.date_delivery,
        rest: delivery.rest,
        state: delivery.state ? "Entregado" : "No entregado",
        id_order: delivery.id_order,
        order_state: delivery.order_state,
        createdAt: delivery.createdAt,
        updatedAt: delivery.updatedAt,
        key_word: keyWords,
        place: delivery.place,
        id_client: delivery.id_client,
      };
    });

    // Filter the deliveries to keep only the first occurrence of each folio
    const filteredDeliveries = arrayDeliveries.filter(
      (delivery, index, self) => {
        // Filter the first element with the same folio encountered
        return (
          self.findIndex(
            (d) => delivery !== null && d.folio === delivery.folio
          ) === index
        );
      }
    );
    // Create excel workbook, where sheets will be stored
    const workbook = new ExcelJS.Workbook();

    // Create a sheet and assign to it some columns metadata to insert rows
    const worksheet = workbook.addWorksheet("Entregas");
    worksheet.columns = [
      { header: "ID", key: "id", width: 20 },
      { header: "Folio", key: "folio", width: 25 },
      { header: "Fecha de entrega", key: "date_delivery", width: 25 },
      { header: "Rest", key: "rest", width: 25 },
      { header: "Estado", key: "state", width: 25 },
      { header: "ID de orden", key: "id_order", width: 25 },
      { header: "Estado de orden", key: "order_state", width: 30 },
      { header: "Fecha de creación", key: "createdAt", width: 30 },
      { header: "Fecha de actualización", key: "updatedAt", width: 30 },
      { header: "Palabra clave", key: "key_word", width: 25 },
      { header: "Lugar", key: "place", width: 25 },
      { header: "ID de cliente", key: "id_client", width: 25 },
    ];

    // Style each column
    const idColumn = worksheet.getColumn("id");
    const folioColumn = worksheet.getColumn("folio");
    const dateDeliveryColumn = worksheet.getColumn("date_delivery");
    const restColumn = worksheet.getColumn("rest");
    const stateColumn = worksheet.getColumn("state");
    const idOrderColumn = worksheet.getColumn("id_order");
    const orderStateColumn = worksheet.getColumn("order_state");
    const createdAtColumn = worksheet.getColumn("createdAt");
    const updatedAtColumn = worksheet.getColumn("updatedAt");
    const keyWordColumn = worksheet.getColumn("key_word");
    const placeColumn = worksheet.getColumn("place");
    const idClientColumn = worksheet.getColumn("id_client");

    const alignment = { horizontal: "center" };

    idColumn.alignment = alignment;
    folioColumn.alignment = alignment;
    dateDeliveryColumn.alignment = alignment;
    restColumn.alignment = alignment;
    stateColumn.alignment = alignment;
    idOrderColumn.alignment = alignment;
    orderStateColumn.alignment = alignment;
    createdAtColumn.alignment = alignment;
    updatedAtColumn.alignment = alignment;
    keyWordColumn.alignment = alignment;
    placeColumn.alignment = alignment;
    idClientColumn.alignment = alignment;

    // Style header row
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true, size: 14 };

    // Add data of every delivery
    for (const delivery of filteredDeliveries) {
      worksheet.addRow(delivery);
    }

    // Auto-size columns to fit the content and headers
    worksheet.columns.forEach((column) => {
      column.header = column.header.toString(); // Convert header to string
      column.width = Math.max(column.header.length, 12); // Set minimum width based on header length

      column.eachCell({ includeEmpty: true }, (cell) => {
        cell.alignment = {
          vertical: "middle",
          horizontal: "center",
          wrapText: true, // Enable text wrapping
        };
        column.width = Math.max(
          column.width,
          cell.value ? cell.value.toString().length + 2 : 10
        ); // Adjust width based on cell content
      });
    });

    const fileBuffer = await workbook.xlsx.writeBuffer();

    res.setHeader(
      "content-disposition",
      'attachment; filename="Entregas.xlsx"'
    );
    res.setHeader("Access-Control-Expose-Headers", "content-disposition");
    res.status(200).end(fileBuffer);
  } catch (error) {
    res.status(400).send("Error al descargar el archivo");
  }
});

router.get("/searchByFolio", async (req, res) => {
  const { order, search } = req.query;
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
            ORDER BY d.state ${order === "ASC" ? "ASC" : "DESC"}
            `,
      {
        type: QueryTypes.SELECT,
        replacements: { search: search },
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


    res.json(arrayDeliveries);
  } catch (error) {
    res.status(400).send({error: true, textError: "Hubo un error en la consulta"});
  }
});

router.get("/searchByState", async (req, res) => {
  const { order, search } = req.query;
  const searchLowerCase = search.toLocaleLowerCase().trim();
  try {
    if (searchLowerCase === "entregado" || searchLowerCase === "sin entregar") {
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
                ORDER BY d.state ${order === "ASC" ? "ASC" : "DESC"}
                `,
        {
          type: QueryTypes.SELECT,
          replacements: { search: state },
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

      const filteredDeliveries = arrayDeliveries.filter(
        (delivery, index, self) => {
          // Filtrar el primer elemento con el mismo folio encontrado
          return (
            self.findIndex(
              (d) => delivery !== null && d.folio === delivery.folio
            ) === index
          );
        }
      );

      res.json(filteredDeliveries);
    } else throw "Ingrese un valor valido";
  } catch (error) {
    console.log(error);
    res.status(400).send("Error al buscar por Estado");
  }
});

router.get("/searchByDate", async (req, res) => {
  const { order, search } = req.query;
  try {
    const deliveries = await conn.query(
      `
        SELECT d.*, orders.state AS order_state, order_details.quantity, order_details.price, products.key_word AS key_word, places.address AS place, orders.id_client
        FROM deliveries d
        INNER JOIN orders ON d.id_order = orders.id
        INNER JOIN order_details ON orders.id = order_details.id_order
        INNER JOIN products ON order_details.id_product = products.id
        INNER JOIN places_deliveries places ON orders.id_place = places.id
        WHERE DATE_FORMAT(d.date_delivery, '%Y-%m-%d') = :search
        ORDER BY d.date_delivery ${order === "ASC" ? "ASC" : "DESC"}
        `,
      {
        type: QueryTypes.SELECT,
        replacements: { search: search },
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

    const filteredDeliveries = arrayDeliveries.filter(
      (delivery, index, self) => {
        // Filtrar el primer elemento con el mismo folio encontrado
        return (
          self.findIndex(
            (d) => delivery !== null && d.folio === delivery.folio
          ) === index
        );
      }
    );
    res.json(filteredDeliveries);
  } catch (error) {
    res.status(400).send("Error al obtener la busqueda");
  }
});

router.get("/searchByClientNumber", async (req, res) => {
  const { order, search } = req.query;
  try {
    const deliveries = await conn.query(
      `
        SELECT d.*, orders.state AS order_state, order_details.quantity, order_details.price, products.key_word AS key_word, places.address AS place, orders.id_client
        FROM deliveries d
        INNER JOIN orders ON d.id_order = orders.id
        INNER JOIN order_details ON orders.id = order_details.id_order
        INNER JOIN products ON order_details.id_product = products.id
        INNER JOIN places_deliveries places ON orders.id_place = places.id
        WHERE orders.id_client = :search
        ORDER BY d.date_delivery ${order === "ASC" ? "ASC" : "DESC"}
        `,
      {
        type: QueryTypes.SELECT,
        replacements: { search: search },
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

    const filteredDeliveries = arrayDeliveries.filter(
      (delivery, index, self) => {
        // Filtrar el primer elemento con el mismo folio encontrado
        return (
          delivery !== null &&
          self.findIndex((d) => d !== null && d.folio === delivery.folio) ===
            index
        );
      }
    );
    res.json(filteredDeliveries);
  } catch (error) {
    res.status(400).send("Error al obtener la busqueda");
  }
});

router.get("/searchByPlace", async (req, res) => {
  const { order, search } = req.query;
  try {
    const deliveries = await conn.query(
      `
            SELECT d.*, orders.state as order_state, order_details.quantity, order_details.price, products.key_word as key_word, places.address as place, orders.id_client
            FROM deliveries d
            INNER JOIN orders ON d.id_order = orders.id
            INNER JOIN order_details ON orders.id = order_details.id_order
            INNER JOIN products ON order_details.id_product = products.id
            INNER JOIN places_deliveries places ON orders.id_place = places.id
            WHERE places.address LIKE :search
            ORDER BY d.date_delivery ${order === "ASC" ? "ASC" : "DESC"}
            `,

      {
        type: QueryTypes.SELECT,
        replacements: { search: `%${search}%` },
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

    const filteredDeliveries = arrayDeliveries.filter(
      (delivery, index, self) => {
        // Filtrar el primer elemento con el mismo folio encontrado
        return (
          delivery !== null &&
          self.findIndex((d) => d !== null && d.folio === delivery.folio) ===
            index
        );
      }
    );
    res.json(filteredDeliveries);
  } catch (error) {
    res.status(400).send("Error al obtener la busqueda");
    console.log(error);
  }
});

router.post("/", async (req, res) => {
  try {
    const delivery = await Delivery.create(req.body);
    res.json(delivery);
  } catch (error) {
    res.status(400).send("Error al crear");
  }
});

router.put("/id/:deliveryId", async (req, res) => {
  try {
    const { deliveryId } = req.params;
    const isFind = await Delivery.findOne({ where: { id: deliveryId } });

    if (!isFind) return res.status(404).send("Entrega no encontrada");

    // Actualizar la entrega
    await Delivery.update(req.body, { where: { id: deliveryId } });

    // Verificar si la entrega se completó (state = true)
    const updatedDelivery = await Delivery.findOne({
      where: { id: deliveryId },
    });
    if (updatedDelivery.state) {
      // Obtener la orden asociada a la entrega
      const order = await Order.findOne({
        where: { id: updatedDelivery.id_order },
      });

      // Obtener los detalles de la orden (order_detail)
      const orderDetails = await OrderDetails.findAll({
        where: { id_order: order.id },
      });

      // Actualizar los productos vendidos asociados a los detalles de la orden
      const productIdList = orderDetails.map((detail) => detail.id_product);

      // Actualizar los registros existentes en sold_products
      await SoldProd.update(
        { date_purchase: new Date() },
        {
          where: { id_order: order.id, id_product: { [Op.in]: productIdList } },
        }
      );

      // Crear nuevos registros en sold_products si no existen
      const existingSoldProducts = await SoldProd.findAll({
        where: {
          id_order: order.id,
          id_product: { [Op.notIn]: productIdList },
        },
      });

      const newSoldProducts = await Promise.all(
        productIdList
          .filter(
            (productId) =>
              !existingSoldProducts.some(
                (soldProduct) => soldProduct.id_product === productId
              )
          )
          .map(async (productId) => {
            const orderDetail = orderDetails.find(
              (detail) => detail.id_product === productId
            );
            const categoriesProduct = await CategoryProd.findOne({
              where: { id_product: productId },
            });
            const id_category = categoriesProduct
              ? categoriesProduct.id_category
              : null;
            return {
              id_order: order.id,
              id_product: productId,
              id_category: id_category, // Add the id_category value from the categoriesProduct model
              date_purchase: new Date(),
              quantity: orderDetail ? orderDetail.quantity : 0,
            };
          })
      );

      if (newSoldProducts.length > 0) {
        await SoldProd.bulkCreate(newSoldProducts, {
          fields: [
            "id_order",
            "id_product",
            "id_category",
            "date_purchase",
            "quantity",
          ],
        });
      }

      // Verificar si el cliente existe por el número de cliente
      const clientNumber = order.id_client;
      const existingClient = await Client.findOne({
        where: { number: clientNumber },
      });

      if (existingClient) {
        // El cliente ya existe, actualizar sus datos
        await Client.update(
          { purcharses: existingClient.purcharses + 1 }, // Incrementar el número de compras en 1
          { where: { number: clientNumber } }
        );
      } else {
        // El cliente no existe, crear un nuevo cliente
        await Client.create({
          number: clientNumber,
          purcharses: 1, // Establecer el número de compras en 1
        });
      }

      const existingShoppingRecords = await Shopping.findAll({
        where: {
          id_order: order.id,
          id_product: { [Op.notIn]: productIdList },
        },
      });

      const newShoppingRecords = productIdList
        .filter(
          (productId) =>
            !existingShoppingRecords.some(
              (shoppingRecord) => shoppingRecord.id_product === productId
            )
        )
        .map((productId) => {
          const orderDetail = orderDetails.find(
            (detail) => detail.id_product === productId
          );
          return {
            id_order: order.id,
            id_product: productId,
            date_purchase: new Date(),
            quantity: orderDetail ? orderDetail.quantity : 0,
            id_client: order.id_client,
          };
        });

      if (newShoppingRecords.length > 0) {
        await Shopping.bulkCreate(newShoppingRecords);
      }
    }

    res.json({ success: `Se ha modificado la entrega ${deliveryId}` });
  } catch (error) {
    res.status(400).send("Error al actualizar la entrega");
    console.log(error);
  }
});

router.put("/folio/:deliveryFolio", async (req, res) => {
  try {
    const { deliveryFolio } = req.params;
    const isFind = await Delivery.findOne({ where: { folio: deliveryFolio } });

    if (!isFind) return res.status(404).send("Pregunta no encontrada");

    const updatedDelivery = { ...req.body };

    if (updatedDelivery.date_delivery) {
      const formattedDate = moment(
        updatedDelivery.date_delivery,
        "DD/MM/YYYY",
        true
      );

      if (formattedDate.isValid()) {
        updatedDelivery.date_delivery = formattedDate.toDate();
      } else {
        console.log("Formato no valido");
        return res.status(400).send("Formato de fecha inválido");
      }
    }

    await Delivery.update(updatedDelivery, {
      where: { folio: deliveryFolio },
    });

    await Order.update(updatedDelivery, {
      where: { folio: deliveryFolio },
    });

    res.json({ success: `se ha modificado ${deliveryFolio}` });
  } catch (error) {
    res.status(400).send("Error al actualizar por medio de folio");
  }
});

router.delete("/:deliveryId", async (req, res) => {
  try {
    const { deliveryId } = req.params;
    const isFind = await Delivery.findOne({ where: { id: deliveryId } });

    if (!isFind) return res.status(404).send("Pregunta no encontrada");

    await Delivery.destroy({ where: { id: deliveryId } });
    res.status(200).send("Exito al eliminar");
  } catch (error) {
    res.status(400).send("Error al eliminar");
  }
});

module.exports = router;
