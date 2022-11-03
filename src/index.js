const express = require('express');
const bodyParser = require('body-parser');
const apiRouter = require('./routes/api');
const cors = require('cors');
require('dotenv').config();


const app = express();


require('./db/db');

app.use(cors());
/* app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');
    next();
}); */

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.use('/api', apiRouter);

app.listen(process.env.PORT, ()=>{
    
    console.log(process.env.PORT);

    console.log('servidor arrancado')
});
