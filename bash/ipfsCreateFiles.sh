#!/bin/sh

numIters=$1

for ((i = 1; i <= numIters; i++)); do
    user={"id":"id_$i","firsName":"first_$i","lastName":"last_$i"}
    file=id_$i
    echo $user > files/$file
    echo "created file $file"
done