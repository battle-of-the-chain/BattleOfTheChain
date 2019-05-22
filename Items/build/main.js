"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bodyParser = require("body-parser");
const express = require("express");
const blockchain_1 = require("./blockchain");
const p2p_1 = require("./p2p");
const transactionPool_1 = require("./transactionPool");
//import {getTransactionPoolVictoryPoints} from './transactionPoolVictoryPoints';
const wallet_1 = require("./wallet");
const _ = require("lodash");
const httpPort = parseInt(process.env.HTTP_PORT) || 3001;
const p2pPort = parseInt(process.env.P2P_PORT) || 6001;
const allowedCurr = ["", "gold", "victory", "rusty needle", "soft helmet", "borger"];
const initHttpServer = (myHttpPort) => {
    const app = express();
    app.use(bodyParser.json());
    app.use((err, req, res, next) => {
        if (err) {
            res.status(400).send(err.message);
        }
    });
    app.get('/blocks', (req, res) => {
        res.send(JSON.stringify(blockchain_1.getBlockchain(), null, 2));
    });
    app.get('/transaction/:id', (req, res) => {
        const tx = _(blockchain_1.getBlockchain())
            .map((blocks) => blocks.data)
            .flatten()
            .find({ 'id': req.params.id });
        res.send(tx);
    });
    app.get('/address/:address', (req, res) => {
        const unspentTxOuts = _.filter(blockchain_1.getUnspentTxOuts(), (uTxO) => uTxO.address === req.params.address);
        res.send({ 'unspentTxOuts': unspentTxOuts });
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
        res.send(blockchain_1.getUnspentTxOuts().filter((uTxO) => { return (uTxO.currency === curr); }));
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
        res.send(blockchain_1.getMyUnspentTransactionOutputs());
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
        const newBlock = blockchain_1.generateRawNextBlock(req.body.data /*, req.body.dataVictory*/);
        if (newBlock === null) {
            res.status(400).send('could not generate block');
        }
        else {
            res.send(JSON.stringify(newBlock, null, 2));
        }
    });
    app.post('/mineBlock', (req, res) => {
        const curr = req.body.currency;
        if (allowedCurr.indexOf(curr) === -1) {
            res.send('currency parameter is missing or invalid');
            return;
        }
        const newBlock = blockchain_1.generateNextBlock(curr);
        if (newBlock === null) {
            res.status(400).send('could not generate block');
        }
        else {
            res.send(JSON.stringify(newBlock, null, 2)); //JSON.stringify(obj, null, 2);  res.send(newBlock);
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
        const balance = blockchain_1.getAccountBalance(curr);
        res.send({ 'balance': balance });
    });
    app.get('/balanceAll', (req, res) => {
        var balance = {};
        for (let curr of allowedCurr) {
            if (!(curr === "")) {
                balance[curr] = blockchain_1.getAccountBalance(curr);
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
        const address = wallet_1.getPublicFromWallet();
        res.send({ 'address': address });
    });
    app.post('/mineTransaction', (req, res) => {
        const address = req.body.address;
        const amount = req.body.amount;
        try {
            const resp = blockchain_1.generatenextBlockWithTransaction(address, amount);
            res.send(resp);
        }
        catch (e) {
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
            const resp = blockchain_1.sendTransaction(address, amount, curr);
            res.send(resp);
        }
        catch (e) {
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
        res.send(transactionPool_1.getTransactionPool());
    });
    /*
        VICTORY
    */
    /*app.get('/transactionPoolVictoryPoints', (req, res) => {
        res.send(getTransactionPoolVictoryPoints());
    });*/
    app.get('/peers', (req, res) => {
        res.send(p2p_1.getSockets().map((s) => s._socket.remoteAddress + ':' + s._socket.remotePort));
    });
    app.post('/addPeer', (req, res) => {
        p2p_1.connectToPeers(req.body.peer);
        res.send();
    });
    app.post('/stop', (req, res) => {
        res.send({ 'msg': 'stopping server' });
        process.exit();
    });
    app.listen(myHttpPort, () => {
        console.log('Listening http on port: ' + myHttpPort);
    });
};
initHttpServer(httpPort);
p2p_1.initP2PServer(p2pPort);
wallet_1.initWallet();
//# sourceMappingURL=main.js.map