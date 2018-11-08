const IPFS = require('ipfs')
const OrbitDB = require('orbit-db')

// OrbitDB uses Pubsub which is an experimental feature
// and need to be turned on manually.
// Note that these options need to be passed to IPFS in
// all examples in this document even if not specified so.

const access = {
    // Give write access to everyone
    write: ['*'],
}

const ipfs = new IPFS({
    EXPERIMENTAL: {
        pubsub: true
    }
})
ipfs.on('ready', async() => {
    // Create the database
    const orbitdb = new OrbitDB(ipfs)
    const kv2 = await orbitdb.keyvalue('/orbitdb/QmXoJSMMSMVLuftbxgudnuJAiAPmjXD85jFvutWEPFH6Kt/kv1')

    const result = kv2.get('key1')
    console.log(result)

    kv2.events.on('replicated', () => {
        const result = kv2.get('key1')
        console.log(result)
    })
})