import React from 'react';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const navigate = useNavigate();

  const handleInvest = () => {
    navigate('/investor');
  };

  const handleContribute = () => {
    navigate('/login');
  };

  const handleContact = (e) => {
    e.preventDefault();
    const message = e.target.message.value;
    const subject = encodeURIComponent('EcoQuant Contact');
    const body = encodeURIComponent(`Message: ${message}`);
    window.location.href = `mailto:contact@ecoquant.com?subject=${subject}&body=${body}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col relative overflow-hidden">
      {/* Background Video */}
      <video
        autoPlay
        muted
        loop
        className="absolute inset-0 w-full h-full object-cover z-0"
        style={{ filter: 'blur(1px) brightness(0.5)' }}
      >
        <source src="/video.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      {/* Header */}
      <header className="backdrop-blur-md bg-white/10 shadow-sm border-b border-gray-200 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Logo */}
            <div className="text-2xl font-bold text-white" style={{ fontFamily: 'Inter' }}>
              EcoQuant
            </div>

            {/* Navigation */}
            <nav className="flex space-x-8">
              <button
                onClick={handleContribute}
                className="text-white hover:text-gray-200 transition-colors"
                style={{ fontFamily: 'Inter' }}
              >
                Contribute
              </button>
              <button
                onClick={handleInvest}
                className="text-white hover:text-gray-200 transition-colors"
                style={{ fontFamily: 'Inter' }}
              >
                Invest
              </button>
              <a href="#" className="text-white hover:text-gray-200 transition-colors" style={{ fontFamily: 'Inter' }}>
                Documentation
              </a>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 gap-12 items-center relative z-10">
          {/* Centered Content */}
          <div className="flex flex-col items-center text-center">
            <h1 className="text-6xl sm:text-7xl lg:text-8xl font-bold text-white mb-6 leading-tight" style={{ fontFamily: 'Inter' }}>
              Reducing <span className="text-green-500">carbon</span> footprints has never been easier
            </h1>
            <p className="text-xl text-white mb-8 leading-relaxed max-w-3xl" style={{ fontFamily: 'Inter' }}>
              A platform for transparent carbon tracking, sustainable investments, and tokenized environmental impact. Ideal for all eco-conscious investors and contributors.
            </p>

            {/* Action Buttons */}
            <div className="flex space-x-4 mb-8">
              <button
                onClick={handleContribute}
                className="px-8 py-3 backdrop-blur-md bg-white/10 text-white rounded-full hover:bg-white hover:text-black transition-all font-medium text-lg"
                style={{ fontFamily: 'Inter' }}
              >
                Contribute
              </button>
              <button
                onClick={handleInvest}
                className="px-8 py-3 backdrop-blur-md bg-white/10 text-white rounded-full hover:bg-white hover:text-black transition-all font-medium text-lg"
                style={{ fontFamily: 'Inter' }}
              >
                Invest
              </button>
            </div>

            {/* Contact Form */}
            <form onSubmit={handleContact} className="max-w-md">
              <div className="flex flex-col sm:flex-row gap-4">
                <input
                  type="text"
                  name="message"
                  placeholder="Send message"
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-all"
                  style={{ fontFamily: 'Inter' }}
                  required
                />
                <button
                  type="submit"
                  className="px-6 py-3 bg-gray-900 text-white rounded-full hover:bg-gray-800 transition-colors font-medium"
                  style={{ fontFamily: 'Inter' }}
                >
                  Contact Us
                </button>
              </div>
            </form>
          </div>

        </div>
      </main>

      {/* Bottom Ticker */}
      <footer className="backdrop-blur-md bg-white/10 border-t border-gray-200 py-2 overflow-hidden mt-auto relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex animate-scroll">
            <div className="flex space-x-8 text-sm text-white whitespace-nowrap" style={{ fontFamily: 'Inter' }}>
              <span>ETH 2481.77 +3.38%</span>
              <span>BNB 621.45 +0.35%</span>
              <span>AVAX 24.55 +0.48%</span>
              <span>TRX 0.2642 +6.28%</span>
              <span>FIL 3.05 +9.34%</span>
              <span>BCH 402.64 +7.31%</span>
              <span>LINK 16.61 +2.32%</span>
              <span>ARB 0.52 +1.15%</span>
              <span>ETH 2481.77 +3.38%</span>
              <span>BNB 621.45 +0.35%</span>
              <span>AVAX 24.55 +0.48%</span>
              <span>TRX 0.2642 +6.28%</span>
              <span>FIL 3.05 +9.34%</span>
              <span>BCH 402.64 +7.31%</span>
              <span>LINK 16.61 +2.32%</span>
              <span>ARB 0.52 +1.15%</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Custom CSS for Animations */}
      <style jsx>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-scroll {
          animation: scroll 25s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default LandingPage;
