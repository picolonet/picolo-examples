const pg = require('pg')
const request = require('request')

// Create an app
request.post('https://picolo.app/create', { json: { name: 'testApp' } },
    (err, res, body) => {
        console.log(err, body)
    }
)

// Connect to app
let connectionString = ''
request.get('https://picolo.app/testApp',
    (err, res, body) => {
        console.log(err, body)
        if (!err && res.statusCode == 200) {
            connectionString = body
        }
    }
)

const pool = new pg.Pool({
    connectionString: connectionString,
})

// Create a table
pool.query('CREATE TABLE IF NOT EXISTS t3 (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), name STRING)', (err, res) => {
    console.log(err, res)
})

// Insert some data
pool.query("INSERT INTO t3 (name) VALUES ('picolo')", (err, res) => {
    console.log(err, res)
})

// Query it
pool.query('SELECT name FROM t3', (err, res) => {
    console.log(err, res)
    res.rows.forEach(function(row) {
        console.log(row)
    })
})

pool.end()