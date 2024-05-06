import jwt from 'jsonwebtoken'
import { db } from '../../database/sqlite.js'
import { JWT_SECRET } from '../config.js'


export function authenticate(req, res, next){
    try {

        const { accessToken } = req.cookies

        if (!accessToken) {
            return res.status(401).send()
        }

        const { jti } = jwt.verify(accessToken, JWT_SECRET)

        db.get('SELECT id, username, age, role FROM user WHERE jti = ?', [jti], (err, row) => {

            if (err) {
                return res.status(404).send('Account data not found')
            }

            req.userData = row            
            next()
            //res.json(row)
        })

    } catch (err) {
        res.status(401).send(err)
    }

}

export function adminOnly(req, res, next){

    if(req.userData && req.userData.role === 'admin'){
        return next()
    } else {
        res.status(401).send()
    }

}