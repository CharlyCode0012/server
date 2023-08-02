const router = require('express').Router();

const {MenuAndOptions} = require('../../db/db');

router.get('/', async (req, res)=>{

    try {
        const menuRess = await MenuAndOptions.findAll();
        res.json(menuRess);  
    } catch (error) {
        res.status(400).send("Error al traer");
    }
});

router.post('/', async (req, res)=>{
    try {
        const menuRes = await MenuAndOptions.create(req.body);
        res.json(menuRes);     
    } catch (error) {
        res.status(400).send("Error al crear");
    }
});

router.put('/:menuResId', async (req, res)=>{
    const {menuResId} = req.params;

    try {
        const isFind = await MenuAndOptions.findOne({where: {id: menuResId}});
    
        if (!isFind) return res.status(404).send("Pregunta no encontrada");
    
        await MenuAndOptions.update(req.body, {
            where: {id: menuResId}
        });
        res.json({success: `se ha modificado ${menuResId}`});
        
    } catch (error) {
        res.status(400).send("Error al actualizar");
    }
})

router.delete('/:menuResId', async (req, res)=>{
    const {menuResId} = req.params;

    try {
        const isFind = await MenuAndOptions.findOne({where: {id: menuResId}});
        
        if (!isFind) return res.status(404).send("Pregunta no encontrada");
    
        await MenuAndOptions.destroy({where: {id: menuResId}});
        
    } catch (error) {
        res.status(400).send("Error al eliminar");
    }
})

module.exports = router;