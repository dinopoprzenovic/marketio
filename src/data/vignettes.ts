import { VignetteCountry } from "@/types";

export const vignetteCountries: VignetteCountry[] = [
  {
    id: "slovenia",
    name: "Slovenia",
    flag: "🇸🇮",
    currency: "EUR",
    vehicleTypes: [
      {
        id: "car",
        label: "Car (up to 3.5t)",
        icon: "🚗",
        durations: [
          { id: "7d", label: "7 Days", price: 16 },
          { id: "1m", label: "1 Month", price: 32 },
          { id: "1y", label: "1 Year", price: 117 },
        ],
      },
      {
        id: "motorcycle",
        label: "Motorcycle",
        icon: "🏍️",
        durations: [
          { id: "7d", label: "7 Days", price: 8 },
          { id: "1m", label: "1 Month", price: 16.5 },
          { id: "1y", label: "1 Year", price: 60 },
        ],
      },
    ],
  },
  {
    id: "austria",
    name: "Austria",
    flag: "🇦🇹",
    currency: "EUR",
    vehicleTypes: [
      {
        id: "car",
        label: "Car (up to 3.5t)",
        icon: "🚗",
        durations: [
          { id: "10d", label: "10 Days", price: 11.5 },
          { id: "2m", label: "2 Months", price: 28.9 },
          { id: "1y", label: "1 Year", price: 96.4 },
        ],
      },
      {
        id: "motorcycle",
        label: "Motorcycle",
        icon: "🏍️",
        durations: [
          { id: "10d", label: "10 Days", price: 5.8 },
          { id: "2m", label: "2 Months", price: 14.5 },
          { id: "1y", label: "1 Year", price: 38.2 },
        ],
      },
    ],
  },
  {
    id: "hungary",
    name: "Hungary",
    flag: "🇭🇺",
    currency: "EUR",
    vehicleTypes: [
      {
        id: "car",
        label: "Car (D1 category)",
        icon: "🚗",
        durations: [
          { id: "10d", label: "10 Days", price: 14.9 },
          { id: "1m", label: "1 Month", price: 20.9 },
          { id: "1y", label: "1 Year", price: 155 },
        ],
      },
    ],
  },
  {
    id: "czech",
    name: "Czech Republic",
    flag: "🇨🇿",
    currency: "EUR",
    vehicleTypes: [
      {
        id: "car",
        label: "Car (up to 3.5t)",
        icon: "🚗",
        durations: [
          { id: "10d", label: "10 Days", price: 15.2 },
          { id: "1m", label: "1 Month", price: 21.5 },
          { id: "1y", label: "1 Year", price: 57 },
        ],
      },
    ],
  },
  {
    id: "slovakia",
    name: "Slovakia",
    flag: "🇸🇰",
    currency: "EUR",
    vehicleTypes: [
      {
        id: "car",
        label: "Car (up to 3.5t)",
        icon: "🚗",
        durations: [
          { id: "10d", label: "10 Days", price: 12 },
          { id: "1m", label: "1 Month", price: 17 },
          { id: "1y", label: "1 Year", price: 60 },
        ],
      },
    ],
  },
  {
    id: "romania",
    name: "Romania",
    flag: "🇷🇴",
    currency: "EUR",
    vehicleTypes: [
      {
        id: "car",
        label: "Car (up to 3.5t)",
        icon: "🚗",
        durations: [
          { id: "7d", label: "7 Days", price: 3.5 },
          { id: "1m", label: "30 Days", price: 8 },
          { id: "1y", label: "1 Year", price: 28 },
        ],
      },
    ],
  },
  {
    id: "bulgaria",
    name: "Bulgaria",
    flag: "🇧🇬",
    currency: "EUR",
    vehicleTypes: [
      {
        id: "car",
        label: "Car (up to 3.5t)",
        icon: "🚗",
        durations: [
          { id: "7d", label: "Weekend (7 Days)", price: 8 },
          { id: "1m", label: "1 Month", price: 15 },
          { id: "3m", label: "3 Months", price: 28 },
          { id: "1y", label: "1 Year", price: 48 },
        ],
      },
    ],
  },
  {
    id: "croatia",
    name: "Croatia",
    flag: "🇭🇷",
    currency: "EUR",
    vehicleTypes: [
      {
        id: "car",
        label: "Car (Category I)",
        icon: "🚗",
        durations: [
          { id: "7d", label: "7 Days", price: 8.9 },
          { id: "1m", label: "1 Month", price: 18 },
          { id: "1y", label: "1 Year", price: 61 },
        ],
      },
    ],
  },
  {
    id: "germany",
    name: "Germany",
    flag: "🇩🇪",
    currency: "EUR",
    vehicleTypes: [
      {
        id: "car",
        label: "Car",
        icon: "🚗",
        durations: [
          { id: "10d", label: "10 Days", price: 12.5 },
          { id: "2m", label: "2 Months", price: 22 },
          { id: "1y", label: "1 Year", price: 130 },
        ],
      },
    ],
  },
];
