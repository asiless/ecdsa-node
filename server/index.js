const secp = require("ethereum-cryptography/secp256k1")
const {toHex, utf8ToBytes} = require("ethereum-cryptography/utils")
const {keccak256} = require("ethereum-cryptography/keccak")

const express = require("express");
const app = express();
const cors = require("cors");
const port = 3042;

app.use(cors());
app.use(express.json());

const balances = {
  "0ff1e24d2fd6951bbfab201e51f7f7922c87aac3": 100,
  "1fcebb21995ce0f98a4c61799bc67e856b18d3ee": 50,
  "6ce3ef05559cb3518beb5dc8ed820825e6cc7cdf": 75,
};

app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  const balance = balances[address] || 0;
  res.send({ balance });
});

app.post("/send", (req, res) => {
  //TODO: GET THE SIGNATURE and recover the sender!!
  console.log(req.body)
  const { signature, recoveryBit, recipient, amount } = req.body;

  const bytes = utf8ToBytes('transfer');
  const hash = keccak256(bytes); 
  const publicKey = secp.recoverPublicKey(hash, signature, recoveryBit);
  const sender =  toHex(keccak256(publicKey.slice(1)).slice(12));

  console.log(`<new transaction>\nfrom:\t${sender}\nto:\t${recipient}\namount:\t${amount}`);

  setInitialBalance(sender);
  setInitialBalance(recipient);

  if (balances[sender] < amount) {
    res.status(400).send({ message: "Not enough funds!" });
  } else {
    balances[sender] -= amount;
    balances[recipient] += amount;
    res.send({ balance: balances[sender] });
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});

function setInitialBalance(address) {
  if (!balances[address]) {
    balances[address] = 0;
  }
}
