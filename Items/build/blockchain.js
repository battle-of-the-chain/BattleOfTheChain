"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const CryptoJS = require("crypto-js");
const _ = require("lodash");
const p2p_1 = require("./p2p");
const transaction_1 = require("./transaction");
/*import {
    getCoinbaseTransactionVictoryPoints, isValidAddressVictoryPoints, processTransactionsVictoryPoints, TransactionVictoryPoints, UnspentTxOutVictoryPoints
} from './transactionVictoryPoints';*/
const transactionPool_1 = require("./transactionPool");
//import {addToTransactionPoolVictoryPoints, getTransactionPoolVictoryPoints, updateTransactionPoolVictoryPoints} from './transactionPoolVictoryPoints';
const util_1 = require("./util");
const wallet_1 = require("./wallet");
// RAZRED ZA BLOCK V BLOCKCHAINU
class Block {
    constructor(index, hash, previousHash, timestamp, data, /*ataVictory: TransactionVictoryPoints[],*/ difficulty, nonce) {
        this.index = index;
        this.previousHash = previousHash;
        this.timestamp = timestamp;
        this.data = data;
        //this.dataVictory = dataVictory;
        this.hash = hash;
        this.difficulty = difficulty;
        this.nonce = nonce;
    }
}
exports.Block = Block;
const genesisTransaction = {
    'txIns': [{ 'signature': '', 'txOutId': '', 'txOutIndex': 0, 'txOutCurr': '' }],
    'txOuts': [{
            'address': '04bfcab8722991ae774db48f934ca79cfb7dd991229153b9f732ba5334aafcd8e7266e47076996b55a14bf9913ee3145ce0cfc1372ada8ada74bd287450313534a',
            'currency': '',
            'amount': 50
        }],
    'id': 'e655f6a5f26dc9b4cac6e46f52336428287759cf81ef5ff10854f69d68f43fa3'
};
/*const genesisTransactionVictoryPoints = {
    'txIns': [{'signature': '', 'txOutId': '', 'txOutIndex': 0}],
    'txOuts': [{
        'address': '04bfcab8722991ae774db48f934ca79cfb7dd991229153b9f732ba5334aafcd8e7266e47076996b55a14bf9913ee3145ce0cfc1372ada8ada74bd287450313534a',
        'amount': 50
    }],
    'id': 'e655f6a5f26dc9b4cac6e46f52336428287759cf81ef5ff10854f69d68f43fa3'
};*/
//USTAVARI ZAČETNI BLOCK (GENESIS)
const genesisBlock = new Block(0, '91a73664bc84c0baa1fc75ea6e4aa6d1d20c5df664c724e3159aefc2e1186627', '', 1465154705, [genesisTransaction], /*[genesisTransactionVictoryPoints],*/ 0, 0);
//USTVARI BLOCKCHAIN
let blockchain = [genesisBlock];
// the unspent txOut of genesis block is set to unspentTxOuts on startup
let unspentTxOuts = transaction_1.processTransactions(blockchain[0].data, [], 0);
const getUnspentTxOuts = () => _.cloneDeep(unspentTxOuts);
exports.getUnspentTxOuts = getUnspentTxOuts;
console.log(blockchain[0].data);
/*let unspentTxOutsVictoryPoints: UnspentTxOutVictoryPoints[] = processTransactionsVictoryPoints(blockchain[0].dataVictory,[],0);
console.log(blockchain[0].dataVictory);
const getUnspentTxOutsVictoryPoints = (): UnspentTxOutVictoryPoints[] => _.cloneDeep(unspentTxOutsVictoryPoints);*/
const getBlockchain = () => blockchain;
exports.getBlockchain = getBlockchain;
console.log("UnspentTxOuts on startup" + JSON.stringify(getUnspentTxOuts(), null, 2));
//console.log("unspentTxOutsVictoryPoints on startup" +JSON.stringify(getUnspentTxOutsVictoryPoints(),null,2));
// and txPool should be only updated at the same time
const setUnspentTxOuts = (newUnspentTxOut) => {
    console.log('replacing unspentTxouts with: %s', JSON.stringify(newUnspentTxOut, null, 2));
    unspentTxOuts = newUnspentTxOut;
};
/*const setUnspentTxOutsVictoryPoints = (newUnspentTxOut: UnspentTxOutVictoryPoints[]) => {
    console.log('replacing unspentTxouts with: %s', JSON.stringify(newUnspentTxOut,null,2));
    unspentTxOutsVictoryPoints = newUnspentTxOut;
};*/
const getLatestBlock = () => blockchain[blockchain.length - 1];
exports.getLatestBlock = getLatestBlock;
/*
        KONSTANTA KI DOLOČA NA KOLIKO ČASA SE LAHKO USTVARI NOV BLOCK:
        10 SEKUND
*/
const BLOCK_GENERATION_INTERVAL = 10;
/*
        KONSTANTA KI DOLOČA NA KOLIKO ČASA SE PRILAGODI TEŽAVNOST:
        10 BLOCKOV
*/
const DIFFICULTY_ADJUSTMENT_INTERVAL = 10;
/*
      PRIDOBI TEŽAVNOST, ČE JE POTREBNO KLIČE FUNKCIJO ZA PRILAGADOTIVE TEŽAVNOSTI
*/
const getDifficulty = (aBlockchain) => {
    const latestBlock = aBlockchain[blockchain.length - 1];
    if (latestBlock.index % DIFFICULTY_ADJUSTMENT_INTERVAL === 0 && latestBlock.index !== 0) {
        return getAdjustedDifficulty(latestBlock, aBlockchain);
    }
    else {
        return latestBlock.difficulty;
    }
};
const getAdjustedDifficulty = (latestBlock, aBlockchain) => {
    const prevAdjustmentBlock = aBlockchain[blockchain.length - DIFFICULTY_ADJUSTMENT_INTERVAL];
    const timeExpected = BLOCK_GENERATION_INTERVAL * DIFFICULTY_ADJUSTMENT_INTERVAL;
    const timeTaken = latestBlock.timestamp - prevAdjustmentBlock.timestamp;
    if (timeTaken < timeExpected / 2) {
        return prevAdjustmentBlock.difficulty + 1;
    }
    else if (timeTaken > timeExpected * 2) {
        return prevAdjustmentBlock.difficulty - 1;
    }
    else {
        return prevAdjustmentBlock.difficulty;
    }
};
const getCurrentTimestamp = () => Math.round(new Date().getTime() / 1000);
const generateRawNextBlock = (blockData /*, blockDataVictory: TransactionVictoryPoints[]*/) => {
    const previousBlock = getLatestBlock();
    const difficulty = getDifficulty(getBlockchain());
    const nextIndex = previousBlock.index + 1;
    const nextTimestamp = getCurrentTimestamp();
    const newBlock = findBlock(nextIndex, previousBlock.hash, nextTimestamp, blockData /*, blockDataVictory*/, difficulty);
    if (addBlockToChain(newBlock)) {
        p2p_1.broadcastLatest();
        return newBlock;
    }
    else {
        return null;
    }
};
exports.generateRawNextBlock = generateRawNextBlock;
// gets the unspent transaction outputs owned by the wallet
const getMyUnspentTransactionOutputs = () => {
    return wallet_1.findUnspentTxOuts(wallet_1.getPublicFromWallet(), getUnspentTxOuts(), "Eyy");
};
exports.getMyUnspentTransactionOutputs = getMyUnspentTransactionOutputs;
/*const getMyUnspentTransactionOutputsVictoryPoints = () => {
    return findUnspentTxOutsVictoryPoints(getPublicFromWallet(), getUnspentTxOutsVictoryPoints());
};*/
//USTVARI NASLEDNJI BLOCK S PREMOŽENJEM(VALUTO)
const generateNextBlock = (currency) => {
    //maybe
    console.log("Inside generateNextBlock");
    const coinbaseTx = transaction_1.getCoinbaseTransaction(wallet_1.getPublicFromWallet(), getLatestBlock().index + 1, currency);
    console.log("COINBASE TX" + JSON.stringify(coinbaseTx, null, 2));
    const blockData = [coinbaseTx].concat(transactionPool_1.getTransactionPool());
    console.log("blockData" + JSON.stringify(blockData, null, 2));
    /*const coinbaseTxVictoryPoints: TransactionVictoryPoints = getCoinbaseTransactionVictoryPoints(getPublicFromWallet(), getLatestBlock().index + 1);
    console.log("COINBASE TX VICTORY" + JSON.stringify(coinbaseTxVictoryPoints, null, 2));
    const blockDataVictoryPoints: TransactionVictoryPoints[] = [coinbaseTxVictoryPoints].concat(getTransactionPoolVictoryPoints());
    console.log("blockDataVictory" + JSON.stringify(blockDataVictoryPoints, null, 2));
    console.log("transactionPoolVictoryPoints:" + JSON.stringify(getTransactionPoolVictoryPoints(), null, 2));*/
    console.log("transactionPool:" + JSON.stringify(transactionPool_1.getTransactionPool(), null, 2));
    return generateRawNextBlock(blockData);
};
exports.generateNextBlock = generateNextBlock;
//USTVARI NASLEDNJI BLOCK S TRANSAKCIJO
//MOGOČE JE POTREBNO LOČITI NA DVE FUNKCIJI (ENA ZA VICTORY, ENA ZA CURRENCY)
//poglej tukaj delovanje, nekaj narobe
const generatenextBlockWithTransaction = (receiverAddress, amount) => {
    if (!transaction_1.isValidAddress(receiverAddress)) {
        throw Error('invalid address');
    }
    if (typeof amount !== 'number') {
        throw Error('invalid amount');
    }
    const coinbaseTx = transaction_1.getCoinbaseTransaction(wallet_1.getPublicFromWallet(), getLatestBlock().index + 1, "Ayy");
    const tx = wallet_1.createTransaction(receiverAddress, amount, wallet_1.getPrivateFromWallet(), getUnspentTxOuts(), transactionPool_1.getTransactionPool());
    const blockData = [coinbaseTx, tx];
    /*const coinbaseTxVictoryPoints: TransactionVictoryPoints = getCoinbaseTransactionVictoryPoints(getPublicFromWallet(), getLatestBlock().index + 1);
    const txVictoryPoints: TransactionVictoryPoints = createTransactionVictoryPoints(receiverAddress, amount, getPrivateFromWallet(), getUnspentTxOuts(), getTransactionPool());
    const blockDataVictoryPoints: TransactionVictoryPoints[] = [coinbaseTxVictoryPoints, tx];*/
    return generateRawNextBlock(blockData /*, blockDataVictoryPoints*/);
};
exports.generatenextBlockWithTransaction = generatenextBlockWithTransaction;
/*
        POIŠČE VELJAVEN BLOCK
        povečuje nonce, dokler ne pride do ustreznega hasha glede na difficulty
*/
const findBlock = (index, previousHash, timestamp, data /*, dataVictory: TransactionVictoryPoints[]*/, difficulty) => {
    let nonce = 0;
    while (true) {
        const hash = calculateHash(index, previousHash, timestamp, data, /* dataVictory,*/ difficulty, nonce);
        if (hashMatchesDifficulty(hash, difficulty)) {
            return new Block(index, hash, previousHash, timestamp, data, /* dataVictory,*/ difficulty, nonce);
        }
        nonce++;
    }
};
const getAccountBalance = (currency) => {
    return wallet_1.getBalance(wallet_1.getPublicFromWallet(), getUnspentTxOuts(), currency);
};
exports.getAccountBalance = getAccountBalance;
/*const getAccountBalanceVictoryPoints = (): number => {
    return getBalanceVictoryPoints(getPublicFromWallet(), getUnspentTxOutsVictoryPoints());
};*/
const sendTransaction = (address, amount, currency) => {
    var unspent = getUnspentTxOuts().filter((uTxO) => { return (uTxO.currency === currency); });
    console.log("___________________\n\n" + unspent + "___________________\n\n" + getUnspentTxOuts() + "___________________\n\n");
    const tx = wallet_1.createTransaction(address, amount, wallet_1.getPrivateFromWallet(), unspent /*getUnspentTxOuts()*/, transactionPool_1.getTransactionPool());
    unspent = getUnspentTxOuts().filter((uTxO) => { return (uTxO.currency === currency); });
    transactionPool_1.addToTransactionPool(tx, unspent /*getUnspentTxOuts()*/);
    p2p_1.broadCastTransactionPool();
    return tx;
};
exports.sendTransaction = sendTransaction;
/*const sendTransactionVictoryPoints = (address: string, amount: number): TransactionVictoryPoints => {
    const tx: TransactionVictoryPoints = createTransactionVictoryPoints(address, amount, getPrivateFromWallet(), getUnspentTxOutsVictoryPoints(), getTransactionPoolVictoryPoints());
    addToTransactionPoolVictoryPoints(tx, getUnspentTxOutsVictoryPoints());
    broadCastTransactionPoolVictoryPoints();
    return tx;
};*/
const calculateHashForBlock = (block) => calculateHash(block.index, block.previousHash, block.timestamp, block.data, /*block.dataVictory,*/ block.difficulty, block.nonce);
const calculateHash = (index, previousHash, timestamp, data, /*dataVictory: TransactionVictoryPoints[],*/ difficulty, nonce) => CryptoJS.SHA256(index + previousHash + timestamp + data /*+ dataVictory+ difficulty*/ + nonce).toString();
const isValidBlockStructure = (block) => {
    return typeof block.index === 'number'
        && typeof block.hash === 'string'
        && typeof block.previousHash === 'string'
        && typeof block.timestamp === 'number'
        && typeof block.data === 'object';
    //&& typeof block.dataVictory === 'object';
};
exports.isValidBlockStructure = isValidBlockStructure;
const isValidNewBlock = (newBlock, previousBlock) => {
    if (!isValidBlockStructure(newBlock)) {
        console.log('invalid block structure: %s', JSON.stringify(newBlock));
        return false;
    }
    if (previousBlock.index + 1 !== newBlock.index) {
        console.log('invalid index');
        return false;
    }
    else if (previousBlock.hash !== newBlock.previousHash) {
        console.log('invalid previoushash');
        return false;
    }
    else if (!isValidTimestamp(newBlock, previousBlock)) {
        console.log('invalid timestamp');
        return false;
    }
    else if (!hasValidHash(newBlock)) {
        return false;
    }
    return true;
};
/*
        IZRAČUNA SKUPNO TEŽAVNOST ZA BLOCKCHAIN
*/
const getAccumulatedDifficulty = (aBlockchain) => {
    return aBlockchain
        .map((block) => block.difficulty)
        .map((difficulty) => Math.pow(2, difficulty))
        .reduce((a, b) => a + b);
};
/*
        PREVERI ALI JE TIMESTAMP VELJAVEN
*/
const isValidTimestamp = (newBlock, previousBlock) => {
    return (previousBlock.timestamp - 60 < newBlock.timestamp)
        && newBlock.timestamp - 60 < getCurrentTimestamp();
};
const hasValidHash = (block) => {
    if (!hashMatchesBlockContent(block)) {
        console.log('invalid hash, got:' + block.hash);
        return false;
    }
    if (!hashMatchesDifficulty(block.hash, block.difficulty)) {
        console.log('block difficulty not satisfied. Expected: ' + block.difficulty + 'got: ' + block.hash);
    }
    return true;
};
const hashMatchesBlockContent = (block) => {
    const blockHash = calculateHashForBlock(block);
    return blockHash === block.hash;
};
/*
        PREVERI ALI SE HASH UJEMA GLEDA NA TEŽAVNOST
        TEŽAVNOST: število 0 na začetku
        PRIMER: dif=5 --> 00000.....
*/
const hashMatchesDifficulty = (hash, difficulty) => {
    const hashInBinary = util_1.hexToBinary(hash);
    const requiredPrefix = '0'.repeat(difficulty);
    return hashInBinary.startsWith(requiredPrefix);
};
/*
    PREVERI ALI JE PODAN BLOCKCHAIN VELJAVEN,
    ČE JA: VRNE NEPORABLJENE txOuts
 */
const isValidChain = (blockchainToValidate) => {
    console.log('isValidChain:');
    console.log(JSON.stringify(blockchainToValidate));
    const isValidGenesis = (block) => {
        return JSON.stringify(block) === JSON.stringify(genesisBlock);
    };
    if (!isValidGenesis(blockchainToValidate[0])) {
        return null;
    }
    /*
      VALIDIRA VSAK BLOCK V VERIGI. BLOCK JE VELJAVEN ČE JE VELJAVNA NJEGOVA STRUKTURA
      IN SO TRANSAKCIJE VELJAVNE
     */
    let aUnspentTxOuts = [];
    for (let i = 0; i < blockchainToValidate.length; i++) {
        const currentBlock = blockchainToValidate[i];
        if (i !== 0 && !isValidNewBlock(blockchainToValidate[i], blockchainToValidate[i - 1])) {
            return null;
        }
        aUnspentTxOuts = transaction_1.processTransactions(currentBlock.data, aUnspentTxOuts, currentBlock.index);
        if (aUnspentTxOuts === null) {
            console.log('invalid transactions in blockchain');
            return null;
        }
    }
    /*let aUnspentTxOutsVictoryPoints: UnspentTxOutVictoryPoints[] = [];

    for (let i = 0; i < blockchainToValidate.length; i++) {
        const currentBlock: Block = blockchainToValidate[i];
        if (i !== 0 && !isValidNewBlock(blockchainToValidate[i], blockchainToValidate[i - 1])) {
            return null;
        }

        aUnspentTxOutsVictoryPoints = processTransactionsVictoryPoints(currentBlock.dataVictory, aUnspentTxOutsVictoryPoints, currentBlock.index);
        console.log("aUnspentTxOutsVictoryPoints: " + JSON.stringify(aUnspentTxOutsVictoryPoints,null,2));
        if (aUnspentTxOutsVictoryPoints === null) {
            console.log('invalid transactions in blockchain');
            return null;
        }
    }*/
    let tupleUnspent = [aUnspentTxOuts /*, aUnspentTxOutsVictoryPoints*/];
    return tupleUnspent;
};
/*
          DODAJ BLOCK V VERIGO
*/
const addBlockToChain = (newBlock) => {
    if (isValidNewBlock(newBlock, getLatestBlock())) {
        const retVal = transaction_1.processTransactions(newBlock.data, getUnspentTxOuts(), newBlock.index);
        //const retValVictoryPoints: UnspentTxOut[] = processTransactionsVictoryPoints(newBlock.dataVictory, getUnspentTxOutsVictoryPoints(), newBlock.index);
        if (retVal === null /*|| retValVictoryPoints == null*/) {
            console.log('block is not valid in terms of transactions');
            return false;
        }
        else {
            blockchain.push(newBlock);
            setUnspentTxOuts(retVal);
            transactionPool_1.updateTransactionPool(unspentTxOuts);
            //setUnspentTxOutsVictoryPoints(retValVictoryPoints);
            //updateTransactionPoolVictoryPoints(unspentTxOutsVictoryPoints);
            return true;
        }
    }
    return false;
};
exports.addBlockToChain = addBlockToChain;
/*
        ZAMENJAJ VERIGO ZA TISTO Z VIŠJO SKUPNO TEŽAVNOSTJO
*/
const replaceChain = (newBlocks) => {
    const tupleUnspent = isValidChain(newBlocks);
    const aUnspentTxOuts = tupleUnspent[0];
    //const aUnspentTxOutsVictoryPoints = tupleUnspent[1];
    const validChain = aUnspentTxOuts !== null /*&& aUnspentTxOutsVictoryPoints !== null*/;
    if (validChain &&
        getAccumulatedDifficulty(newBlocks) > getAccumulatedDifficulty(getBlockchain())) {
        console.log('Received blockchain is valid. Replacing current blockchain with received blockchain');
        blockchain = newBlocks;
        setUnspentTxOuts(aUnspentTxOuts);
        transactionPool_1.updateTransactionPool(unspentTxOuts);
        //setUnspentTxOutsVictoryPoints(aUnspentTxOutsVictoryPoints);
        //updateTransactionPoolVictoryPoints(unspentTxOutsVictoryPoints);
        p2p_1.broadcastLatest();
    }
    else {
        console.log('Received blockchain invalid');
    }
};
exports.replaceChain = replaceChain;
const handleReceivedTransaction = (transaction) => {
    transactionPool_1.addToTransactionPool(transaction, getUnspentTxOuts());
};
exports.handleReceivedTransaction = handleReceivedTransaction;
//# sourceMappingURL=blockchain.js.map