##### Vse komande
```
So v cmds.txt
```

#### More new

```
curl http://localhost:3001/lastBlock

curl -H "Content-type:application/json" --data '{"player": "white", "pos":{"x":2, "y": 3}}' http://localhost:3001/mineBlockGame

```




#### New
```
curl -H "Content-type: application/json" --data '{"address": "04d9cd3271b4e988696360b05dd77606e1ee8b89f4b2907682255cf139cf015e45f44afc26d2319eb61d9289ada3824414802b5fbd737dc04b1f03d2119f5c6ee1", "amount" : 35, "currency": "CURRENCY NAME HERE"}' http://localhost:3001/sendTransaction

curl -H "Content-type:application/json" --data '{"currency" : "INSERT CURRENCY NAME HERE"}' http://localhost:3001/mineBlock
curl -H "Content-type:application/json" --data '{"currency" : "INSERT CURRENCY NAME HERE"}' http://localhost:3001/balance
curl http://localhost:3001/balanceAll

curl -H "Content-type:application/json" --data '{"currency" : "INSERT CURRENCY NAME HERE"}' http://localhost:3001/unspentTransactionOutputs
curl http://localhost:3001/balanceAll
```
