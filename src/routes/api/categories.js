const router = require('express').Router();

const {Category} = require('../../db/db');

router.get('/', async (req, res)=>{
    const categories = await Category.findAll();
    res.json(categories);
});

router.get('/:categoryId', async (req, res)=>{
    const {categoryId} = req.params;
    const category = await Category.findAll({where: {id: categoryId}});

    res.json(category);
});

router.post('/', async (req, res)=>{
    const category = Category.create(req.body);
    res.json(category);
});

router.put('/:categoryId', async (req, res)=>{
    const {categoryId} = req.params;
    const isFind = await Category.findOne({where: {id: categoryId}});

    if (!isFind) return res.status(404).send("Categoria no encontrada");

     await Category.update(req.body, {
        where: {id: categoryId}
    });
    res.json({success: `se ha modificado ${categoryId}`});
})

router.delete('/:categoryId', async (req, res)=>{
    const {categoryId} = req.params;
    const isFind = await Category.findOne({where: {id: categoryId}});
    
    if (!isFind) return res.status(404).send("Categoria no encontrada");

    await Category.destroy({where: {id: categoryId}});
})

module.exports = router;