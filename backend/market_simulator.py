import random
import time
import json
import requests
from datetime import datetime, timedelta
import matplotlib.pyplot as plt
import matplotlib.animation as animation
from collections import deque

class EQTMarketSimulator:
    def __init__(self, initial_price=700.0, initial_celo=18.0):
        self.current_price = initial_price
        self.celo_balance = initial_celo
        self.eqt_balance = 0
        self.price_history = deque([initial_price] * 100, maxlen=100)
        self.volume_history = deque([0] * 100, maxlen=100)
        self.timestamps = deque([datetime.now()] * 100, maxlen=100)
        
        # Market parameters for realistic behavior
        self.volatility = 0.02  # 2% daily volatility
        self.trend_bias = 0.001  # Slight upward bias
        self.mean_reversion = 0.1
        self.base_volume = 1000
        
    def generate_realistic_price_change(self):
        """Generate realistic price movements with trend + randomness + mean reversion"""
        # Random walk component
        random_component = random.gauss(0, self.volatility / 10)
        
        # Trend component (slight bias)
        trend_component = self.trend_bias / 100
        
        # Mean reversion component
        mean_reversion_component = -self.mean_reversion * (self.current_price - 700) / 700 / 100
        
        # News/event impact (rare but significant)
        event_impact = 0
        if random.random() < 0.02:  # 2% chance of news event
            event_impact = random.gauss(0, self.volatility * 3)
        
        total_change = random_component + trend_component + mean_reversion_component + event_impact
        
        # Apply change
        new_price = self.current_price * (1 + total_change)
        
        # Prevent negative prices
        return max(new_price, 0.01)
    
    def execute_trade(self, trade_type, amount_celo=None, amount_eqt=None):
        """Execute buy or sell trade"""
        if trade_type == 'buy' and amount_celo:
            # Buy EQT with CELO
            eqt_received = amount_celo / self.current_price
            if amount_celo <= self.celo_balance:
                self.celo_balance -= amount_celo
                self.eqt_balance += eqt_received
                return f"Bought {eqt_received:.4f} EQT for {amount_celo:.2f} CELO"
        
        elif trade_type == 'sell' and amount_eqt:
            # Sell EQT for CELO
            celo_received = amount_eqt * self.current_price
            if amount_eqt <= self.eqt_balance:
                self.eqt_balance -= amount_eqt
                self.celo_balance += celo_received
                return f"Sold {amount_eqt:.4f} EQT for {celo_received:.2f} CELO"
        
        return "Trade failed: insufficient balance"
    
    def generate_market_activity(self):
        """Generate one cycle of market activity"""
        # Update price
        self.current_price = self.generate_realistic_price_change()
        self.price_history.append(self.current_price)
        self.timestamps.append(datetime.now())
        
        # Generate random trades
        trade_messages = []
        
        # Random buy/sell decisions
        if random.random() < 0.6:  # 60% chance of trade
            if random.random() < 0.5 and self.celo_balance > 0.1:  # Buy
                trade_amount = random.uniform(0.1, min(2.0, self.celo_balance * 0.8))
                message = self.execute_trade('buy', amount_celo=trade_amount)
                trade_messages.append(message)
                self.volume_history.append(trade_amount)
            
            elif self.eqt_balance > 0.001:  # Sell
                trade_amount = random.uniform(0.001, self.eqt_balance * 0.5)
                message = self.execute_trade('sell', amount_eqt=trade_amount)
                trade_messages.append(message)
                self.volume_history.append(trade_amount)
        else:
            self.volume_history.append(0)
        
        return trade_messages
    
    def get_market_data(self):
        """Return current market state"""
        return {
            'timestamp': datetime.now().isoformat(),
            'price': self.current_price,
            'price_change_24h': ((self.current_price - self.price_history[0]) / self.price_history[0]) * 100,
            'volume_24h': sum(list(self.volume_history)[-24:]),
            'celo_balance': self.celo_balance,
            'eqt_balance': self.eqt_balance,
            'total_value_celo': self.celo_balance + (self.eqt_balance * self.current_price)
        }

# Real-time data API (Flask server)
from flask import Flask, jsonify
import threading

app = Flask(__name__)
simulator = EQTMarketSimulator()

@app.route('/api/market-data')
def get_market_data():
    return jsonify(simulator.get_market_data())

@app.route('/api/price-history')
def get_price_history():
    return jsonify({
        'prices': list(simulator.price_history),
        'timestamps': [ts.isoformat() for ts in simulator.timestamps],
        'volumes': list(simulator.volume_history)
    })

@app.route('/api/execute-trade/<trade_type>/<amount>')
def execute_trade(trade_type, amount):
    if trade_type == 'buy':
        message = simulator.execute_trade('buy', amount_celo=float(amount))
    elif trade_type == 'sell':
        message = simulator.execute_trade('sell', amount_eqt=float(amount))
    else:
        message = "Invalid trade type"
    return jsonify({'message': message, 'balance': simulator.get_market_data()})

def run_simulation():
    """Run the market simulation in background"""
    while True:
        trades = simulator.generate_market_activity()
        if trades:
            print(f"[{datetime.now().strftime('%H:%M:%S')}] Price: {simulator.current_price:.2f} | {trades[0]}")
        time.sleep(5)  # Update every 5 seconds

# Real-time chart plotting
def live_plotter():
    fig, (ax1, ax2) = plt.subplots(2, 1, figsize=(12, 8))
    
    def animate(i):
        ax1.clear()
        ax2.clear()
        
        # Price chart
        ax1.plot(list(simulator.timestamps), list(simulator.price_history), 'b-', linewidth=2)
        ax1.set_title('EQT/CELO Price Simulation - Real-time')
        ax1.set_ylabel('Price (EQT per CELO)')
        ax1.grid(True, alpha=0.3)
        
        # Volume chart
        ax2.bar(list(simulator.timestamps), list(simulator.volume_history), alpha=0.7, color='orange')
        ax2.set_title('Trading Volume')
        ax2.set_ylabel('Volume (CELO)')
        ax2.set_xlabel('Time')
        ax2.grid(True, alpha=0.3)
        
        plt.tight_layout()
    
    ani = animation.FuncAnimation(fig, animate, interval=5000, cache_frame_data=False)
    plt.show()

if __name__ == "__main__":
    print("Starting EQT Market Simulator...")
    print("Initial Price: 700 EQT/CELO")
    print("Initial CELO Balance: 18.0")
    print("Access market data at: http://localhost:5000/api/market-data")
    print("Access price history at: http://localhost:5000/api/price-history")
    
    # Start simulation thread
    sim_thread = threading.Thread(target=run_simulation, daemon=True)
    sim_thread.start()
    
    # Start web server
    app.run(host='0.0.0.0', port=5000, debug=False, use_reloader=False)