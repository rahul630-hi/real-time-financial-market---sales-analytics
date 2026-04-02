import React, { useState, useEffect } from 'react';
import { Area, CartesianGrid, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ForecastDataPoint, SalesData } from '../types';
import * as MockData from '../services/mockDataService';

interface ForecastingPageProps {
  latestSales: number;
  historicalData?: SalesData[] | null;
}

const ForecastingPage: React.FC<ForecastingPageProps> = ({ latestSales, historicalData }) => {
  const [forecastData, setForecastData] = useState<ForecastDataPoint[]>([]);
  const [horizon, setHorizon] = useState<number>(30);
  const [isTraining, setIsTraining] = useState<boolean>(false);
  const [trainingLog, setTrainingLog] = useState<string[]>([]);
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(value);
  };

  const retrainModel = () => {
    setIsTraining(true);
    const usingData = historicalData ? `historical data (${historicalData.length} points)` : `latest sales data (${formatCurrency(latestSales)})`;
    setTrainingLog([`Starting model retraining with ${usingData}...`]);
    let progress = 0;
    
    const logInterval = setInterval(() => {
        progress += 1;
        const messages = [
            'Loading latest sales data...',
            'Performing feature engineering...',
            'Training LightGBM model...',
            'Evaluating model performance (MAPE: 5.2%)...',
            'Saving model artifacts...',
            `Generating new ${horizon}-day forecast...`,
            'Retraining complete!'
        ];
        
        if (progress <= messages.length) {
            setTrainingLog(prev => [...prev, messages[progress-1]]);
        }

        if (progress >= messages.length) {
            clearInterval(logInterval);
            setForecastData(MockData.generateForecastData(latestSales));
            setIsTraining(false);
        }
    }, 1000);
  };

  useEffect(() => {
    setForecastData(MockData.generateForecastData(latestSales));
  }, [latestSales]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white">Sales Forecast</h2>
            <p className="text-gray-400">Predict future sales with confidence intervals.</p>
            {historicalData && <p className="text-sm text-indigo-400">Forecasting based on your uploaded data.</p>}
          </div>
          <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                  <label htmlFor="horizon" className="text-sm font-medium text-gray-300">Horizon (days):</label>
                  <select 
                    id="horizon" 
                    value={horizon}
                    onChange={(e) => setHorizon(Number(e.target.value))}
                    className="bg-gray-700 border border-gray-600 rounded-md px-3 py-1.5 text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                      <option value="7">7</option>
                      <option value="14">14</option>
                      <option value="30">30</option>
                      <option value="90">90</option>
                  </select>
              </div>
              <button 
                onClick={retrainModel}
                disabled={isTraining}
                className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed transition-colors"
              >
                  {isTraining ? 'Training...' : 'Retrain Model'}
              </button>
          </div>
      </div>
      
      <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700/50">
        <h3 className="text-lg font-semibold text-white mb-4">{horizon}-Day Aggregated Forecast</h3>
        <div style={{ height: '400px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={forecastData.slice(0, horizon)} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} />
              <YAxis stroke="#9ca3af" fontSize={12} domain={['dataMin - 10000', 'dataMax + 10000']} tickFormatter={(val) => `₹${Math.round(val/1000)}k`} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #4b5563', borderRadius: '0.5rem' }}
                labelStyle={{ color: '#d1d5db' }}
                formatter={(value: number) => formatCurrency(value)}
              />
              <Area type="monotone" dataKey="upper" fill="#4f46e5" stroke="transparent" name="Upper Bound" fillOpacity={0.2} />
              <Area type="monotone" dataKey="lower" fill="#4f46e5" stroke="transparent" stackId="1" name="Lower Bound" fillOpacity={0.2}/>
              <Line type="monotone" dataKey="forecast" stroke="#a78bfa" strokeWidth={2} dot={false} name="Forecast" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {isTraining && (
          <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700/50">
              <h3 className="text-lg font-semibold text-white mb-4">Training Log</h3>
              <div className="bg-black/50 p-4 rounded-lg h-48 overflow-y-auto font-mono text-sm text-gray-300">
                  {trainingLog.map((log, i) => (
                      <p key={i}>{`> ${log}`}</p>
                  ))}
              </div>
          </div>
      )}
    </div>
  );
};

export default ForecastingPage;