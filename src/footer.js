import React from 'react';
import './footer.css';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="footer-content">
                <div className="footer-section">
                    <h3>Contact Us</h3>
                    <p>Email: support@phoenixtrips.com</p>
                    <p>Phone: +1 (555) 123-4567</p>
                    <p>Address: 123 Aviation Plaza, Sky City, SC 12345</p>
                </div>

                <div className="footer-section">
                    <h3>Quick Links</h3>
                    <ul>
                        <li><a href="/about">About Us</a></li>
                        <li><a href="/terms">Terms & Conditions</a></li>
                        <li><a href="/privacy">Privacy Policy</a></li>
                        <li><a href="/faq">FAQs</a></li>
                    </ul>
                </div>

                <div className="footer-section">
                    <h3>Connect With Us</h3>
                    <div className="social-links">
                        <a href="https://instagram.com/" target="_blank" rel="noopener noreferrer" className="social-link">
                            <i className="fab fa-instagram"></i>
                        </a>
                        <a href="https://x.com/" target="_blank" rel="noopener noreferrer" className="social-link">
                            <i className="fab fa-x-twitter"></i>
                        </a>
                        <a href="https://facebook.com/" target="_blank" rel="noopener noreferrer" className="social-link">
                            <i className="fab fa-facebook"></i>
                        </a>
                        <a href="https://linkedin.com/company/" target="_blank" rel="noopener noreferrer" className="social-link">
                            <i className="fab fa-linkedin"></i>
                        </a>
                    </div>
                </div>
            </div>

            <div className="footer-bottom">
                <p>&copy; 2026 Phoenix Trips. All rights reserved.</p>
                <div className="payment-methods">
                    <i className="fab fa-cc-visa"></i>
                    <i className="fab fa-cc-mastercard"></i>
                    <i className="fab fa-cc-amex"></i>
                    <i className="fab fa-cc-paypal"></i>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
