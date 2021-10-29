const { expect } = require("chai");

describe("NFTMarket", async () => {
  it("Should create and execute market sales", async () => {
    // Instantiate Market Contract
    const Market = await ethers.getContractFactory("NFTMarket");
    const market = await Market.deploy();
    await market.deployed();
    const marketAddress = market.address;

    // Instantiate NFT Contract
    const NFT = await ethers.getContractFactory("NFT");
    const nft = await NFT.deploy(marketAddress);
    await nft.deployed();
    const nftAddress = nft.address;

    // Retrieves the current listing price
    let listingPrice = await market.getListingPrice();
    listingPrice = listingPrice.toString();

    // Parses an action price in Ether
    let auctionPrice = ethers.utils.parseUnits("100", "ether");
    auctionPrice = auctionPrice.toString();

    // Creates two NFT Tokens
    await nft.createToken("https://www.mytokenlocation.com");
    await nft.createToken("https://www.mytokenlocation2.com");

    // Creates a market item for sale for each previously created NFT
    await market.createMarketItem(nftAddress, 1, auctionPrice, {
      value: listingPrice,
    });
    await market.createMarketItem(nftAddress, 2, auctionPrice, {
      value: listingPrice,
    });

    // Set the buyer address as accounts[1]
    // accounts[0] or first account is ignored as it is the owner of the contract.
    const [_, buyerAddress] = await ethers.getSigners();

    // Creates a market sale for the first NFT
    await market
      .connect(buyerAddress)
      .createMarketSale(nftAddress, 1, { value: auctionPrice });

    // Fetch all market items
    let items = await market.fetchMarketItems();

    // Iterate over the items and recreate the object with relevant data
    items = await Promise.all(
      items.map(async (i) => {
        const tokenUri = await nft.tokenURI(i.tokenId);
        let item = {
          price: i.price.toString(),
          tokenId: i.tokenId.toString(),
          seller: i.seller,
          owner: i.owner,
          tokenUri,
        };

        return item;
      })
    );

    console.log("items: ", items);
  });
});
