import logo from "./tecLogo.png";
import "./App.css";
import React, { useContext } from "react";
import { Web3Context } from "./web3";
import { useState, useEffect } from 'react';
import { ethers } from 'ethers'

import TestToken from "./web3/abis/TestToken.sol/TestToken.json";
import TecRewardsBadge from "./web3/abis/TecRewardsBadge.sol/TecRewardsBadge.json"
import TecRewardsRegistry from "./web3/abis/TecRewardsRegistry.sol/TecRewardsRegistry.json";
import MockTreasury from "./web3/abis/MockTreasury.sol/MockTreasury.json";

const testTokenAddress = "0x00999070D90ceEd76Ca4369a88C55A8a3c1A5eEC";
const tecRewardsBadgeAddress = "0xcEc26Fa798D676E4e90E67A9267AF4E48c9faAb9";
const tecRewardsRegistryAddress = "0xc1479c9157a5f27c2181D233a8a397C13A1F21C2";
const mockTreasuryAddress = "0x3f7bA998dA9D51647b3278Be5645C8DC7fCA8Fc2"; 

function App() {
  const { account, connectWeb3, logout } = useContext(Web3Context);

  const [userBalance, setUserBalance] = useState('');
  const [registryBalance, setRegistryBalance] = useState('')
  const [treasuryBalance, setTreasuryBalance] = useState('');
  const [numOfUserOwnedBadges, setNumOfUserOwnedBadges] = useState('');
  const [claimableRewards, setClaimableRewards] = useState('');


   useEffect(() => {
    const init = async () => {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const [account] = await window.ethereum.request({ method: 'eth_requestAccounts' })
      const tokenContract = new ethers.Contract(testTokenAddress, TestToken.abi, provider);
      const badgeContract = new ethers.Contract(tecRewardsBadgeAddress, TecRewardsBadge.abi, provider);
      const registryContract = new ethers.Contract(tecRewardsRegistryAddress, TecRewardsRegistry.abi, provider);

      const userBalanceData = await tokenContract.balanceOf(account);
      const registryBalanceData = await tokenContract.balanceOf(tecRewardsRegistryAddress);
      const treasuryBalanceData = await tokenContract.balanceOf(mockTreasuryAddress);
    
      const badgesOwnedByUserData = await badgeContract.balanceOf(account);
      

      let rewardsToClaim = 0;

      if(badgesOwnedByUserData){
        for (let i = 0; i < Number(badgesOwnedByUserData); i++){
          let tokenId = await badgeContract.tokenOfOwnerByIndex(account, i);
          if(tokenId){
            let claimable = await registryContract.accumulatedRewards(tokenId);
            if(claimable){
              rewardsToClaim += Number(claimable);
            }
          }

        }
      }



      setUserBalance(userBalanceData);
      setRegistryBalance(registryBalanceData);
      setTreasuryBalance(treasuryBalanceData);
      setNumOfUserOwnedBadges(badgesOwnedByUserData);
      setClaimableRewards(rewardsToClaim);
    };
    init();
  }, []);

    // request access to the user's MetaMask account
    async function requestAccount() {
      await window.ethereum.request({ method: 'eth_requestAccounts' });
    }

      // call the smart contract, read the current greeting value
  async function fetchUserBalance() {
    if (typeof window.ethereum !== 'undefined') {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const [account] = await window.ethereum.request({ method: 'eth_requestAccounts' })
      const contract = new ethers.Contract(testTokenAddress, TestToken.abi, provider);
      try {
        const data = await contract.balanceOf(account);
        console.log('Balance: ', data.toString())
      } catch (err) {
        console.log("Error: ", err)
      }
    }    
  }

  async function fetchTreasuryBalance() {
    if (typeof window.ethereum !== 'undefined') {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = new ethers.Contract(testTokenAddress, TestToken.abi, provider);
      try {
        const data = await contract.balanceOf(mockTreasuryAddress);
        console.log('Balance: ', data.toString())
      } catch (err) {
        console.log("Error: ", err)
      }
    }    
  }

  async function fetchRegistryBalance() {
    if (typeof window.ethereum !== 'undefined') {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = new ethers.Contract(testTokenAddress, TestToken.abi, provider);
      try {
        const data = await contract.balanceOf(tecRewardsRegistryAddress);
        console.log('Balance: ', data.toString())
      } catch (err) {
        console.log("Error: ", err)
      }
    }    
  }

  async function doTreasuryDistribution() {
    await requestAccount()
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(mockTreasuryAddress, MockTreasury.abi, signer);
    const transation = await contract.doDistribution();
    await transation.wait();
    console.log(`Ditribution done. New balance ${fetchTreasuryBalance}`);    
  }

  async function claimAllRewards() {
    await requestAccount()
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(tecRewardsRegistryAddress, TecRewardsRegistry.abi, signer);
    const transation = await contract.claimAllRewards();
    await transation.wait();
    console.log(`Rewards claimed. New Balance ${fetchUserBalance}`);    
  }



  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="ethereum_logo" />
        <div>
          {account == null ? (
            <button onClick={connectWeb3}>Connect Web3</button>
          ) : (
            <div>
              <div className="Box" id="token"></div>
              <div className="Box" id="treasury"><p>Treasury TEC Balance: {treasuryBalance.toString()}</p><button onClick={doTreasuryDistribution}> Do Treasury Distribution</button><br/></div>
              <div className="Box" id="registry"><p>Registry TEC Balance (undistributed rewards): {registryBalance.toString()}</p><br/></div>
              <div className="Box" id="user"><p>Your Account: {account}</p><p> Badges owned: {numOfUserOwnedBadges.toString()}</p><p>Claimable rewards: {claimableRewards}</p><button onClick={claimAllRewards}>Claim rewards for all owned badges</button><br/></div>
              <br/>
              <br/>
            

              <button onClick={logout}>Logout</button><br/>
            </div>
          )}
        </div>
        <br/>
        <br/>
        <a
          className="App-link"
          href="https://tecommons.org/"
          target="_blank"
          rel="noopener noreferrer"
        >
          <br/>
          Explore the TEC
        </a>
      </header>
    </div>
  );
}

export default App;
