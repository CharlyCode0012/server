const express = require('express');
const bodyParser = require('body-parser');
const apiRouter = require('./routes/api');
const cors = require('cors');
require('./db/db');
require('dotenv').config();

const app = express();

app.use(cors({
    origin: true,
    credentials: true
  }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/api', apiRouter);

app.listen(process.env.PORT, () => {    
    console.log("=========================")
    console.log("Listening on port: " + process.env.PORT);
    console.log("Server is running! 😎")
    console.log("=========================\n")
});
