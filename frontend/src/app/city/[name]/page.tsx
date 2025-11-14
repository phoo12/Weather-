"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Cloud,
  Droplets,
  Thermometer,
  Wind,
  Eye,
  Gauge,
} from "lucide-react";

interface DetailedWeatherData {
  temperature: string | null;
  humidity: string | null;
  feelsLike: string | null;
  description: string;
  lastUpdated: string | null;
  // Extended data we'll add
  windSpeed?: string;
  pressure?: string;
  visibility?: string;
}

export default function CityDetailPage() {
  const params = useParams();
  const router = useRouter();
  const cityName = decodeURIComponent(params.name as string);

  const [weatherData, setWeatherData] = useState<DetailedWeatherData | null>(
    null
  );
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const eventSource = new EventSource("http://localhost:8000/sse");

    eventSource.onopen = () => {
      setIsConnected(true);
    };

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        const cityData = data.cities[cityName];

        if (cityData) {
          setWeatherData(cityData);
          setLoading(false);
        }
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
  }, [cityName]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-black dark:to-purple-950">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header with Back Button */}
        <div className="mb-8">
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Dashboard
          </button>

          <div className="flex items-center justify-between">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
              {cityName}
            </h1>

            <div className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-white dark:bg-gray-800 shadow-sm">
              <div
                className={`w-2 h-2 rounded-full ${
                  isConnected ? "bg-green-500 animate-pulse" : "bg-red-500"
                }`}
              />
              {isConnected ? "Live" : "Offline"}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-16">
            <div className="animate-spin w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">
              Loading weather data...
            </p>
          </div>
        ) : !weatherData ? (
          <div className="text-center py-16">
            <Cloud className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-700 mb-4" />
            <p className="text-gray-600 dark:text-gray-400">
              No data available for this city
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Main Weather Card */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <Cloud className="w-8 h-8 text-blue-500" />
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  Current Weather
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                {/* Temperature */}
                <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-2xl p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Thermometer className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Temperature
                    </p>
                  </div>
                  <p className="text-5xl font-bold text-gray-900 dark:text-white mb-2">
                    {weatherData.temperature
                      ? `${weatherData.temperature}°C`
                      : "--"}
                  </p>
                  {weatherData.feelsLike && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Feels like {weatherData.feelsLike}°C
                    </p>
                  )}
                </div>

                {/* Humidity */}
                <div className="bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 rounded-2xl p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Droplets className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Humidity
                    </p>
                  </div>
                  <p className="text-5xl font-bold text-gray-900 dark:text-white">
                    {weatherData.humidity ? `${weatherData.humidity}%` : "--"}
                  </p>
                </div>

                {/* Condition */}
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Cloud className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Condition
                    </p>
                  </div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {weatherData.description || "Unknown"}
                  </p>
                </div>
              </div>

              {/* Additional Details (placeholder for future API enhancement) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                  <Wind className="w-6 h-6 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Wind Speed
                    </p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {weatherData.windSpeed || "N/A"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                  <Gauge className="w-6 h-6 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Pressure
                    </p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {weatherData.pressure || "N/A"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                  <Eye className="w-6 h-6 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Visibility
                    </p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {weatherData.visibility || "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              {weatherData.lastUpdated && (
                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                    Last updated:{" "}
                    {new Date(
                      parseInt(weatherData.lastUpdated) * 1000
                    ).toLocaleString()}
                  </p>
                </div>
              )}
            </div>

            {/* Info Card */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                About This Data
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Weather data is updated every 10 minutes and sourced from
                OpenWeatherMap. Data includes current conditions for {cityName}.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
