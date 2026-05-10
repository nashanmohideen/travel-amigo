import type { Itinerary } from "@/types";

// A sample 7-day mid-range itinerary used for the happy-path prototype.
// This is returned immediately when the user submits the planning form.
export const sampleItinerary: Itinerary = {
  id: "sample-7d-midrange-001",
  createdAt: new Date().toISOString(),
  tripDetails: {
    startDate: "2025-03-01",
    endDate: "2025-03-07",
    duration: 7,
    travelers: 2,
    budget: "mid-range",
    interests: ["culture", "nature", "beach"],
    startingFrom: "Colombo",
  },
  tips: [
    "Carry small denominations of Sri Lankan Rupees for tuk-tuks and markets.",
    "Book train tickets for the Kandy–Ella scenic route at least 3 days in advance.",
    "Always negotiate tuk-tuk fares before getting in outside touristy areas.",
    "Dress modestly (shoulders + knees covered) when visiting temples and sacred sites.",
    "The best time to spot whales in Mirissa is November through April.",
    "Drink bottled water; roadside king coconut (thambili) is safe and refreshing.",
  ],
  days: [
    {
      day: 1,
      date: "2025-03-01",
      location: "Colombo → Sigiriya",
      title: "Arrival & The Lion Rock",
      activities: [
        {
          id: "a1-1",
          name: "Check in & freshen up",
          description:
            "Settle into your boutique guesthouse near Sigiriya, surrounded by jungle.",
          duration: "1 hour",
          cost: 0,
          type: "sightseeing",
        },
        {
          id: "a1-2",
          name: "Sigiriya Rock Fortress",
          description:
            "Climb the iconic 200m rock fortress, viewing ancient frescoes and sweeping jungle panoramas.",
          duration: "3 hours",
          cost: 30,
          type: "sightseeing",
        },
        {
          id: "a1-3",
          name: "Pidurangala Rock at sunset",
          description:
            "A short hike for the best elevated view of Sigiriya Rock itself — perfect for golden-hour photography.",
          duration: "1.5 hours",
          cost: 5,
          type: "adventure",
        },
      ],
      accommodation: "Jetwing Vil Uyana (or similar eco-lodge)",
      meals: ["Breakfast on the go", "Lunch at hotel", "Dinner: rice & curry"],
      transport: "Private van from Colombo (~4 hrs)",
      estimatedCost: 180,
    },
    {
      day: 2,
      date: "2025-03-02",
      location: "Sigiriya → Dambulla → Kandy",
      title: "Cave Temples & Cultural Capital",
      activities: [
        {
          id: "a2-1",
          name: "Dambulla Cave Temple",
          description:
            "Explore 5 ornate cave temples filled with 157 Buddha statues and ancient ceiling paintings.",
          duration: "2 hours",
          cost: 15,
          type: "culture",
        },
        {
          id: "a2-2",
          name: "Spice Garden tour",
          description:
            "A guided walk through a working spice plantation — cinnamon, pepper, nutmeg and more.",
          duration: "1 hour",
          cost: 5,
          type: "culture",
        },
        {
          id: "a2-3",
          name: "Temple of the Tooth (Dalada Maligawa)",
          description:
            "Visit Sri Lanka's most sacred Buddhist temple housing a relic of the Buddha's tooth.",
          duration: "1.5 hours",
          cost: 15,
          type: "culture",
        },
        {
          id: "a2-4",
          name: "Kandyan dance performance",
          description:
            "Watch a traditional fire-juggling and masked dance show at the Kandyan Art Association.",
          duration: "1 hour",
          cost: 8,
          type: "culture",
        },
      ],
      accommodation: "Cinnamon Citadel Kandy (or similar)",
      meals: ["Breakfast at lodge", "Lunch: kottu roti in Dambulla", "Dinner: hotel"],
      transport: "Private van (~3.5 hrs total)",
      estimatedCost: 200,
    },
    {
      day: 3,
      date: "2025-03-03",
      location: "Kandy → Ella (Scenic Train)",
      title: "The World's Most Beautiful Train Ride",
      activities: [
        {
          id: "a3-1",
          name: "Kandy to Ella scenic train",
          description:
            "Ride the legendary colonial-era rail line through mist-covered tea estates and viaducts.",
          duration: "7 hours",
          cost: 3,
          type: "sightseeing",
        },
        {
          id: "a3-2",
          name: "Ella village walk",
          description:
            "Stroll the main street, browse local cafés, and take in the mountain air on arrival.",
          duration: "1 hour",
          cost: 0,
          type: "sightseeing",
        },
      ],
      accommodation: "98 Acres Resort & Spa (or similar hilltop guesthouse)",
      meals: [
        "Breakfast at hotel",
        "Lunch: packed snacks on train",
        "Dinner: rooftop restaurant in Ella",
      ],
      transport: "Scenic train from Kandy",
      estimatedCost: 120,
    },
    {
      day: 4,
      date: "2025-03-04",
      location: "Ella",
      title: "Hikes, Tea & the Nine Arch Bridge",
      activities: [
        {
          id: "a4-1",
          name: "Little Adam's Peak hike",
          description:
            "An easy 2km hike through tea estates to a 1141m peak with 360° hill-country views.",
          duration: "2.5 hours",
          cost: 0,
          type: "adventure",
        },
        {
          id: "a4-2",
          name: "Nine Arch Bridge",
          description:
            "Visit the iconic colonial stone viaduct — time your visit for when a train passes through.",
          duration: "1 hour",
          cost: 0,
          type: "sightseeing",
        },
        {
          id: "a4-3",
          name: "Tea factory tour",
          description:
            "Go behind the scenes at a working tea factory, learn the process from leaf to cup.",
          duration: "1.5 hours",
          cost: 6,
          type: "culture",
        },
        {
          id: "a4-4",
          name: "Ravana Falls",
          description:
            "A short detour to a dramatic 25m waterfall with mythological ties to the Ramayana.",
          duration: "45 min",
          cost: 0,
          type: "sightseeing",
        },
      ],
      accommodation: "98 Acres Resort & Spa (continued)",
      meals: [
        "Breakfast at hotel",
        "Lunch: hillside café",
        "Dinner: authentic Sri Lankan set meal",
      ],
      transport: "Tuk-tuks & walking",
      estimatedCost: 80,
    },
    {
      day: 5,
      date: "2025-03-05",
      location: "Ella → Yala National Park",
      title: "Into the Wild",
      activities: [
        {
          id: "a5-1",
          name: "Morning safari — Yala Block 1",
          description:
            "Jeep safari through the highest leopard-density habitat on Earth. Also spot elephants, sloth bears, and crocodiles.",
          duration: "4 hours",
          cost: 65,
          type: "wildlife",
        },
        {
          id: "a5-2",
          name: "Afternoon safari",
          description:
            "A second drive as animals become more active near waterholes before dusk.",
          duration: "3 hours",
          cost: 55,
          type: "wildlife",
        },
      ],
      accommodation: "Cinnamon Wild Yala (or tented eco-camp)",
      meals: [
        "Breakfast: early morning before safari",
        "Lunch: camp buffet",
        "Dinner: lodge BBQ",
      ],
      transport: "Private van (~3 hrs), then safari jeeps",
      estimatedCost: 280,
    },
    {
      day: 6,
      date: "2025-03-06",
      location: "Yala → Mirissa",
      title: "Beaches & Blue Whales",
      activities: [
        {
          id: "a6-1",
          name: "Whale watching boat trip",
          description:
            "Early morning departure to spot blue whales — the largest animals ever to exist on Earth.",
          duration: "4 hours",
          cost: 45,
          type: "wildlife",
        },
        {
          id: "a6-2",
          name: "Mirissa beach afternoon",
          description:
            "Relax on the crescent bay, swim in turquoise water, or try stand-up paddleboarding.",
          duration: "3 hours",
          cost: 10,
          type: "beach",
        },
        {
          id: "a6-3",
          name: "Parrot Rock sunset",
          description:
            "Climb the small rock at the end of the beach for the classic Sri Lanka sunset view.",
          duration: "1 hour",
          cost: 0,
          type: "sightseeing",
        },
      ],
      accommodation: "Mirissa Hills (or beachside boutique guesthouse)",
      meals: [
        "Breakfast: early (before whale watch)",
        "Lunch: beachside seafood",
        "Dinner: sunset restaurant",
      ],
      transport: "Private van (~2 hrs)",
      estimatedCost: 190,
    },
    {
      day: 7,
      date: "2025-03-07",
      location: "Mirissa → Galle → Colombo",
      title: "Galle Fort & Departure",
      activities: [
        {
          id: "a7-1",
          name: "Galle Fort morning walk",
          description:
            "Stroll the Dutch-colonial fortified city, browse boutique shops and art galleries.",
          duration: "2.5 hours",
          cost: 0,
          type: "sightseeing",
        },
        {
          id: "a7-2",
          name: "Rampart walk & lighthouse",
          description:
            "Walk the coral-stone ramparts with ocean views on both sides — the best free activity in Sri Lanka.",
          duration: "1 hour",
          cost: 0,
          type: "sightseeing",
        },
        {
          id: "a7-3",
          name: "Departure to Colombo",
          description: "Coastal expressway back to Colombo for your flight home.",
          duration: "2 hours",
          cost: 0,
          type: "sightseeing",
        },
      ],
      accommodation: "N/A — departure day",
      meals: ["Breakfast at guesthouse", "Lunch: Galle fort café", ""],
      transport: "Private van to Galle, then Colombo (~4 hrs total)",
      estimatedCost: 100,
    },
  ],
  budget: {
    accommodation: 630,
    food: 210,
    transport: 260,
    activities: 260,
    miscellaneous: 80,
    total: 1440,
  },
};
