const router = require('express').Router();

const {PlaceDelivery} = require('../../db/db');

router.get('/', async (req, res)=>{
    const places = await PlaceDelivery.findAll();
    res.json(places);
});

router.get('/:placeId', async (req, res)=>{
    const {placeId} = req.params;
    const place = await PlaceDelivery.findAll({where: {id: placeId}});

    res.json(place);
});

router.post('/', async (req, res)=>{
    const place = await PlaceDelivery.create(req.body);
    res.json(place);
});

router.put('/:placeId', async (req, res)=>{
    const {placeId} = req.params;
    const isFind = await PlaceDelivery.findOne({where: {id: placeId}});

    if (!isFind) return res.status(404).send("Lugar no encontrado");

     await PlaceDelivery.update(req.body, {
        where: {id: placeId}
    });
    res.json({success: `se ha modificado ${placeId}`});
})

router.delete('/:placeId', async (req, res)=>{
    const {placeId} = req.params;
    const isFind = await PlaceDelivery.findOne({where: {id: placeId}});
    
    if (!isFind) return res.status(404).send("Lugar no encontrado");

    await PlaceDelivery.destroy({where: {id: placeId}});
})

module.exports = router;