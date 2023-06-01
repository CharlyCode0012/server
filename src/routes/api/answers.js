const router = require('express').Router();

const {Answer} = require('../../db/db');

router.get('/', async (req, res)=>{
    try {
        const answers = await Answer.findAll();
        res.json(answers);
    } catch (error) {
        res.status(400).send("Error al obtener los datos");
    }
});

router.post('/', async (req, res)=>{
    
    try {
        const answer = await Answer.create(req.body);
        res.json(answer);
        
    } catch (error) {
        res.status(400).send("Error al crear");
    }
});

router.put('/:answerId', async (req, res)=>{
    const {answerId} = req.params;

    try {
        const isFind = await Answer.findOne({where: {id: answerId}});
    
        if (!isFind) return res.status(404).send("Respuesta no encontrada");
    
        await Answer.update(req.body, {
            where: {id: answerId}
        });
        res.json({success: `se ha modificado ${answerId}`});
        
    } catch (error) {
        res.status(400).send("Error al actualizar");
    }
})

router.delete('/:answerId', async (req, res)=>{
    const {answerId} = req.params;

    try {
        const isFind = await Answer.findOne({where: {id: answerId}});
        
        if (!isFind) return res.status(404).send("Respuesta no encontrada");
    
        await Answer.destroy({where: {id: answerId}});
        res.status(200).send("Se elimino con exito");
    } catch (error) {
        res.status(400).send("Error al eliminar");
    }
})

module.exports = router;