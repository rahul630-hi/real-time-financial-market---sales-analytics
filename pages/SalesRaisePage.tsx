
import React, { useState, FormEvent } from 'react';
import DashboardCard from '../components/DashboardCard';
import { TrendingUpIcon } from '../components/icons';

const SalesRaisePage: React.FC = () => {
    const [price, setPrice] = useState('80000');
    const [promotion, setPromotion] = useState('none');
    const [season, setSeason] = useState('normal');
    const [prediction, setPrediction] = useState<{ change: number; sales: number } | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-IN', {
          style: 'currency',
          currency: 'INR',
          maximumFractionDigits: 0,
        }).format(value);
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setPrediction(null);
        
        // Simulate API call
        setTimeout(() => {
            const baseChange = (parseFloat(price) - 80000) / 80000 * -0.5; // Price elasticity
            let promoEffect = 0;
            if(promotion === '10off') promoEffect = 0.15;
            if(promotion === 'bogo') promoEffect = 0.25;

            let seasonEffect = 0;
            if(season === 'holiday') seasonEffect = 0.4;
            if(season === 'summer') seasonEffect = 0.1;

            const totalChange = baseChange + promoEffect + seasonEffect + (Math.random() - 0.5) * 0.05;
            const predictedSales = 20000000 * (1 + totalChange); // Base sales of 2 Cr
            
            setPrediction({ change: totalChange * 100, sales: predictedSales });
            setIsLoading(false);
        }, 1500);
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-white">Sales Raise Predictor</h2>
                <p className="text-gray-400">Simulate how changes in price, promotions, and seasonality might affect sales.</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                    <form onSubmit={handleSubmit} className="bg-gray-800/50 p-6 rounded-xl border border-gray-700/50 space-y-6">
                        <div>
                            <label htmlFor="price" className="block text-sm font-medium text-gray-300">Product Price (₹)</label>
                            <input
                                type="number"
                                id="price"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="promotion" className="block text-sm font-medium text-gray-300">Promotion</label>
                            <select
                                id="promotion"
                                value={promotion}
                                onChange={(e) => setPromotion(e.target.value)}
                                className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            >
                                <option value="none">None</option>
                                <option value="10off">10% Off</option>
                                <option value="bogo">Buy One Get One Free</option>
                            </select>
                        </div>

                        <div>
                            <label htmlFor="season" className="block text-sm font-medium text-gray-300">Season</label>
                            <select
                                id="season"
                                value={season}
                                onChange={(e) => setSeason(e.target.value)}
                                className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            >
                                <option value="normal">Normal</option>
                                <option value="summer">Summer</option>
                                <option value="holiday">Holiday Season</option>
                            </select>
                        </div>
                        
                        <button 
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex justify-center items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed transition-colors"
                        >
                            <TrendingUpIcon className="h-5 w-5" />
                            {isLoading ? 'Predicting...' : 'Predict Sales Change'}
                        </button>
                    </form>
                </div>

                <div className="lg:col-span-2 flex items-center justify-center">
                    <div className="w-full max-w-md">
                        {isLoading && (
                            <div className="text-center p-8">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-400 mx-auto"></div>
                                <p className="mt-4 text-gray-400">Running prediction model...</p>
                            </div>
                        )}
                        {prediction && (
                            <div className="space-y-4 animate-fade-in">
                                <DashboardCard
                                    title="Predicted Sales Change (next 30 days)"
                                    value={`${prediction.change.toFixed(1)}%`}
                                    changeType={prediction.change >= 0 ? 'increase' : 'decrease'}
                                    className="text-center"
                                />
                                <DashboardCard
                                    title="Predicted Total Sales"
                                    value={formatCurrency(prediction.sales)}
                                    className="text-center"
                                />
                            </div>
                        )}
                        {!isLoading && !prediction && (
                             <div className="text-center p-8 bg-gray-800/50 rounded-xl border border-gray-700/50">
                                <TrendingUpIcon className="h-12 w-12 mx-auto text-gray-500"/>
                                <p className="mt-4 text-gray-400">Enter your scenario parameters and click "Predict" to see the results.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SalesRaisePage;
