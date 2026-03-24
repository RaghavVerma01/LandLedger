import React, { useEffect, useState } from "react";
import { usePropertyContext } from "@/contexts/propertyContext";
import { getEscrowDetails } from "@/utils/escrowUtils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AcceptOfferButton from "@/components/AcceptOfferButton";
import DepositFundsButton from "@/components/DepositFundsButton";
import { Building, Wallet } from "lucide-react";
import SignClosingButton from "@/components/SignClosingButton";
import PassInspectionButton from "@/components/PassInspectionButton";

const Dashboard: React.FC = () => {
    const { properties } = usePropertyContext();
    const [activeTab, setActiveTab] = useState<"listings" | "offers">("listings");
    const [myListings, setMyListings] = useState<any[]>([]);
    const [myOffers, setMyOffers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const userWallet = localStorage.getItem("walletAddress")?.toLowerCase();

    useEffect(() => {
        const fetchDashboardData = async () => {
            if (!userWallet || properties.length === 0) return;
            setLoading(true);

            //1. Filter MongoDB data based on wallet address
            const listings = properties.filter(p => p.seller?.walletAddress?.toLowerCase() === userWallet);
            const offers = properties.filter(p => p.buyerWallet?.toLowerCase() === userWallet);

            //2. Helper functions to stitch Blockchain Escrow Data to MongoDB data
            const attachEscrowDetails = async (propertyArray: any[]) => {
                const combinedData = [];
                for (const property of propertyArray) {
                    if (property.escrowId) {
                        try {
                            const escrowData = await getEscrowDetails(property.escrowId);
                            combinedData.push({ ...property, onChainData: escrowData });
                        } catch (err) {
                            console.error(`Failed to fetch escrow ${property.escrowId}`, err);
                            combinedData.push({ ...property, onChainData: null });
                        }
                    } else {
                        combinedData.push({ ...property, onChainData: null });
                    }
                }
                return combinedData;
            }

            //3. Resolve both arrays
            setMyListings(await attachEscrowDetails(listings));
            setMyOffers(await attachEscrowDetails(offers));
            setLoading(false);
        };
        fetchDashboardData();
    }, [properties, userWallet]);

    if (loading) {
        return (
            <div className="flex flex-col min-h-screen">
                <Navbar />
                <main className="flex-grow flex items-center justify-center">
                    <p className="text-xl animate-pulse">Syncing with Blockchain...</p>
                </main>
                <Footer />
            </div>
        );
    }
    return (
        <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow bg-gray-50 p-4 md:p-8">
                <div className="max-w-6xl mx-auto">
                    <h1 className="text-3xl font-bold mb-8 text-estate-primary">My Portfolio</h1>

                    {/* Custom Tailwind Tabs */}
                    <div className="flex space-x-4 mb-8 border-b border-gray-200 pb-4">
                        <button
                            onClick={() => setActiveTab("listings")}
                            className={`flex items-center px-4 py-2 rounded-md font-semibold transition-colors ${activeTab === "listings" ? "bg-estate-primary text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                }`}
                        >
                            <Building className="mr-2" size={18} />
                            My Listings ({myListings.length})
                        </button>
                        <button
                            onClick={() => setActiveTab("offers")}
                            className={`flex items-center px-4 py-2 rounded-md font-semibold transition-colors ${activeTab === "offers" ? "bg-estate-primary text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                }`}
                        >
                            <Wallet className="mr-2" size={18} />
                            My Offers ({myOffers.length})
                        </button>
                    </div>

                    {/* TAB CONTENT: MY LISTINGS (SELLER VIEW) */}
                    {activeTab === "listings" && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {myListings.length === 0 ? <p className="text-gray-500">You haven't listed any properties yet.</p> : null}
                            {myListings.map(property => (
                                <Card key={property._id} className="shadow-sm border-t-4 border-t-blue-500">
                                    <CardContent className="p-6">
                                        <div className="flex justify-between items-start mb-4">
                                            <h2 className="text-xl font-bold">{property.title}</h2>
                                            <Badge>{property.status}</Badge>
                                        </div>
                                        <p className="text-gray-600 mb-4">{property.price} ETH</p>

                                        {/* SELLER ACTION LOGIC */}
                                        {property.status === "Available" && (
                                            <p className="text-sm text-gray-500 italic">Waiting for buyers...</p>
                                        )}

                                        {property.status === "Under Contract" && property.onChainData && (
                                            <div className="bg-blue-50 p-4 rounded-lg mt-4 space-y-3">
                                                <p className="text-sm font-semibold text-blue-800 mb-2">🎉 Offer Active!</p>

                                                {/* Phase 1: Accept the offer and wait for buyer to deposit */}
                                                {!property.onChainData.isFunded && (
                                                    <>
                                                        <AcceptOfferButton
                                                            tokenId={property.blockchainId}
                                                            onSuccess={() => window.location.reload()}
                                                        />
                                                        <p className="text-sm text-blue-800 mt-2 italic">
                                                            Once accepted, wait for the buyer to deposit funds.
                                                        </p>
                                                    </>
                                                )}

                                                {/* Phase 2: Funded, wait for inspection */}
                                                {property.onChainData.isFunded && !property.onChainData.inspectionPassed && (
                                                    <p className="text-sm text-amber-600 font-semibold">
                                                        ⏳ Buyer funded. Waiting for real-world inspection...
                                                    </p>
                                                )}

                                                {/* Phase 3: Inspected, time for Seller to sign closing documents */}
                                                {property.onChainData.isFunded && property.onChainData.inspectionPassed && !property.onChainData.sellerApproved && (
                                                    <SignClosingButton
                                                        escrowId={property.escrowId}
                                                        isBuyer={false}
                                                        onSuccess={() => window.location.reload()}
                                                    />
                                                )}

                                                {/* Phase 4: Seller signed, waiting for Buyer to sign */}
                                                {property.onChainData.sellerApproved && !property.onChainData.completed && (
                                                    <p className="text-sm text-green-700 font-semibold">
                                                        ✅ You have signed. Waiting for buyer's final signature...
                                                    </p>
                                                )}

                                                {/* Phase 5: Complete */}
                                                {property.onChainData.completed && (
                                                    <p className="text-sm text-purple-700 font-bold">
                                                        🏠 Sold! The ETH has been transferred to your wallet.
                                                    </p>
                                                )}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}

                    {/* TAB CONTENT: MY OFFERS (BUYER VIEW) */}
                    {activeTab === "offers" && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {myOffers.length === 0 ? <p className="text-gray-500">You haven't made any offers yet.</p> : null}
                            {myOffers.map(property => (
                                <Card key={property._id} className="shadow-sm border-t-4 border-t-green-500">
                                    <CardContent className="p-6">
                                        <div className="flex justify-between items-start mb-4">
                                            <h2 className="text-xl font-bold">{property.title}</h2>
                                            <Badge variant="outline">Escrow ID: {property.escrowId}</Badge>
                                        </div>
                                        <p className="text-gray-600 mb-4">Agreed Price: {property.price} ETH</p>

                                        {/* BUYER ACTION LOGIC */}
                                        {property.onChainData && (
                                            <div className="bg-gray-100 p-4 rounded-lg mt-4 space-y-3">

                                                {/* State 1: Waiting for Seller to Accept/Buyer to Deposit */}
                                                {!property.onChainData.isFunded && (
                                                    <DepositFundsButton
                                                        escrowId={property.escrowId}
                                                        price={property.price}
                                                        onSuccess={() => window.location.reload()}
                                                    />
                                                )}

                                                {/* State 2: Funded, but not inspected yet (Includes our Dev Tool!) */}
                                                {property.onChainData.isFunded && !property.onChainData.inspectionPassed && (
                                                    <>
                                                        <p className="text-sm text-amber-600 font-semibold">
                                                            ⏳ Funds Secured. Waiting for Real-World Inspection...
                                                        </p>
                                                        {/* DEV TOOL: Simulate the inspector right from the buyer dashboard */}
                                                        <PassInspectionButton
                                                            escrowId={property.escrowId}
                                                            onSuccess={() => window.location.reload()}
                                                        />
                                                    </>
                                                )}

                                                {/* State 3: Inspected, waiting for Buyer to sign */}
                                                {property.onChainData.inspectionPassed && !property.onChainData.buyerApproved && (
                                                    <SignClosingButton
                                                        escrowId={property.escrowId}
                                                        propertyId={property._id}
                                                        isBuyer={true}
                                                        onSuccess={() => window.location.reload()}
                                                    />
                                                )}

                                                {/* State 4: Completed */}
                                                {property.onChainData.completed && (
                                                    <p className="text-sm text-purple-700 font-bold">
                                                        🏠 Purchase Complete! The NFT is in your wallet.
                                                    </p>
                                                )}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
}
export default Dashboard;