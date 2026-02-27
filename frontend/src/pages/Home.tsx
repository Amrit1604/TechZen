import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const Home: React.FC = () => {
  return (
    <div className="home-page">
      <Navbar isHomePage={true} />
      <main className="main-content">
        <h1>Home Page - To be implemented</h1>
        <p>Copy content from public/html/home.html</p>
      </main>
      <Footer />
    </div>
  );
};

export default Home;
