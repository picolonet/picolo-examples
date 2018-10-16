const pg = require('pg')
const request = require('request')
const async = require('async')

let pool = new pg.Pool()

function createApp(next) {
    request.post('https://picolo.app/create', { json: { name: 'testApp' } },
        (err, res, body) => {
            console.log(err, body)
            next()
        }
    )
}

function connectToApp(next) {
    request.get('https://picolo.app/testApp',
        (err, res, body) => {
            console.log(err, body)
            if (!err && res.statusCode == 200) {
                pool = new pg.Pool({
                    connectionString: body,
                })
            }
            next()
        }
    )
}

function runQueries(next) {
    pool.connect(function(err, client, done) {

        var finish = function() {
            done()
            next()
        }

        if (err) {
            console.error('could not connect to picolo', err)
            finish()
        }
        async.waterfall([
                function(next) {
                    // Create a table
                    client.query('CREATE TABLE IF NOT EXISTS test_table (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), name STRING)', next)
                },
                function(results, next) {
                    // Insert some data
                    client.query("INSERT INTO test_table (name) VALUES ('testApp')", next)
                },
                function(results, next) {
                    // Query it
                    client.query('SELECT name FROM test_table', next)
                },
            ],
            function(err, results) {
                if (err) {
                    console.error('Error inserting into and selecting from test_table: ', err)
                    finish()
                }

                results.rows.forEach(function(row) {
                    console.log(row)
                })

                finish()
            })
    })
}

async.waterfall([createApp, connectToApp, runQueries], function(error, success) {
    console.log(error, success)
})