import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import 'dotenv/config'

const config: HardhatUserConfig = {
  solidity: "0.8.28",
  networks:{
    sepolia:{
      url:process.env.SEPOLIA_RPC_URL,
      accounts:[`0x${process.env.PRIVATE_KEY}`]
    },
    ganache:{
      url:"http://127.0.0.1:7545"
    }
  }
};

export default config;
