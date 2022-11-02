const jwt = require('jwt-simple');
const momento = require('moment');

const checkToken = (req, res, next) =>{
    if(req.headers['user-token']){
        return res.json({ error: 'necesitas incluir el user-token en la cabezera' })
    }

    const userToken = req.headers['user-token'];
    let payload = {};

    try {
        payload = jwt.decode(userToken, 'secret sentence');
    } catch (err) {
        return res.json({error: 'El token es incorrecto'});
    }

    if( payload.expiredAt < moment().unix() ) return res.json({ error: 'El token expiro' });

    req.userId = payload.userId;

    next();
}

module.exports = {
    checkToken: checkToken,
}