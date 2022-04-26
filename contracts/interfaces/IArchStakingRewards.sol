// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

// https://github.com/Synthetixio/synthetix/blob/develop/contracts/interfaces/IStakingRewards.sol
// https://github.com/lidofinance/staking-rewards-manager/blob/main/contracts/StakingRewards.sol
interface IStakingRewards {
    // Views
    function balanceOf(address account) external view returns (uint256);

    function earned(address account) external view returns (uint256);

    function getRewardForDuration() external view returns (uint256);

    function lastTimeRewardApplicable() external view returns (uint256);

    function rewardPerToken() external view returns (uint256);

    function rewardsDistribution() external view returns (address);

    function rewardsToken() external view returns (address);

    function totalSupply() external view returns (uint256);

    // Mutative
    function exit() external;

    function getReward() external;

    function stake(uint256 amount) external;

    function withdraw(uint256 amount) external;
}
