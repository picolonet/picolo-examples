numIters=$1
host=localhost
port=32980

echo "CREATE TABLE IF NOT EXISTS ipfs_users (key string, value string);" | cockroach sql --insecure --host=$host --port=$port

# simulate getting table info delay
# dht lookup is O(log n) for a network of size n. Avg hop latency of 500ms and a network size of 50 is assumed for this test
sleep 3

for ((i = 1; i <= numIters; i++)); do
    user={"id":"id_$i","firsName":"first_$i","lastName":"last_$i"}
    id="id_$i"
    fp="INSERT INTO ipfs_users VALUES ('"
    sp="', '"
    tp="');"
    echo $fp$id$sp$user$tp | cockroach sql --insecure --host=$host --port=$port
    echo "added user number $i with id $id"
done