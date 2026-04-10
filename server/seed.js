const bcrypt = require("bcryptjs");
const { connectDb } = require("./db");
const User = require("./models/User");
const Airline = require("./models/Airline");
const Flight = require("./models/Flight");
const Hotel = require("./models/Hotel");
const HotelRoom = require("./models/HotelRoom");
const AirbnbListing = require("./models/AirbnbListing");
const { CITY_AIRPORTS } = require("./data/constants");

async function seedAdmin() {
  const email = "sid@gmail.com";
  const existing = await User.findOne({ email });
  const hashed = await bcrypt.hash("sidkadam", 10);
  if (existing) {
    existing.password = hashed;
    existing.role = "admin";
    existing.name = existing.name || "Sid Admin";
    await existing.save();
    return existing;
  }
  return User.create({
    name: "Sid Admin",
    email,
    password: hashed,
    role: "admin",
  });
}

async function seedAirlines() {
  const base = [
    {
      name: "Emirates",
      logo: "/airlinesandhotels/emirates.svg",
    },
    {
      name: "Etihad Airways",
      logo: "/airlinesandhotels/etihadairways.svg",
    },
    {
      name: "Qatar Airways",
      logo: "/airlinesandhotels/qatarairways.svg",
    },
    {
      name: "Singapore Airlines",
      logo: "/airlinesandhotels/singaporeairlines.svg",
    },
    {
      name: "Lufthansa",
      logo: "/airlinesandhotels/lufthansa.svg",
    },
    {
      name: "British Airways",
      logo: "/airlinesandhotels/britishairways.svg",
    },
    {
      name: "IndiGo",
      logo: "/airlinesandhotels/indigo.svg",
    },
  ];
  const out = [];
  for (const item of base) {
    const airline = await Airline.findOneAndUpdate(
      { name: item.name },
      { name: item.name, logo: item.logo, activeStatus: true },
      { upsert: true, new: true }
    );
    out.push(airline);
  }
  return out;
}

async function seedFlights(airlines) {
  const byName = new Map(airlines.map((airline) => [airline.name, airline]));
  const flights = [
    {
      flightNumber: "EK419",
      fromCity: "Mumbai",
      toCity: "Dubai",
      airlineId: byName.get("Emirates")._id,
      departureTime: "10:30",
      arrivalTime: "12:30",
      duration: "2h 00m",
      basePrice: 35999,
    },
    {
      flightNumber: "EY212",
      fromCity: "Mumbai",
      toCity: "Singapore",
      airlineId: byName.get("Etihad Airways")._id,
      departureTime: "08:15",
      arrivalTime: "16:10",
      duration: "5h 25m",
      basePrice: 42999,
    },
    {
      flightNumber: "QR321",
      fromCity: "Paris",
      toCity: "Madrid",
      airlineId: byName.get("Qatar Airways")._id,
      departureTime: "13:00",
      arrivalTime: "15:10",
      duration: "2h 10m",
      basePrice: 22999,
    },
    {
      flightNumber: "SQ944",
      fromCity: "Singapore",
      toCity: "Bali",
      airlineId: byName.get("Singapore Airlines")._id,
      departureTime: "09:00",
      arrivalTime: "11:35",
      duration: "2h 35m",
      basePrice: 18999,
    },
    {
      flightNumber: "6E701",
      fromCity: "Mumbai",
      toCity: "Dubai",
      airlineId: byName.get("IndiGo")._id,
      departureTime: "05:55",
      arrivalTime: "09:15",
      duration: "3h 20m",
      basePrice: 38999,
    },
    {
      flightNumber: "6E702",
      fromCity: "Mumbai",
      toCity: "Jaipur",
      airlineId: byName.get("IndiGo")._id,
      departureTime: "18:10",
      arrivalTime: "20:00",
      duration: "1h 50m",
      basePrice: 10999,
    },
  ];
  for (const flight of flights) {
    await Flight.findOneAndUpdate(
      { flightNumber: flight.flightNumber },
      {
        ...flight,
        airportCodes: {
          from: CITY_AIRPORTS[flight.fromCity],
          to: CITY_AIRPORTS[flight.toCity],
        },
      },
      { upsert: true, new: true }
    );
  }
}

async function seedHotelsAndAirbnb() {
  const hotels = [
    {
      name: "Marina Bay Sands",
      location: "Singapore",
      description: "Luxury hotel with iconic infinity pool",
      image:
        "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/1b/4e/9b/11/exterior.jpg",
      amenities: ["Pool", "Spa", "City View"],
    },
    {
      name: "The Balmoral Hotel",
      location: "Edinburgh, Scotland",
      description: "Iconic luxury hotel with Edinburgh Castle views",
      image: "https://www.clipdrape.com/wp-content/uploads/2024/11/Balmoral-large.jpg",
      amenities: ["Restaurant", "Bar", "Gym"],
    },
  ];
  for (const hotel of hotels) {
    const created = await Hotel.findOneAndUpdate({ name: hotel.name }, hotel, {
      upsert: true,
      new: true,
    });
    const tiers = [
      { tierName: "Standard", price: 14999, capacity: 2, amenities: ["WiFi"], availability: 30 },
      { tierName: "Deluxe", price: 21999, capacity: 3, amenities: ["WiFi", "Breakfast"], availability: 20 },
      { tierName: "Executive", price: 29999, capacity: 3, amenities: ["WiFi", "Breakfast", "Lounge"], availability: 10 },
      { tierName: "Suite", price: 42999, capacity: 4, amenities: ["WiFi", "Breakfast", "Lounge", "Butler"], availability: 5 },
    ];
    for (const tier of tiers) {
      await HotelRoom.findOneAndUpdate(
        { hotelId: created._id, tierName: tier.tierName },
        { ...tier, hotelId: created._id },
        { upsert: true, new: true }
      );
    }
  }

  const listings = [
    {
      name: "Luxury Harbor Apartment",
      location: "Monaco",
      price: 65999,
      availability: 7,
      description: "Premium apartment overlooking harbor",
      image: "https://tse1.mm.bing.net/th?id=OIP.EK8yTbDABwC8O10qbfn0UwHaE7&pid=Api&P=0&h=180",
    },
    {
      name: "Ocean View Villa in Onna",
      location: "Okinawa, Japan",
      price: 28999,
      availability: 9,
      description: "Modern villa with private pool",
      image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQAEqsS8aR1oykJOnhzZW_eYqTJJhhWTKp75g&s",
    },
  ];
  for (const listing of listings) {
    await AirbnbListing.findOneAndUpdate({ name: listing.name }, listing, {
      upsert: true,
      new: true,
    });
  }
}

async function runSeed() {
  await connectDb();
  await seedAdmin();
  const airlines = await seedAirlines();
  await seedFlights(airlines);
  await seedHotelsAndAirbnb();
  process.exit(0);
}

runSeed().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});
