#!/bin/sh

numIters=$1

for ((i = 1; i <= numIters; i++)); do
    file=id_$i
    hash=`ipfs-cluster-ctl add files/$file -q`
    echo "added user number $i with hash $hash"
done