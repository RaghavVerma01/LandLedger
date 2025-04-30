import { getContracts } from "./contracts";

export const fetchPropertyFromChain = async (tokenId: number) => {
  try {
    const { propertyContract } = await getContracts();
    const propertyDetails = await propertyContract.getPropertyDetails(tokenId);
    const owner = await propertyContract.getPropertyOwner(tokenId);
    return { ...propertyDetails, owner };
  } catch (error) {
    console.error("Error fetching property:", error);
    throw error;
  }
};
