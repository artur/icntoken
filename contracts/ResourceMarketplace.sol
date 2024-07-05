// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./ICNToken.sol";
import "./ParticipantRegistry.sol";

contract ResourceMarketplace is Ownable {
    ICNToken public icntToken;
    ParticipantRegistry public participantRegistry;

    struct ResourceOffer {
        address provider;
        uint256 computeUnits;
        uint256 pricePerUnit;
        bool isActive;
    }

    ResourceOffer[] public resourceOffers;

    event ResourceOfferCreated(uint256 offerId, address provider, uint256 computeUnits, uint256 pricePerUnit);
    event ResourcePurchased(uint256 offerId, address buyer, uint256 computeUnits);

    constructor(address _icntToken, address _participantRegistry) Ownable(msg.sender) {
        icntToken = ICNToken(_icntToken);
        participantRegistry = ParticipantRegistry(_participantRegistry);
    }

    function createResourceOffer(uint256 _computeUnits, uint256 _pricePerUnit) public {
        require(participantRegistry.isActiveParticipant(msg.sender), "Not an active participant");
        require(participantRegistry.getParticipantType(msg.sender) == ParticipantRegistry.ParticipantType.HardwareProvider, "Not a hardware provider");

        resourceOffers.push(ResourceOffer({
            provider: msg.sender,
            computeUnits: _computeUnits,
            pricePerUnit: _pricePerUnit,
            isActive: true
        }));

        emit ResourceOfferCreated(resourceOffers.length - 1, msg.sender, _computeUnits, _pricePerUnit);
    }

    function purchaseResource(uint256 _offerId, uint256 _computeUnits) public {
        require(participantRegistry.isActiveParticipant(msg.sender), "Not an active participant");
        require(_offerId < resourceOffers.length, "Invalid offer ID");
        ResourceOffer storage offer = resourceOffers[_offerId];
        require(offer.isActive, "Offer is not active");
        require(_computeUnits <= offer.computeUnits, "Not enough compute units available");

        uint256 totalCost = _computeUnits * offer.pricePerUnit;
        require(icntToken.balanceOf(msg.sender) >= totalCost, "Insufficient ICNT balance");

        icntToken.transferFrom(msg.sender, offer.provider, totalCost);
        offer.computeUnits -= _computeUnits;

        if (offer.computeUnits == 0) {
            offer.isActive = false;
        }

        emit ResourcePurchased(_offerId, msg.sender, _computeUnits);
    }
}