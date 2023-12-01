"use client";
import Image from "next/image";
// 1. import `NextUIProvider` component
import { NextUIProvider } from "@nextui-org/react";
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import {
  getDrawTimer,
  getLottoJackpot,
  getWinningNumbers,
  getCurrentLottoId,
  getWinnerNumbers,
  sortArray,
} from "./components/interfaces";

import { buyTicket, claimPrize } from "./components/web3function";

// counting button click on selecting number. Min 4 number
let digitCount = 0;

export default function Home() {
  // display draw list. allowing user claim untill last 6 draw
  const [drawNum, viewDrawNum] = useState([]);
  const [win1, showNumber1] = useState([]);
  const [win2, showNumber2] = useState([]);
  const [win3, showNumber3] = useState([]);
  const [win4, showNumber4] = useState([]);
  // numbers that user select
  // const [tckNum, getTckNumb] = useState([]);

  const [tckNum, getTckNumb] = useState({
    satu: "",
    dua: "",
    tiga: "",
    empat: "",
  });

  // display current jacckpot prizepool
  const [totalpot, getJackpot] = useState([]);
  // get draw id, to get info
  const [lotto, getLotto] = useState([]);

  useEffect(() => {
    functionTimerCountDown();
    getLottoData();
    getDrawNumbers();
    getAllWinningNumbers();
  }, []);

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

  // Handle number form value
  const handleChange = (event) => {
    getTckNumb({
      ...tckNum,
      [event.target.name]: event.target.value,
    });
  };

  const buyTickets = async () => {
    event.preventDefault();
    let numberArray = [];
    let stringArray = [];
    for (const key in tckNum) {
      if (tckNum.hasOwnProperty(key)) {
        numberArray.push(parseInt(tckNum[key]));
      }
    }

    const numbers = await sortArray(numberArray);

    for (let i = 0; i < numbers.length; i++) {
      stringArray.push(numbers[i].toString());
    }

    const tx = await buyTicket(stringArray);

    if (tx) {
      alert("Transaction success");
      setTimeout(() => {
        window.location.reload();
      }, 4000);
    }
  };

  const getAllWinningNumbers = async () => {
    const currentId = await getCurrentLottoId();
    const lastDrawId = (currentId.data - 1).toString();
    const firstDrawId = lastDrawId - 6;
    const dataArray = [];
    for (let i = 1; i < 6; i++) {
      let idValue = firstDrawId + i;
      const data = await getWinnerNumbers(idValue);
      dataArray.push(data);
    }
    const reverseArray = dataArray.reverse();
    console.log(reverseArray);
    viewDrawNum(reverseArray);
  };

  const getLottoData = async () => {
    const lottoid = await getCurrentLottoId();
    getLotto(lottoid.data);
    const result = await getLottoJackpot();
    getJackpot(result);
  };

  const claim = async (lottoId) => {
    if (lottoId == undefined) {
      const claimresult = await claimPrize(lotto - 1);
      if (claimresult == "Not lucky") {
        alert("Sorry, No Winning Tickets Found on your Wallet");
      } else {
        alert("Congrats!! Your prize amount has been sent!");
      }
    } else {
      const claimresult = await claimPrize(lottoId);
      if (claimresult == "Not lucky") {
        alert("Sorry, No Winning Tickets Found on your Wallet");
      } else {
        alert("Congrats!! Your prize amount has been sent!");
      }
    }
  };

  async function getDrawNumbers() {
    const currentId = await getCurrentLottoId();
    const lottoid = (currentId.data - 1).toString();
    const output = await getWinningNumbers(lottoid);
    showNumber1(output.winner1);
    showNumber2(output.winner2);
    showNumber3(output.winner3);
    showNumber4(output.winner4);
  }

  return (
    <div className="flex mx-auto flex-col justify-center text-center text-[#FBE3D7]">
      <p className="text-7xl  p-5">GACHOR Teti Lottery</p>
      <p>Draw Nomer {lotto}</p>
      <p
        className="text-black text-5xl"
        style={{ textShadow: "1px 0px 6px #39ff14" }}
      >
        JACKPOT SAAT INI {totalpot} TETI Coin
      </p>

      {/* jam timer */}
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

      <div className="mx-auto mt-5 p-3 border border-gray-200 rounded-lg shadow w-3/4">
        <p className="text-3xl">Buy Number</p>
        <p className="pb-5">cost 10 TETIC</p>
        <form onSubmit={buyTickets} className="flex flex-col items-center">
          <div className="mb-6 flex flex-row space-x-4">
            <input
              type="text"
              name="satu"
              value={tckNum.satu}
              onChange={handleChange}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-lg rounded focus:ring-blue-500 focus:border-blue-500 block w-16 p-3 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              placeholder="1"
              required
            />
            <input
              type="text"
              name="dua"
              value={tckNum.dua}
              onChange={handleChange}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-lg rounded focus:ring-blue-500 focus:border-blue-500 block w-16 p-3 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              placeholder="1"
              required
            />
            <input
              type="text"
              name="tiga"
              value={tckNum.tiga}
              onChange={handleChange}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-lg rounded focus:ring-blue-500 focus:border-blue-500 block w-16 p-3 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              placeholder="1"
              required
            />
            <input
              type="text"
              name="empat"
              value={tckNum.empat}
              onChange={handleChange}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-lg rounded focus:ring-blue-500 focus:border-blue-500 block w-16 p-3 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              placeholder="1"
              required
            />
          </div>
          <button
            type="submit"
            className="mt-1 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
          >
            Submit
          </button>
        </form>
      </div>

      {/* current draw result */}
      <div className="mx-auto mt-5 p-3 border border-gray-200 rounded-lg shadow w-3/4">
        <p className="mb-3">Draw {lotto - 1} Results</p>
        <div className="justify-items-center">
          <div className="grid grid-flow-col gap-5 text-center auto-cols-max place-content-center">
            <div className="flex flex-col p-2 bg-[#FBE3D7] rounded-box text-neutral-content">
              <span className="countdown font-mono text-5xl text-[#38232c]">
                <span style={{ "--value": win1 }}></span>
              </span>
            </div>
            <div className="flex flex-col p-2 bg-[#FBE3D7] rounded-box text-neutral-content">
              <span className="countdown font-mono text-5xl text-[#38232c]">
                <span style={{ "--value": win2 }}></span>
              </span>
            </div>
            <div className="flex flex-col p-2 bg-[#FBE3D7] rounded-box text-neutral-content">
              <span className="countdown font-mono text-5xl text-[#38232c]">
                <span style={{ "--value": win3 }}></span>
              </span>
            </div>
            <div className="flex flex-col p-2 bg-[#FBE3D7] rounded-box text-neutral-content">
              <span className="countdown font-mono text-5xl text-[#38232c]">
                <span style={{ "--value": win4 }}></span>
              </span>
            </div>
          </div>
        </div>
        <button
          onClick={() => claim()}
          className="mt-3 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
        >
          claim
        </button>
      </div>

      <p className="mt-7">Previous Draw Lucky Number</p>
      {drawNum.map((draw, index) => (
        <div className="">
          <div className="mx-auto mt-5 p-3 border border-gray-200 rounded-lg shadow w-3/4">
            <p className="mb-3">Draw # {draw.lottoid}</p>
            <div className="justify-items-center">
              <div className="grid grid-flow-col gap-5 text-center auto-cols-max place-content-center">
                <div className="flex flex-col p-2 bg-[#FBE3D7] rounded-box text-neutral-content">
                  <span className="countdown font-mono text-5xl text-[#38232c]">
                    <span style={{ "--value": draw.winningNum[0] }}></span>
                  </span>
                </div>
                <div className="flex flex-col p-2 bg-[#FBE3D7] rounded-box text-neutral-content">
                  <span className="countdown font-mono text-5xl text-[#38232c]">
                    <span style={{ "--value": draw.winningNum[1] }}></span>
                  </span>
                </div>
                <div className="flex flex-col p-2 bg-[#FBE3D7] rounded-box text-neutral-content">
                  <span className="countdown font-mono text-5xl text-[#38232c]">
                    <span style={{ "--value": draw.winningNum[2] }}></span>
                  </span>
                </div>
                <div className="flex flex-col p-2 bg-[#FBE3D7] rounded-box text-neutral-content">
                  <span className="countdown font-mono text-5xl text-[#38232c]">
                    <span style={{ "--value": draw.winningNum[3] }}></span>
                  </span>
                </div>
              </div>
            </div>
            <button
              value={draw.lottoid}
              onClick={(e) => claim(e.target.value)}
              className="mt-3 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
            >
              claim
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
