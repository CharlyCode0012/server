const router = require('express').Router();

const {CatalogProduct} = require('../../db/db');

router.get('/', async (req, res)=>{

    try {
        const catalogPrs = await CatalogProduct.findAll();
        res.json(catalogPrs);
    } catch (error) {
        res.status(400).send("Error al traer los datos");
    }
});

router.post('/', async (req, res)=>{

    try {
        const catalogPr = await CatalogProduct.create(req.body);
        res.json(catalogPr);
    } catch (error) {
        res.send("Error al crear");
    }
});

router.put('/:catalogPrId', async (req, res)=>{
    const {catalogPrId} = req.params;

    try {
        
        const isFind = await CatalogProduct.findOne({where: {id: catalogPrId}});
    
        if (!isFind) return res.status(404).send("Pregunta no encontrada");
    
        await CatalogProduct.update(req.body, {
            where: {id: catalogPrId}
        });
        res.json({success: `se ha modificado ${catalogPrId}`});
    } catch (error) {
        res.status(400).send("Error al actualizar");
    }
})

router.delete('/:catalogPrId', async (req, res)=>{
    const {catalogPrId} = req.params;

    try {
        const isFind = await CatalogProduct.findOne({where: {id: catalogPrId}});
        
        if (!isFind) return res.status(404).send("Pregunta no encontrada");
    
        await CatalogProduct.destroy({where: {id: catalogPrId}});   
        res.status(200).send("Se elimino");
    } catch (error) {
        res.status(400).send("Erro al eliminar");
    }
})

module.exports = router;