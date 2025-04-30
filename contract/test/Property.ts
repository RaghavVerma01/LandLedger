import { expect } from "chai";
import {ethers} from "hardhat"
// import { ethers } from "hardhat";
// import loadFixture from "@nomicfoundation/hardhat-network-helpers"
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");


describe("Property Contract", function(){
    async function deployPropertyFixture(){
        const [owner,buyer,otherAccount] = await ethers.getSigners();

        const Property = await ethers.getContractFactory("Property");
        const property = await Property.deploy(
            "RealEstateProperty",
            "REP",
            owner.address,
            500
        );
        return{property,owner,buyer,otherAccount};
    };



    describe("Deployment",function(){
        it("Should set the right owner", async function(){
            const {property,owner} = await loadFixture(deployPropertyFixture);
            expect(await property.owner()).to.equal(owner.address);
        });

        it("Should set royalty info correctly", async function(){
            const {property,owner} = await loadFixture(deployPropertyFixture);
            const [recipient,basisPoints] = await property.royaltyInfo(0,10000);
            expect(recipient).to.equal(owner.address);
            expect(basisPoints).to.equal(500);
        });
    });

    describe("Property Creation",function(){
        it("Should create a new property NFT", async function(){
            const {property,owner} = await loadFixture(deployPropertyFixture);

            const tx = await property.createProperty(
                owner.address,
                "ipfs://test-uri",
                "New Delhi",
                ethers.parseEther("1"),
                1500, // sq ft
                3, //bedrooms
                2, //bathrooms
                2010 // yearBuilt
            );

            await expect(tx)
            .to.emit(property,"PropertyListed")
            .withArgs(1,owner.address,ethers.parseEther("1"));

            const details = await property.getPropertyDetails(1);
            expect(details.location).to.equal("New Delhi");
            expect(details.price).to.equal(ethers.parseEther("1"));
            expect(details.status).to.equal(0); //Available
        });

        it("Should reject invalid inputs", async function(){
            const {property,owner} = await loadFixture(deployPropertyFixture);

            await expect(
                property.createProperty(
                    owner.address,
                    "", //empty URI
                    "New Delhi",
                    ethers.parseEther("1"),
                    1500,3,2,2010
                )
            ).to.be.revertedWithCustomError(property,"InvalidInput");

            await expect(
                property.createProperty(
                    owner.address,
                    "ipfs://test-uri",
                    "New Delhi",
                    0,
                    1500, 3, 2, 2010
                )
            ).to.be.revertedWithCustomError(property,"InvalidInput");
        });
    });
    
    describe("Property Transactions", function(){
        it("Should allow property purchase", async function(){
            const{ property, owner, buyer} = await loadFixture(deployPropertyFixture);

            //Create property first
            await property.createProperty(
                owner.address,
                "ipfs://test-uri",
                "New Delhi",
                ethers.parseEther("1"),
                1500,3,2,2010
            );

            const buyerBalanceBefore = await ethers.provider.getBalance(buyer.address);

            await expect(
                property.connect(buyer).buyProperty(1,{
                    value: ethers.parseEther("1")
                })
            )
            .to.emit(property, "PropertySold")
            .withArgs(1,owner.address,buyer.address,ethers.parseEther('1'));

            const buyerBalanceAfter = await ethers.provider.getBalance (buyer.address);
            expect (buyerBalanceBefore - buyerBalanceAfter).to.be.closeTo(

                ethers.parseEther("1"),
                ethers.parseEther("0.01") // Account for gas
                
            )   //  bfgb gg  bg b bg bb g bbvffvdvfrtgr ecewftgtrtgfr3 i love pranati so much i could fap all day looking at her 
        })

        it("Should reject incorrect payment amounts", async function(){
            const{property, owner, buyer } = await loadFixture(deployPropertyFixture);
            
            await property.createProperty(
                owner.address,
                "ipfs://test-uri",
                "New Delhi",
                ethers.parseEther("1"),
                1500,3,2,2010
            );

            await expect(
                property.connect(buyer).buyProperty(1,{
                    value: ethers.parseEther("0.5") //underpay        
                })
            ).to.be.revertedWithCustomError(property,"IncorrectPayment");
        });
    });

    describe("Property Management", function(){
        it("Should allow price updates by owner", async function(){
            const{property, owner} = await loadFixture(deployPropertyFixture);

            await property.createProperty(
                owner.address,
                "ipfs://test-uri",
                "New Delhi",
                ethers.parseEther("1"),
                1500,3,2,2010
            );

            await expect(
                property.updatePropertyPrice(1,ethers.parseEther("1.5"))
            )
            .to.emit(property, "PropertyPriceChanged")
            .withArgs(1,ethers.parseEther("1"), ethers.parseEther("1.5"));

            const details = await property.getPropertyDetails(1);
            expect(details.price).to.equal(ethers.parseEther("1.5"));
        });

        it("Should prevent price updates by non-owners", async function(){
            const {property,owner,otherAccount} = await loadFixture(deployPropertyFixture);

            await property.createProperty(
                owner.address,
                "ipfs://test-uri",
                "New Delhi" ,
                ethers.parseEther("1"),
                1500,3,2,2010
            );

            await expect(
                property.connect(otherAccount).updatePropertyPrice(1,ethers.parseEther("1.5"))
            ).to.be.revertedWithCustomError(property,"NotOwner");
        });
    });
});