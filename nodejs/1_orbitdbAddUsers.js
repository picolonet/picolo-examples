const IPFS = require('ipfs')
const OrbitDB = require('orbit-db')

// OrbitDB uses Pubsub which is an experimental feature
// and need to be turned on manually.
// Note that these options need to be passed to IPFS in
// all examples in this document even if not specified so.

const args = process.argv.slice(2)

const numIters = args[0]
    // Create IPFS instance
const ipfs = new IPFS({
    repo: './ipfs0',
    EXPERIMENTAL: {
        pubsub: true
    }
})
const access = {
    // Give write access to everyone
    write: ['*'],
}

ipfs.on('ready', async() => {
    // Create OrbitDB instance
    const orbitdb = new OrbitDB(ipfs)
    const kv1 = await orbitdb.keyvalue('kv1', access)
    console.log(kv1.address.toString())

    let counter = 0;

    let looper = setInterval(async function() {
        counter++;
        await kv1.put('key' + counter, 'value' + counter)
        console.log(kv1.get('key' + counter))
        if (counter >= numIters) {
            clearInterval(looper);
        }
    }, 1000);
})