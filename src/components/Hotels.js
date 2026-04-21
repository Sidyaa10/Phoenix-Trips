import React, { useMemo, useState, useEffect } from "react";
import "./Hotels.css";
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Grid,
  Rating,
  ToggleButton,
  ToggleButtonGroup,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Skeleton,
  Chip,
} from "@mui/material";
import { LocalOffer, FamilyRestroom, Favorite, Hotel, Apartment, LocationOn, Bed, CalendarMonth } from "@mui/icons-material";
import { api } from "../api";
import { useAuth } from "../context/AuthContext";
import SectionHeader from "./ui/SectionHeader";
import StatusBadge from "./ui/StatusBadge";

const makeRoomTiers = (basePrice) => [
  { tierName: "Standard", price: basePrice, capacity: 2, availability: 20 },
  { tierName: "Deluxe", price: basePrice + 5000, capacity: 2, availability: 14 },
  { tierName: "Executive", price: basePrice + 10000, capacity: 3, availability: 8 },
  { tierName: "Suite", price: basePrice + 18000, capacity: 4, availability: 5 },
];

const discountLabel = {
  website: "Website Deal",
  family: "Family Deal",
  couples: "Couples Deal",
};

const forcedStayImages = {
  "Hotel de Paris Monte-Carlo": "/hotel-images/hotel-de-paris-monte-carlo.jpg",
  "Ocean View Villa in Onna": "/hotel-images/ocean-view-villa-onna.jpg",
  "Luxury Harbor Apartment": "https://static1.mansionglobal.com/production/media/article-images/50e99bc7b0c10bbcb84950e30f4bfeb9/large_Photo-25.jpg",
  "Luxury Harbor View Apartment": "https://static1.mansionglobal.com/production/media/article-images/50e99bc7b0c10bbcb84950e30f4bfeb9/large_Photo-25.jpg",
};

const fallbackStays = [
  { id: "sg-h1", type: "hotel", name: "Marina Bay Sands", location: "Singapore", price: "32,999", rating: 5, discount: true, discountPrice: "24,799", discountType: "website", description: "Luxury hotel with iconic infinity pool", image: "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/1b/4e/9b/11/exterior.jpg" },
  { id: "sg-a1", type: "airbnb", name: "Marina Bay Luxury Apartment", location: "Singapore", price: "28,999", rating: 5, discount: true, discountPrice: "21,749", discountType: "family", description: "Stunning apartment with bay views", image: "https://sg.tepcdn.com/public/usr/1r40hw/525730-BLD-MARINA-BAY-RESIDENCES-SUPER-PENTHOUSE-04-SIC.JPG" },
  { id: "hw-h1", type: "hotel", name: "Halekulani Hotel", location: "Hawaii, USA", price: "45,999", rating: 5, discount: true, discountPrice: "34,499", discountType: "couples", description: "Beachfront luxury with ocean views", image: "https://75580cde83d35dc00a05-20f670a5827f41ce9e85089eb012f48c.ssl.cf1.rackcdn.com/Halekulani_final.jpg" },
  { id: "hw-a1", type: "airbnb", name: "Luxury Beachfront Villa", location: "Hawaii, USA", price: "65,999", rating: 5, discount: true, discountPrice: "49,499", discountType: "family", description: "Private villa with direct beach access", image: "https://domainedaily.com/wp-content/uploads/2021/02/Best-Airbnb-Hawaii-Vacation-Rental-Aolani-House-6-1024x768.jpg" },
  { id: "wl-h1", type: "hotel", name: "InterContinental Wellington", location: "Wellington, New Zealand", price: "28,999", rating: 5, discount: true, discountPrice: "21,749", discountType: "couples", description: "Premium city center accommodation", image: "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/1b/89/3e/32/exterior.jpg?w=900&h=-1&s=1" },
  { id: "wl-a1", type: "airbnb", name: "Luxury Harbor View Apartment", location: "Wellington, New Zealand", price: "22,999", rating: 5, discount: true, discountPrice: "17,249", discountType: "family", description: "Stunning apartment with panoramic harbor views", image: "https://static1.mansionglobal.com/production/media/article-images/50e99bc7b0c10bbcb84950e30f4bfeb9/large_Photo-25.jpg" },
  { id: "mb-h1", type: "hotel", name: "Crown Towers Melbourne", location: "Melbourne, Australia", price: "42,999", rating: 5, discount: true, discountPrice: "32,249", discountType: "website", description: "Luxury hotel with city views", image: "https://images-cdn.qantashotels.com/insecure/xlarge/plain/media/05894886-4449-439b-94da-b37bd745aa49.jpg" },
  { id: "mb-a1", type: "airbnb", name: "Luxury Docklands Apartment", location: "Melbourne, Australia", price: "32,999", rating: 5, discount: true, discountPrice: "24,749", discountType: "family", description: "Modern apartment with harbor views", image: "https://www.melbourneprivateapartments.com.au/wp-content/uploads/2022/05/Docklands-Luxury-Penthouse-apartment-melbourne-1020x730.jpg" },
  { id: "jd-h1", type: "hotel", name: "The Hotel Galleria Jeddah", location: "Jeddah, Saudi Arabia", price: "29,999", rating: 5, discount: true, discountPrice: "22,499", discountType: "website", description: "Modern luxury in central Jeddah", image: "https://www.hoteliermiddleeast.com/cloud/2024/03/22/The-Hotel-Galleria-Jeddah-2.jpg" },
  { id: "jd-a1", type: "airbnb", name: "Corniche Luxury Flat", location: "Jeddah, Saudi Arabia", price: "15,999", rating: 4, discount: true, discountPrice: "12,499", discountType: "couples", description: "Spacious modern flat near Corniche", image: "https://destinationksa.com/wp-content/uploads/2025/06/shutterstock_2515403615-scaled.jpg" },
  { id: "db-h1", type: "hotel", name: "Atlantis The Palm", location: "Dubai, UAE", price: "54,999", rating: 5, discount: true, discountPrice: "42,999", discountType: "family", description: "Iconic luxury resort on Palm Jumeirah", image: "https://vistapointe.net/images/atlantis-the-palm-wallpaper-18.jpg" },
  { id: "db-a1", type: "airbnb", name: "Downtown Skyline Apartment", location: "Dubai, UAE", price: "24,999", rating: 4, discount: true, discountPrice: "18,999", discountType: "website", description: "Stylish apartment near Dubai Mall", image: "https://wallpaperaccess.com/full/1136715.jpg" },
  { id: "np-h1", type: "hotel", name: "Romeo Hotel", location: "Napoli, Italy", price: "35,999", rating: 5, discount: true, discountPrice: "29,999", discountType: "website", description: "Contemporary luxury with Vesuvius views", image: "https://cf.bstatic.com/xdata/images/hotel/max1024x768/600138726.jpg?k=635aab0d110ff2bdfdf7cb26b008899678ae5ffdc2cb5a3a0e93cc8090240fdc&o=&hp=1" },
  { id: "np-a1", type: "airbnb", name: "Chiaia Luxury Apartment", location: "Napoli, Italy", price: "15,999", rating: 4, discount: true, discountPrice: "12,999", discountType: "family", description: "Elegant apartment in shopping district", image: "https://img.jamesedition.com/listing_images/2025/02/05/11/45/30/7cb84df2-f204-4310-88b4-6b885e069f49/je/1040x620xc.jpg" },
  { id: "nc-h1", type: "hotel", name: "Hyatt Regency Nice Palais", location: "Nice, France", price: "42,999", rating: 5, discount: true, discountPrice: "35,999", discountType: "website", description: "Luxury hotel with Mediterranean views", image: "https://nicecitymag.fr/wp-content/uploads/2025/01/hyatt-regency-nice-palais-de-la-mediterranee-luxe-et-confort-au-cur-de-la-ville.jpg" },
  { id: "nc-a1", type: "airbnb", name: "Promenade des Anglais Apartment", location: "Nice, France", price: "18,999", rating: 4, discount: true, discountPrice: "15,999", discountType: "website", description: "Beachfront apartment with sea views", image: "https://a0.muscache.com/im/pictures/68b5a8e3-7263-40f3-8e1d-2a53687d5606.jpg?im_w=720&im_format=avif" },
  { id: "pr-h1", type: "hotel", name: "Four Seasons Hotel George V", location: "Paris, France", price: "75,999", rating: 5, discount: true, discountPrice: "56,999", discountType: "couples", description: "Iconic luxury near Champs-Elysees", image: "https://pariscapitale.com/wp-content/uploads/2015/10/fshgv-marble-courtyard-%C2%A9black-alpaga-18-e1444228778933.jpg" },
  { id: "pr-a1", type: "airbnb", name: "Eiffel View Apartment", location: "Paris, France", price: "45,999", rating: 5, discount: true, discountPrice: "34,499", discountType: "family", description: "Luxury apartment with Eiffel Tower view", image: "https://shershegoes.com/wp-content/uploads/paris-apartment-with-balcony-and-eiffel-tower-view.jpg" },
  { id: "bl-h1", type: "hotel", name: "The Seminyak Beach Resort", location: "Bali, Indonesia", price: "28,999", rating: 5, discount: true, discountPrice: "21,999", discountType: "couples", description: "Beachfront luxury with sunset views", image: "https://wallpaperaccess.com/full/6673527.jpg" },
  { id: "bl-a1", type: "airbnb", name: "Canggu Private Villa", location: "Bali, Indonesia", price: "19,999", rating: 4, discount: true, discountPrice: "14,999", discountType: "family", description: "Private pool villa near beach clubs", image: "https://storage.googleapis.com/theluxenomad-python.appspot.com/uploads/hotels/h36468/VillaKapungkur_Bali_01_Pool_-_Villa_Kapungkur_-_Bali_-_Indonesia.jpg" },
  { id: "jj-h1", type: "hotel", name: "Lotte Hotel Jeju", location: "Jeju-do, South Korea", price: "35,999", rating: 5, discount: true, discountPrice: "26,999", discountType: "website", description: "Luxury resort with ocean views", image: "https://img.lottehotel.com/cms/asset/2025/01/31/1147/4502-02-2000-fac-LTJE.webp" },
  { id: "jj-a1", type: "airbnb", name: "Traditional Jeju House", location: "Jeju-do, South Korea", price: "18,999", rating: 4, discount: false, discountType: "website", description: "Authentic Jeju style accommodation", image: "https://tse3.mm.bing.net/th?id=OIP.WRmK5qM32RQ-VUgCOCPW7AHaE7&pid=Api&P=0&h=180" },
  { id: "jp-h1", type: "hotel", name: "Rambagh Palace", location: "Jaipur, India", price: "29,999", rating: 5, discount: true, discountPrice: "22,999", discountType: "couples", description: "Royal palace hotel experience", image: "https://www.tata.com/content/dam/tata/images/newsroom/business/desktop/heritage-places-rambagh_slideshow1_desktop_1920x1080.jpg" },
  { id: "jp-a1", type: "airbnb", name: "Jaipur Heritage Haveli", location: "Jaipur, India", price: "12,999", rating: 4, discount: true, discountPrice: "9,999", discountType: "family", description: "Traditional haveli stay with modern comfort", image: "https://www.bandbaajabarat.com/images/postgallery/1672992707maxresdefault.jpg" },
  { id: "md-h1", type: "hotel", name: "Hotel Ritz Madrid", location: "Madrid, Spain", price: "49,999", rating: 5, discount: true, discountPrice: "37,499", discountType: "couples", description: "Legendary luxury near landmarks", image: "https://hotel-ritz-madrid.hotel-ds.com/data/Photos/OriginalPhoto/9868/986898/986898649.JPEG" },
  { id: "md-a1", type: "airbnb", name: "Gran Via Skyline Apartment", location: "Madrid, Spain", price: "26,999", rating: 4, discount: true, discountPrice: "20,999", discountType: "website", description: "Modern apartment in city center", image: "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/22/56/6f/02/terrace-bed-duplex.jpg?w=700&h=-1&s=1" },
  { id: "ed-h1", type: "hotel", name: "The Balmoral Hotel", location: "Edinburgh, Scotland", price: "45,999", rating: 5, discount: true, discountPrice: "34,499", discountType: "website", description: "Iconic luxury hotel with castle views", image: "https://www.clipdrape.com/wp-content/uploads/2024/11/Balmoral-large.jpg" },
  { id: "ed-a1", type: "airbnb", name: "Royal Mile Luxury Apartment", location: "Edinburgh, Scotland", price: "28,999", rating: 5, discount: true, discountPrice: "21,749", discountType: "family", description: "Elegant apartment in historic Royal Mile", image: "https://a0.muscache.com/im/pictures/prohost-api/Hosting-675014558813595314/original/4cbf34e4-7c06-4cc8-adce-80be371f80f9.jpeg?im_w=720&im_format=avif" },
  { id: "mf-h1", type: "hotel", name: "Belmond Reid's Palace", location: "Madeira, Portugal", price: "48,999", rating: 5, discount: true, discountPrice: "36,999", discountType: "couples", description: "Historic clifftop luxury resort", image: "https://img.belmond.com/f_auto/t_3600x2025/photos/rds/rds-gst-pool04.jpg" },
  { id: "mf-a1", type: "airbnb", name: "Ocean View Villa", location: "Madeira, Portugal", price: "42,999", rating: 5, discount: true, discountPrice: "32,249", discountType: "family", description: "Luxury villa with infinity pool", image: "https://tse4.mm.bing.net/th?id=OIP.rQI5Yyv8EEuRdjq2HzjkAQHaE7&pid=Api&P=0&h=180" },
  { id: "my-h1", type: "hotel", name: "Cavo Tagoo Mykonos", location: "Mykono, Greece", price: "67,999", rating: 5, discount: true, discountPrice: "52,999", discountType: "couples", description: "Iconic cliffside luxury in Mykonos", image: "https://www.travelplusstyle.com/wp-content/gallery/cavo-tagoo-mykonos-cyclades-greece/02193148-cavo-tagoo_cover_2000x1335.jpg" },
  { id: "my-a1", type: "airbnb", name: "Mykono Windmill Villa", location: "Mykono, Greece", price: "35,999", rating: 4, discount: true, discountPrice: "27,499", discountType: "family", description: "Traditional Cycladic villa", image: "https://cdn.wallpapersafari.com/10/39/VOhxwz.jpg" },
  { id: "mi-h1", type: "hotel", name: "Four Seasons Hotel Milano", location: "Milan, Italy", price: "58,999", rating: 5, discount: true, discountPrice: "44,249", discountType: "couples", description: "Luxury hotel in historic monastery building", image: "https://rfp.selecthotelsresorts.com/hotels/96000.jpg" },
  { id: "mi-a1", type: "airbnb", name: "Duomo View Apartment", location: "Milan, Italy", price: "35,999", rating: 5, discount: true, discountPrice: "26,999", discountType: "family", description: "Luxury apartment overlooking Duomo", image: "https://x3jh6o6w.cdn.imgeng.in/assets/uploads/Starhotels-Collezione/Rosa_Grand/duomo-luxury-apartments/duomo-luxury-apartments-mi-penthouse-duplex-duomo-view-4-duplicate.jpg?imgeng=/w_1440?v2" },
  { id: "mc-h1", type: "hotel", name: "Hotel de Paris Monte-Carlo", location: "Monaco", price: "95,999", rating: 5, discount: true, discountPrice: "71,999", discountType: "website", description: "Legendary luxury in Monte Carlo", image: "/hotel-images/hotel-de-paris-monte-carlo.jpg" },
  { id: "mc-a1", type: "airbnb", name: "Monte Carlo Penthouse", location: "Monaco", price: "82,999", rating: 5, discount: true, discountPrice: "62,249", discountType: "couples", description: "Luxurious penthouse with casino views", image: "https://blogs-images.forbes.com/guymartin/files/2016/10/tour-odeon_renderings_penthouse-aerial-view-2-1940x1455.jpg" },
  { id: "ok-h1", type: "hotel", name: "The Ritz-Carlton Okinawa", location: "Okinawa, Japan", price: "52,999", rating: 5, discount: true, discountPrice: "44,999", discountType: "website", description: "Luxury resort with golf and spa", image: "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/2e/60/37/c5/exterior.jpg?w=700&h=-1&s=1" },
  { id: "ok-a1", type: "airbnb", name: "Ocean View Villa in Onna", location: "Okinawa, Japan", price: "28,999", rating: 4, discount: true, discountPrice: "24,999", discountType: "website", description: "Modern villa with private pool and views", image: "/hotel-images/ocean-view-villa-onna.jpg" }
];

const Hotels = () => {
  const { isAuthenticated, openAuthDialog } = useAuth();
  const [starFilter, setStarFilter] = useState(0);
  const [propertyType, setPropertyType] = useState("all");
  const [discountType, setDiscountType] = useState("all");
  const [regionFilter, setRegionFilter] = useState("all");
  const [hotels, setHotels] = useState([]);
  const [airbnbs, setAirbnbs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBookingItem, setSelectedBookingItem] = useState(null);
  const [selectedTier, setSelectedTier] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [nights, setNights] = useState(1);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    Promise.all([api.get("/stays/hotels"), api.get("/stays/airbnbs")])
      .then(([hotelRes, airbnbRes]) => {
        setHotels(hotelRes.hotels || []);
        setAirbnbs(airbnbRes.listings || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const getRegion = (location = "") => {
    const europe = ["Paris, France", "Nice, France", "Madrid, Spain", "Madeira, Portugal", "Monaco", "Milan, Italy", "Napoli, Italy", "Mykono, Greece", "Edinburgh, Scotland"];
    const asia = ["Singapore", "Jeju-do, South Korea", "Okinawa, Japan", "Jaipur, India", "Melbourne, Australia", "Wellington, New Zealand", "Jeddah, Saudi Arabia", "Dubai, UAE", "Bali, Indonesia"];
    if (europe.includes(location)) return "europe";
    if (asia.includes(location)) return "asia";
    return "row";
  };

  const merged = useMemo(() => {
    const hotelCards = hotels.map((h) => ({
      ...h,
      id: h.id,
      type: "hotel",
      rating: 5,
      price: String(h.roomTiers?.[0]?.price || 0),
      discount: false,
      discountType: "website",
      image: h.image,
      roomTiers: h.roomTiers && h.roomTiers.length ? h.roomTiers : makeRoomTiers(Number(h.price || 15000)),
    }));
    const airbnbCards = airbnbs.map((a) => ({
      ...a,
      id: a._id || a.id,
      type: "airbnb",
      rating: 4,
      price: String(a.price || 0),
      discount: false,
      discountType: "website",
      image: a.image,
    }));
    const dynamic = [...hotelCards, ...airbnbCards];
    const existing = new Set(dynamic.map((item) => `${item.type}:${item.name}`));
    const fallbackOnly = fallbackStays.filter((item) => !existing.has(`${item.type}:${item.name}`));
    return [...dynamic, ...fallbackOnly].map((item) => ({
      ...item,
      image: forcedStayImages[item.name] || item.image,
      roomTiers:
        item.type === "hotel"
          ? item.roomTiers || makeRoomTiers(Number(String(item.discountPrice || item.price).replace(/,/g, "")))
          : undefined,
    }));
  }, [hotels, airbnbs]);

  const filteredHotels = merged.filter((hotel) => {
    const matchesStar = starFilter === 0 || hotel.rating === starFilter;
    const matchesType = propertyType === "all" || hotel.type === propertyType;
    const matchesDiscount = discountType === "all" || hotel.discountType === discountType;
    const matchesRegion = regionFilter === "all" || getRegion(hotel.location) === regionFilter;
    return matchesStar && matchesType && matchesDiscount && matchesRegion;
  });

  const startBooking = (item) => {
    if (!isAuthenticated) {
      openAuthDialog();
      return;
    }
    setError("");
    setSelectedBookingItem(item);
    setSelectedTier(item.type === "hotel" ? item.roomTiers?.[0]?.tierName || "" : "");
    setSelectedDate("");
    setNights(1);
  };

  const submitBooking = async () => {
    if (!selectedBookingItem || !selectedDate) return;
    try {
      if (selectedBookingItem.type === "hotel") {
        await api.post("/bookings/hotel", {
          hotelId: selectedBookingItem.id,
          roomTier: selectedTier,
          date: selectedDate,
          hotelData: {
            name: selectedBookingItem.name,
            location: selectedBookingItem.location,
            description: selectedBookingItem.description,
            image: selectedBookingItem.image,
            roomTiers: selectedBookingItem.roomTiers,
          },
        });
      } else {
        await api.post("/bookings/airbnb", {
          listingId: selectedBookingItem.id,
          date: selectedDate,
          listingData: {
            name: selectedBookingItem.name,
            location: selectedBookingItem.location,
            description: selectedBookingItem.description,
            image: selectedBookingItem.image,
            price: selectedBookingItem.price,
            discountPrice: selectedBookingItem.discountPrice,
          },
        });
      }
      setSelectedBookingItem(null);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="hotels-container hotels-shell">
      <Container maxWidth="xl" className="py-8 md:py-10">
        <SectionHeader
          eyebrow="Stay Marketplace"
          title="Find your perfect stay with smarter visual rhythm."
          description="Your hotel filters remain exactly the same. We only upgraded the page shells, spacing, cards, and presentation so the page feels consistent with the improved Flights experience."
          className="mb-6"
        />

        <Box className="hotel-chip-row">
          <Chip size="small" label={`${filteredHotels.length} stays`} />
          <Chip size="small" label={propertyType === "all" ? "All property types" : propertyType} />
          <Chip size="small" label={discountType === "all" ? "All offers" : discountType} />
          <Chip size="small" label={regionFilter === "all" ? "All regions" : regionFilter} />
        </Box>

        <div className="filters-section hotel-filter-panel">
          <div className="star-filter hotel-filter-row">
            <Typography variant="subtitle1" className="filter-label">Star Rating</Typography>
            <Rating value={starFilter} onChange={(e, val) => setStarFilter(val || 0)} size="large" />
          </div>

          <div className="property-filter hotel-filter-row">
            <Typography variant="subtitle1" className="filter-label">Property Type</Typography>
            <ToggleButtonGroup value={propertyType} exclusive onChange={(_, v) => v !== null && setPropertyType(v)}>
              <ToggleButton value="all">All</ToggleButton>
              <ToggleButton value="hotel"><Hotel sx={{ mr: 1 }} /> Hotels</ToggleButton>
              <ToggleButton value="airbnb"><Apartment sx={{ mr: 1 }} /> Airbnb</ToggleButton>
            </ToggleButtonGroup>
          </div>

          <div className="discount-filter hotel-filter-row">
            <Typography variant="subtitle1" className="filter-label">Discount Type</Typography>
            <ToggleButtonGroup value={discountType} exclusive onChange={(_, v) => v !== null && setDiscountType(v)}>
              <ToggleButton value="all">All</ToggleButton>
              <ToggleButton value="website"><LocalOffer sx={{ mr: 1 }} /> Website</ToggleButton>
              <ToggleButton value="family"><FamilyRestroom sx={{ mr: 1 }} /> Family</ToggleButton>
              <ToggleButton value="couples"><Favorite sx={{ mr: 1 }} /> Couples</ToggleButton>
            </ToggleButtonGroup>
          </div>

          <div className="region-filter hotel-filter-row">
            <Typography variant="subtitle1" className="filter-label">Region</Typography>
            <ToggleButtonGroup value={regionFilter} exclusive onChange={(_, v) => v !== null && setRegionFilter(v)}>
              <ToggleButton value="all">All Regions</ToggleButton>
              <ToggleButton value="europe">Europe</ToggleButton>
              <ToggleButton value="asia">Asia-Pacific</ToggleButton>
              <ToggleButton value="row">Rest of World</ToggleButton>
            </ToggleButtonGroup>
          </div>
        </div>

        {error ? <Typography color="error" sx={{ mb: 2 }}>{error}</Typography> : null}

        {loading ? (
          <Grid container spacing={3}>
            {Array.from({ length: 6 }).map((_, index) => (
              <Grid item xs={12} sm={6} xl={4} key={`hotel-skeleton-${index}`}>
                <Skeleton variant="rounded" height={520} sx={{ borderRadius: "30px" }} />
              </Grid>
            ))}
          </Grid>
        ) : filteredHotels.length ? (
          <Grid container spacing={3}>
            {filteredHotels.map((hotel) => (
              <Grid item xs={12} sm={6} xl={4} key={hotel.id}>
                <Card className={`hotel-card ${hotel.type === "airbnb" ? "airbnb is-airbnb" : ""}`}>
                  <div className="hotel-image-wrap">
                    <div className="hotel-image" style={{ backgroundImage: `url(${hotel.image || ""})` }} />
                    {hotel.discount ? (
                      <div className="discount-label">{discountLabel[hotel.discountType]}</div>
                    ) : null}
                    <div className="property-type-tag">{hotel.type === "hotel" ? <Hotel /> : <Apartment />}</div>
                  </div>
                  <CardContent className="card-content hotel-card-content">
                    <Typography variant="h5" className="hotel-name">{hotel.name}</Typography>
                    <div className="hotel-location-row">
                      <LocationOn sx={{ fontSize: 16 }} />
                      <span>{hotel.location}</span>
                    </div>
                    <div className="hotel-rating-row">
                      <Rating value={hotel.rating} readOnly size="small" />
                      <Chip
                        size="small"
                        label={hotel.type === "hotel" ? "Hotel stay" : "Airbnb stay"}
                        sx={{ backgroundColor: "rgba(139,64,100,0.10)", color: "#8b4064", fontWeight: 600 }}
                      />
                    </div>
                    <Typography variant="body2" className="hotel-description">{hotel.description}</Typography>
                    <div className="hotel-mini-grid">
                      <div className="hotel-mini-item">
                        <Bed sx={{ fontSize: 16 }} />
                        <span>{hotel.type === "hotel" ? `${hotel.roomTiers?.length || 4} room tiers` : "Entire stay"}</span>
                      </div>
                      <div className="hotel-mini-item">
                        <CalendarMonth sx={{ fontSize: 16 }} />
                        <StatusBadge label="Pending" />
                      </div>
                    </div>
                    <div className="price-section hotel-price-section">
                      {hotel.discount ? (
                        <Typography variant="body1" className="original-price">INR {hotel.price}</Typography>
                      ) : null}
                      <Typography variant="h6" className="discounted-price">INR {hotel.discount && hotel.discountPrice ? hotel.discountPrice : hotel.price}</Typography>
                    </div>
                    <Button
                      variant="contained"
                      className="book-button"
                      onClick={() => startBooking(hotel)}
                    >
                      Book Now
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Box className="hotel-empty-state">
            <Typography variant="h5" sx={{ fontWeight: 700, color: "#4f2c2d", mb: 1 }}>
              No stays match these filters yet
            </Typography>
            <Typography sx={{ color: "#6f5a51", maxWidth: 640, mx: "auto" }}>
              Try switching the region, discount type, or property type to bring more hotel and Airbnb options back into view.
            </Typography>
          </Box>
        )}
      </Container>
      <Dialog
        open={Boolean(selectedBookingItem)}
        onClose={() => setSelectedBookingItem(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle className="booking-dialog-title">
          <div className="booking-title-main">Hotel Booking</div>
          <div className="booking-title-sub">Choose room, travel date and review total</div>
        </DialogTitle>
        <DialogContent sx={{ minWidth: 360, pt: "12px !important" }}>
          <Box className="booking-layout">
            <Box className="booking-left">
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
                {selectedBookingItem?.type === "hotel" ? "Select Room" : "Stay Details"}
              </Typography>

              {selectedBookingItem?.type === "hotel" ? (
                <Box className="room-list">
                  {(selectedBookingItem?.roomTiers || []).map((tier) => {
                    const active = selectedTier === tier.tierName;
                    return (
                      <Box
                        key={tier._id || tier.tierName}
                        className={`room-card ${active ? "active" : ""}`}
                        onClick={() => setSelectedTier(tier.tierName)}
                      >
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                            {tier.tierName}
                          </Typography>
                          <Typography variant="body2">
                            Room Size: {tier.capacity} guests
                          </Typography>
                          <Typography variant="caption" className="room-meta">
                            Free Cancellation | Breakfast | Wifi
                          </Typography>
                        </Box>
                        <Box sx={{ textAlign: "right" }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                            INR {tier.price}
                          </Typography>
                          <Typography variant="caption">{tier.availability} left</Typography>
                        </Box>
                      </Box>
                    );
                  })}
                </Box>
              ) : (
                <Box className="room-card active">
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      {selectedBookingItem?.name}
                    </Typography>
                    <Typography variant="body2">Entire stay | Base Price</Typography>
                    <Typography variant="caption" className="room-meta">
                      Flexible dates | Instant confirmation
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: "right" }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      INR {selectedBookingItem?.discountPrice || selectedBookingItem?.price}
                    </Typography>
                  </Box>
                </Box>
              )}
            </Box>

            <Box className="booking-right">
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
                Booking Summary
              </Typography>
              <TextField
                fullWidth
                margin="dense"
                label="Date"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                inputProps={{ min: new Date().toISOString().slice(0, 10) }}
              />
              <TextField
                fullWidth
                margin="dense"
                label="Nights"
                type="number"
                value={nights}
                onChange={(e) => setNights(Math.max(1, Number(e.target.value) || 1))}
                inputProps={{ min: 1 }}
              />
              <Box className="booking-total-box">
                <Typography variant="body2">Property</Typography>
                <Typography variant="subtitle2">{selectedBookingItem?.name}</Typography>
                <Typography variant="body2">Tier</Typography>
                <Typography variant="subtitle2">
                  {selectedBookingItem?.type === "hotel" ? selectedTier || "Select tier" : "Entire stay"}
                </Typography>
                <Typography variant="body2">Status</Typography>
                <Typography variant="subtitle2">Pending Admin Approval</Typography>
              </Box>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedBookingItem(null)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={submitBooking}
            disabled={!selectedDate || (selectedBookingItem?.type === "hotel" && !selectedTier)}
          >
            Submit (Pending Approval)
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Hotels;

