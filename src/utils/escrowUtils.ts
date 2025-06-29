import EscrowABI from '../contracts/abis/Escrow.json';


console.log(EscrowABI.abi.find((e)=>e.name==="createEscrow"))