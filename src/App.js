import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './header';
import Footer from './footer';
import Home from './components/Home';
import Flights from './components/Flights';
import Hotels from './components/Hotels';
import Support from './components/Support';
import MyBookings from './components/MyBookings';
import AboutUs from './components/AboutUs';
import AdminDashboard from './components/AdminDashboard';
import TripPackageDetails from './components/TripPackageDetails';
import './App.css';

function App() {
    return (
        <Router>
            <div className="App">
                <Header />
                <main className="main-content">
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/flights" element={<Flights />} />
                        <Route path="/hotels" element={<Hotels />} />
                        <Route path="/support" element={<Support />} />
                        <Route path="/my-bookings" element={<MyBookings />} />
                        <Route path="/admin" element={<AdminDashboard />} />
                        <Route path="/about" element={<AboutUs />} />
                        <Route path="/trip-packages/:slug" element={<TripPackageDetails />} />
                    </Routes>
                </main>
                <Footer />
            </div>
        </Router>
    );
}

export default App;
