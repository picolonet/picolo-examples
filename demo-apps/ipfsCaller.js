const request = require('request')

let args = process.argv.slice(2)

let tweets = []

for (let i = 0; i < args[0]; i++) {
    tweet()
}

function tweet() {
    let rand = Math.random()
    request.post('http://localhost:3001/tweet', {
            json: {
                text: 'this is a tweet' + rand,
                favs: 0
            }
        },
        (err, resp, body) => {
            if (!err && resp.statusCode == 200) {
                console.log('Added tweet ' + resp.body)
                fav(resp.body)
            }
        }
    )
}

function fav(tweetId) {
    request.post('http://localhost:3001/fav', {
            json: {
                id: tweetId,
            }
        },
        (err, resp, body) => {
            if (!err && resp.statusCode == 200) {
                console.log('Favorited tweet ' + tweetId)
            }
        }
    )
}