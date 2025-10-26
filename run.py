# EcoQuant/run.py
import sys
import os

# Add the backend directory to Python path
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

from market_simulator import app, run_simulator
import threading

if __name__ == "__main__":
    print("🚀 Starting EcoQuant Market Simulator...")
    print("📈 Initial Price: 700 EQT/CELO")
    print("💰 Initial CELO Balance: 18.0")
    print("🌐 API Endpoints:")
    print("   http://localhost:5000/api/market-data")
    print("   http://localhost:5000/api/price-history")
    print("   http://localhost:5000/api/execute-trade/buy/0.5")
    
    # Start simulation thread
    sim_thread = threading.Thread(target=run_simulator, daemon=True)
    sim_thread.start()
    
    # Start web server
    app.run(host='0.0.0.0', port=5000, debug=False, use_reloader=False)