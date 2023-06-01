const router = require('express').Router();

const {CategoryProd} = require('../../db/db');

router.get('/', async (req, res)=>{
    try {
        const categoryProds = await CategoryProd.findAll();
        res.json(categoryProds);
    } catch (error) {
        res.status(400).send("Error al traer");
    }
});


router.post('/', async (req, res)=>{

    try {
        const categoryProd = await CategoryProd.create(req.body);
        res.json(categoryProd);
    } catch (error) {
        res.status(400).send("Error al crear");
    }
});

router.put('/:categoryProdId', async (req, res)=>{
    const {categoryProdId} = req.params;

    try {
        const isFind = await CategoryProd.findOne({where: {id: categoryProdId}});
        
        if (!isFind) return res.status(404).send("Pregunta no encontrada");
        
        await CategoryProd.update(req.body, {
            where: {id: categoryProdId}
        });
        res.json({success: `se ha modificado ${categoryProdId}`});  
    } catch (error) {
        res.status(400).status("Error al actualizar");
    }
})

router.delete('/:categoryProdId', async (req, res)=>{
    const {categoryProdId} = req.params;
    try {
        const isFind = await CategoryProd.findOne({where: {id: categoryProdId}});
        
        if (!isFind) return res.status(404).send("Pregunta no encontrada");
    
        await CategoryProd.destroy({where: {id: categoryProdId}});
    } catch (error) {
        res.status(400).send("Error al eliminar");
    }
})

module.exports = router;