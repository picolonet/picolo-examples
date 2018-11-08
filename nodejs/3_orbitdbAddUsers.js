const IPFS = require('ipfs')
const OrbitDB = require('orbit-db')

// OrbitDB uses Pubsub which is an experimental feature
// and need to be turned on manually.
// Note that these options need to be passed to IPFS in
// all examples in this document even if not specified so.

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
    await kv1.put('name', 'hello')
})

const ipfs1 = new IPFS({
    repo: './ipfs1',
    EXPERIMENTAL: {
        pubsub: true
    }
})
ipfs1.on('ready', async() => {
    // Create the database
    const orbitdb1 = new OrbitDB(ipfs1, './orbitdb1')
    const db1 = await orbitdb1.keyvalue('events')

    // Create the second peer
    const ipfs2 = new IPFS({
        repo: './ipfs2',
        EXPERIMENTAL: {
            pubsub: true
        }
    })
    ipfs2.on('ready', async() => {
        // Open the first database for the second peer,
        // ie. replicate the database
        const orbitdb2 = new OrbitDB(ipfs2, './orbitdb2')
        const db2 = await orbitdb2.keyvalue(db1.address.toString())

        // When the second database replicated new heads, query the database
        db2.events.on('replicated', () => {
            const result = db2.get('key')
            console.log(result)
        })

        // Start adding entries to the first database
        setInterval(async() => {
            await db1.put('key', 'value')
        }, 1000)
    })
})