const router = require('express').Router();

const {Menu} = require('../../db/db');

router.get('/', async (req, res)=>{
    try {
        const menus = await Menu.findAll();
        res.json(menus);
        
    } catch (error) {
        res.status(400).json();
    }
});

router.post('/', async (req, res)=>{
    try {
        const menu = await Menu.create(req.body);
        res.json(menu);   
    } catch (error) {
        res.status(400).send("Error al traer");
    }
});

router.put('/:menuId', async (req, res)=>{
    const {menuId} = req.params;
    try {
        const isFind = await Menu.findOne({where: {id: menuId}});
    
        if (!isFind) return res.status(404).send("Pregunta no encontrada");
    
        await Menu.update(req.body, {
            where: {id: menuId}
        });
        res.json({success: `se ha modificado ${menuId}`}); 
    } catch (error) {
        res.status(400).send("Error al actualizar");
    }
})

router.delete('/:menuId', async (req, res)=>{
    const {menuId} = req.params;
    try {
        const isFind = await Menu.findOne({where: {id: menuId}});
        
        if (!isFind) return res.status(404).send("Pregunta no encontrada");
    
        await Menu.destroy({where: {id: menuId}});    
    } catch (error) {
        res.status(400).send("Error al eliminar");
    }
})

module.exports = router;