var Web3 = require('web3');
var fs = require('fs');
var solc = require('solc');

/*
* connect to ethereum node
*/ 
var ethereumUri = 'http://localhost:8545';

var web3 = new Web3(new Web3.providers.HttpProvider(ethereumUri));

console.log('connected to ehterum node at ' + ethereumUri);
var coinbase = web3.eth.coinbase;
console.log('coinbase:' + coinbase);
var balance = web3.eth.getBalance(coinbase);
console.log('balance:' + web3.fromWei(balance, 'ether') + " ETH");
var accounts = web3.eth.accounts;
console.log(accounts);

if (web3.personal.unlockAccount(web3.eth.accounts[0],'123456')) {
     console.log(web3.eth.accounts[0] + 'is unlocked');
}else {
     console.log(web3.eth.accounts[0] + 'unlock failed');
}

web3.eth.defaultAccount = web3.eth.accounts[0];

/*
* Compile Contract and Fetch ABI, bytecode
*/ 
var source = fs.readFileSync("./contracts/token.sol", 'utf8');

console.log('compiling contract...');
var compiledContract = solc.compile(source);
console.log('done');

for (var contractName in compiledContract.contracts) {
    // code and ABI that are needed by web3 
    // console.log(contractName + ': ' + compiledContract.contracts[contractName].bytecode);
    // console.log(contractName + '; ' + JSON.parse(compiledContract.contracts[contractName].interface));
    var bytecode = compiledContract.contracts[contractName].bytecode;
    console.log(bytecode);
    var abi = JSON.parse(compiledContract.contracts[contractName].interface);
}

console.log(JSON.stringify(abi, undefined, 2));

/*
* deploy contract
*/ 
var gasEstimate = web3.eth.estimateGas({data: '0x' + bytecode});
console.log('gasEstimate = ' + gasEstimate);
var MyContract = web3.eth.contract(abi);
console.log('deploying contract...');
var myContractReturned = MyContract.new( {
    from: web3.eth.accounts[0],
    data: '0x'+ bytecode,
    gas: gasEstimate + 50000
}, function (err, myContract) {
    if (!err) {
        // NOTE: The callback will fire twice!
        // Once the contract has the transactionHash property set and once its deployed on an address.

        // e.g. check tx hash on the first call (transaction send)
        if (!myContract.address) {
            console.log(`myContract.transactionHash = ${myContract.transactionHash}`); // The hash of the transaction, which deploys the contract

        // check address on the second call (contract deployed)
        } else {
            console.log(`myContract.address = ${myContract.address}`); // the contract address
            global.contractAddress = myContract.address;
        }

        // Note that the returned "myContractReturned" === "myContract",
        // so the returned "myContractReturned" object will also get the address set.
    } else {
        console.log(err);
    }
});


(function wait () {
    setTimeout(wait, 1000);
})();

