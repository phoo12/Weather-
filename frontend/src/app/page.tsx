"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Cloud, Droplets, Thermometer, Plus, X, Star } from "lucide-react";

interface CityWeatherData {
  temperature: string | null;
  humidity: string | null;
}

interface SSEData {
  cities: Record<string, CityWeatherData>;
}

export default function Home() {
  const [citiesData, setCitiesData] = useState<Record<string, CityWeatherData>>(
    {}
  );
  const [cities, setCities] = useState<string[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [newCity, setNewCity] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    const eventSource = new EventSource("http://localhost:8000/sse");

    eventSource.onopen = () => {
      setIsConnected(true);
    };

    eventSource.onmessage = (event) => {
      try {
        const data: SSEData = JSON.parse(event.data);
        setCitiesData(data.cities);
        // Update cities list from SSE data
        setCities(Object.keys(data.cities));
      } catch (error) {
        console.error("Error parsing SSE data:", error);
      }
    };

    eventSource.onerror = (error) => {
      console.error("SSE error:", error);
      setIsConnected(false);
    };

    return () => {
      eventSource.close();
    };
  }, []);

  const addCity = async () => {
    if (!newCity.trim()) return;

    setIsAdding(true);
    try {
      const response = await fetch("http://localhost:8000/cities", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ city: newCity.trim() }),
      });

      if (response.ok) {
        setNewCity("");
        // Refresh cities list
        fetchCities();
      } else if (response.status === 404) {
        alert("City not found. Please check the city name and try again.");
      } else {
        alert("Error adding city. Please try again.");
      }
    } catch (error) {
      console.error("Error adding city:", error);
      alert("Error adding city. Please try again.");
    } finally {
      setIsAdding(false);
    }
  };

  const removeCity = async (city: string) => {
    try {
      const response = await fetch(
        `http://localhost:8000/cities/${encodeURIComponent(city)}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        // Refresh cities list
        fetchCities();
      }
    } catch (error) {
      console.error("Error removing city:", error);
    }
  };

  const toggleFavorite = async (city: string) => {
    const isFavorite = favorites.includes(city);
    try {
      const response = await fetch(
        `http://localhost:8000/favorites${
          isFavorite ? `/${encodeURIComponent(city)}` : ""
        }`,
        {
          method: isFavorite ? "DELETE" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: isFavorite ? undefined : JSON.stringify({ city }),
        }
      );

      if (response.ok) {
        // Refresh favorites list
        fetchFavorites();
        // Also refresh cities to reflect changes
        fetchCities();
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
  };

  const fetchCities = async () => {
    try {
      const response = await fetch("http://localhost:8000/cities");
      if (response.ok) {
        const data = await response.json();
        setCities(data.cities);
      }
    } catch (error) {
      console.error("Error fetching cities:", error);
    }
  };

  const fetchFavorites = async () => {
    try {
      const response = await fetch("http://localhost:8000/favorites");
      if (response.ok) {
        const data = await response.json();
        setFavorites(data.favorites);
      }
    } catch (error) {
      console.error("Error fetching favorites:", error);
    }
  };

  useEffect(() => {
    fetchCities();
    fetchFavorites();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-black dark:to-purple-950">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent mb-4">
            Weather Dashboard
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
            Real-time weather updates for cities around the world
          </p>

          <div className="flex items-center justify-center gap-2 mb-8">
            <div
              className={`w-3 h-3 rounded-full ${
                isConnected ? "bg-green-500 animate-pulse" : "bg-red-500"
              }`}
            />
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {isConnected ? "Live Updates" : "Offline"}
            </span>
          </div>

          {/* Add City Form */}
          <div className="max-w-md mx-auto mb-8">
            <div className="flex gap-2">
              <input
                type="text"
                value={newCity}
                onChange={(e) => setNewCity(e.target.value)}
                placeholder="Enter city name..."
                className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onKeyPress={(e) => e.key === "Enter" && addCity()}
              />
              <button
                onClick={addCity}
                disabled={isAdding || !newCity.trim()}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white rounded-lg flex items-center gap-2 transition-colors"
              >
                <Plus className="w-4 h-4" />
                {isAdding ? "Adding..." : "Add"}
              </button>
            </div>
          </div>
        </div>

        {cities.length === 0 ? (
          <div className="text-center py-16">
            <Cloud className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-700 mb-4" />
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              No cities added yet. Add a city above to start monitoring weather.
            </p>
          </div>
        ) : (
          <div className="space-y-12">
            {/* Favorite Cities Section */}
            {favorites.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                  <Star
                    className="w-6 h-6 text-yellow-500"
                    fill="currentColor"
                  />
                  Favorite Cities
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {cities
                    .filter((city) => favorites.includes(city))
                    .map((city) => {
                      const cityData = citiesData[city];
                      return (
                        <div key={city} className="relative group">
                          <Link href={`/city/${encodeURIComponent(city)}`}>
                            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 group-hover:scale-105 ring-2 ring-yellow-400">
                              <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                                  {city}
                                </h3>
                                <div className="flex items-center gap-2">
                                  <Cloud className="w-6 h-6 text-blue-500 group-hover:text-blue-600 transition-colors" />
                                  <button
                                    onClick={(e) => {
                                      e.preventDefault();
                                      toggleFavorite(city);
                                    }}
                                    className="w-6 h-6 text-yellow-500 hover:text-yellow-600 transition-colors"
                                  >
                                    <Star
                                      className="w-6 h-6"
                                      fill="currentColor"
                                    />
                                  </button>
                                </div>
                              </div>

                              <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                  <Thermometer className="w-4 h-4 text-orange-500" />
                                  <span className="text-sm text-gray-600 dark:text-gray-400">
                                    Temperature
                                  </span>
                                </div>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                  {cityData?.temperature
                                    ? `${cityData.temperature}°C`
                                    : "--"}
                                </p>

                                <div className="flex items-center gap-2">
                                  <Droplets className="w-4 h-4 text-cyan-500" />
                                  <span className="text-sm text-gray-600 dark:text-gray-400">
                                    Humidity
                                  </span>
                                </div>
                                <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                                  {cityData?.humidity
                                    ? `${cityData.humidity}%`
                                    : "--"}
                                </p>
                              </div>

                              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                                <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                                  Click for details →
                                </p>
                              </div>
                            </div>
                          </Link>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}

            {/* Regular Cities Section */}
            {cities.filter((city) => !favorites.includes(city)).length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                  <Cloud className="w-6 h-6 text-blue-500" />
                  Other Cities
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {cities
                    .filter((city) => !favorites.includes(city))
                    .map((city) => {
                      const cityData = citiesData[city];
                      return (
                        <div key={city} className="relative group">
                          <Link href={`/city/${encodeURIComponent(city)}`}>
                            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 group-hover:scale-105">
                              <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                                  {city}
                                </h3>
                                <div className="flex items-center gap-2">
                                  <Cloud className="w-6 h-6 text-blue-500 group-hover:text-blue-600 transition-colors" />
                                  <button
                                    onClick={(e) => {
                                      e.preventDefault();
                                      toggleFavorite(city);
                                    }}
                                    className="w-6 h-6 text-gray-400 hover:text-yellow-600 transition-colors"
                                  >
                                    <Star className="w-6 h-6" fill="none" />
                                  </button>
                                </div>
                              </div>

                              <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                  <Thermometer className="w-4 h-4 text-orange-500" />
                                  <span className="text-sm text-gray-600 dark:text-gray-400">
                                    Temperature
                                  </span>
                                </div>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                  {cityData?.temperature
                                    ? `${cityData.temperature}°C`
                                    : "--"}
                                </p>

                                <div className="flex items-center gap-2">
                                  <Droplets className="w-4 h-4 text-cyan-500" />
                                  <span className="text-sm text-gray-600 dark:text-gray-400">
                                    Humidity
                                  </span>
                                </div>
                                <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                                  {cityData?.humidity
                                    ? `${cityData.humidity}%`
                                    : "--"}
                                </p>
                              </div>

                              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                                <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                                  Click for details →
                                </p>
                              </div>
                            </div>
                          </Link>

                          {/* Delete Button - Only show for non-favorites */}
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              removeCity(city);
                            }}
                            className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="text-center mt-12">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Data updates every 2 seconds • Powered by wttr.in
          </p>
        </div>
      </div>
    </div>
  );
}
