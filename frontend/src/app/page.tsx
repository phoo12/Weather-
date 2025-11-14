"use client";

import { useEffect, useState } from "react";

interface WeatherData {
  temperature: string | null;
  humidity: string | null;
}

export default function Home() {
  const [weatherData, setWeatherData] = useState<WeatherData>({
    temperature: null,
    humidity: null,
  });
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const eventSource = new EventSource("http://localhost:8000/sse");

    eventSource.onopen = () => {
      setIsConnected(true);
    };

    eventSource.onmessage = (event) => {
      try {
        const data: WeatherData = JSON.parse(event.data);
        setWeatherData(data);
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

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-center py-32 px-16 bg-white dark:bg-black">
        <div className="flex flex-col items-center gap-8 text-center">
          <h1 className="text-4xl font-bold text-black dark:text-zinc-50">
            Weather Dashboard
          </h1>

          <div
            className={`px-4 py-2 rounded-full text-sm font-medium ${
              isConnected
                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
            }`}
          >
            {isConnected ? "Connected to backend" : "Disconnected from backend"}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-md">
            <div className="bg-zinc-100 dark:bg-zinc-800 p-6 rounded-lg">
              <h2 className="text-lg font-semibold text-zinc-600 dark:text-zinc-400 mb-2">
                Temperature
              </h2>
              <p className="text-3xl font-bold text-black dark:text-zinc-50">
                {weatherData.temperature
                  ? `${weatherData.temperature}°C`
                  : "--"}
              </p>
            </div>

            <div className="bg-zinc-100 dark:bg-zinc-800 p-6 rounded-lg">
              <h2 className="text-lg font-semibold text-zinc-600 dark:text-zinc-400 mb-2">
                Humidity
              </h2>
              <p className="text-3xl font-bold text-black dark:text-zinc-50">
                {weatherData.humidity ? `${weatherData.humidity}%` : "--"}
              </p>
            </div>
          </div>

          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Data updates every 5 seconds from Bangkok weather
          </p>
        </div>
      </main>
    </div>
  );
}
