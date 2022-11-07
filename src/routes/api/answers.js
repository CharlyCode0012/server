const router = require('express').Router();

const {Answer} = require('../../db/db');

router.get('/', async (req, res)=>{
    const answers = await Answer.findAll();
    res.json(answers);
});

router.get('/:answerId', async (req, res)=>{
    const {answerId} = req.params;
    const answer = await Answer.findAll({where: {id: answerId}});

    res.json(answer);
});

router.post('/:', async (req, res)=>{
    const answer = await Answer.create(req.body);
    res.json(answer);
});

router.put('/:answerId', async (req, res)=>{
    const {answerId} = req.params;
    const isFind = await Answer.findOne({where: {id: answerId}});

    if (!isFind) return res.status(404).send("Respuesta no encontrada");

     await Answer.update(req.body, {
        where: {id: answerId}
    });
    res.json({success: `se ha modificado ${answerId}`});
})

router.delete('/:answerId', async (req, res)=>{
    const {answerId} = req.params;
    const isFind = await Answer.findOne({where: {id: answerId}});
    
    if (!isFind) return res.status(404).send("Respuesta no encontrada");

    await Answer.destroy({where: {id: answerId}});
})

module.exports = router;