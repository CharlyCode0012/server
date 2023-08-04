const express = require('express');
const http = require('http');
const bodyParser = require('body-parser');

const apiRouter = require('./routes/api');
const { io: menuIO } = require('./routes/api/menus');
const {io: menuOptionsIO} = require('./routes/api/menu_options');
const cors = require('cors');

require('./db/db');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

const {processPendingOrders, io: pendingOrdersIO} = require("./pendingOrdersProcessor");

// Ejecutar la función processPendingOrders en segundo plano o en un proceso separado
processPendingOrders();

app.use(cors({
  origin: '*', // Cambia esto al dominio que estás usando

}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// TODO: Remove route logger
app.use((req, res, next) => {
	console.log('\x1b[33m%s\x1b[0m', `=> ${req.url}`);
	next();
});

app.use('/api', apiRouter);

menuIO.attach(server);
menuOptionsIO.attach(server);
//pendingOrdersIO.attach(server);

server.listen(process.env.PORT, () => {    
	console.log("=========================")
	console.log("Listening on port: " + process.env.PORT);
	console.log("Server is running! 😎")
	console.log("=========================\n")
});

