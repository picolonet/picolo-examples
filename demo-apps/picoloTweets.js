const pg = require('pg')
const request = require('request')
const async = require('async')
const express = require('express')
const bodyParser = require('body-parser')
const app = express()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
  extended: true
}))
app.listen(3000, () => console.log('Listening'))

const config = {
    user: 'root',
    host: 'localhost',
    database: 'defaultdb',
    port: 32980
}

let pool = new pg.Pool(config)

app.post('/createApp', (req, res) => {
    request.post('https://picolo.app/create', { json: { name: req.body.name } },
        (err, resp, body) => {
            console.log(err)
            if (!err && resp.statusCode == 200) {
                res.send('created')
            }
        }
    )
})

app.post('/connectToApp', (req, res) => {
    //let url = 'https://picolo.app/'
    let url = 'https://us-central1-flares-d1c56.cloudfunctions.net/getApp/'
    request.get(url + req.body.name,
        (err, resp, body) => {
            console.log(err)
            if (!err && resp.statusCode == 200) {
                pool = new pg.Pool({
                    connectionString: body,
                })
                res.send('connected')
            }
        }
    )
})

app.post('/fav', async (req, res) => {
    try {
        let id = req.body.id
        const result1 = await pool.query("SELECT tweet FROM tweets WHERE id = ($1) ", [id])
        result1.rows.forEach(async function (row) {
            let tweet = row.tweet
            tweet.favs = tweet.favs + 1
            const result2 = await pool.query("UPDATE tweets SET tweet = ($1) WHERE id=($2)", [tweet, id])
            res.send('Updated favs')
        })
    } catch (err) {
        console.log(err)
    }
})

app.post('/tweet', async (req, res) => {
    try {
        const result = await pool.query("INSERT INTO tweets(tweet) VALUES ($1) RETURNING id", [req.body])
        res.send(result.rows[0].id)
    } catch (err) {
        console.log(err)
    }
})