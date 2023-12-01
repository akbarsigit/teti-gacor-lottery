// allow connectivity with metamask
import Web3Modal from "web3modal";
import { ethers } from "ethers";
import LOTTOABI from "./lottoabi.json";
import TOKENABI from "./erc20abi.json";
import { lotterycontract, erc20contract } from "./config";
import { formatOutput, getCurrentLottoId, getlotteryInfo } from "./interfaces";

export async function ethConnect() {
  const web3Modal = new Web3Modal();
  //   metamask provider
  const connection = await web3Modal.connect();
  const provider = new ethers.providers.Web3Provider(connection);
  //   save the approve
  const signer = provider.getSigner();
  const lottoctr = new ethers.Contract(lotterycontract, LOTTOABI, signer);
  const tokenctr = new ethers.Contract(erc20contract, TOKENABI, signer);
  return { lottoctr, tokenctr };
}

export async function buyTicket(ticketArray) {
  const output = await ethConnect();
  // get token and lottery
  const lottoContract = output.lottoctr;
  const erc20Contract = output.tokenctr;
  // get the ticket price
  const price = await lottoContract.ticketPrice();
  //   approve first to transfer in token
  //   user approve the token transfer => buy ticket
  const tx1 = await erc20Contract.approve(lotterycontract, price);
  //   hold the process till get the response
  const receipt1 = await tx1.wait();
  if (receipt1) {
    // but ticket with the chosen user number
    const tx2 = await lottoContract.buyTickets(ticketArray);
    // wait till finish
    const receipt2 = await tx2.wait();
    if (receipt2) {
      const currentId = await getCurrentLottoId();
      const result = await getlotteryInfo(currentId.data);
      const hexLastTicket = result[5];
      const LastTicketStr = await formatOutput(hexLastTicket);
      console.log("Tx Completed, Ticket Number: " + LastTicketStr);
      return "Tx Completed, Ticket Number: " + LastTicketStr;
    } else {
      return "Tx Canceled";
    }
  } else {
    return "Tx Canceled";
  }
}

export async function claimPrize(lottoId) {
  const output = await ethConnect();
  const lottoContract = output.lottoctr;
  //   call the claim prize on draw id
  const tx = await lottoContract.claimPrize(lottoId).catch((error) => {
    return "Not Payable";
  });
  if (tx != "Not Payable") {
    return "Paid";
  } else {
    return "Not lucky";
  }
}
