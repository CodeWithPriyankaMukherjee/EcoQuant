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
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Logo */}
            <div className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'Inter' }}>
              EcoQuant
            </div>

            {/* Navigation */}
            <nav className="flex space-x-8">
              <button
                onClick={handleContribute}
                className="text-gray-600 hover:text-gray-900 transition-colors"
                style={{ fontFamily: 'Inter' }}
              >
                Contribute
              </button>
              <button
                onClick={handleInvest}
                className="text-gray-600 hover:text-gray-900 transition-colors"
                style={{ fontFamily: 'Inter' }}
              >
                Invest
              </button>
              <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors" style={{ fontFamily: 'Inter' }}>
                Documentation
              </a>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight" style={{ fontFamily: 'Inter' }}>
              Reducing carbon footprints has never been easier
            </h1>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed" style={{ fontFamily: 'Inter' }}>
              A platform for transparent carbon tracking, sustainable investments, and tokenized environmental impact. Ideal for all eco-conscious investors and contributors.
            </p>

            {/* Contact Form */}
            <form onSubmit={handleContact} className="max-w-md">
              <div className="flex flex-col sm:flex-row gap-4">
                <input
                  type="text"
                  name="message"
                  placeholder="Send message"
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-all"
                  style={{ fontFamily: 'Inter' }}
                  required
                />
                <button
                  type="submit"
                  className="px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
                  style={{ fontFamily: 'Inter' }}
                >
                  Contact Us
                </button>
              </div>
            </form>
          </div>

          {/* Right Illustrations */}
          <div className="relative">
            <div className="relative h-96 w-full">
              {/* Carbon Molecule */}
              <div className="absolute top-8 right-12 w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                <div className="relative">
                  <div className="w-3 h-3 bg-gray-800 rounded-full absolute -top-1 -left-1"></div>
                  <div className="w-3 h-3 bg-gray-800 rounded-full absolute -top-1 left-4"></div>
                  <div className="w-3 h-3 bg-gray-800 rounded-full absolute top-2 left-6"></div>
                  <div className="w-3 h-3 bg-gray-800 rounded-full absolute top-2 -left-1"></div>
                </div>
              </div>

              {/* Leaf Icon */}
              <div className="absolute top-0 left-8 w-16 h-16 bg-green-400 rounded-full flex items-center justify-center transform rotate-12">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L2 7v10c0 5.55 3.84 9.74 9 11 5.16-1.26 9-5.45 9-11V7l-10-5z"/>
                </svg>
              </div>

              {/* Wind Turbine */}
              <div className="absolute top-20 right-0 w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center">
                <div className="relative">
                  <div className="w-1 h-12 bg-gray-800 absolute top-0 left-1/2 transform -translate-x-1/2"></div>
                  <div className="w-8 h-1 bg-gray-800 absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1"></div>
                  <div className="w-6 h-1 bg-gray-800 absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1 rotate-45"></div>
                  <div className="w-6 h-1 bg-gray-800 absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1 -rotate-45"></div>
                </div>
              </div>

              {/* Recycling Symbol */}
              <div className="absolute bottom-20 left-0 w-20 h-20 bg-green-200 rounded-full flex items-center justify-center">
                <svg className="w-10 h-10 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 3h2v2H6V3zm0 4h2v2H6V7zm0 4h2v2H6v-2zm0 4h2v2H6v-2zm4-8h2v2h-2V7zm0 4h2v2h-2v-2zm0 4h2v2h-2v-2zm4-8h2v2h-2V7zm0 4h2v2h-2v-2zm0 4h2v2h-2v-2z"/>
                </svg>
              </div>

              {/* Growth Chart */}
              <div className="absolute bottom-16 right-8 w-28 h-16 bg-yellow-100 rounded-lg p-2">
                <div className="flex items-end space-x-1 h-full">
                  <div className="w-2 bg-green-400 rounded-t" style={{height: '20%'}}></div>
                  <div className="w-2 bg-green-500 rounded-t" style={{height: '40%'}}></div>
                  <div className="w-2 bg-green-600 rounded-t" style={{height: '70%'}}></div>
                  <div className="w-2 bg-green-700 rounded-t" style={{height: '100%'}}></div>
                  <div className="w-2 bg-green-500 rounded-t" style={{height: '60%'}}></div>
                  <div className="w-2 bg-green-400 rounded-t" style={{height: '30%'}}></div>
                </div>
                <div className="text-xs text-gray-600 mt-1">Growth</div>
              </div>

              {/* CO2 Reduction Badge */}
              <div className="absolute bottom-0 right-0 w-18 h-18 bg-blue-200 rounded-full flex items-center justify-center">
                <span className="text-xs font-bold text-blue-800">CO₂↓</span>
              </div>

              {/* Connecting Lines */}
              <div className="absolute top-16 left-16 right-16 h-0.5 bg-gradient-to-r from-green-300 via-blue-300 to-green-300 opacity-50"></div>
              <div className="absolute bottom-24 left-8 right-8 h-0.5 bg-gradient-to-r from-blue-300 via-green-300 to-blue-300 opacity-50"></div>
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Ticker */}
      <footer className="bg-white border-t border-gray-200 py-2 overflow-hidden mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex animate-scroll">
            <div className="flex space-x-8 text-sm text-gray-600 whitespace-nowrap" style={{ fontFamily: 'Inter' }}>
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
