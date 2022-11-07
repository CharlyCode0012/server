const express = require('express');
const bodyParser = require('body-parser');
const apiRouter = require('./routes/api');
const cors = require('cors');
require('dotenv').config();


const app = express();


require('./db/db');

app.use(cors());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.use('/api', apiRouter);

app.listen(process.env.PORT, ()=>{
    
    console.log(process.env.PORT);

    console.log('servidor arrancado')
});
