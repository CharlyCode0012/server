const router = require('express').Router();

const {Question} = require('../../db/db');

router.get('/', async (req, res)=>{
    const questions = await Question.findAll();
    res.json(questions);
});

router.get('/:questionId', async (req, res)=>{
    const {questionId} = req.params;
    const question = await Question.findAll({where: {id: questionId}});

    res.json(question);
});

router.post('/', async (req, res)=>{
    const question = await Question.create(req.body);
    res.json(question);
});

router.put('/:questionId', async (req, res)=>{
    const {questionId} = req.params;
    const isFind = await Question.findOne({where: {id: questionId}});

    if (!isFind) return res.status(404).send("Pregunta no encontrada");

     await Question.update(req.body, {
        where: {id: questionId}
    });
    res.json({success: `se ha modificado ${questionId}`});
})

router.delete('/:questionId', async (req, res)=>{
    const {questionId} = req.params;
    const isFind = await Question.findOne({where: {id: questionId}});
    
    if (!isFind) return res.status(404).send("Pregunta no encontrada");

    await Question.destroy({where: {id: questionId}});
})

module.exports = router;