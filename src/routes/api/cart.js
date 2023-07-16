const router = require("express").Router();

const { Op } = require("sequelize");

const { Cart, CartProduct, Product } = require("../../db/db");

async function getCartProducts(clientId) {
  try {
    const cart = await Cart.findOne({
      where: { id_client: clientId },
      attributes: ["id", "total_price"],
    });

    if (!cart) {
      return null; // El carrito no existe
    }

    const cartProductData = await CartProduct.findAll({
      where: { id_cart: cart.id },
      attributes: ["id_product", "total_price"],
    });

    const productIds = cartProductData.map(
      (cartProduct) => cartProduct.id_product
    );

    const products = await Product.findAll({
      where: { id: { [Op.in]: productIds } },
      attributes: ["id", "product_name", "price"],
    });

    const cartProducts = cartProductData.map((cartProduct) => {
      const matchingProduct = products.find(
        (product) => product.id === cartProduct.id_product
      );
      return {
        id: cartProduct.id_product,
        total_price: cartProduct.total_price,
        product_name: matchingProduct ? matchingProduct.product_name : null,
        price: matchingProduct ? matchingProduct.price : null,
      };
    });

    const result = {
      id: cart.id,
      total_price: cart.total_price,
      products: cartProducts,
    };

    return result;
  } catch (error) {
    console.error("Error retrieving cart products:", error);
    throw error;
  }
}

router.get("/", async (req, res) => {
  const { number: id_client } = req.query;
  try {
    const cartProducts = await getCartProducts(id_client);
    if (cartProducts) {
      res.json(cartProducts);
    } else {
      res
        .status(404)
        .json({ message: "No se encontró el carrito o no tiene productos" });
    }
  } catch (error) {
    res.status(400).send("Error al traer los datos");
  }
});

router.post("/", async (req, res) => {
  const { number: id_client } = req.body;

  try {
    let cart = await Cart.findOne({ where: { id_client } });

    if (!cart) {
      // Si no existe el carrito, lo creamos
      cart = await Cart.create({ id_client });
    }

    res.json(cart);
  } catch (error) {
    console.error("Error creating cart:", error);
    res.status(500).json({ message: "Error al crear el carrito" });
  }
});

router.put("/", async (req, res) => {
  const { keyword, id_client } = req.body;

  try {
    let cart = await Cart.findOne({ where: { id_client } });

    if (!cart) {
      return res.status(404).json({ message: "No se encontró el carrito" });
    }

    let product = await Product.findOne({ where: { key_word: keyword } });

    if (!product) {
      return res.status(404).json({ message: "No se encontró el producto" });
    }

    let cartProduct = await CartProduct.findOne({
      where: { id_cart: cart.id, id_product: product.id },
    });

    if (cartProduct) {
      // Si el producto ya está en el carrito, actualiza los campos correspondientes
      cartProduct.quantity += 1;
      cartProduct.total_price = cartProduct.quantity * product.price;
      await cartProduct.save();
    } else {
      // Si el producto no está en el carrito, crea un nuevo registro
      cartProduct = await CartProduct.create({
        id_cart: cart.id,
        id_product: product.id,
        quantity: 1,
        total_price: product.price,
      });
    }

    // Actualiza el total_price del carrito sumando los valores de total_price de todos los productos
    const cartProducts = await CartProduct.findAll({
      where: { id_cart: cart.id },
    });
    const total_price = cartProducts.reduce(
      (sum, cartProduct) => sum + cartProduct.total_price,
      0
    );
    cart.total_price = total_price;
    await cart.save();

    res.json(cart);
  } catch (error) {
    console.error("Error updating cart:", error);
    res.status(500).json({ message: "Error al actualizar el carrito" });
  }
});

router.delete("/:id_product", async (req, res) => {
  const { id_client } = req.body;
  const { id_product } = req.params;

  try {
    const cart = await Cart.findOne({ where: { id_client } });

    if (!cart) {
      return res.status(404).json({ message: "No se encontró el carrito" });
    }

    const cartProduct = await CartProduct.findOne({
      where: { id_cart: cart.id, id_product },
    });

    if (!cartProduct) {
      return res.status(404).json({ message: "No se encontró el producto en el carrito" });
    }

    await cartProduct.destroy();

    // Actualiza el total_price del carrito sumando los valores de total_price de todos los productos
    const cartProducts = await CartProduct.findAll({ where: { id_cart: cart.id } });
    const total_price = cartProducts.reduce((sum, cartProduct) => sum + cartProduct.total_price, 0);
    cart.total_price = total_price;
    await cart.save();

    res.json(cart);
  } catch (error) {
    console.error("Error deleting product from cart:", error);
    res.status(500).json({ message: "Error al eliminar el producto del carrito" });
  }
});

module.exports = router;
