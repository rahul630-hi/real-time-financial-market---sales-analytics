
import React, { useState, useEffect } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { CustomerSegment } from '../types';
import * as MockData from '../services/mockDataService';
import * as GeminiService from '../services/geminiService';
import { SparklesIcon } from '../components/icons';

const SegmentationPage: React.FC = () => {
  const [segments, setSegments] = useState<CustomerSegment[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    setSegments(MockData.getCustomerSegments());
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(value);
  };

  const handleGenerateDescriptions = async () => {
    setIsGenerating(true);
    try {
      const descriptions = await GeminiService.generateClusterDescriptions(segments);
      setSegments(prevSegments =>
        prevSegments.map((segment, index) => ({
          ...segment,
          description: descriptions[index] || segment.description,
        }))
      );
    } catch (error) {
      console.error("Failed to generate descriptions", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const allCustomers = segments.flatMap(s => s.customers.map(c => ({...c.rfm, segment: s.name})));
  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE'];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Customer Segmentation</h2>
          <p className="text-gray-400">Understand customer groups based on RFM analysis.</p>
        </div>
        <button
          onClick={handleGenerateDescriptions}
          disabled={isGenerating}
          className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 disabled:bg-purple-400 disabled:cursor-not-allowed transition-colors"
        >
          <SparklesIcon />
          {isGenerating ? 'Generating...' : 'Generate AI Descriptions'}
        </button>
      </div>

      <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700/50">
        <h3 className="text-lg font-semibold text-white mb-4">Customer Segments Scatter Plot (Recency vs. Frequency)</h3>
        <div style={{ height: '400px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid stroke="rgba(255,255,255,0.1)" />
              <XAxis type="number" dataKey="recency" name="Recency" unit=" days" stroke="#9ca3af" reversed={true}/>
              <YAxis type="number" dataKey="frequency" name="Frequency" stroke="#9ca3af" />
              <ZAxis type="number" dataKey="monetary" range={[100, 1000]} name="Monetary" unit="₹" />
              <Tooltip 
                cursor={{ strokeDasharray: '3 3' }} 
                contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #4b5563', borderRadius: '0.5rem' }}
                formatter={(value, name) => name === 'Monetary' ? formatCurrency(value as number) : value}
              />
              {segments.map((s, i) => (
                <Scatter key={s.id} name={s.name} data={s.customers.map(c => c.rfm)} fill={COLORS[i % COLORS.length]} />
              ))}
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {segments.map(segment => (
          <div key={segment.id} className="bg-gray-800/50 p-6 rounded-xl border border-gray-700/50 flex flex-col">
            <h3 className="text-xl font-bold text-white mb-2">{segment.name}</h3>
            <p className="text-sm text-gray-400 mb-1">({segment.customerCount} customers)</p>
            <p className="text-gray-300 text-sm mb-4 flex-grow">
                {isGenerating && segment.description.startsWith('Click') ? 'Generating new description...' : segment.description}
            </p>
            <div className="mt-auto border-t border-gray-700 pt-4 text-xs text-gray-400 space-y-2">
                <p>Avg Recency: <span className="font-semibold text-indigo-300">{segment.avgRFM.recency.toFixed(1)} days</span></p>
                <p>Avg Frequency: <span className="font-semibold text-indigo-300">{segment.avgRFM.frequency.toFixed(1)} purchases</span></p>
                <p>Avg Monetary: <span className="font-semibold text-indigo-300">{formatCurrency(segment.avgRFM.monetary)}</span></p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SegmentationPage;
