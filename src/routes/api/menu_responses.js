const router = require('express').Router();

const {MenuRes} = require('../../db/db');

router.get('/', async (req, res)=>{
    const menuRess = await MenuRes.findAll();
    res.json(menuRess);
});

router.get('/:menuResId', async (req, res)=>{
    const {menuResId} = req.params;
    const menuRes = await MenuRes.findAll({where: {id: menuResId}});

    res.json(menuRes);
});

router.post('/', async (req, res)=>{
    const menuRes = MenuRes.create(req.body);
    res.json(menuRes);
});

router.put('/:menuResId', async (req, res)=>{
    const {menuResId} = req.params;
    const isFind = await MenuRes.findOne({where: {id: menuResId}});

    if (!isFind) return res.status(404).send("Pregunta no encontrada");

     await MenuRes.update(req.body, {
        where: {id: menuResId}
    });
    res.json({success: `se ha modificado ${menuResId}`});
})

router.delete('/:menuResId', async (req, res)=>{
    const {menuResId} = req.params;
    const isFind = await MenuRes.findOne({where: {id: menuResId}});
    
    if (!isFind) return res.status(404).send("Pregunta no encontrada");

    await MenuRes.destroy({where: {id: menuResId}});
})

module.exports = router;