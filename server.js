/*

Tehtävä koostuu kolmesta osiosta:
- API laajennuksen suunnittelu,
- API laajennuksen toteutus,
- Virheiden hallinta ja testitapausten luonti.

Tehtävänanto kokonaisuudessaan:
```
1. Suunnittele rajapinnan laajennos jo aloitettuun nodejs projektiin:
- Tee OpenAPI-spesifikaation mukainen dokumentaatio RESTful rajapinnalle.
- REST-rajapinnan tulee sisältää endpointit HTTP-metodeille GET, POST, PUT ja DELETE

2. Toteuta suunnittelemasi REST-rajapinnan laajennos:
- Toteuta suunnittelemasi laajennos Nodejs:llä niin, että REST-rajapintasi endpointit tukevat CRUD toiminnallisuuksia, vastaten asianmukaisia HTTP-metodeja.

3. Lisää mukaan virheiden hallinta ja luo testitapaukset rajapinnan toimivuuden toteamiseksi:
- Virheideiden hallinta: rajapinta ei "kaadu" käsittelemättömään virheeseen, client saa asianmukaisen HTTP-statuskoodin mahdollisen virheen ilmetessä
```.

 */

import express, { Router } from "express";
import cookieParser from "cookie-parser";
import { db } from "./database/sqlite.js";
import { compare, hash } from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from 'crypto'
import { JWT_SECRET } from "./src/config.js";
import { adminOnly, authenticate } from "./src/middlewares/auth.js";


const app = express();

app.use(express.json())
app.use(cookieParser())

const router = Router();
const saltRounds = 10

/*
    USER GET ENDPOINTS
 */

router.get('/user', authenticate, adminOnly, (req, res) => {
    try{
        db.all('SELECT id, username, age, role FROM user', [], (err, rows) => {

            if (err) {
                return res.status(404).send('Users not found')
            }

            res.send(JSON.stringify(rows))
        })
    }
    catch(err){
        return res.status(500).send('Server error')
    }
})

router.get('/user/account', authenticate, (req, res)=>{

    res.json(req.userData)

})

router.get('/user/:id', (req, res) => {
    const id = req.params.id

    try {
        db.get('SELECT id, username, age, role FROM user WHERE id = ?', [id], (err, row) => {

            if (err) {
                return res.status(404).send('User not found')
            }

            res.send(JSON.stringify(row))
        })
    }
    catch(err){
        return res.status(500).send('Server error')
    }
})

/*
    USER POST ENDPOINTS
 */

router.post('/user', async (req, res) => {
    const { username, password, age, role } = req.body

    if (!username || !age || !password || !role) {
        return res.status(400).send("Tarkista tiedot")
    }

    try {
        const hashedPassword = await hash(password, saltRounds)

        const stmt = db.prepare("INSERT INTO user VALUES (NULL, ?, ?, ?, NULL, ?)")

        stmt.run(username, hashedPassword, age, role, (err)=>{
            if(err){
                return res.status(400).json({
                    error: "Kokeile toista käyttäjänimeä"
                })
            }

            res.status(201).send('Käyttäjä luotu onnistuneesti')
        })
    } catch (err) {
        res.status(500).send('Server error')
    }
})

router.post('/user/login', (req, res) => {

    const { username, password } = req.body

    if (!username || !password) {
        return res.status(400).send()
    }

    try{
        db.get('SELECT id, password, role FROM user WHERE username = ?', [username], async (err, row) => {

            if (err || !row) {
                return res.status(400).send()
            }

            const isAuthenticated = await compare(password, row.password)

            if (isAuthenticated) {
                const jti = crypto.randomUUID()

                const token = jwt.sign({
                    role: row
                }, JWT_SECRET, {
                    expiresIn: '1h',
                    jwtid: jti
                })

                db.serialize(() => {

                    const stmt = db.prepare("UPDATE user SET jti = ? WHERE id = ?")

                    stmt.run(jti, row.id)

                    stmt.finalize()

                    res.cookie('accessToken', token, {
                        httpOnly: true,
                        sameSite: "lax",
                        secure: true
                    })

                    // res.setHeader('Set-Cookie', 'accessToken=Bearer ' + token + "; HttpOnly;")

                    return res.send("Kirjautuminen onnistui")

                })



            } else {
                return res.status(400).send()
            }
        })
    }
    catch(err){
        return res.status(500).send('Server error')
    }
})

router.post('/user/logout', authenticate, (req, res) => {
    res.clearCookie('accessToken');
    res.send('Logged out successfully');
});

/*
    USER PUT ENDPOINTS
 */

router.put('/user', authenticate, adminOnly, (req, res) => {


    const { username, age, id, role } = req.body

    if (!username || !age || !id || !role) {
        return res.status(400).send("Tarkista tiedot")
    }

    try{
        db.serialize(() => {

            const stmt = db.prepare("UPDATE user SET username = ?, age = ?, role = ? WHERE id = ?")

            stmt.run(username, age, role, id)

            stmt.finalize()

            res.send('Käyttäjä päivitetty onnistuneesti')
        })
    }
    catch(err){
        return res.status(500).send('Server error')
    }
})

/*
    USER PATCH ENDPOINTS
 */

router.patch('/user', authenticate, adminOnly, (req, res) => {
    res.send('Käyttäjän ikä päivitetty onnistuneesti')
})

/*
    USER DELETE ENDPOINTS
 */

router.delete('/user/:id', authenticate, adminOnly, (req, res) => {
    const id = req.params.id

    try{
        db.run("DELETE FROM user WHERE id = ?", [id], (err) => {

            if (err) {
                return res.status(404).send()
            }

            res.send("Käyttäjätili poistettu onnistuneesti")

        })
    }
    catch(err){
        return res.status(500).send('Server error')
    }
})

/*
    NOTE GET ENDPOINTS
 */

router.get('/note', authenticate, (req, res) => {
    const userId = req.userData.id;

    try{
        db.all(`SELECT * FROM note WHERE userId = ?`, [userId], (err, rows) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.status(200).json(rows);
        });
    }
    catch(err){
        return res.status(500).send('Server error')
    }
});

router.get('/note/:noteId', authenticate, (req, res) => {
    const noteId = req.params.noteId;
    const userId = req.userData.id;

    try{
        db.get(`SELECT * FROM note WHERE id = ? AND userId = ?`, [noteId, userId], (err, row) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            if (!row) {
                return res.status(404).json({ error: "Note not found" });
            }
            res.status(200).json(row);
        });
    }
    catch(err){
        return res.status(500).send('Server error')
    }
});

/*
    NOTE POST ENDPOINTS
 */

router.post('/note', authenticate, async (req, res) => {
    const { content } = req.body;
    const userId = req.userData.id;

    if (!content) {
        return res.status(400).send("Content is required");
    }

    try{
        db.run(`INSERT INTO note (content, userId) VALUES (?, ?)`, [content, userId], function(err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.status(201).json({ id: this.lastID });
        });
    }
    catch(err){
        return res.status(500).send('Server error')
    }
});

/*
    NOTE PUT ENDPOINTS
 */

router.put('/note', authenticate, async (req, res) => {
    const { id, content } = req.body;
    const userId = req.userData.id;

    if (!id || !content) {
        return res.status(400).send("Both ID and content are required");
    }

    try{
        db.run(`UPDATE note SET content = ? WHERE id = ? AND userId = ?`, [content, id, userId], function(err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            if (this.changes === 0) {
                return res.status(404).json({ error: "Note not found" });
            }
            res.status(200).json({ id: id });
        });
    }
    catch(err){
        return res.status(500).send('Server error')
    }
});

/*
    NOTE DELETE ENDPOINTS
 */

router.delete('/note/:noteId', authenticate, (req, res) => {
    const noteId = req.params.noteId;
    const userId = req.userData.id;

    try{
        db.run(`DELETE FROM note WHERE id = ? AND userId = ?`, [noteId, userId], function(err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            if (this.changes === 0) {
                return res.status(404).json({ error: "Note not found" });
            }
            res.status(200).json({ message: "Note deleted successfully" });
        });
    }
    catch(err){
        return res.status(500).send('Server error')
    }
});

app.use('/api/v1', router)

app.use(express.static('public'))

app.listen(3000, () => {
    console.log('HTTP Server is running on port http://localhost:3000')
})