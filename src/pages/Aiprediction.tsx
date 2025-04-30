import React, { useState, useEffect } from "react";
import { predict_home_price, get_location_names } from "../services/aiPredictService";
import Navbar from "@/components/Navbar";

const PropertyEstimator: React.FC = () => {
  const [area, setArea] = useState<string>("1000");
  const [bhk, setBHK] = useState<number>(2);
  const [bathrooms, setBathrooms] = useState<number>(2);
  const [location, setLocation] = useState<string>("");
  const [estimatedPrice, setEstimatedPrice] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [locations, setLocations] = useState<string[]>([]);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const locs = await get_location_names();
        setLocations(locs);
      } catch (error) {
        console.error("Failed to fetch locations", error);
      }
    };

    fetchLocations();
  }, []);

  const onClickedEstimatePrice = async () => {
    if (!area || !location) {
      alert("Please enter valid area and select a location.");
      return;
    }

    try {
      setLoading(true);
      const result = await predict_home_price({
        total_sqft: parseFloat(area),
        location,
        bhk,
        bath: bathrooms,
      });
      setEstimatedPrice(`Estimated Price: ₹${result.estimated_price.toLocaleString()}`);
    } catch (error) {
      setEstimatedPrice("Failed to fetch estimated price. Please try again.");
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
    <Navbar/>
    <section className="max-w-3xl mx-auto px-6 py-12 bg-white shadow-xl rounded-2xl mt-10 ">
      
      <h1 className="text-3xl font-bold text-gray-800 text-center mb-8">Estimate Property Price</h1>

      <div className="mb-6">
        <label htmlFor="uiSqft" className="block text-gray-700 font-medium mb-2">Area (Square Feet)</label>
        <input
          id="uiSqft"
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          type="text"
          value={area}
          onChange={(e) => setArea(e.target.value)}
        />
      </div>

      <div className="mb-6">
        <label className="block text-gray-700 font-medium mb-2">BHK</label>
        <div className="flex gap-4 flex-wrap">
          {[1, 2, 3, 4, 5].map((num) => (
            <label key={num} className="flex items-center gap-2">
              <input
                type="radio"
                name="uiBHK"
                value={num}
                checked={bhk === num}
                onChange={() => setBHK(num)}
              />
              {num}
            </label>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-gray-700 font-medium mb-2">Bathrooms</label>
        <div className="flex gap-4 flex-wrap">
          {[1, 2, 3, 4, 5].map((num) => (
            <label key={num} className="flex items-center gap-2">
              <input
                type="radio"
                name="uiBathrooms"
                value={num}
                checked={bathrooms === num}
                onChange={() => setBathrooms(num)}
              />
              {num}
            </label>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <label htmlFor="uiLocations" className="block text-gray-700 font-medium mb-2">Location</label>
        <select
          id="uiLocations"
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        >
          <option value="" disabled>Choose a Location</option>
          {locations.map((loc, idx) => (
            <option key={idx} value={loc}>{loc}</option>
          ))}
        </select>
      </div>

      <button
        onClick={onClickedEstimatePrice}
        className="w-full bg-indigo-600 text-white font-semibold py-3 rounded-lg hover:bg-indigo-700 transition"
        disabled={loading}
      >
        {loading ? "Estimating..." : "Estimate Price"}
      </button>

      {estimatedPrice && (
        <div className="mt-6 bg-indigo-50 text-indigo-700 text-center p-4 rounded-lg">
          <h2 className="text-xl font-semibold">{estimatedPrice} Lakh</h2>
        </div>
      )}
    </section>
    </>
  );
};

export default PropertyEstimator;
