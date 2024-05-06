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

        // Wrap db.get in a Promise
        const userPromise = new Promise((resolve, reject) => {
            db.get('SELECT id, username, age, role FROM user WHERE jti = ?', [jti], (err, row) => {
                if (err) {
                    reject('Account data not found');
                } else {
                    resolve(row);
                }
            });
        });

        // Await the Promise
        userPromise.then((row) => {
            req.userData = row;
            next();
        }).catch((err) => {
            res.status(404).send(err);
        });

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