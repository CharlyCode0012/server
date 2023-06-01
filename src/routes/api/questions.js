const router = require('express').Router();
const { QueryTypes } = require('sequelize');

const {conn, Question, Answer} = require('../../db/db');

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

router.post('/', async (req, res)=>{
    try {
        const question = await Question.create(req.body);
        res.json(question);       
    } catch (error) {
        res.status(400).send("Error al crear");
    }
});

router.put('/:questionId', async (req, res)=>{
    const {questionId} = req.params;
    const {state, answer, id_client } = req.body;

    try {
        const isFind = await Question.findOne({where: {id: questionId}});
    
        if (!isFind) return res.status(404).send("Pregunta no encontrada");
    
        await Question.update({ state }, {
            where: {id: questionId}
        });
        res.json({success: `se ha modificado ${questionId}`});   
    } catch (error) {
        res.status(400).send("Error al actualizar");
    }
})

router.delete('/:questionId', async (req, res)=>{
    const {questionId} = req.params;
    try {
        const isFind = await Question.findOne({where: {id: questionId}});
        
        if (!isFind) return res.status(404).send("Pregunta no encontrada");
    
        await Question.destroy({where: {id: questionId}});
        res.send("Se elimino con extio");
    } catch (error) {
        res.status(400).send("Error");
    }
})

module.exports = router;