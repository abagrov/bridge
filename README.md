Verified contract address: https://rinkeby.etherscan.io/address/0x6Aa9CF4fE2901C7a9bddCA381BB57382c1E027Cf
Verified contract address: https://rinkeby.etherscan.io/address/0xA3443312DeFd49C225d61c4A2A403e4b1503406e

## Deploy:
* `npx hardhat run --network bsc scripts/deploy.ts`
* `npx hardhat run --network rinkeby scripts/deploy.ts`

## Verify
* `npx hardhat verify --network bsc --contract "contracts/BadToken.sol:BadToken" 0xBd2556076b378935D7d50bEeae45A3F90FB3f2dd`
* `npx hardhat verify --network rinkeby --contract "contracts/BadToken.sol:BadToken" 0x6Aa9CF4fE2901C7a9bddCA381BB57382c1E027Cf`
* `npx hardhat verify --network bsc --contract "contracts/Bridge.sol:Bridge" 0x42d25a90Ad44ba8c6ef9401e23Fc9a812C396576`
* `npx hardhat verify --network rinkeby --contract "contracts/Bridge.sol:Bridge" 0xA3443312DeFd49C225d61c4A2A403e4b1503406e`



