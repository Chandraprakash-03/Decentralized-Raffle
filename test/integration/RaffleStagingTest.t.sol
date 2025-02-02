// // SPDX-License-Identifier: MIT

// pragma solidity ^0.8.19;

// import {DeployRaffle} from "../../script/DeployRaffle.s.sol";
// import {Raffle} from "../../src/Raffle.sol";
// import {HelperConfig} from "../../script/HelperConfig.s.sol";
// import {Test, console} from "forge-std/Test.sol";
// import {Vm} from "forge-std/Vm.sol";
// import {StdCheats} from "forge-std/StdCheats.sol";
// import {VRFCoordinatorMock} from "@chainlink/contracts/src/v0.8/vrf/mocks/VRFCoordinatorMock.sol";
// import {CreateSubscription} from "../../script/Interactions.s.sol";

// contract RaffleTest is StdCheats, Test {
//     /* Errors */
//     event RequestedRaffleWinner(uint256 indexed requestId);
//     event RaffleEnter(address indexed player);
//     event WinnerPicked(address indexed player);

//     Raffle public raffle;
//     HelperConfig public helperConfig;

//     uint256 subscriptionId;
//     bytes32 gasLane;
//     uint256 interval;
//     uint256 entranceFee;
//     uint32 callbackGasLimit;
//     address vrfCoordinator;

//     address public PLAYER = makeAddr("player");
//     uint256 public constant STARTING_USER_BALANCE = 10 ether;

//     function setUp() external {
//         DeployRaffle deployer = new DeployRaffle();
//         (raffle, helperConfig) = deployer.run();
//         vm.deal(PLAYER, STARTING_USER_BALANCE);

//         HelperConfig.NetworkConfig memory config = helperConfig.getConfig();
//         subscriptionId = config.subscriptionId;
//         gasLane = config.gasLane;
//         interval = config.interval;
//         entranceFee = config.entranceFee;
//         callbackGasLimit = config.callbackGasLimit;
//         vrfCoordinator = config.vrfCoordinator;
//     }

//     /////////////////////////
//     // fulfillRandomWords //
//     ////////////////////////

//     modifier raffleEntered() {
//         vm.prank(PLAYER);
//         raffle.enterRaffle{value: entranceFee}();
//         vm.warp(block.timestamp + interval + 1);
//         vm.roll(block.number + 1);
//         _;
//     }

//     modifier onlyOnDeployedContracts() {
//         if (block.chainid == 31337) {
//             return;
//         }
//         try vm.activeFork() returns (uint256) {
//             return;
//         } catch {
//             _;
//         }
//     }

//     function testFulfillRandomWordsCanOnlyBeCalledAfterPerformUpkeep()
//         public
//         raffleEntered
//         onlyOnDeployedContracts
//     {
//         // Arrange
//         // Act / Assert
//         vm.expectRevert("nonexistent request");
//         // vm.mockCall could be used here...
//         VRFCoordinatorMock(vrfCoordinator).fulfillRandomWords(
//             0,
//             address(raffle)
//         );

//         vm.expectRevert("nonexistent request");

//         VRFCoordinatorMock(vrfCoordinator).fulfillRandomWords(
//             1,
//             address(raffle)
//         );
//     }

//     function testFulfillRandomWordsPicksAWinnerResetsAndSendsMoney()
//         public
//         raffleEntered
//         onlyOnDeployedContracts
//     {
//         address expectedWinner = address(1);

//         // Arrange
//         uint256 additionalEntrances = 3;
//         uint256 startingIndex = 1; // We have starting index be 1 so we can start with address(1) and not address(0)

//         for (
//             uint256 i = startingIndex;
//             i < startingIndex + additionalEntrances;
//             i++
//         ) {
//             address player = address(uint160(i));
//             hoax(player, 1 ether); // deal 1 eth to the player
//             raffle.enterRaffle{value: entranceFee}();
//         }

//         uint256 startingTimeStamp = raffle.getLastTimeStamp();
//         uint256 startingBalance = expectedWinner.balance;

//         // Act
//         vm.recordLogs();
//         raffle.performUpkeep(""); // emits requestId
//         Vm.Log[] memory entries = vm.getRecordedLogs();
//         bytes32 requestId = entries[1].topics[1]; // get the requestId from the logs

//         VRFCoordinatorMock(vrfCoordinator).fulfillRandomWords(
//             uint256(requestId),
//             address(raffle)
//         );

//         // Assert
//         address recentWinner = raffle.getRecentWinner();
//         Raffle.RaffleState raffleState = raffle.getRaffleState();
//         uint256 winnerBalance = recentWinner.balance;
//         uint256 endingTimeStamp = raffle.getLastTimeStamp();
//         uint256 prize = entranceFee * (additionalEntrances + 1);

//         assert(recentWinner == expectedWinner);
//         assert(uint256(raffleState) == 0);
//         assert(winnerBalance == startingBalance + prize);
//         assert(endingTimeStamp > startingTimeStamp);
//     }
// }
