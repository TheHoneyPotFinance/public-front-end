import { ethers } from "ethers";
import Web3 from "web3";
import BigNumber from "bignumber.js";

BigNumber.config({
  EXPONENTIAL_AT: 1000,
  DECIMAL_PLACES: 80,
});

const GAS_LIMIT = {
  STAKING: {
    DEFAULT: 400000,
    SNX: 850000,
  },
};

const knownSnapshots = {

};

export const getPoolStartTime = async (poolContract) => {
  return await poolContract.methods.starttime().call();
};

export const stake = async (
  poolContract,
  provider,
  poolId,
  amount,
  account,
  onTxHash
) => {
  let now = new Date().getTime() / 1000;
  // const gas = GAS_LIMIT.STAKING[tokenName.toUpperCase()] || GAS_LIMIT.STAKING.DEFAULT;
  const gas = GAS_LIMIT.STAKING.DEFAULT;
  if (now >= 1597172400) {
    return poolContract.methods
      .stake(
        String(new BigNumber(amount).times(new BigNumber(10).pow(18))),
        String(new BigNumber(poolId))
      )
      .send({ from: account, gas: 400000 }, async (error, txHash) => {
        if (error) {
          onTxHash && onTxHash("");
          console.log("Staking error", error);
          return false;
        }
        onTxHash && onTxHash(txHash);
        const status = await waitTransaction(provider, txHash);
        if (!status) {
          console.log("Staking transaction failed.");
          return false;
        }
        return true;
      });
  } else {
    alert("pool not active");
  }
};

export const unstake = async (
  poolContract,
  provider,
  poolId,
  amount,
  account,
  onTxHash
) => {
  let now = new Date().getTime() / 1000;
  if (now >= 1597172400) {
    return poolContract.methods
      .withdraw(
        String(new BigNumber(amount).times(new BigNumber(10).pow(18))),
        String(new BigNumber(poolId))
      )
      .send({ from: account, gas: 600000 }, async (error, txHash) => {
        if (error) {
          onTxHash && onTxHash("");
          console.log("Unstaking error", error);
          return false;
        }
        onTxHash && onTxHash(txHash);
        const status = await waitTransaction(provider, txHash);
        if (!status) {
          console.log("Unstaking transaction failed.");
          return false;
        }
        return true;
      });
  } else {
    alert("pool not active");
  }
};

export const harvest = async (poolContract, provider, account, onTxHash) => {
  return poolContract.methods
    .getReward()
    .send({ from: account, gas: 800000 }, async (error, txHash) => {
      if (error) {
        onTxHash && onTxHash("");
        console.log("Claim error", error);
        return false;
      }
      onTxHash && onTxHash(txHash);
      const status = await waitTransaction(provider, txHash);
      if (!status) {
        console.log("Claim transaction failed.");
        return false;
      }
      return true;
    });
};

export const harvestNfts = async (
  poolContract,
  provider,
  account,
  nftids,
  onTxHash
) => {
  console.log("getRewards nftids", nftids);
  return poolContract.methods
    .getReward(nftids)
    .send({ from: account, gas: 800000 }, async (error, txHash) => {
      if (error) {
        onTxHash && onTxHash("");
        console.log("Claim error", error);
        return false;
      }
      onTxHash && onTxHash(txHash);
      const status = await waitTransaction(provider, txHash);
      if (!status) {
        console.log("Claim transaction failed.");
        return false;
      }
      return true;
    });
};

export const redeem = async (
  poolContract,
  provider,
  poolId,
  account,
  onTxHash
) => {
  let now = new Date().getTime() / 1000;
  if (now >= 15971724) {
    return poolContract.methods
      .exit(String(new BigNumber(poolId)))
      .send({ from: account, gas: 400000 }, async (error, txHash) => {
        if (error) {
          onTxHash && onTxHash("");
          console.log("Redeem error", error);
          return false;
        }
        onTxHash && onTxHash(txHash);
        const status = await waitTransaction(provider, txHash);
        if (!status) {
          console.log("Redeem transaction failed.");
          return false;
        }
        return true;
      });
  } else {
    alert("pool not active");
  }
};

export const singleExit = async (
  poolContract,
  provider,
  amount,
  account,
  onTxHash
) => {
  return poolContract.methods
    .exit(String(new BigNumber(amount).times(new BigNumber(10).pow(18))))
    .send({ from: account, gas: 400000 }, async (error, txHash) => {
      if (error) {
        onTxHash && onTxHash("");
        console.log("Redeem error", error);
        return false;
      }
      onTxHash && onTxHash(txHash);
      const status = await waitTransaction(provider, txHash);
      if (!status) {
        console.log("Redeem transaction failed.");
        return false;
      }
      return true;
    });
};

export const approve = async (tokenContract, poolContract, account) => {
  return tokenContract.methods
    .approve(poolContract.options.address, String(ethers.constants.MaxUint256))
    .send({ from: account, gas: 80000 });
};

export const getPoolContracts = async (yam) => {
  const pools = Object.keys(yam.contracts)
    .filter((c) => c.indexOf("_pool") !== -1)
    .reduce((acc, cur) => {
      const newAcc = { ...acc };
      newAcc[cur] = yam.contracts[cur];
      return newAcc;
    }, {});
  return pools;
};

export const getSingleStakeBalances = async (pool, account) => {
  let stakes = [];
  try {
    stakes = await pool.methods.getStakes(account).call();
  } catch (e) {
    console.error("can not get user stakes", e);
  }
  return stakes;
};

export const getExitableAmount = async (pool, account) => {
  let amount = new BigNumber(0);
  try {
    amount = await pool.methods.exitableAmount(account).call();
  } catch (e) {
    console.error("can not get exitable amount", e);
  }
  return amount;
};

export const getSingleStakingEndTime = async (yam, pool) => {
  const endTime = await pool.methods.endTime().call();
  return yam.toBigN(endTime || 0);
};

export const honeySingleRedeem = async (
  poolContract,
  provider,
  amount,
  account,
  onTxHash
) => {
  return poolContract.methods
    .exit(String(amount))
    .send({ from: account, gas: 400000 }, async (error, txHash) => {
      if (error) {
        onTxHash && onTxHash("");
        console.log("Redeem error", error);
        return false;
      }
      onTxHash && onTxHash(txHash);
      const status = await waitTransaction(provider, txHash);
      if (!status) {
        console.log("Redeem transaction failed.");
        return false;
      }
      return true;
    });
};

export const honeySingleHarvest = async (
  poolContract,
  provider,
  account,
  onTxHash
) => {
  return poolContract.methods
    .redeem()
    .send({ from: account, gas: 400000 }, async (error, txHash) => {
      if (error) {
        onTxHash && onTxHash("");
        console.log("Redeem error", error);
        return false;
      }
      onTxHash && onTxHash(txHash);
      const status = await waitTransaction(provider, txHash);
      if (!status) {
        console.log("Redeem transaction failed.");
        return false;
      }
      return true;
    });
};

export const honeySingleStake = async (
  poolContract,
  provider,
  duration,
  amount,
  account,
  onTxHash
) => {
  return poolContract.methods
    .stake(
      String(new BigNumber(amount).times(new BigNumber(10).pow(18))),
      duration
    )
    .send({ from: account, gas: 400000 }, async (error, txHash) => {
      if (error) {
        onTxHash && onTxHash("");
        console.log("Staking error", error);
        return false;
      }
      onTxHash && onTxHash(txHash);
      const status = await waitTransaction(provider, txHash);
      if (!status) {
        console.log("Staking transaction failed.");
        return false;
      }
      return true;
    });
};

export const generateNft = async (
  poolContract,
  provider,
  poolId,
  amount,
  name,
  account,
  onTxHash
) => {
  console.log(
    "create NFT",
    String(poolId),
    String(new BigNumber(amount).times(new BigNumber(10).pow(18))),
    name
  );
  return poolContract.methods
    .mintBeeNFT(
      String(poolId),
      String(new BigNumber(amount).times(new BigNumber(10).pow(18))),
      name
    )
    .send({ from: account, gas: 1300000 }, async (error, txHash) => {
      if (error) {
        onTxHash && onTxHash("");
        console.log("create NFT error", error);
        return false;
      }
      onTxHash && onTxHash(txHash);
      const status = await waitTransaction(provider, txHash);
      if (!status) {
        console.log("Creating NFT transaction failed.");
        return false;
      }
      return true;
    });
};

export const addNftStake = async (
  poolContract,
  provider,
  poolId,
  nftId,
  amount,
  honeyTokens,
  account,
  onTxHash
) => {
  console.log("add stake to NFT", String(poolId), amount, honeyTokens);
  const lpAmount = String(
    new BigNumber(amount).times(new BigNumber(10).pow(18))
  );
  const honeyAmount = String(
    new BigNumber(honeyTokens).times(new BigNumber(10).pow(18))
  );
  return poolContract.methods
    .stake(String(poolId), nftId, lpAmount, honeyAmount)
    .send({ from: account, gas: 1300000 }, async (error, txHash) => {
      if (error) {
        onTxHash && onTxHash("");
        console.log("create NFT error", error);
        return false;
      }
      onTxHash && onTxHash(txHash);
      const status = await waitTransaction(provider, txHash);
      if (!status) {
        console.log("Creating NFT transaction failed.");
        return false;
      }
      return true;
    });
};

export const burnNft = async (
  poolContract,
  provider,
  nftId,
  poolId,
  account,
  onTxHash
) => {
  return poolContract.methods
    .burn(String(nftId), String(poolId))
    .send({ from: account, gas: 400000 }, async (error, txHash) => {
      if (error) {
        onTxHash && onTxHash("");
        console.log("burn NFT error", error);
        return false;
      }
      onTxHash && onTxHash(txHash);
      const status = await waitTransaction(provider, txHash);
      if (!status) {
        console.log("Destroying NFT transaction failed.");
        return false;
      }
      return true;
    });
};

export const spawnNfts = async (
  minterContract,
  provider,
  poolId,
  amount,
  honeyAmount,
  honeyBurnAmount,
  name,
  parentOne,
  parentTwo,
  account,
  onTxHash
) => {
  console.log(
    "breading NFTs",
    String(poolId),
    String(new BigNumber(amount).times(new BigNumber(10).pow(18))),
    String(new BigNumber(honeyAmount).times(new BigNumber(10).pow(18))),
    String(new BigNumber(honeyBurnAmount).times(new BigNumber(10).pow(18))),
    name
  );
  return minterContract.methods
    .spawnBeeNFT(
      String(poolId),
      String(new BigNumber(amount).times(new BigNumber(10).pow(18))),
      String(new BigNumber(honeyAmount).times(new BigNumber(10).pow(18))),
      String(new BigNumber(honeyBurnAmount).times(new BigNumber(10).pow(18))),
      name,
      String(parentOne),
      String(parentTwo)
    )
    .send({ from: account, gas: 1300000 }, async (error, txHash) => {
      if (error) {
        onTxHash && onTxHash("");
        console.log("spawning NFTs error", error);
        return false;
      }
      onTxHash && onTxHash(txHash);
      const status = await waitTransaction(provider, txHash);
      if (!status) {
        console.log("Breeding NFT transaction failed.");
        return false;
      }
      return true;
    });
};

export const getSingleEarned = async (yam, pool, account) => {
  return yam.toBigN(await pool.methods.withdrawableRewards(account).call());
};

export const getEarned = async (yam, pool, account) => {
  return yam.toBigN(await pool.methods.earned(account).call());
};

export const getNftEarned = async (yam, minter, account, nftid) => {
  return yam.toBigN(await minter.methods.earned(account, nftid).call());
};

export const getCanBreed = async (minter, nftId1, nftId2) => {
  return await minter.methods.canBreed(nftId1, nftId2).call();
};

export const getStaked = async (yam, pool, account) => {
  return yam.toBigN(await pool.methods.balanceOf(account).call());
};

export const getCurrentPrice = async (yam) => {
  // FORBROCK: get current YAM price
  return new BigNumber(
    await yam.contracts.rebaser.methods.getCurrentTWAP().call()
  );
};

export const getTargetPrice = async (yam) => {
  return yam.toBigN(1).toFixed(2);
};

export const getCirculatingSupply = async (yam) => {
  let now = await yam.web3.eth.getBlock("latest");
  let scalingFactor = yam.toBigN(
    await yam.contracts.yamV3.methods.yamsScalingFactor().call()
  );
  let starttime = yam
    .toBigN(await yam.contracts.eth_pool.methods.starttime().call())
    .toNumber();
  let timePassed = now["timestamp"] - starttime;
  if (timePassed < 0) {
    return 0;
  }
  let yamsDistributed = yam.toBigN((8 * timePassed * 250000) / 625000); //yams from first 8 pools
  let starttimePool2 = yam
    .toBigN(await yam.contracts.ycrv_pool.methods.starttime().call())
    .toNumber();
  timePassed = now["timestamp"] - starttime;
  let pool2Yams = yam.toBigN((timePassed * 1500000) / 625000); // yams from second pool. note: just accounts for first week
  let circulating = pool2Yams
    .plus(yamsDistributed)
    .times(scalingFactor)
    .dividedBy(10 ** 36)
    .toFixed(2);
  return circulating;
};

export const getLastRebaseTimestamp = async (yam) => {
  try {
    const lastTimestamp = yam
      .toBigN(
        await yam.contracts.rebaser.methods.lastRebaseTimestampSec().call()
      )
      .toNumber();
    return lastTimestamp;
  } catch (e) {
    console.log(e);
  }
};

export const delegate = async (yam, account, onTxHash) => {
  return yam.contracts.yamV3.methods
    .delegate(account)
    .send({ from: account, gas: 150000 }, async (error, txHash) => {
      if (error) {
        onTxHash && onTxHash("");
        console.log("Delegate error", error);
        return false;
      }
      onTxHash && onTxHash(txHash);
      const status = await waitTransaction(yam.web3.eth, txHash);
      if (!status) {
        console.log("Delegate transaction failed.");
        return false;
      }
      return true;
    });
};

export const didDelegate = async (yam, account) => {
  return (
    (await yam.contracts.yamV3.methods.delegates(account).call()) === account
  );
};

export const vote = async (yam, proposal, side, account, onTxHash) => {
  return yam.contracts.gov2.methods
    .castVote(proposal, side)
    .send({ from: account, gas: 130000 }, async (error, txHash) => {
      if (error) {
        onTxHash && onTxHash("");
        console.log("Vote error", error);
        return false;
      }
      onTxHash && onTxHash(txHash);
      const status = await waitTransaction(yam.web3.eth, txHash);
      if (!status) {
        console.log("Vote transaction failed.");
        return false;
      }
      return true;
    });
};

const stateMap = {
  0: "Pending",
  1: "Active",
  2: "Canceled",
  3: "Defeated",
  4: "Succeeded",
  5: "Queued",
  6: "Expired",
  7: "Executed",
};

export const getProposals = async (yam) => {
  let BASE24 = new BigNumber(10).pow(24);

  const v1Proposals = await yam.contracts.gov.getPastEvents("ProposalCreated", {
    fromBlock: 10887059,
    toBlock: 10926022,
  });
  let proposals = [];
  let v1Descriptions = [];
  for (let i = 0; i < v1Proposals.length; i++) {
    let id = v1Proposals[i]["returnValues"]["id"];
    let targets = [];
    for (let j = 0; j < v1Proposals[i]["returnValues"]["targets"].length; j++) {
      if (yam.contracts.names[v1Proposals[i]["returnValues"]["targets"][j]]) {
        targets.push(
          yam.contracts.names[v1Proposals[i]["returnValues"]["targets"][j]]
        );
      } else {
        targets.push(v1Proposals[i]["returnValues"]["targets"][j]);
      }
    }

    let sigs = [];
    for (
      let j = 0;
      j < v1Proposals[i]["returnValues"]["signatures"].length;
      j++
    ) {
      if (
        yam.contracts.names[v1Proposals[i]["returnValues"]["signatures"][j]]
      ) {
        sigs.push(
          yam.contracts.names[v1Proposals[i]["returnValues"]["signatures"][j]]
        );
      } else {
        sigs.push(v1Proposals[i]["returnValues"]["signatures"][j]);
      }
    }

    let ins = [];
    for (
      let j = 0;
      j < v1Proposals[i]["returnValues"]["calldatas"].length;
      j++
    ) {
      let abi_types = v1Proposals[i]["returnValues"]["signatures"][j]
        .split("(")[1]
        .split(")")
        .slice(0, -1)[0]
        .split(",");
      let result = yam.web3.eth.abi.decodeParameters(
        abi_types,
        v1Proposals[i]["returnValues"]["calldatas"][j]
      );
      let fr = [];
      for (let k = 0; k < result.__length__; k++) {
        fr.push(result[k.toString()]);
      }
      ins.push(fr);
    }

    let proposal = await yam.contracts.gov.methods.proposals(id).call();
    let fv = new BigNumber(proposal["forVotes"]).div(BASE24);
    let av = new BigNumber(proposal["againstVotes"]).div(BASE24);
    let more;
    if (knownSnapshots[v1Proposals[i]["transactionHash"]]) {
      more = knownSnapshots[v1Proposals[i]["transactionHash"]];
    }

    proposals.push({
      gov: "gov",
      description: v1Proposals[i]["returnValues"]["description"],
      state: stateMap[await yam.contracts.gov.methods.state(id).call()],
      targets: targets,
      signatures: sigs,
      inputs: ins,
      forVotes: fv.toNumber(),
      againstVotes: av.toNumber(),
      id: id,
      start: v1Proposals[i]["returnValues"]["startBlock"],
      end: v1Proposals[i]["returnValues"]["endBlock"],
      hash: v1Proposals[i]["transactionHash"],
      more: more,
    });
  }
  const v2Proposals = await yam.contracts.gov2.getPastEvents(
    "ProposalCreated",
    {
      fromBlock: 10926022,
      toBlock: "latest",
    }
  );
  for (let i = 0; i < v2Proposals.length; i++) {
    let id = v2Proposals[i]["returnValues"]["id"];
    let targets = [];
    for (let j = 0; j < v2Proposals[i]["returnValues"]["targets"].length; j++) {
      if (yam.contracts.names[v2Proposals[i]["returnValues"]["targets"][j]]) {
        targets.push(
          yam.contracts.names[v2Proposals[i]["returnValues"]["targets"][j]]
        );
      } else {
        targets.push(v2Proposals[i]["returnValues"]["targets"][j]);
      }
    }

    let sigs = [];
    for (
      let j = 0;
      j < v2Proposals[i]["returnValues"]["signatures"].length;
      j++
    ) {
      if (
        yam.contracts.names[v2Proposals[i]["returnValues"]["signatures"][j]]
      ) {
        sigs.push(
          yam.contracts.names[v2Proposals[i]["returnValues"]["signatures"][j]]
        );
      } else {
        sigs.push(v2Proposals[i]["returnValues"]["signatures"][j]);
      }
    }

    let ins = [];
    for (
      let j = 0;
      j < v2Proposals[i]["returnValues"]["calldatas"].length;
      j++
    ) {
      let abi_types = v2Proposals[i]["returnValues"]["signatures"][j]
        .split("(")[1]
        .split(")")
        .slice(0, -1)[0]
        .split(",");
      let result = yam.web3.eth.abi.decodeParameters(
        abi_types,
        v2Proposals[i]["returnValues"]["calldatas"][j]
      );
      let fr = [];
      for (let k = 0; k < result.__length__; k++) {
        fr.push(result[k.toString()]);
      }
      ins.push(fr);
    }

    let proposal = await yam.contracts.gov2.methods.proposals(id).call();
    let fv = new BigNumber(proposal["forVotes"]).div(BASE24);
    let av = new BigNumber(proposal["againstVotes"]).div(BASE24);

    let more;
    if (knownSnapshots[v2Proposals[i]["transactionHash"]]) {
      more = knownSnapshots[v2Proposals[i]["transactionHash"]];
    }

    proposals.push({
      gov: "gov2",
      description: v2Proposals[i]["returnValues"]["description"],
      state: stateMap[await yam.contracts.gov2.methods.state(id).call()],
      targets: targets,
      signatures: sigs,
      inputs: ins,
      forVotes: fv.toNumber(),
      againstVotes: av.toNumber(),
      id: id,
      start: v2Proposals[i]["returnValues"]["startBlock"],
      end: v2Proposals[i]["returnValues"]["endBlock"],
      hash: v2Proposals[i]["transactionHash"],
      more: more,
    });
  }
  // proposals[1].state = "Active"
  // proposals[0].state = "Active"
  return proposals;
};

export const getVotingPowers = async (yam, proposals, account) => {
  let BASE24 = new BigNumber(10).pow(24);
  let powers = [];
  for (let i = 0; i < proposals.length; i++) {
    if (proposals[i].gov == "gov") {
      let receipt = await yam.contracts.gov.methods
        .getReceipt(proposals[i].id, account)
        .call();
      let power = new BigNumber(receipt[2]).div(BASE24).toNumber();
      if (power == 0) {
        power = new BigNumber(
          await yam.contracts.yamV3.methods
            .getPriorVotes(account, proposals[i].start)
            .call()
        )
          .div(BASE24)
          .toNumber();
      }
      powers.push({
        hash: proposals[i].hash,
        power: power,
        voted: receipt[0],
        side: receipt[1],
      });
    } else {
      let receipt = await yam.contracts.gov2.methods
        .getReceipt(proposals[i].id, account)
        .call();
      let power = new BigNumber(receipt[2]).div(BASE24).toNumber();
      if (power == 0) {
        power = new BigNumber(
          await yam.contracts.yamV3.methods
            .getPriorVotes(account, proposals[i].start)
            .call()
        )
          .div(BASE24)
          .toNumber();
      }
      powers.push({
        hash: proposals[i].hash,
        power: power,
        voted: receipt[0],
        side: receipt[1],
      });
    }
  }
  return powers;
};

export const getCurrentVotingPower = async (yam, account) => {
  let BASE24 = new BigNumber(10).pow(24);
  return new BigNumber(
    await yam.contracts.yamV3.methods.getCurrentVotes(account).call()
  )
    .dividedBy(BASE24)
    .toNumber();
};

export const getVotes = async (yam) => {
  const votesRaw = new BigNumber(
    await yam.contracts.yam.methods
      .getCurrentVotes("0x683A78bA1f6b25E29fbBC9Cd1BFA29A51520De84")
      .call()
  ).dividedBy(10 ** 24);
  return votesRaw;
};

export const getScalingFactor = async (yam) => {
  return new BigNumber(
    await yam.contracts.yamV3.methods.yamsScalingFactor().call()
  );
};

export const getDelegatedBalance = async (yam, account) => {
  return new BigNumber(
    await yam.contracts.yam.methods.balanceOfUnderlying(account).call()
  ).dividedBy(10 ** 24);
};

export const migrate = async (yam, account) => {
  return yam.contracts.yamV2migration.methods
    .migrate()
    .send({ from: account, gas: 320000 });
};

export const getMigrationEndTime = async (yam) => {
  return yam
    .toBigN(await yam.contracts.yamV2migration.methods.startTime().call())
    .plus(yam.toBigN(86400 * 3))
    .toNumber();
};

export const getV2Supply = async (yam) => {
  return new BigNumber(await yam.contracts.yamV2.methods.totalSupply().call());
};

export const migrationStarted = async (yam) => {
  let now = new Date().getTime() / 1000; // get current time
  let startTime = await yam.contracts.migrator.methods.startTime().call();
  let token_initialized = await yam.contracts.migrator.methods
    .token_initialized()
    .call();
  let delegatorRewardsSet = await yam.contracts.migrator.methods
    .delegatorRewardsSet()
    .call();
  if (now >= startTime && token_initialized && delegatorRewardsSet) {
    return true;
  }
  return false;
};

const yamToFragment = async (yam, amount) => {
  let BASE24 = new BigNumber(10).pow(24);
  let scalingFactor = new BigNumber(
    await yam.contracts.yamV3.methods.yamsScalingFactor().call()
  );

  return amount.multipliedBy(scalingFactor).dividedBy(BASE24);
};

export const currVested = async (yam, account) => {
  let BASE = new BigNumber(10).pow(18);

  let vested = new BigNumber(
    await yam.contracts.migrator.methods.vested(account).call()
  );
  let amt = await yamToFragment(yam, vested);
  return amt.dividedBy(BASE);
};

export const currUnclaimedDelegatorRewards = async (yam, account) => {
  let BASE = new BigNumber(10).pow(18);
  /*
  let start = new BigNumber(1600444800);
  let duration = new BigNumber(90 * 86400);
  let now = new BigNumber(new Date().getTime() / 1000);
  let percDone = now.minus(start).dividedBy(duration);
  if (percDone.gt(1)) {
    percDone = new BigNumber(1)
  }
  */
  //let totalVesting = new BigNumber(await yam.contracts.migrator.methods.delegator_vesting(account).call());
  //let claimed = new BigNumber(await yam.contracts.migrator.methods.delegator_claimed(account).call());
  //let unclaimed = ((totalVesting.multipliedBy(percDone)).minus(claimed));
  let unclaimed = new BigNumber(
    await yam.contracts.strneth_pool.methods.earned(account).call()
  );
  let amt = await yamToFragment(yam, unclaimed);
  return amt.dividedBy(BASE);
};

export const currUnclaimedMigratorVesting = async (yam, account) => {
  let BASE = new BigNumber(10).pow(18);
  let BASE24 = new BigNumber(10).pow(24);

  let start = new BigNumber(1600444800);
  let duration = new BigNumber(30 * 86400);
  let now = new BigNumber(new Date().getTime() / 1000);
  let percDone = now.minus(start).dividedBy(duration);
  if (percDone.gt(1)) {
    percDone = new BigNumber(1);
  }
  let totalVesting = new BigNumber(
    await yam.contracts.migrator.methods.vesting(account).call()
  );
  let claimed = new BigNumber(
    await yam.contracts.migrator.methods.claimed(account).call()
  );
  let unclaimed = totalVesting.multipliedBy(percDone).minus(claimed);
  let amt = await yamToFragment(yam, unclaimed);
  return amt.dividedBy(BASE);
};

export const delegatorRewards = async (yam, account) => {
  let BASE = new BigNumber(10).pow(18);
  let BASE24 = new BigNumber(10).pow(24);

  let rewards = new BigNumber(
    await yam.contracts.migrator.methods.delegator_vesting(account).call()
  );
  let amt = await yamToFragment(yam, rewards);
  return amt.dividedBy(BASE);
};

export const migrateV3 = async (yam, account, onTxHash) => {
  return await yam.contracts.migrator.methods
    .migrate()
    .send({ from: account, gas: 200000 }, async (error, txHash) => {
      if (error) {
        onTxHash && onTxHash("");
        console.log("Migration error", error);
        return false;
      }
      onTxHash && onTxHash(txHash);
      const status = await waitTransaction(yam.web3.eth, txHash);
      if (!status) {
        console.log("Migration transaction failed.");
        return false;
      }
      return true;
    });
};

export const claimVested = async (yam, account, onTxHash) => {
  return await yam.contracts.migrator.methods
    .claimVested()
    .send({ from: account, gas: 140000 });
};

const sleep = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export const waitTransaction = async (provider, txHash) => {
  const web3 = new Web3(provider);
  let txReceipt = null;
  while (txReceipt === null) {
    const r = await web3.eth.getTransactionReceipt(txHash);
    txReceipt = r;
    await sleep(2000);
  }
  return txReceipt.status;
};
