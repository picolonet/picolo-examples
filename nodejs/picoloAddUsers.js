const pg = require('pg')
const request = require('request')
const async = require('async')

const args = process.argv.slice(2)

const numIters = args[0]
let host = 'localhost'
let port = 32980

if (args.length == 2) {
    host = args[1]
}

if (args.length == 3) {
    host = args[1]
    port = args[2]
}

const config = {
    user: 'root',
    host: host,
    database: 'defaultdb',
    port: port
}

const pool = new pg.Pool(config)

pool.connect(function(err, client, done) {

    const finish = function() {
        console.log('closing connection')
        done()
        process.exit()
    }

    if (err) {
        console.error('could not connect to picolo', err)
        finish()
    }

    let inserted = 0
    for (let i = 1; i <= numIters; i++) {
        let userId = 'id_' + i
        let user = {
            id: userId,
            firstName: 'first_' + i,
            lastName: 'last_' + i
        }
        const text = 'INSERT INTO ipfs_users (key, value) VALUES ($1, $2)'
        const values = [userId, JSON.stringify(user)]

        const res = client.query(text, values, (err, res) => {
            if (err) {
                console.log(err.stack)
            } else {
                console.log('added ' + ++inserted + ' users')
                if (inserted == numIters) {
                    finish()
                }
            }
        })

    }
});