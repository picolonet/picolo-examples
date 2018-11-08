#!/bin/sh

numIters=$1
host=localhost
port=32980

for ((i = 1; i <= numIters; i++)); do
    user={"id":"id_$i","firsName":"first_$i","lastName":"last_$i"}
    id="id_$i"
    fp="INSERT INTO ipfs_users VALUES ('"
    sp="', '"
    tp="');"
    echo $fp$id$sp$user$tp | cockroach sql --insecure --host=$host --port=$port
    echo "added user number $i with id $id"
done