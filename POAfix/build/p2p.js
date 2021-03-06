"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const WebSocket = require("ws");
const blockchain_1 = require("./blockchain");
const transactionPool_1 = require("./transactionPool");
const transactionPoolVictoryPoints_1 = require("./transactionPoolVictoryPoints");
const main_1 = require("./main");
//GLOBALS
const sockets = [];
var potential_chain;
var consentNum = 0;
var masterSocket;
const setMasterSocket = () => {
    var socket = 'ws://localhost:' + main_1.getMaster();
    console.log("Ayy: " + socket);
    masterSocket = new WebSocket(socket);
};
exports.setMasterSocket = setMasterSocket;
//_______
var MessageType;
(function (MessageType) {
    MessageType[MessageType["QUERY_LATEST"] = 0] = "QUERY_LATEST";
    MessageType[MessageType["QUERY_ALL"] = 1] = "QUERY_ALL";
    MessageType[MessageType["RESPONSE_BLOCKCHAIN"] = 2] = "RESPONSE_BLOCKCHAIN";
    MessageType[MessageType["QUERY_TRANSACTION_POOL"] = 3] = "QUERY_TRANSACTION_POOL";
    MessageType[MessageType["RESPONSE_TRANSACTION_POOL"] = 4] = "RESPONSE_TRANSACTION_POOL";
    MessageType[MessageType["QUERY_TRANSACTION_POOL_VICTORY_POINTS"] = 5] = "QUERY_TRANSACTION_POOL_VICTORY_POINTS";
    MessageType[MessageType["RESPONSE_TRANSACTION_POOL_VICTORY_POINTS"] = 6] = "RESPONSE_TRANSACTION_POOL_VICTORY_POINTS";
    MessageType[MessageType["AUTO_ADD_TO_CENTRAL"] = 7] = "AUTO_ADD_TO_CENTRAL";
    MessageType[MessageType["GET_CONSENT"] = 8] = "GET_CONSENT";
    MessageType[MessageType["RESPOND_CONSENT"] = 9] = "RESPOND_CONSENT";
    MessageType[MessageType["FORCE_CHAIN"] = 10] = "FORCE_CHAIN";
})(MessageType || (MessageType = {}));
class Message {
}
const initP2PServer = (p2pPort) => {
    const server = new WebSocket.Server({ port: p2pPort });
    server.on('connection', (ws) => {
        initConnection(ws);
    });
    console.log('listening websocket p2p port on: ' + p2pPort);
    console.log('Master? ' + main_1.isMaster());
    console.log('Master: ' + main_1.getMaster());
};
exports.initP2PServer = initP2PServer;
const getSockets = () => sockets;
exports.getSockets = getSockets;
const initConnection = (ws) => {
    sockets.push(ws);
    initMessageHandler(ws);
    initErrorHandler(ws);
    write(ws, queryChainLengthMsg());
    write(ws, forceChain());
    // query transactions pool only some time after chain query
    setTimeout(() => {
        broadcast(queryTransactionPoolMsg());
    }, 500);
};
const JSONToObject = (data) => {
    try {
        return JSON.parse(data);
    }
    catch (e) {
        console.log(e);
        return null;
    }
};
const initMessageHandler = (ws) => {
    ws.on('message', (data) => {
        try {
            const message = JSONToObject(data);
            if (message === null) {
                console.log('could not parse received JSON message: ' + data);
                return;
            }
            //console.log('Received message: %s', JSON.stringify(message, null, 2));
            JSON.stringify(message, null, 2);
            console.log('Received message: %s', message.type);
            switch (message.type) {
                case MessageType.QUERY_LATEST:
                    write(ws, responseLatestMsg());
                    break;
                case MessageType.QUERY_ALL:
                    write(ws, responseChainMsg());
                    break;
                case MessageType.RESPONSE_BLOCKCHAIN:
                    const receivedBlocks = JSONToObject(message.data);
                    if (receivedBlocks === null) {
                        console.log('invalid blocks received: %s', JSON.stringify(message.data, null, 2));
                        break;
                    }
                    handleBlockchainResponse2(receivedBlocks);
                    break;
                case MessageType.QUERY_TRANSACTION_POOL:
                    write(ws, responseTransactionPoolMsg());
                    break;
                case MessageType.QUERY_TRANSACTION_POOL_VICTORY_POINTS:
                    write(ws, responseTransactionPoolVictoryPointsMsg());
                    break;
                case MessageType.GET_CONSENT:
                    if (main_1.isAuthorized() == true) {
                        const receivedBlocks = JSONToObject(message.data);
                        const latestBlockReceived = receivedBlocks[receivedBlocks.length - 1];
                        const latestBlockHeld = blockchain_1.getLatestBlock();
                        if (latestBlockReceived.index > latestBlockHeld.index) {
                            if (latestBlockHeld.hash === latestBlockReceived.previousHash) {
                                //BROADCAST true
                                break;
                            }
                        }
                        //BROADCAST FALSE
                    }
                case MessageType.FORCE_CHAIN:
                    blockchain_1.replaceChainWithoutDifficulty(JSONToObject(message.data)); //na kak drugacen nacin parameter v oklepaju? TODO
                    break;
                case MessageType.RESPOND_CONSENT:
                    if (main_1.isMaster()) {
                        if (message.data == true) { //TODOMAIN v json obliki je 'true' zaj pa nisem cist 100% kak to ven dobit
                            consentNum++;
                            if (consentNum == 2) { //TODO better mechanism?
                                if (potential_chain != null) {
                                    blockchain_1.replaceChainWithoutDifficulty(potential_chain);
                                    consentNum = 0;
                                    broadcastChainChange();
                                    console.log('CHAIN CHANGED BY AUTHORITY!');
                                }
                            }
                        }
                    }
                    break;
                case MessageType.RESPONSE_TRANSACTION_POOL:
                    const receivedTransactions = JSONToObject(message.data);
                    if (receivedTransactions === null) {
                        console.log('invalid transaction received: %s', JSON.stringify(message.data, null, 2));
                        break;
                    }
                    receivedTransactions.forEach((transaction) => {
                        try {
                            blockchain_1.handleReceivedTransaction(transaction);
                            // if no error is thrown, transaction was indeed added to the pool
                            // let's broadcast transaction pool
                            broadCastTransactionPool();
                        }
                        catch (e) {
                            console.log(e.message);
                        }
                    });
                    break;
                case MessageType.RESPONSE_TRANSACTION_POOL_VICTORY_POINTS:
                    const receivedTransactionsVictoryPoints = JSONToObject(message.data);
                    if (receivedTransactionsVictoryPoints === null) {
                        console.log('invalid transaction received: %s', JSON.stringify(message.data, null, 2));
                        break;
                    }
                    receivedTransactionsVictoryPoints.forEach((transaction) => {
                        try {
                            blockchain_1.handleReceivedTransactionVictoryPoints(transaction);
                            // if no error is thrown, transaction was indeed added to the pool
                            // let's broadcast transaction pool
                            broadCastTransactionPoolVictoryPoints();
                        }
                        catch (e) {
                            console.log(e.message);
                        }
                    });
                    break;
            }
        }
        catch (e) {
            console.log(e);
        }
    });
};
const write = (ws, message) => ws.send(JSON.stringify(message));
const broadcast = (message) => sockets.forEach((socket) => write(socket, message));
const sendToMain = (message) => write(masterSocket, message);
const queryChainLengthMsg = () => ({ 'type': MessageType.QUERY_LATEST, 'data': null });
const queryAllMsg = () => ({ 'type': MessageType.QUERY_ALL, 'data': null });
const getConsentMsg = (blockchain) => ({
    'type': MessageType.GET_CONSENT,
    'data': blockchain
});
const respondConsent = () => ({
    'type': MessageType.RESPOND_CONSENT,
    'data': true
});
const forceChain = () => ({
    'type': MessageType.FORCE_CHAIN,
    'data': JSON.stringify(blockchain_1.getBlockchain())
});
const responseChainMsg = () => ({
    'type': MessageType.RESPONSE_BLOCKCHAIN, 'data': JSON.stringify(blockchain_1.getBlockchain())
});
const responseLatestMsg = () => ({
    'type': MessageType.RESPONSE_BLOCKCHAIN,
    'data': JSON.stringify(blockchain_1.getBlockchain())
});
const queryTransactionPoolMsg = () => ({
    'type': MessageType.QUERY_TRANSACTION_POOL,
    'data': null
});
const queryTransactionPoolVictoryPointsMsg = () => ({
    'type': MessageType.QUERY_TRANSACTION_POOL_VICTORY_POINTS,
    'data': null
});
const responseTransactionPoolMsg = () => ({
    'type': MessageType.RESPONSE_TRANSACTION_POOL,
    'data': JSON.stringify(transactionPool_1.getTransactionPool())
});
const responseTransactionPoolVictoryPointsMsg = () => ({
    'type': MessageType.RESPONSE_TRANSACTION_POOL_VICTORY_POINTS,
    'data': JSON.stringify(transactionPoolVictoryPoints_1.getTransactionPoolVictoryPoints())
});
// const addtoCentralPeer = (): Message => ({
//     'type': MessageType.AUTO_ADD_TO_CENTRAL,
//     'data': httpPort
// });
const initErrorHandler = (ws) => {
    const closeConnection = (myWs) => {
        console.log('connection failed to peer: ' + myWs.url);
        sockets.splice(sockets.indexOf(myWs), 1);
    };
    ws.on('close', () => closeConnection(ws));
    ws.on('error', () => closeConnection(ws));
};
const handleBlockchainResponse2 = (receivedBlocks) => {
    console.log("INSIDE HANDLER");
    if (receivedBlocks.length === 0) {
        console.log('received block chain size of 0');
        return;
    }
    console.log("INSIDE HANDLER2");
    const latestBlockReceived = receivedBlocks[receivedBlocks.length - 1];
    if (!blockchain_1.isValidBlockStructure(latestBlockReceived)) {
        console.log('block structuture not valid');
        return;
    }
    console.log("INSIDE HANDLER3");
    if (main_1.isMaster()) {
        console.log("INSIDE HANDLER4");
        potential_chain = receivedBlocks;
    }
    const latestBlockHeld = blockchain_1.getLatestBlock();
    if (latestBlockReceived.index > latestBlockHeld.index) {
        console.log("ALL IS GOOD WE HERE FAM");
        if (main_1.isAuthorized()) {
            console.log('Received blockchain is longer than current blockchain');
            //broadcastConsentReply(true);
            console.log("sending 2 main");
            sendToMain(respondConsent()); //tud sam sebi poslje da forca vsem change (v handlerju se to zgodi zato si poslje)
        }
    }
};
const broadcastLatest = () => {
    broadcast(responseLatestMsg());
};
exports.broadcastLatest = broadcastLatest;
const broadcastChainChange = () => {
    broadcast(forceChain());
};
const broadcastConsentQuery = (blockchain) => {
    broadcast(getConsentMsg(blockchain));
};
// const broadcastConsentReply = (rep): void => {
//     broadcast(respondConsent(rep));
// };
const connectToPeers = (newPeer) => {
    const ws = new WebSocket(newPeer);
    ws.on('open', () => {
        initConnection(ws);
    });
    ws.on('error', () => {
        console.log('connection failed');
    });
};
exports.connectToPeers = connectToPeers;
const broadCastTransactionPool = () => {
    broadcast(responseTransactionPoolMsg());
};
exports.broadCastTransactionPool = broadCastTransactionPool;
const broadCastTransactionPoolVictoryPoints = () => {
    broadcast(responseTransactionPoolVictoryPointsMsg());
};
exports.broadCastTransactionPoolVictoryPoints = broadCastTransactionPoolVictoryPoints;
//# sourceMappingURL=p2p.js.map