const async = require('async')
const express = require('express')
const bodyParser = require('body-parser')
const request = require('request')
const app = express()

const IpfsApi = require('ipfs-api')
const node = new IpfsApi({
    host: 'localhost',
    port: 5001,
    protocol: 'http'
})

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
    extended: true
}))
app.listen(3001, () => console.log('Listening'))

app.listen(10001, () => console.log('Listening'))

app.post('/replicate', async(req, res) => {
    const toStore = JSON.stringify(req.body)
    node.files.add(Buffer.from(toStore), (err, resp) => {
        if (err || !resp) {
            res.send('ipfs add error')
        } else {
            resp.forEach((file) => {
                if (file && file.hash) {
                    res.send(file.hash)
                }
            })
        }
    })
})

app.post('/fav', async(req, res) => {
    const validCID = req.body.id
    node.files.get(validCID, function(err, files) {
        files.forEach((file) => {
            let objStr = file.content.toString('utf8')
            let obj = JSON.parse(objStr)
            obj.favs = obj.favs + 1

            //add updated file
            node.files.add(Buffer.from(JSON.stringify(obj)), (err, resp) => {
                if (err || !resp) {
                    res.send('ipfs update error')
                } else {
                    resp.forEach((file) => {
                        if (file && file.hash) {
                            replicate(file, res, true, validCID)
                        }
                    })
                }
            })
        })
    })
})

app.post('/tweet', async(req, res) => {
    const toStore = JSON.stringify(req.body)
    node.files.add(Buffer.from(toStore), (err, resp) => {
        if (err || !resp) {
            res.send('ipfs add error')
        } else {
            resp.forEach((file) => {
                if (file && file.hash) {
                    replicate(file, res, false, {})
                }
            })
        }
    })
})

async function replicate(file, res, tweet, validCID) {
    console.log('replicating')
    let rf = 0

    async.parallel({
        one: function(callback) {
            console.log("One")
            request.post('http://178.62.59.55:10001/replicate', {
                    json: {
                        file: file
                    }
                },
                (err, resp, body) => {
                    if (!err && resp.statusCode == 200) {
                        console.log('replicated once')
                        rf++
                        callback(null, body)
                    }
                }
            )
        },
        two: function(callback) {
            console.log("Two")
            request.post('http://178.62.59.55:10001/replicate', {
                    json: {
                        file: file
                    }
                },
                (err, resp, body) => {
                    if (!err && resp.statusCode == 200) {
                        console.log('replicated twice')
                        rf++
                        callback(null, body)
                    }
                }
            )
        }
    }, function(err, results) {
        console.log('rf: ' + rf)
        //console.log(results)
        if (tweet) {
            res.send('Favorited tweet ' + validCID)
        } else {
            res.send(file.hash)
        }
    })
}