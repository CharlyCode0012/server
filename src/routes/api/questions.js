const router = require('express').Router();
const { QueryTypes } = require('sequelize');

const {conn, Question} = require('../../db/db');

router.get('/', async (req, res)=>{
    /** 
     * 
     * **/
    try {
        const questions = await conn.query(`
        SELECT questions.id, questions.question, questions.state, questions.id_client, questions.id_product, products.product_name AS product_name
        FROM questions
        INNER JOIN products ON questions.id_product = products.id
        WHERE questions.state = 0;
    `, {
        type: QueryTypes.SELECT,
    });
    res.json(questions);
    } catch (error) {
        res.status(400).send(error);
    } 
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
    const {state, answer, id_client } = req.body;

    const isFind = await Question.findOne({where: {id: questionId}});

    if (!isFind) return res.status(404).send("Pregunta no encontrada");

     await Question.update({ state }, {
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