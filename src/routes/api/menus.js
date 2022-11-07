const router = require('express').Router();

const {Menu} = require('../../db/db');

router.get('/', async (req, res)=>{
    const menus = await Menu.findAll();
    res.json(menus);
});

router.get('/:menuId', async (req, res)=>{
    const {menuId} = req.params;
    const menu = await Menu.findAll({where: {id: menuId}});

    res.json(menu);
});

router.post('/', async (req, res)=>{
    const menu = await Menu.create(req.body);
    res.json(menu);
});

router.put('/:menuId', async (req, res)=>{
    const {menuId} = req.params;
    const isFind = await Menu.findOne({where: {id: menuId}});

    if (!isFind) return res.status(404).send("Pregunta no encontrada");

     await Menu.update(req.body, {
        where: {id: menuId}
    });
    res.json({success: `se ha modificado ${menuId}`});
})

router.delete('/:menuId', async (req, res)=>{
    const {menuId} = req.params;
    const isFind = await Menu.findOne({where: {id: menuId}});
    
    if (!isFind) return res.status(404).send("Pregunta no encontrada");

    await Menu.destroy({where: {id: menuId}});
})

module.exports = router;