import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import DashboardCard from '../components/DashboardCard';
import { SalesData, Alert, Product, AssociationRule } from '../types';
import * as MockData from '../services/mockDataService';
import { SparklesIcon } from '../components/icons';
import { format as formatDate } from 'date-fns';

interface HomeDashboardProps {
  isLiveData: boolean;
  salesData: SalesData[];
  totalSalesToday: number;
  dailyChange: number;
  documentText?: string | null;
  documentAnalysis?: string | null;
  isAnalyzing?: boolean;
  onAnalyzeDocument?: () => void;
}

const HomeDashboard: React.FC<HomeDashboardProps> = ({ 
    isLiveData, salesData, totalSalesToday, dailyChange, 
    documentText, documentAnalysis, isAnalyzing, onAnalyzeDocument 
}) => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [topProducts, setTopProducts] = useState<Product[]>(MockData.getTopProducts());
  const [rules, setRules] = useState<AssociationRule[]>(MockData.getAssociationRules());

  useEffect(() => {
    // These intervals are for mock data widgets that are always present
    const productInterval = setInterval(() => {
      setTopProducts(MockData.getTopProducts());
    }, 5000);

    const alertInterval = setInterval(() => {
        setAlerts(prevAlerts => {
            const newAlerts = [MockData.generateAlert(), ...prevAlerts];
            if(newAlerts.length > 5) newAlerts.pop();
            return newAlerts;
        })
    }, 8000);

    return () => {
      clearInterval(productInterval);
      clearInterval(alertInterval);
    };
  }, []);
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getSalesTotalForWindow = (minutes: number) => {
      const points = minutes * 30; // 1 point every 2 seconds
      return salesData.slice(-points).reduce((sum, d) => sum + d.sales, 0);
  }

  const alertIcon = (type: string) => {
    switch(type) {
        case 'info': return <span className="text-blue-400">ℹ️</span>;
        case 'warning': return <span className="text-yellow-400">⚠️</span>;
        case 'error': return <span className="text-red-400">❗</span>;
        default: return null;
    }
  }
  
  const renderDashboardCards = () => {
      if (isLiveData) {
          return (
            <>
              <DashboardCard title="Total Sales (Last 1 min)" value={formatCurrency(getSalesTotalForWindow(1))} />
              <DashboardCard title="Total Sales (Last 5 min)" value={formatCurrency(getSalesTotalForWindow(5))} />
              <DashboardCard title="Total Sales (Last 1 hr)" value={formatCurrency(getSalesTotalForWindow(60))} />
              <DashboardCard 
                  title="Today's Total Sales" 
                  value={formatCurrency(totalSalesToday)} 
                  change={`${dailyChange.toFixed(1)}%`}
                  changeType={dailyChange >= 0 ? "increase" : "decrease"}
              />
            </>
          );
      } else {
          const total = salesData.reduce((sum, d) => sum + d.sales, 0);
          const average = total / salesData.length;
          const dateRange = salesData.length > 1 && salesData[0].date && salesData[salesData.length - 1].date
            ? `${formatDate(salesData[0].date!, 'MMM d, yyyy')} - ${formatDate(salesData[salesData.length - 1].date!, 'MMM d, yyyy')}`
            : 'N/A';
            
          return (
            <>
                <DashboardCard title="Total Sales from File" value={formatCurrency(total)} />
                <DashboardCard title="Average Daily Sales" value={formatCurrency(average)} />
                <DashboardCard title="Date Range" value={dateRange} />
                <DashboardCard title="Data Points" value={salesData.length.toString()} />
            </>
          )
      }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {renderDashboardCards()}
      </div>

      <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700/50">
        <h3 className="text-lg font-semibold text-white mb-4">{isLiveData ? 'Live' : 'Uploaded'} Sales Trend</h3>
        <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={salesData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="time" stroke="#9ca3af" fontSize={12} />
                <YAxis stroke="#9ca3af" fontSize={12} tickFormatter={(val) => `₹${Number(val) / 1000}k`} />
                <Tooltip
                    contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #4b5563', borderRadius: '0.5rem' }}
                    labelStyle={{ color: '#d1d5db' }}
                    formatter={(value: number) => formatCurrency(value)}
                />
                <Area type="monotone" dataKey="sales" stroke="#8884d8" fillOpacity={1} fill="url(#colorSales)" />
            </AreaChart>
            </ResponsiveContainer>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {documentText && (
             <div className="lg:col-span-3 bg-gray-800/50 p-6 rounded-xl border border-gray-700/50">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-white">Document Insights</h3>
                    <button
                        onClick={onAnalyzeDocument}
                        disabled={isAnalyzing}
                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 disabled:bg-purple-400 disabled:cursor-not-allowed transition-colors text-sm"
                    >
                        <SparklesIcon />
                        {isAnalyzing ? 'Analyzing...' : 'Analyze with AI'}
                    </button>
                </div>
                {documentAnalysis ? (
                    <div className="prose prose-invert prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: documentAnalysis }}></div>
                ) : (
                    <p className="text-gray-400 text-sm">{isAnalyzing ? 'Generating insights from the document...' : 'Click "Analyze with AI" to summarize the uploaded document.'}</p>
                )}
             </div>
          )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-gray-800/50 p-6 rounded-xl border border-gray-700/50">
          <h3 className="text-lg font-semibold text-white mb-4">Alerts Panel</h3>
          <ul className="space-y-3">
            {alerts.length > 0 ? alerts.map(alert => (
              <li key={alert.id} className="flex items-start text-sm p-2 bg-gray-700/50 rounded-md">
                <span className="mr-3 mt-1">{alertIcon(alert.type)}</span>
                <div>
                  <p className="text-gray-300">{alert.message}</p>
                  <p className="text-xs text-gray-500">{alert.timestamp}</p>
                </div>
              </li>
            )) : <p className="text-gray-400 text-sm">No new alerts.</p>}
          </ul>
        </div>

        <div className="lg:col-span-1 bg-gray-800/50 p-6 rounded-xl border border-gray-700/50">
          <h3 className="text-lg font-semibold text-white mb-4">Top Products (Live)</h3>
          <ul className="space-y-3">
            {topProducts.map(product => (
              <li key={product.id} className="flex justify-between items-center text-sm p-2 bg-gray-700/50 rounded-md">
                <span className="text-gray-300">{product.name}</span>
                <span className="font-semibold text-indigo-400">{formatCurrency(product.sales)}</span>
              </li>
            ))}
          </ul>
        </div>
        
        <div className="lg:col-span-1 bg-gray-800/50 p-6 rounded-xl border border-gray-700/50">
          <h3 className="text-lg font-semibold text-white mb-4">Top Association Rules</h3>
          <ul className="space-y-3">
            {rules.slice(0,5).map((rule, index) => (
              <li key={index} className="text-sm p-2 bg-gray-700/50 rounded-md">
                <p className="text-gray-300">If a customer buys <span className="font-semibold text-indigo-400">{rule.antecedents.join(', ')}</span>, they are likely to buy <span className="font-semibold text-indigo-400">{rule.consequents.join(', ')}</span>.</p>
                <p className="text-xs text-gray-500">Confidence: {(rule.confidence * 100).toFixed(1)}%</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default HomeDashboard;