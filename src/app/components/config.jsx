import { ethers } from "ethers";
import Web3Modal from "web3modal";

export async function ethConnect() {
  const web3Modal = new Web3Modal();
  // connect to browser wallet
  const connection = await web3Modal.connect();
  // safe browser as provider
  const provider = new ethers.providers.Web3Provider(connection);
  // signer/wallet
  const signer = provider.getSigner();

  // token address
  const erc20 = "0x93508dDbd06d8ceAe77BAF63F9F0B3E719CDB941";
  // SC adress
  const lottery = "0x28F32C4e0B1B947939a6b5FDC9db00c83A6fC113";
  return { signer, erc20, lottery };
}
