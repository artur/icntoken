// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./ParticipantRegistry.sol";

contract SLAOracle is Ownable {
    ParticipantRegistry public participantRegistry;

    struct SLAReport {
        address provider;
        uint256 timestamp;
        uint256 performanceScore;
    }

    mapping(address => SLAReport[]) public slaReports;

    event SLAReported(address provider, uint256 timestamp, uint256 performanceScore);

    constructor(address _participantRegistry) Ownable(msg.sender) {
        participantRegistry = ParticipantRegistry(_participantRegistry);
    }

    function reportSLA(address _provider, uint256 _performanceScore) public {
        require(participantRegistry.isActiveParticipant(msg.sender), "Not an active participant");
        require(participantRegistry.getParticipantType(msg.sender) == ParticipantRegistry.ParticipantType.SLAOracle, "Not an SLA Oracle");
        require(_performanceScore <= 100, "Performance score must be between 0 and 100");

        slaReports[_provider].push(SLAReport({
            provider: _provider,
            timestamp: block.timestamp,
            performanceScore: _performanceScore
        }));

        emit SLAReported(_provider, block.timestamp, _performanceScore);
    }

    function getLatestSLAReport(address _provider) public view returns (uint256, uint256) {
        require(slaReports[_provider].length > 0, "No SLA reports for this provider");
        SLAReport memory latestReport = slaReports[_provider][slaReports[_provider].length - 1];
        return (latestReport.timestamp, latestReport.performanceScore);
    }
}