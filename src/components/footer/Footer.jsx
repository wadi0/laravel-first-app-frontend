import React, { useState } from 'react';
import './footer.scss';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [subscribeStatus, setSubscribeStatus] = useState('Subscribe');

  const handleNewsletterSubmit = () => {
    if (email && email.includes('@')) {
      setSubscribeStatus('Subscribed!');
      setEmail('');

      setTimeout(() => {
        setSubscribeStatus('Subscribe');
      }, 2000);
    } else {
      alert('Please enter a valid email address');
    }
  };

  return (
    <footer className="footer">
      <div className="footer-content">
        {/* Company Info */}
        <div className="footer-section">
          <h3 className="footer-title">ZAW Collection</h3>
          <p className="about-shop">We're dedicated to providing high-quality products with exceptional customer service. Your satisfaction is our top priority.</p>
          <div className="social-links">
            <a href="#" title="Facebook" aria-label="Facebook">f</a>
            <a href="#" title="Twitter" aria-label="Twitter">t</a>
            <a href="#" title="Instagram" aria-label="Instagram">i</a>
            <a href="#" title="LinkedIn" aria-label="LinkedIn">in</a>
          </div>
        </div>

        {/* Quick Links */}
        <div className="footer-section">
          <h3 className="footer-title">Quick Links</h3>
          <ul>
            <li><a href="#home">Home</a></li>
            <li><a href="#products">Products</a></li>
            <li><a href="#about">About Us</a></li>
            <li><a href="#contact">Contact</a></li>
            <li><a href="#careers">Careers</a></li>
            <li><a href="#blog">Blog</a></li>
          </ul>
        </div>

        {/* Customer Service */}
        <div className="footer-section">
          <h3 className="footer-title">Customer Service</h3>
          <ul>
            <li><a href="#faq">FAQ</a></li>
            <li><a href="#shipping">Shipping Info</a></li>
            <li><a href="#returns">Returns & Exchanges</a></li>
            <li><a href="#size-guide">Size Guide</a></li>
            <li><a href="#track">Track Your Order</a></li>
            <li><a href="#support">Customer Support</a></li>
          </ul>
        </div>

        {/* Contact & Newsletter */}
        <div className="footer-section">
          <h3 className="footer-title">Contact Us</h3>
          <p className="address-details">📍 Dhaka, Bangladesh</p>
          <p className="address-details">📞 (555) 123-4567</p>
          <p className="address-details">✉️ support@modernshop.com</p>

          <div className="newsletter">
            <h3 className="newsletter">Newsletter</h3>
            <p>Subscribe for updates and exclusive offers!</p>
            <div className="newsletter-form">
              <input
                type="email"
                className="newsletter-input"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleNewsletterSubmit()}
              />
              <button
                className={`newsletter-btn ${subscribeStatus === 'Subscribed!' ? 'subscribed' : ''}`}
                onClick={handleNewsletterSubmit}
              >
                {subscribeStatus}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="footer-bottom-content">
          <div>
            <p>&copy; 2024 ModernShop. All rights reserved. | <a href="#privacy">Privacy Policy</a> | <a href="#terms">Terms of Service</a></p>
          </div>
          <div className="payment-methods">
            <span>We Accept:</span>
            <div className="payment-icon">VISA</div>
            <div className="payment-icon">MC</div>
            <div className="payment-icon">AMEX</div>
            <div className="payment-icon">PP</div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
