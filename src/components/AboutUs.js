import React from 'react';
import { Container, Typography, Grid, Paper, Chip, Stack, Divider, Button } from '@mui/material';
import './AboutUs.css';
import { api } from '../api';
import { AIRLINE_LOGOS, logoForAirline } from '../constants/airlineLogos';

const fallbackAirlines = Object.entries(AIRLINE_LOGOS).map(([name, logo]) => ({ name, logo }));

const AboutUs = () => {
    const [airlines, setAirlines] = React.useState([]);

    React.useEffect(() => {
        api.get('/meta/airlines').then((res) => {
            const incoming = (res.airlines || []).map((airline) => ({
                ...airline,
                logo: airline.logo || logoForAirline(airline.name)
            }));
            if (!incoming.length) {
                setAirlines(fallbackAirlines);
                return;
            }
            const existing = new Set(incoming.map((a) => a.name));
            const merged = [
                ...incoming,
                ...fallbackAirlines.filter((a) => !existing.has(a.name))
            ];
            setAirlines(merged);
        }).catch(() => {
            setAirlines(fallbackAirlines);
        });
    }, []);

    const hotels = [
        { name: 'The Ritz-Carlton', logo: 'https://1000logos.net/wp-content/uploads/2020/02/Ritz-Carlton-Logo-1965.png' },
        { name: 'Four Seasons', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/a/a1/Four_Seasons_logo.svg/1200px-Four_Seasons_logo.svg.png' },
        { name: 'Waldorf Astoria', logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTyO_NMyQyvbwWwaH2yGMMAUOkl_JnIavWcTw&s' },
        { name: 'Mandarin Oriental', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/be/Mandarin_Oriental_Hotel_Group_logo.svg/1200px-Mandarin_Oriental_Hotel_Group_logo.svg.png' },
        { name: 'St. Regis', logo: 'https://i.pinimg.com/736x/aa/86/90/aa8690662cd2a0886fe13319c837a032.jpg' },
        { name: 'Peninsula Hotels', logo: 'https://www.cathaypacific.com/content/dam/cx/mpo/Frequent-Flyers/The-Marco-Polo-Club/Partners/Partner-details/the-peninsula-hotels/1.Pen-Hotels-(Black)_bkg%20removed.png' }
    ];

    return (
        <div className="about-us-container py-6 md:py-10">
            <Container maxWidth="lg">
                <div className="about-content">
                    <Typography variant="h2" className="main-title" gutterBottom>
                        About Us
                    </Typography>
                    <Stack direction="row" spacing={1} className="mb-4">
                        <Chip size="small" label="Trusted Partners" />
                        <Chip size="small" label="Global Coverage" />
                    </Stack>
                    
                    <Paper elevation={3} className="mission-section rounded-2xl">
                        <Typography variant="h4" gutterBottom>
                            Our Mission
                        </Typography>
                        <Typography variant="body1" paragraph>
                            We strive to revolutionize the travel industry by providing seamless, luxurious, and memorable experiences for our customers. Our platform connects you with the world's leading airlines and prestigious hotels, ensuring your journey is nothing short of extraordinary.
                        </Typography>
                    </Paper>

                    <Paper elevation={2} className="partners-section rounded-2xl">
                        <Typography variant="h4" gutterBottom>
                            Our Airline Partners
                        </Typography>
                        <Divider className="mb-4" />
                        <Grid container spacing={4} className="partner-logos">
                            {airlines.map((airline, index) => (
                                <Grid item xs={6} sm={4} md={2} key={airline._id || index}>
                                    <Paper elevation={2} className="logo-container rounded-xl">
                                        <img src={airline.logo || logoForAirline(airline.name) || 'https://via.placeholder.com/120x60?text=Airline'} alt={airline.name} />
                                    </Paper>
                                </Grid>
                            ))}
                        </Grid>

                        <Typography variant="h4" gutterBottom className="hotel-partners-title">
                            Our Hotel Partners
                        </Typography>
                        <Grid container spacing={4} className="partner-logos">
                            {hotels.map((hotel, index) => (
                                <Grid item xs={6} sm={4} md={2} key={index}>
                                    <Paper elevation={2} className="logo-container rounded-xl">
                                        <img src={hotel.logo} alt={hotel.name} />
                                    </Paper>
                                </Grid>
                            ))}
                        </Grid>
                    </Paper>

                    <Paper elevation={3} className="creator-section rounded-2xl">
                        <Typography variant="h5" gutterBottom>
                            Created By
                        </Typography>
                        <Typography variant="h4" className="creator-name">
                            Siddhesh Anand Kadam
                        </Typography>
                        <Typography variant="body1">
                            Bringing innovation to travel technology
                        </Typography>
                        <Stack
                            direction={{ xs: 'column', sm: 'row' }}
                            spacing={2}
                            justifyContent="center"
                            alignItems="center"
                            className="creator-links"
                        >
                            <Button
                                component="a"
                                href="https://github.com/Sidyaa10"
                                target="_blank"
                                rel="noreferrer"
                                variant="contained"
                                className="creator-link-btn"
                            >
                                Sid Github
                            </Button>
                            <Button
                                component="a"
                                href="https://www.linkedin.com/in/siddhesh-kadam-5b0961367/"
                                target="_blank"
                                rel="noreferrer"
                                variant="contained"
                                className="creator-link-btn"
                            >
                                Sid LinkedIn
                            </Button>
                            <Button
                                component="a"
                                href="https://sid-kadam.vercel.app/"
                                target="_blank"
                                rel="noreferrer"
                                variant="contained"
                                className="creator-link-btn"
                            >
                                Sid Portfolio
                            </Button>
                        </Stack>
                    </Paper>
                </div>
            </Container>
        </div>
    );
};

export default AboutUs; 
