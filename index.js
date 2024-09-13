import { ethers } from "./ethers-6.7.0.esm.min.js";
import { abi, contractAddress } from "./constants.js";

const connectButton = document.getElementById("connectButton");
const fundButton = document.getElementById("fundButton");
const balanceButton = document.getElementById("balanceButton");
const ethInput = document.getElementById("ethAmount");
const withdrawButton = document.getElementById("withdrawButton");
connectButton.onclick = connect;
fundButton.onclick = fund;
balanceButton.onclick = getBalance;
withdrawButton.onclick = withdraw;

async function connect() {
  if (typeof window.ethereum !== "undefined") {
    // to ensure that metamask exists in browser
    await window.ethereum.request({ method: "eth_requestAccounts" });
    console.log("Wallet connected");
    connectButton.innerHTML = "Connected";
  } else {
    console.log("No metamask found!");
  }
}

async function getBalance() {
  if (typeof window.ethereum !== "undefined") {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const balance = await provider.getBalance(contractAddress);
    console.log("Balance: " + ethers.formatEther(balance));
  }
}

async function withdraw() {
  console.log("Withdrawing...");
  if (typeof window.ethereum !== "undefined") {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(contractAddress, abi, signer);
    try {
      const transactionResponse = await contract.withdraw();
      await listenForTransactionMine(transactionResponse, provider);
      console.log("Done");
    } catch (err) {
      console.log(err);
    }
  }
}

async function fund() {
  const ethAmount = ethInput.value.toString();
  console.log("Funding with " + ethAmount);
  if (typeof window.ethereum !== "undefined") {
    //we need
    //provider / connection to the wallet
    //signer / wallet / someone with gas
    //Also
    //Contract we are interacting with
    // ^ to get that, we need ABI & Address of contract
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    // ^ this will return whichever wallet(account address) is connected from the provider. // provider -> metamask.
    console.log(signer);
    // to get the contract
    const contract = new ethers.Contract(contractAddress, abi, signer);

    //sending transaction
    try {
      const transactionResponse = await contract.fund({
        value: ethers.parseEther(ethAmount),
      });

      //Wait here until transaction is mined
      await listenForTransactionMine(transactionResponse, provider);
      console.log("done");
    } catch (err) {
      console.log(err);
    }
  }
}

function listenForTransactionMine(transactionResponse, provider) {
  console.log(`Mining ${transactionResponse.hash}`);
  // All the transaction response have a hash
  //Listen for this transaction to finish
  return new Promise((resolve, reject) => {
    provider.once(transactionResponse.hash, async (transactionReceipt) => {
      const blocks = await transactionReceipt.confirmations();
      console.log(`Completed with ${blocks} confirmations`);
      resolve();
    });
  });
}
