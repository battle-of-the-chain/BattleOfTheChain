import * as  bodyParser from 'body-parser';
import * as express from 'express';

import {
    Block, generateNextBlock, generatenextBlockWithTransaction, generateRawNextBlock, getAccountBalance,
    getBlockchain, getMyUnspentTransactionOutputs, getUnspentTxOuts, sendTransaction, getLatestBlock,
    /*getUnspentTxOutsVictoryPoints, getMyUnspentTransactionOutputsVictoryPoints, sendTransactionVictoryPoints,
    getAccountBalanceVictoryPoints*/
} from './blockchain';
import {connectToPeers, getSockets, initP2PServer} from './p2p';
import {UnspentTxOut} from './transaction';
import {getTransactionPool} from './transactionPool';
//import {getTransactionPoolVictoryPoints} from './transactionPoolVictoryPoints';
import {getPublicFromWallet, initWallet} from './wallet';
import * as _ from 'lodash';

const httpPort: number = parseInt(process.env.HTTP_PORT) || 3001;
const p2pPort: number = parseInt(process.env.P2P_PORT) || 6001;

const allowedCurr: string[] = ["", "gold", "victory", "rusty needle", "soft helmet", "borger"];

const initHttpServer = (myHttpPort: number) => {
    const app = express();
    app.use(bodyParser.json());

    app.use((err, req, res, next) => {
        if (err) {
            res.status(400).send(err.message);
        }
    });

    app.get('/blocks', (req, res) => {
        res.send(JSON.stringify(getBlockchain(), null, 2));
    });

    app.get('/lastBlock', (req, res) => {
        res.send(JSON.stringify(getLatestBlock(), null, 2));
    });

    app.get('/lastBlockGame', (req, res) => {
        var newBlock=getLatestBlock();
        var bc = JSON.parse(JSON.stringify(newBlock, null, 2));
        var turndata = bc.data[0].txOuts[0].currency.split("|", 3);

        bc.data = {"player":turndata[0], "pos":"e"};
        bc.data.pos = {"x": parseInt(turndata[1]), "y": parseInt(turndata[2])};
        res.send(JSON.stringify(bc, null, 2));
    });

    app.get('/transaction/:id', (req, res) => {
        const tx = _(getBlockchain())
            .map((blocks) => blocks.data)
            .flatten()
            .find({'id': req.params.id});
        res.send(tx);
    });

    app.get('/address/:address', (req, res) => {
        const unspentTxOuts: UnspentTxOut[] =
            _.filter(getUnspentTxOuts(), (uTxO) => uTxO.address === req.params.address);
        res.send({'unspentTxOuts': unspentTxOuts});
    });

    /*
        CURRENCY
    */
    app.post('/unspentTransactionOutputs', (req, res) => {
      const curr = req.body.currency;
      if (allowedCurr.indexOf(curr) === -1) {
          res.send('currency parameter is missing or invalid');
          return;
      }
      res.send(getUnspentTxOuts().filter((uTxO: UnspentTxOut): boolean => { return(uTxO.currency===curr)}));
    });

    /*
        VICTORY
    */
    /*app.get('/unspentTransactionOutputsVictoryPoints', (req, res) => {
        res.send(getUnspentTxOutsVictoryPoints());
    });*/


    /*
        CURRENCY
    */
    app.get('/myUnspentTransactionOutputs', (req, res) => {
        res.send(getMyUnspentTransactionOutputs());
    });

    /*
        VICTORY
    */
    /*app.get('/myUnspentTransactionOutputsVictory', (req, res) => {
        res.send(getMyUnspentTransactionOutputsVictoryPoints());
    });*/

    app.post('/mineRawBlock', (req, res) => {
        if (req.body.data == null) {
            res.send('data parameter is missing');
            return;
        }
        /*if (req.body.dataVictory == null) {
            res.send('dataVictory parameter is missing');
            return;
        }*/
        const newBlock: Block = generateRawNextBlock(req.body.data/*, req.body.dataVictory*/);
        if (newBlock === null) {
            res.status(400).send('could not generate block');
        } else {
            res.send(JSON.stringify(newBlock, null, 2));
        }
    });

    app.post('/mineBlock', (req, res) => {
      const curr = req.body.currency;
        if (allowedCurr.indexOf(curr) === -1) {
            res.send('currency parameter is missing or invalid');
            return;
        }
        const newBlock: Block = generateNextBlock(curr);
        if (newBlock === null) {
            res.status(400).send('could not generate block');
        } else {
            res.send(JSON.stringify(newBlock, null, 2)); //JSON.stringify(obj, null, 2);  res.send(newBlock);
        }
    });

    app.post('/mineBlockGame', (req, res) => {
      if(!req.body.player){
        res.send('player parameter is missing or invalid (valid names are "black" and "white")');
      }else if(!req.body.pos){
        res.send('position parameter is missing');
      }else if(!req.body.pos.x){
        res.send('x position parameter is missing\n'+JSON.stringify(req.body, null, 2));
      }else if(!req.body.pos.y){
        res.send('y position parameter is missing');
      }
      const curr = ""+req.body.player+"|"+req.body.pos.x+"|"+req.body.pos.y;
      const newBlock: Block = generateNextBlock(curr);
      var bc = JSON.parse(JSON.stringify(newBlock, null, 2));
      if (newBlock === null) {
          res.status(400).send('could not generate block');
      } else {
        var turndata = bc.data[0].txOuts[0].currency.split("|", 3);
        bc.data = {"player":turndata[0], "pos":"e"};
        bc.data.pos = {"x": parseInt(turndata[1]), "y": parseInt(turndata[2])};


        res.send(JSON.stringify(bc, null, 2)); //JSON.stringify(obj, null, 2);  res.send(newBlock);
      }
    });

    /*
      CURRENCY
    */
    app.post('/balance', (req, res) => {
      const curr = req.body.currency;
      if (allowedCurr.indexOf(curr) === -1) {
          res.send('currency parameter is missing or invalid');
          return;
      }
      //const curr = req.body.currency;
        const balance: number = getAccountBalance(curr);
        res.send({'balance': balance});
    });

    app.get('/balanceAll', (req, res) => {
        var balance: any = {};

        for (let curr of allowedCurr) {
            if(!(curr==="")){
              balance[curr]=getAccountBalance(curr);
            }
        }
        //res.send({'balance': balance});
        res.send(balance);
    });

    /*
      VICTORY
    */
    /*app.get('/balanceVictoryPoints', (req, res) => {
        const balance: number = getAccountBalanceVictoryPoints();
        res.send({'balance': balance});
    });*/

    app.get('/address', (req, res) => {
        const address: string = getPublicFromWallet();
        res.send({'address': address});
    });

    app.post('/mineTransaction', (req, res) => {
        const address = req.body.address;
        const amount = req.body.amount;
        try {
            const resp = generatenextBlockWithTransaction(address, amount);
            res.send(resp);
        } catch (e) {
            console.log(e.message);
            res.status(400).send(e.message);
        }
    });

    /*
      CURRENCY
    */
    app.post('/sendTransaction', (req, res) => {
        try {
            const address = req.body.address;
            const amount = req.body.amount;
            const curr = req.body.currency;

            if (address === undefined || amount === undefined || allowedCurr.indexOf(curr) === -1) {
                throw Error('invalid currency, address or amount');
            }
            const resp = sendTransaction(address, amount, curr);
            res.send(resp);
        } catch (e) {
            console.log(e.message);
            res.status(400).send(e.message);
        }
    });

    /*
      VICTORY
    */
    /*app.post('/sendTransactionVictoryPoints', (req, res) => {
        try {
            const address = req.body.address;
            const amount = req.body.amount;

            if (address === undefined || amount === undefined) {
                throw Error('invalid address or amount');
            }
            const resp = sendTransactionVictoryPoints(address, amount);
            res.send(resp);
        } catch (e) {
            console.log(e.message);
            res.status(400).send(e.message);
        }
    });*/

    /*
        CURRENCY
    */
    app.get('/transactionPool', (req, res) => {
        res.send(getTransactionPool());
    });

    /*
        VICTORY
    */
    /*app.get('/transactionPoolVictoryPoints', (req, res) => {
        res.send(getTransactionPoolVictoryPoints());
    });*/

    app.get('/peers', (req, res) => {
        res.send(getSockets().map((s: any) => s._socket.remoteAddress + ':' + s._socket.remotePort));
    });
    app.post('/addPeer', (req, res) => {
        connectToPeers(req.body.peer);
        res.send();
    });

    app.post('/stop', (req, res) => {
        res.send({'msg' : 'stopping server'});
        process.exit();
    });

    app.listen(myHttpPort, () => {
        console.log('Listening http on port: ' + myHttpPort);
    });
};

initHttpServer(httpPort);
initP2PServer(p2pPort);
initWallet();
