
import React, { useState, useMemo } from 'react';
import { AssociationRule } from '../types';
import * as MockData from '../services/mockDataService';

const MarketBasketPage: React.FC = () => {
  const allRules = useMemo(() => MockData.getAssociationRules(), []);
  const [minSupport, setMinSupport] = useState(0.02);
  const [minConfidence, setMinConfidence] = useState(0.5);

  const filteredRules = useMemo(() => {
    return allRules.filter(
      rule => rule.support >= minSupport && rule.confidence >= minConfidence
    );
  }, [allRules, minSupport, minConfidence]);

  return (
    <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Market Basket Analysis</h2>
          <p className="text-gray-400">Discover product associations to optimize marketing and placement.</p>
        </div>

        <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700/50">
            <div className="flex flex-col md:flex-row gap-6 mb-6">
                <div className="flex-1">
                    <label htmlFor="minSupport" className="block text-sm font-medium text-gray-300">
                        Min Support: {minSupport.toFixed(3)}
                    </label>
                    <input
                        id="minSupport"
                        type="range"
                        min="0.01"
                        max="0.1"
                        step="0.001"
                        value={minSupport}
                        onChange={(e) => setMinSupport(parseFloat(e.target.value))}
                        className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                    />
                </div>
                <div className="flex-1">
                    <label htmlFor="minConfidence" className="block text-sm font-medium text-gray-300">
                        Min Confidence: {minConfidence.toFixed(2)}
                    </label>
                    <input
                        id="minConfidence"
                        type="range"
                        min="0.1"
                        max="1.0"
                        step="0.05"
                        value={minConfidence}
                        onChange={(e) => setMinConfidence(parseFloat(e.target.value))}
                        className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                    />
                </div>
            </div>
            
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-700">
                    <thead className="bg-gray-800">
                        <tr>
                            <th scope="col" className="py-3.5 px-3 text-left text-sm font-semibold text-white">Antecedents (If Buy)</th>
                            <th scope="col" className="py-3.5 px-3 text-left text-sm font-semibold text-white">Consequents (Then Buy)</th>
                            <th scope="col" className="py-3.5 px-3 text-left text-sm font-semibold text-white">Support</th>
                            <th scope="col" className="py-3.5 px-3 text-left text-sm font-semibold text-white">Confidence</th>
                            <th scope="col" className="py-3.5 px-3 text-left text-sm font-semibold text-white">Lift</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700 bg-gray-900/50">
                        {filteredRules.map((rule, index) => (
                            <tr key={index}>
                                <td className="whitespace-nowrap py-4 px-3 text-sm text-gray-300">
                                    <span className="inline-flex items-center rounded-md bg-gray-700 px-2 py-1 text-xs font-medium text-gray-300">
                                        {rule.antecedents.join(', ')}
                                    </span>
                                </td>
                                <td className="whitespace-nowrap py-4 px-3 text-sm text-gray-300">
                                    <span className="inline-flex items-center rounded-md bg-indigo-900 px-2 py-1 text-xs font-medium text-indigo-300">
                                        {rule.consequents.join(', ')}
                                    </span>
                                </td>
                                <td className="whitespace-nowrap py-4 px-3 text-sm text-gray-400">{rule.support.toFixed(3)}</td>
                                <td className="whitespace-nowrap py-4 px-3 text-sm text-gray-400">{rule.confidence.toFixed(2)}</td>
                                <td className="whitespace-nowrap py-4 px-3 text-sm font-medium text-white">{rule.lift.toFixed(1)}x</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {filteredRules.length === 0 && <p className="text-center text-gray-400 py-8">No rules match the current filters.</p>}
        </div>
    </div>
  );
};

export default MarketBasketPage;
