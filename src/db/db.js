const Sequelize = require("sequelize");

const productModel = require("../models/product");
const userModel = require("../models/user");
const cartModel = require("../models/cart");
const cartProductModel = require("../models/cart_product");
const catalogModel = require("../models/catalog");
const catalogProductModel = require("../models/catalog_product");
const categoryModel = require("../models/category");
const categoryProdModel = require("../models/categories_product");
const clientModel = require("../models/client");
const responseModel = require("../models/response");
const menuModel = require("../models/menus.js");
const menuAndOptionsModel = require("../models/menu_and_options.js");
const menuOptionsModel = require("../models/menu_options");
const orderModel = require("../models/order");
const orderDetailModel = require("../models/order_detail");
const paymentModel = require("../models/payment_method");
const placesDeliveriesModel = require("../models/place_delivery");
const shoppingModel = require("../models/shopping");
const soldProdModel = require("../models/sold_product");

const answerModel = require("../models/answer");
const deliveryModel = require("../models/delivery");
const questionModel = require("../models/question");

const {
  DB_PORT,
  DB_DATABASE,
  DB_USER,
  DB_PASSWORD,
  DB_HOST,
  DB_DIALECT,
} = require("./config");
/* const conn = new Sequelize("data_bot", "root", "0906gean", {
  host: "localhost",
  dialect: "mysql",
  port: 3310,
}); */ //'db_name', 'user_name', 'password'{host: 'url', dialect: 'type_db'}

const conn = new Sequelize(DB_DATABASE, DB_USER, DB_PASSWORD, {
  host: DB_HOST,
  dialect: DB_DIALECT,
  port: DB_PORT,
  logging: false,
}); 

const Product = productModel(conn, Sequelize);
const User = userModel(conn, Sequelize);
const Cart = cartModel(conn, Sequelize);
const CartProduct  = cartProductModel(conn, Sequelize);
const Catalog = catalogModel(conn, Sequelize);
const CatalogProduct = catalogProductModel(conn, Sequelize);
const Category = categoryModel(conn, Sequelize);
const CategoryProd = categoryProdModel(conn, Sequelize);
const Client = clientModel(conn, Sequelize);
const Response = responseModel(conn, Sequelize);
const Menu = menuModel(conn, Sequelize);
const MenuAndOptions = menuAndOptionsModel(conn, Sequelize);
const MenuOptions = menuOptionsModel(conn, Sequelize);
const Order = orderModel(conn, Sequelize);
const OrderDetails = orderDetailModel(conn, Sequelize);
const Payment = paymentModel(conn, Sequelize);
const PlaceDelivery = placesDeliveriesModel(conn, Sequelize);
const Shopping = shoppingModel(conn, Sequelize);
const SoldProd = soldProdModel(conn, Sequelize);

const Answer = answerModel(conn, Sequelize);
const Delivery = deliveryModel(conn, Sequelize);
const Question = questionModel(conn, Sequelize);
//const Answer = answerModel(conn, Sequelize);
conn.sync({ force: false }).then(() => {
  console.log("tablas sincronizadas");
});

module.exports = {
  conn,
  Answer,
  Cart,
  CartProduct,
  Catalog,
  CatalogProduct,
  Category,
  CategoryProd,
  Client,
  Delivery,
  Menu,
  MenuAndOptions,
  MenuOptions,
  Response,
  Order,
  OrderDetails,
  Payment,
  Product,
  PlaceDelivery,
  Question,
  Shopping,
  SoldProd,
  User,
};
