const router = require('express').Router();

const apiCatalogsRouter = require('./api/catalogs');
const apiCatalogPrRouter  = require('./api/catalog_products');
const apiCategoriesRouter = require('./api/categories');
const apiClientsRouter = require('./api/clients');
const {router: apiMenuRouter} = require('./api/menus');
const apiMenuAndOptionsRouter = require('./api/menu_and_options');
const {router: apiMenuOptions} = require('./api/menu_options');
const apiOrderRouter = require('./api/order');
const apiOrderDetailsRouter = require('./api/order_details');
const apiPaymentRouter = require('./api/payment_methods');
const apiPlacesRouter = require('./api/places_deliveries');
const apiProductsRouter = require('./api/products');
const apiQuestionRouter = require('./api/questions');
const apiShoppingRouter = require('./api/shoppings');
const apiSoldProdRouter = require('./api/sold_products');
const apiUsersRouter = require('./api/users');
const apiImageRouter = require('./api/images');
const apiDeliveryRouter = require('./api/deliveries');


router.use('/catalogs', apiCatalogsRouter);
router.use('/catalog_products', apiCatalogPrRouter);
router.use('/categories', apiCategoriesRouter);
router.use('/clients', apiClientsRouter);
router.use('/menus', apiMenuRouter);
router.use('/menu_options', apiMenuOptions);
router.use('menu_&_options/', apiMenuAndOptionsRouter);
router.use('/orders', apiOrderRouter);
router.use('/order_details', apiOrderDetailsRouter);
router.use('/payment_methods', apiPaymentRouter);
router.use('/places', apiPlacesRouter);
router.use('/products', apiProductsRouter);
router.use('/questions', apiQuestionRouter);
router.use('/shoppings', apiShoppingRouter);
router.use('/sold_products', apiSoldProdRouter);
router.use('/users', apiUsersRouter);
router.use('/images', apiImageRouter);
router.use('/deliveries', apiDeliveryRouter);

module.exports = router;