// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";

contract ParticipantRegistry is Ownable {
    enum ParticipantType { HardwareProvider, ServiceProvider, SLAOracle }

    struct Participant {
        ParticipantType participantType;
        bool isActive;
    }

    mapping(address => Participant) public participants;

    event ParticipantRegistered(address participant, ParticipantType participantType);
    event ParticipantDeactivated(address participant);

    constructor() Ownable(msg.sender) {}

    function registerParticipant(address _participant, ParticipantType _type) public onlyOwner {
        require(!participants[_participant].isActive, "Participant already registered");
        participants[_participant] = Participant(_type, true);
        emit ParticipantRegistered(_participant, _type);
    }

    function deactivateParticipant(address _participant) public onlyOwner {
        require(participants[_participant].isActive, "Participant not active");
        participants[_participant].isActive = false;
        emit ParticipantDeactivated(_participant);
    }

    function isActiveParticipant(address _participant) public view returns (bool) {
        return participants[_participant].isActive;
    }

    function getParticipantType(address _participant) public view returns (ParticipantType) {
        require(participants[_participant].isActive, "Participant not active");
        return participants[_participant].participantType;
    }
}