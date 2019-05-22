"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const elliptic_1 = require("elliptic");
const fs_1 = require("fs");
const _ = require("lodash");
const transaction_1 = require("./transaction");
/*import {getPublicKeyVictoryPoints, getTransactionIdVictoryPoints, signTxInVictoryPoints, TransactionVictoryPoints,
        TxInVictoryPoints, TxOutVictoryPoints, UnspentTxOutVictoryPoints} from './transactionVictoryPoints';*/
const EC = new elliptic_1.ec('secp256k1');
const privateKeyLocation = process.env.PRIVATE_KEY || 'node/wallet/private_key';
const getPrivateFromWallet = () => {
    const buffer = fs_1.readFileSync(privateKeyLocation, 'utf8');
    return buffer.toString();
};
exports.getPrivateFromWallet = getPrivateFromWallet;
const getPublicFromWallet = () => {
    const privateKey = getPrivateFromWallet();
    const key = EC.keyFromPrivate(privateKey, 'hex');
    return key.getPublic().encode('hex');
};
exports.getPublicFromWallet = getPublicFromWallet;
const generatePrivateKey = () => {
    const keyPair = EC.genKeyPair();
    const privateKey = keyPair.getPrivate();
    return privateKey.toString(16);
};
exports.generatePrivateKey = generatePrivateKey;
const initWallet = () => {
    // let's not override existing private keys
    if (fs_1.existsSync(privateKeyLocation)) {
        console.log("You already have a private key, so none created");
        return;
    }
    const newPrivateKey = generatePrivateKey();
    fs_1.writeFileSync(privateKeyLocation, newPrivateKey);
    console.log('new wallet with private key created to : %s', privateKeyLocation);
};
exports.initWallet = initWallet;
const deleteWallet = () => {
    if (fs_1.existsSync(privateKeyLocation)) {
        fs_1.unlinkSync(privateKeyLocation);
    }
};
exports.deleteWallet = deleteWallet;
/*
      BALANCE ZA CURRENCY
*/
const getBalance = (address, unspentTxOuts, currency) => {
    console.log("Address: " + address + " Uspent txOuts" + JSON.stringify(unspentTxOuts, null, 2));
    console.log(_(findUnspentTxOuts(address, unspentTxOuts, currency))
        .map((uTxO) => uTxO.amount)
        .sum());
    return _(findUnspentTxOuts(address, unspentTxOuts, currency))
        .map((uTxO) => uTxO.amount)
        .sum();
};
exports.getBalance = getBalance;
/*
      BALANCE ZA VICTORY POINTS
*/
/*const getBalanceVictoryPoints = (address: string, unspentTxOuts: UnspentTxOutVictoryPoints[]): number => {
  console.log("Address: "+ address+ "Uspent txOuts" + JSON.stringify(unspentTxOuts,null,2));
  console.log(_(findUnspentTxOutsVictoryPoints(address, unspentTxOuts))
      .map((uTxO: UnspentTxOutVictoryPoints) => uTxO.amount)
      .sum());
    return _(findUnspentTxOutsVictoryPoints(address, unspentTxOuts))
        .map((uTxO: UnspentTxOutVictoryPoints) => uTxO.amount)
        .sum();
};*/
/*
    NEPORABLJENI IZHODI ZA CURRENCY
*/
const findUnspentTxOuts = (ownerAddress, unspentTxOuts, currency) => {
    return _.filter(unspentTxOuts, (uTxO) => (uTxO.address === ownerAddress && uTxO.currency === currency));
};
exports.findUnspentTxOuts = findUnspentTxOuts;
/*
    NEPORABLJENI IZHODI ZA VICTORY POINTS
*/
/*const findUnspentTxOutsVictoryPoints = (ownerAddress: string, unspentTxOuts: UnspentTxOutVictoryPoints[]) => {
    return _.filter(unspentTxOuts, (uTxO: UnspentTxOutVictoryPoints) => uTxO.address === ownerAddress);
};*/
/*
    CURRENCY
    LOOPA ČEZ NEPORABLJENE OUTPUTE TRANSAKCIJ, DOKLER NJIHOV SEŠTEVEK NI VEČJI ALI ENAK
    VSOTI, KI SE JO ŽELI POSLATI
*/
const findTxOutsForAmount = (amount, myUnspentTxOuts) => {
    let currentAmount = 0;
    const includedUnspentTxOuts = [];
    for (const myUnspentTxOut of myUnspentTxOuts) {
        includedUnspentTxOuts.push(myUnspentTxOut);
        //maybe
        currentAmount = currentAmount + myUnspentTxOut.amount;
        if (currentAmount >= amount) {
            const leftOverAmount = currentAmount - amount;
            return { includedUnspentTxOuts, leftOverAmount };
        }
    }
    const eMsg = 'Cannot create transaction from the available unspent transaction outputs.' +
        ' Required amount:' + amount + '. Available unspentTxOuts:' + JSON.stringify(myUnspentTxOuts);
    throw Error(eMsg);
};
/*
    VICTORY
    LOOPA ČEZ NEPORABLJENE OUTPUTE TRANSAKCIJ, DOKLER NJIHOV SEŠTEVEK NI VEČJI ALI ENAK
    VSOTI, KI SE JO ŽELI POSLATI
*/
/*const findTxOutsForAmountVictoryPoints = (amount: number, myUnspentTxOuts: UnspentTxOutVictoryPoints[]) => {
    let currentAmount = 0;
    const includedUnspentTxOuts = [];
    for (const myUnspentTxOut of myUnspentTxOuts) {
        includedUnspentTxOuts.push(myUnspentTxOut);
        currentAmount = currentAmount + myUnspentTxOut.amount;
        if (currentAmount >= amount) {
            const leftOverAmount = currentAmount - amount;
            return {includedUnspentTxOuts, leftOverAmount};
        }
    }

    const eMsg = 'Cannot create transaction from the available unspent transaction outputs.' +
        ' Required amount:' + amount + '. Available unspentTxOuts:' + JSON.stringify(myUnspentTxOuts);
    throw Error(eMsg);
};*/
/*
    CURRENCY
    USTVARI txOut ZA PREJEMNIKA KOVANCEV IN EN txOut ZA PREOSTANEK,
    ČE PREOSTANEK NI ENAK 0

*/
const createTxOuts = (receiverAddress, myAddress, amount, leftOverAmount, currency) => {
    const txOut1 = new transaction_1.TxOut(receiverAddress, amount, currency);
    if (leftOverAmount === 0) {
        return [txOut1];
    }
    else {
        //maybe
        const leftOverTx = new transaction_1.TxOut(myAddress, leftOverAmount, currency);
        return [txOut1, leftOverTx];
    }
};
/*
    VICTORY POINTS
    USTVARI txOut ZA PREJEMNIKA KOVANCEV IN EN txOut ZA PREOSTANEK,
    ČE PREOSTANEK NI ENAK 0

*/
/*const createTxOutsVictoryPoints = (receiverAddress: string, myAddress: string, amount, leftOverAmount: number) => {
    const txOut1: TxOutVictoryPoints = new TxOutVictoryPoints(receiverAddress, amount);
    if (leftOverAmount === 0) {
        return [txOut1];
    } else {
        const leftOverTx = new TxOutVictoryPoints(myAddress, leftOverAmount);
        return [txOut1, leftOverTx];
    }
};*/
/*
    CURRENCY
*/
const filterTxPoolTxs = (unspentTxOuts, transactionPool) => {
    const txIns = _(transactionPool)
        .map((tx) => tx.txIns)
        .flatten()
        .value();
    const removable = [];
    for (const unspentTxOut of unspentTxOuts) {
        const txIn = _.find(txIns, (aTxIn) => {
            return aTxIn.txOutIndex === unspentTxOut.txOutIndex && aTxIn.txOutId === unspentTxOut.txOutId;
        });
        if (txIn === undefined) {
        }
        else {
            removable.push(unspentTxOut);
        }
    }
    return _.without(unspentTxOuts, ...removable);
};
/*
    VICTORY
*/
/*const filterTxPoolTxsVictoryPoints = (unspentTxOuts: UnspentTxOutVictoryPoints[], transactionPool: TransactionVictoryPoints[]): UnspentTxOutVictoryPoints[] => {
    const txIns: TxInVictoryPoints[] = _(transactionPool)
        .map((tx: TransactionVictoryPoints) => tx.txIns)
        .flatten()
        .value();
    const removable: UnspentTxOutVictoryPoints[] = [];
    for (const unspentTxOut of unspentTxOuts) {
        const txIn = _.find(txIns, (aTxIn: TxInVictoryPoints) => {
            return aTxIn.txOutIndex === unspentTxOut.txOutIndex && aTxIn.txOutId === unspentTxOut.txOutId;
        });

        if (txIn === undefined) {

        } else {
            removable.push(unspentTxOut);
        }
    }

    return _.without(unspentTxOuts, ...removable);
};*/
/*
    CURRENCY
*/
const createTransaction = (receiverAddress, amount, privateKey, unspentTxOuts, txPool) => {
    console.log('txPool: %s', JSON.stringify(txPool));
    const myAddress = transaction_1.getPublicKey(privateKey);
    const myUnspentTxOutsA = unspentTxOuts.filter((uTxO) => uTxO.address === myAddress);
    //console.log("___________________\n\n"+unspentTxOuts+"___________________\n\n"+myUnspentTxOutsA+"___________________\n\n");
    const myUnspentTxOuts = filterTxPoolTxs(myUnspentTxOutsA, txPool);
    // filter from unspentOutputs such inputs that are referenced in pool
    const { includedUnspentTxOuts, leftOverAmount } = findTxOutsForAmount(amount, myUnspentTxOuts);
    const toUnsignedTxIn = (unspentTxOut) => {
        const txIn = new transaction_1.TxIn();
        txIn.txOutId = unspentTxOut.txOutId;
        txIn.txOutIndex = unspentTxOut.txOutIndex;
        txIn.txOutCurr = unspentTxOut.currency;
        return txIn;
    };
    const unsignedTxIns = includedUnspentTxOuts.map(toUnsignedTxIn);
    const tx = new transaction_1.Transaction();
    tx.txIns = unsignedTxIns;
    tx.txOuts = createTxOuts(receiverAddress, myAddress, amount, leftOverAmount, unspentTxOuts[0].currency);
    tx.id = transaction_1.getTransactionId(tx);
    tx.txIns = tx.txIns.map((txIn, index) => {
        txIn.signature = transaction_1.signTxIn(tx, index, privateKey, unspentTxOuts);
        return txIn;
    });
    return tx;
};
exports.createTransaction = createTransaction;
//# sourceMappingURL=wallet.js.map