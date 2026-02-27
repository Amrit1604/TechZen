import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@components/Navbar';
import Footer from '@components/Footer';
import '@styles/Index.css';
import '../styles/Index.css';

const Index: React.FC = () => {
  useEffect(() => {
    // Parallax effect
    const handleScroll = () => {
      const scroll = window.pageYOffset;
      const heroContent = document.querySelector('.hero-content') as HTMLElement;
      const heroVideo = document.querySelector('.hero-video') as HTMLElement;
      
      if (heroContent) heroContent.style.transform = `translateY(${scroll * 0.5}px)`;
      if (heroVideo) heroVideo.style.transform = `translateY(${scroll * 0.15}px)`;
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="index-page">
      <Navbar showAuthButtons={true} />

      {/* Hero Section */}
      <section className="hero">
        <video className="hero-video" autoPlay loop muted>
          <source src="/img-vid/backvid3.mp4" type="video/mp4" />
        </video>
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1 className="hero-title">TechZen</h1>
          <p className="hero-subtitle">Discover. Learn. Innovate.</p>
          <Link to="/login">
            <button className="hero-btn">Get Started</button>
          </Link>
        </div>
      </section>

      <div className="divider"></div>

      {/* Categories */}
      <section className="categories">
        <h2>Explore Tech Topics</h2>
        <div className="category-grid">
          <Link to="/login" className="category-card">
            <img src="/img-vid/ai.png" alt="AI Updates" />
            <h3>AI Updates</h3>
            <p>Latest developments in artificial intelligence and machine learning</p>
          </Link>
          <Link to="/login" className="category-card">
            <img src="/img-vid/gadgets.png" alt="Gadget Reviews" />
            <h3>Gadget Reviews</h3>
            <p>In-depth reviews of the latest tech gadgets and innovations</p>
          </Link>
          <Link to="/login" className="category-card">
            <img src="/img-vid/tech.png" alt="Tech News" />
            <h3>Tech News</h3>
            <p>Breaking news and updates from the tech industry</p>
          </Link>
        </div>
      </section>

      <div className="divider"></div>

      {/* Latest News */}
      <section className="latest-news">
        <h2>Latest News</h2>
        <div className="news-grid">
          <div className="news-card">
            <img src="/img-vid/ainews.png" alt="AI News" />
            <div className="news-content">
              <span className="news-tag">AI & ML</span>
              <h3>Latest AI Breakthroughs</h3>
              <p>Exploring recent developments in artificial intelligence and their impact on various industries.</p>
              <Link to="/login" className="read-more">
                Read More <span>&rarr;</span>
              </Link>
            </div>
          </div>
          <div className="news-card">
            <img src="/img-vid/robots.png" alt="Robotics" />
            <div className="news-content">
              <span className="news-tag">Robotics</span>
              <h3>Future of Robotics</h3>
              <p>Discover the latest advancements in robotics and automation technology.</p>
              <Link to="/login" className="read-more">
                Read More <span>&rarr;</span>
              </Link>
            </div>
          </div>
          <div className="news-card">
            <img src="/img-vid/web3.png" alt="Web3" />
            <div className="news-content">
              <span className="news-tag">Web3</span>
              <h3>Web3 Revolution</h3>
              <p>Understanding the impact of blockchain and decentralized technologies.</p>
              <Link to="/login" className="read-more">
                Read More <span>&rarr;</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="divider"></div>

      <Footer />
    </div>
  );
};

export default Index;
