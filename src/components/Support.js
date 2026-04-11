import React, { useState, useEffect } from 'react';
import { Container, Typography, TextField, Card, CardContent, IconButton, Box } from '@mui/material';
import { Search, ArrowForward, ArrowBack, ArrowForward as ArrowForwardIcon } from '@mui/icons-material';
import './Support.css';

const Support = () => {
    const [currentSlide, setCurrentSlide] = useState(0);

    const carouselItems = [
        {
            image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2073&q=80",
            title: "Welcome to Support"
        },
        {
            image: "https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
            title: "How Can We Help You?"
        },
        {
            image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2074&q=80",
            title: "24/7 Customer Support"
        }
    ];

    const totalSlides = carouselItems.length;

    const commonQueries = [
        {
            title: "How to cancel your flight booking",
            content: "To cancel your flight booking, log in to your account, go to 'My Bookings', select the booking you wish to cancel, and click on the 'Cancel Booking' button. Follow the prompts to complete the cancellation process."
        },
        {
            title: "Refund process on the cancellation of booking",
            content: "Refunds are processed within 5-7 business days after cancellation. The amount refunded depends on the fare type and how close to the departure date you cancel. Refunds are credited back to the original payment method."
        },
        {
            title: "Why am I not receiving confirmation emails",
            content: "If you're not receiving confirmation emails, first check your spam folder. Verify that your email address was entered correctly during booking. If issues persist, contact our support team with your booking reference."
        },
        {
            title: "What should I do if I encounter an error during booking",
            content: "If you encounter an error during booking, try clearing your browser cache and cookies, then attempt the booking again. If the problem continues, take a screenshot of the error and contact our support team."
        },
        {
            title: "How do I file a complaint or provide feedback",
            content: "To file a complaint or provide feedback, use our 'Contact Us' form, email us at support@flightapp.com, or call our customer service. Please include your booking reference (if applicable) and any relevant details."
        }
    ];

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prevSlide) => 
                prevSlide === totalSlides - 1 ? 0 : prevSlide + 1
            );
        }, 5000);

        return () => clearInterval(timer);
    }, [totalSlides]);

    const handlePrevSlide = () => {
        setCurrentSlide((prevSlide) => 
            prevSlide === 0 ? totalSlides - 1 : prevSlide - 1
        );
    };

    const handleNextSlide = () => {
        setCurrentSlide((prevSlide) => 
            prevSlide === totalSlides - 1 ? 0 : prevSlide + 1
        );
    };

    return (
        <div className="support-container">
            <div className="support-carousel">
                <div
                    className="carousel-item"
                    style={{ backgroundImage: `url(${carouselItems[currentSlide].image})` }}
                >
                    <div className="carousel-content">
                        <Typography variant="h2" className="carousel-title">
                            {carouselItems[currentSlide].title}
                        </Typography>
                        <div className="search-container">
                            <TextField
                                fullWidth
                                variant="outlined"
                                placeholder="Search your query"
                                InputProps={{
                                    endAdornment: (
                                        <IconButton>
                                            <Search />
                                        </IconButton>
                                    ),
                                    className: "search-input"
                                }}
                            />
                        </div>
                    </div>
                    <Box className="carousel-controls">
                        <IconButton onClick={handlePrevSlide} className="carousel-control-btn">
                            <ArrowBack />
                        </IconButton>
                        <IconButton onClick={handleNextSlide} className="carousel-control-btn">
                            <ArrowForward />
                        </IconButton>
                    </Box>
                </div>
            </div>

            <Container maxWidth="lg" className="queries-section">
                <Typography variant="h4" className="section-title">
                    Common Queries
                </Typography>
                <div className="queries-grid">
                    {commonQueries.map((query, index) => (
                        <Card key={index} className="query-card">
                            <CardContent>
                                <Typography variant="h6" className="query-title">
                                    {query.title}
                                </Typography>
                                <Typography variant="body1" className="query-content">
                                    {query.content}
                                </Typography>
                                <IconButton className="read-more">
                                    <ArrowForwardIcon />
                                </IconButton>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </Container>
        </div>
    );
};

export default Support; 
