const router = require("express").Router();

const {Client} = require('../../db/db');

router.get('/', async (req, res)=>{
    const clients = await Client.findAll();
    res.json(clients);
});

router.get('/:clientId', async (req, res)=>{
    const {clientId} = req.params;
    const Client = await Client.findAll({where: {number: clientId}});

    res.json(Client);
});

router.post('/', async (req, res)=>{
    const Client = await Client.create(req.body);
    res.json(Client);
});

router.put('/:clientId', async (req, res)=>{
    const {clientId} = req.params;
    const isFind = await Client.findOne({where: {number: clientId}});

    if (!isFind) return res.status(404).send("Client@ no encontrad@");

     await Client.update(req.body, {
        where: {number: clientId}
    });
    res.json({success: `se ha modificado ${clientId}`});
})

router.delete('/:clientId', async (req, res)=>{
    const {clientId} = req.params;
    const isFind = await Client.findOne({where: {number: clientId}});
    
    if (!isFind) return res.status(404).send("Client@ no encontrad@");

    await Client.destroy({where: {number: clientId}});
})

module.exports = router;