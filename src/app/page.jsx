"use client";
import Image from "next/image";
// 1. import `NextUIProvider` component
import { NextUIProvider } from "@nextui-org/react";
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import {
  getCurrentLottoId,
  getDrawJackpot,
  getDrawTimer,
  getBalance,
  fundContract,
} from "./components/interfaces";

export default function Home() {
  const [drawId, getLottoId] = useState([]);
  const [jackpotBal, getJackpot] = useState([]);
  const [ticketSold, getTicketSold] = useState([]);
  const [currentBalance, getLottoBalance] = useState([]);

  useEffect(() => {
    getLottoStatus();
    functionTimerCountDown();
    fetchBalance();
  }, []);

  useEffect(() => {
    const balanceTimer = setInterval(() => {
      fetchBalance();
    }, 30000);
    return () => clearInterval(balanceTimer);
  }, []);

  // Get SC Balance
  async function fetchBalance() {
    let balance = await getBalance();
    let balanceformat = Number(ethers.utils.formatEther(balance.data));
    getLottoBalance(balanceformat);
  }

  // Button function to add fund to SC
  async function getFund() {
    const result = await fundContract();
    document.getElementById("result").innerHTML = result;
  }

  // TIMER COUNTER
  async function functionTimerCountDown() {
    const response = await getDrawTimer();
    let timeleft = response.document.time;
    const downloadTimer = setInterval(function () {
      if (timeleft <= 0) {
        clearInterval(downloadTimer);
        console.log("completed");
      } else {
        let hour = Math.floor((timeleft / (1000 * 60 * 60)) % 24);
        document.documentElement.style.setProperty("--hour-value", hour);

        let minute = Math.floor((timeleft / 1000 / 60) % 60);
        document.documentElement.style.setProperty("--minute-value", minute);

        let second = Math.floor((timeleft / 1000) % 60);
        document.documentElement.style.setProperty("--second-value", second);
      }
      timeleft -= 1000;
      if (timeleft < 1000) {
        window.location.reload();
      }
    }, 1000);
  }

  async function getLottoStatus() {
    const lottoid = await getCurrentLottoId();
    getLottoId(lottoid.data);
    const result = await getDrawJackpot();
    let jackpotraw = result.data[4]; // get the total jackpot in hex
    let jackpotint = ethers.utils.formatEther(jackpotraw); //convert hex to int decimal
    let jackpot = jackpotint.split(".")[0]; // remove the trailing 0=> 1000.0
    // console.log(jackpot);
    getJackpot(jackpot);

    // get the ticket number data
    const firstTicket = result.data[3];
    const lastTicket = result.data[5];
    // turn from hex to int
    let firstTickNum = Number(ethers.utils.formatEther(firstTicket));
    let lastTickNum = Number(ethers.utils.formatEther(lastTicket));
    let totalTickets = (lastTickNum - firstTickNum).toString();
    let ticketformat = totalTickets.split(".")[0];
    getTicketSold(ticketformat);
  }

  return (
    <div className="flex mx-auto flex-col justify-center text-center text-[#FBE3D7]">
      <p className="text-7xl  p-5">GACHOR Teti Lottery</p>
      <div class="mx-auto p-3 border border-gray-200 rounded-lg shadow w-3/4">
        <p className="text-3xl p-5">Admin Panel</p>
        <p className="text-2xl p-5 ">Contract Balance</p>
        <p className="text-2xl p-5">{currentBalance}</p>
        <button
          onClick={() => getFund()}
          className="mb-4 inline-flex bg-[#FBE3D7] border-0 py-2 px-20 focus:outline-none hover:bg-[#ad826d] rounded text-lg text-[#38232c]"
        >
          Isi Saldo
        </button>
        <div id="result"></div>
      </div>
      <div className="flex mt-5 gap-5 justify-items-center p-10">
        <div class="mx-auto p-3 border border-gray-200 rounded-lg shadow w-3/4">
          <p>Current Draw</p>
          <p>{drawId}</p>
        </div>
        <div class="mx-auto p-3 border border-gray-200 rounded-lg shadow w-3/4">
          <p>Ticket Sold</p>
          <p>{ticketSold}</p>
        </div>
        <div class="mx-auto p-3 border border-gray-200 rounded-lg shadow w-3/4">
          <p>Current Jackpot</p>
          <p>{jackpotBal}</p>
        </div>
      </div>
      <div>
        <p className="p-2">Ending in</p>
        <div className="justify-items-center">
          <div className="grid grid-flow-col gap-5 text-center auto-cols-max place-content-center">
            <div className="flex flex-col p-2 bg-[#FBE3D7] rounded-box text-neutral-content">
              <span className="countdown font-mono text-5xl text-[#38232c]">
                <span style={{ "--value": "var(--hour-value)" }}></span>
              </span>
              <p className="text-[#38232c]">hours</p>
            </div>
            <div className="flex flex-col p-2 bg-[#FBE3D7] rounded-box text-neutral-content">
              <span className="countdown font-mono text-5xl text-[#38232c]">
                <span style={{ "--value": "var(--minute-value)" }}></span>
              </span>
              <p className="text-[#38232c]">min</p>
            </div>
            <div className="flex flex-col p-2 bg-[#FBE3D7] rounded-box text-neutral-content">
              <span className="countdown font-mono text-5xl text-[#38232c]">
                <span style={{ "--value": "var(--second-value)" }}></span>
              </span>
              <p className="text-[#38232c]">sec</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
