const express = require("express");
const router = express.Router();

const ExcelJS = require("exceljs");
const upload = require("../../config.js");

const { QueryTypes, Op } = require("sequelize");
const {
  conn,
  Product,
  CatalogProduct,
  CategoryProd,
  Catalog,
} = require("../../db/db");

Catalog.belongsToMany(Product, { through: CatalogProduct });
Product.belongsToMany(Catalog, { through: CatalogProduct });

async function keyWordExists(keyWord, productID = null) {
  try {
    const isFindKey = productID
      ? await Product.findOne({
          where: {
            key_word: keyWord,
            id: {
              [Op.ne]: productID,
            },
          },
        })
      : await Product.findOne({ where: { key_word: keyWord } });

    return isFindKey ? true : false;
  } catch (error) {
    console.log(error);
    return true;
  }
}

router.get("/", async (req, res) => {
  const order = req.query.order ?? "ASC";
  const catalogId = req.query.catalogId ?? "";
  let products;
  try {
    // Remplaza con la id del catálogo que deseas obtener
    if (catalogId !== "") {
      products = await conn.query(
        `
        SELECT p.*, cat.category_name AS category_name, cat.id AS id_category
        FROM products p
        LEFT JOIN catalog_products key_word ON key_word.id_product = p.id
        LEFT JOIN catalogs c ON c.id = key_word.id_catalog
        LEFT JOIN categories_products cp2 ON cp2.id_product = p.id
        LEFT JOIN categories cat ON cat.id = cp2.id_category
        WHERE c.id = :catalogId
        ORDER BY p.product_name ${order}
      `,
        {
          replacements: { catalogId, order },
          type: QueryTypes.SELECT,
        }
      );
    } else {
      products = [];
    }

    products = products.reduce((uniqueProducts, product) => {
      if (!uniqueProducts.find((p) => p.id === product.id)) {
        uniqueProducts.push(product);
      }
      return uniqueProducts;
    }, []);

    res.json(products);
  } catch (error) {
    res.json(error);
  }
});

/**
 * Returns an xlsx file that contains the info of
 * the existing payment methods in the DB
 */
router.get("/download", async (req, res) => {
  try {
    // Get payment methods from DB
    const productsQuery = await Product.findAll();
    const products = JSON.parse(JSON.stringify(productsQuery));

    // Create excel workbook, where sheets will be stored
    const workbook = new ExcelJS.Workbook();

    // Create a sheet and assign to it some columns metadata to insert rows
    const worksheet = workbook.addWorksheet("Productos");
    worksheet.columns = [
      { header: "ID", key: "id", width: 20 },
      { header: "Nombre del producto", key: "product_name", width: 25 },
      { header: "Descripción", key: "description", width: 35 },
      { header: "Palabra clave", key: "key_word", width: 25 },
      { header: "Precio", key: "price", width: 25 },
      { header: "No. de existencia", key: "stock", width: 30 },
    ];

    // Style each column
    const idColumn = worksheet.getColumn("id"),
      productColumn = worksheet.getColumn("product_name"),
      descriptionColumn = worksheet.getColumn("description"),
      keyWordColumn = worksheet.getColumn("key_word"),
      priceColumn = worksheet.getColumn("price"),
      stockColumn = worksheet.getColumn("stock");

    const alignment = { horizontal: "center" };

    idColumn.alignment = alignment;
    productColumn.alignment = alignment;
    descriptionColumn.alignment = alignment;
    keyWordColumn.alignment = alignment;
    priceColumn.alignment = alignment;
    stockColumn.alignment = alignment;

    // Style header row
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true, size: 14 };

    // Add data of every payment method
    for (const product of products) worksheet.addRow(product);

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
      'attachment; filename="Productos.xlsx"'
    );
    res.setHeader("Access-Control-Expose-Headers", "content-disposition");
    res.status(200).end(fileBuffer);
  } catch (error) {
    res.status(400).send("Error al descargar el archivo");
  }
});

router.get("/downloadWithCatalogId", async (req, res) => {
  const { catalogID } = req.query;
  console.log("catalogID: ", catalogID, "\n\n");
  try {
    // Obtener los productos del catálogo desde la base de datos
    const productsCatalog = await CatalogProduct.findAll({
      where: { id_catalog: catalogID },
    });

    const productos = await Promise.all(
      productsCatalog.map(async (product) => {
        const resolvedMenuOption = await Product.findOne({
          where: { id: product.id_product },
        });
        return resolvedMenuOption.dataValues;
      })
    );

    const products = JSON.parse(JSON.stringify(productos));

    // Crear el libro de Excel y la hoja de trabajo
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Productos");

    // Definir las columnas de la hoja de trabajo
    worksheet.columns = [
      { header: "ID", key: "id", width: 20 },
      { header: "Nombre del producto", key: "product_name", width: 25 },
      { header: "Descripción", key: "description", width: 30 },
      { header: "Palabra clave", key: "key_word", width: 25 },
      { header: "Precio", key: "price", width: 25 },
      { header: "No. de existencia", key: "stock", width: 30 },
    ];

    // Establecer el estilo de las columnas
    worksheet.columns.forEach((column) => {
      column.alignment = { horizontal: "center" };
    });

    // Establecer el estilo de la fila de encabezado
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true, size: 14 };

    // Agregar los datos de cada producto
    for (const product of products) worksheet.addRow(product);

    // Autoajustar el ancho de las columnas para que se ajusten al contenido y encabezados
    worksheet.columns.forEach((column) => {
      column.header = column.header?.toString(); // Convert header to string
      column.width = Math.max(column.header.length, 12); // Set minimum width based on header length

      column.eachCell({ includeEmpty: true }, (cell) => {
        cell.alignment = {
          vertical: "middle",
          horizontal: "center",
          wrapText: true, // Enable text wrapping
        };
        if (cell.value) {
          const cellLength = cell.value.toString().length;
          column.width = Math.max(column.width, cellLength + 2); // Adjust width based on cell content
        }
      });
    });

    // Generar el archivo y enviar la respuesta
    const fileBuffer = await workbook.xlsx.writeBuffer();

    res.setHeader(
      "content-disposition",
      'attachment; filename="Productos.xlsx"'
    );
    res.setHeader("Access-Control-Expose-Headers", "content-disposition");
    res.status(200).end(fileBuffer);
  } catch (error) {
    res.status(400).send("Error al descargar el archivo");
    console.log(error);
  }
});

router.get("/searchByStock", async (req, res) => {
  const { order, search, catalogId } = req.query;
  let products = [];

  try {
    if (catalogId !== "") {
      products = await conn.query(
        `
        SELECT p.*, cat.category_name AS category_name, cat.id AS id_category
        FROM products p
        LEFT JOIN catalog_products key_word ON key_word.id_product = p.id
        LEFT JOIN catalogs c ON c.id = key_word.id_catalog
        LEFT JOIN categories_products cp2 ON cp2.id_product = p.id
        LEFT JOIN categories cat ON cat.id = cp2.id_category
        WHERE p.stock = :search
        ORDER BY p.product_name ${order === "ASC" ? "ASC" : "DESC"}
      `,
        {
          replacements: { search },
          type: QueryTypes.SELECT,
        }
      );
    } else {
      products = [];
    }

    products = products.reduce((uniqueProducts, product) => {
      if (!uniqueProducts.find((p) => p.id === product.id)) {
        uniqueProducts.push(product);
      }
      return uniqueProducts;
    }, []);

    res.json(products);
  } catch (error) {
    return res.status(400).send({ error: "Un error en la busqueda" });
  }
});

router.get("/searchByName", async (req, res) => {
  const { order, search, catalogId } = req.query;
  let products = [];

  try {
    if (catalogId !== "") {
      products = await conn.query(
        `
        SELECT p.*, cat.category_name AS category_name, cat.id AS id_category
        FROM products p
        LEFT JOIN catalog_products key_word ON key_word.id_product = p.id
        LEFT JOIN catalogs c ON c.id = key_word.id_catalog
        LEFT JOIN categories_products cp2 ON cp2.id_product = p.id
        LEFT JOIN categories cat ON cat.id = cp2.id_category
        WHERE p.product_name LIKE :search
        ORDER BY p.product_name ${order === "ASC" ? "ASC" : "DESC"}
      `,
        {
          replacements: { search: `%${search}%` },
          type: QueryTypes.SELECT,
        }
      );
    } else {
      products = [];
    }

    products = products.reduce((uniqueProducts, product) => {
      if (!uniqueProducts.find((p) => p.id === product.id)) {
        uniqueProducts.push(product);
      }
      return uniqueProducts;
    }, []);

    res.json(products);
  } catch (error) {
    return res.status(400).send({ error: "Un error en la busqueda" });
  }
});

router.get("/searchByPrice", async (req, res) => {
  const { order, search, catalogId } = req.query;
  let products = [];

  try {
    if (catalogId !== "") {
      products = await conn.query(
        `
        SELECT p.*, cat.category_name AS category_name, cat.id AS id_category
        FROM products p
        LEFT JOIN catalog_products key_word ON key_word.id_product = p.id
        LEFT JOIN catalogs c ON c.id = key_word.id_catalog
        LEFT JOIN categories_products cp2 ON cp2.id_product = p.id
        LEFT JOIN categories cat ON cat.id = cp2.id_category
        WHERE p.price = :search
        ORDER BY p.product_name ${order === "ASC" ? "ASC" : "DESC"}
      `,
        {
          replacements: { search },
          type: QueryTypes.SELECT,
        }
      );
    } else {
      products = [];
    }

    products = products.reduce((uniqueProducts, product) => {
      if (!uniqueProducts.find((p) => p.id === product.id)) {
        uniqueProducts.push(product);
      }
      return uniqueProducts;
    }, []);

    res.json(products);
  } catch (error) {
    return res.status(400).send({ error: "Un error en la busqueda" });
  }
});

router.get("/searchByKeyWord", async (req, res) => {
  const { order, search } = req.query;
  let products = [];

  try {
    products = await conn.query(
      `
        SELECT p.*, cat.category_name AS category_name, cat.id AS id_category
        FROM products p
        LEFT JOIN catalog_products key_word ON key_word.id_product = p.id
        LEFT JOIN catalogs c ON c.id = key_word.id_catalog
        LEFT JOIN categories_products cp2 ON cp2.id_product = p.id
        LEFT JOIN categories cat ON cat.id = cp2.id_category
        WHERE p.key_word = :search
        ORDER BY p.product_name ${order === "ASC" ? "ASC" : "DESC"}
      `,
      {
        replacements: { search },
        type: QueryTypes.SELECT,
      }
    );

    res.json(products[0]);
  } catch (error) {
    return res.status(400).send({ error: "Un error en la busqueda" });
  }
});

router.post("/", async (req, res) => {
  const { categoryId, catalogId } = req.query;
  const { key_word } = req.body;

  try {
    if (!(await keyWordExists(key_word ?? ""))) {
      const product = await Product.create(req.body);
      const productId = product.id;

      await CatalogProduct.create({
        id_product: productId,
        id_catalog: catalogId,
      });
      await CategoryProd.create({
        id_product: productId,
        id_category: categoryId,
      });

      res.json(product);
    } else throw { statusText: "Ya existe un producto con esa palabra clave" };
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Ocurrió un error al crear al producto" });
  }
});

/**
 * Takes an excel file from the request, analices it's data and
 * - If correct, updates the table
 * - If incorrect, returns the corresponding error to the client
 */
router.post("/upload", upload.single("excel_file"), async (req, res) => {
  const file = req.file;

  try {
    // Create excel info getter
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(file.path);
    const worksheet = workbook.getWorksheet(1);

    // Get every product from the excel
    const products = [];
    worksheet.eachRow(function (row, rowNumber) {
      if (rowNumber === 1) return;

      const [, id, product_name, description, key_word, price, stock] =
        row.values;

      products.push({
        id,
        name: product_name,
        description: description,
        key_word: key_word,
        price: price,
        stock: stock,
      });
    });

    // BUG: If validation is needed, it should go here

    // For every product, add it if ID not found, or update it if found
    for (const product of products) {
      if (product.id !== undefined)
        // Place indeed exists, update its info
        await Product.update(product, {
          where: { id: product.id },
        });
      // Place didn't exist, create a new one
      else
        await Product.create({
          id: Date.now().toString(),
          name: product.name,
          description: product.description,
          key_word: product.key_word,
          price: product.price,
          stock: product.stock,
        });
    }

    res.sendStatus(200);
  } catch (error) {
    res.status(400).send("Error al actualizar desde el archivo");
  }
});

router.put("/:productId", async (req, res) => {
  const { categoryId } = req.query;
  const { productId } = req.params;
  const { key_word } = req.body;
  try {
    if (!productId) return res.status(404).send("Producto no encontrado");

    if (!(await keyWordExists(key_word ?? "", productId))) {
      await Product.update(req.body, {
        where: { id: productId },
      });

      const isFind = await CategoryProd.findOne({
        where: { id_product: productId },
      });

      if (isFind) {
        await CategoryProd.update(
          { id_category: categoryId },
          {
            where: { id_product: productId },
          }
        );
      } else
        await CategoryProd.create({
          id_product: productId,
          id_category: categoryId,
        });

      res.json({ success: "Se ha modificado" });
    } else throw { statusText: "Ya existe un producto con esa palabra clave" };
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "Ocurrió un error al actualizar el producto" });
  }
});

router.delete("/:productId", async (req, res) => {
  const { productId } = req.params;
  try {
    if (!productId) return res.status(404).send("Producto no encontrado");

    await Product.destroy({
      where: { id: productId },
    });

    res.status(200).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Ocurrió un error al eliminar el producto" });
  }
});

module.exports = router;
