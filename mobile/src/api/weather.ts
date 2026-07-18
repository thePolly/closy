import type { ComponentProps } from "react";
import type { Ionicons } from "@expo/vector-icons";

export interface CurrentWeather {
  temperature: number;
  condition: string;
  icon: ComponentProps<typeof Ionicons>["name"];
}

function describeWeatherCode(code: number): { condition: string; icon: CurrentWeather["icon"] } {
  if (code === 0) return { condition: "Sunny", icon: "sunny-outline" };
  if (code === 1) return { condition: "Partly Cloudy", icon: "partly-sunny-outline" };
  if (code === 2 || code === 3) return { condition: "Cloudy", icon: "cloudy-outline" };
  if (code === 45 || code === 48) return { condition: "Foggy", icon: "cloudy-outline" };
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) {
    return { condition: "Rain", icon: "rainy-outline" };
  }
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) {
    return { condition: "Snow", icon: "snow-outline" };
  }
  if (code >= 95) return { condition: "Thunderstorm", icon: "thunderstorm-outline" };
  return { condition: "Cloudy", icon: "cloudy-outline" };
}

export async function fetchCurrentWeather(
  latitude: number,
  longitude: number
): Promise<CurrentWeather> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Failed to fetch weather");
  }

  const data = await response.json();
  const { condition, icon } = describeWeatherCode(data.current.weather_code);

  return {
    temperature: Math.round(data.current.temperature_2m),
    condition,
    icon,
  };
}
