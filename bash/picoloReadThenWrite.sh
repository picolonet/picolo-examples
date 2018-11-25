numIters=$1
host=localhost
port=32980

# simulate getting table info delay
# dht lookup is O(log n) for a network of size n. Avg hop latency of 500ms and a network size of 50 is assumed for this test
#sleep 3

# read data
res=`cockroach sql --insecure --host=$host --port=$port --execute="SELECT value FROM ipfs_users LIMIT $numIters"`
echo $res

# sequential write, not batching for a fair comparison with ipfs
i=0
for val in $res
do
	echo $val
	if [ "$val" != "value" ]; then
		i++
		id=`echo $val | python -m json.tool | grep "id"`
		fn=`echo $val | python -m json.tool | grep "firsName"`
		ln=`echo $val | python -m json.tool | grep "lastName"`
		newval={"id":"id_$i","firsName":"first_$i","lastName":"last_$i", "fullName": "$fn-$ln"}
		id="id_$i"
	    fp="INSERT INTO ipfs_users VALUES ('"
	    sp="', '"
	    tp="') "
	    fourth="WHERE 'id' = $id;"
	    echo $fp$id$sp$newval$tp$fourth | cockroach sql --insecure --host=$host --port=$port
	    echo "updated user with id $id"
	fi
done