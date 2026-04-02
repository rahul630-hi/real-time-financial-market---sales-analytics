
import { SalesData, ForecastDataPoint, Alert, Product, AssociationRule, CustomerSegment, RFMData } from '../types';
import { subDays, format, addDays } from 'date-fns';

// --- SALES & FORECAST ---
let currentSales = 80000;
export const generateInitialSalesData = (): SalesData[] => {
  const data: SalesData[] = [];
  let value = 75000;
  for (let i = 60; i >= 0; i--) {
    const date = subDays(new Date(), i);
    value += Math.random() * 2000 - 1000;
    data.push({ time: format(date, 'HH:mm:ss'), sales: Math.max(60000, value) });
  }
  currentSales = data[data.length - 1].sales;
  return data;
};

export const generateNewSalesDataPoint = (): SalesData => {
  currentSales += Math.random() * 2000 - 950;
  currentSales = Math.max(50000, currentSales);
  return { time: format(new Date(), 'HH:mm:ss'), sales: currentSales };
};

export const generateForecastData = (startValue: number = currentSales): ForecastDataPoint[] => {
    const data: ForecastDataPoint[] = [];
    const today = new Date();
    let value = startValue;
    for (let i = 0; i < 90; i++) { // Generate 90 days of forecast data
        const date = addDays(today, i);
        const fluctuation = (Math.random() - 0.5) * 0.1 * value;
        value += fluctuation + (i * 50); // slight upward trend
        const forecast = Math.max(30000, value);
        data.push({
            date: format(date, 'MMM dd'),
            forecast,
            upper: forecast * 1.15,
            lower: forecast * 0.85,
        });
    }
    return data;
};


// --- ALERTS ---
let alertId = 0;
const alertMessages = [
    { type: 'info', msg: 'New promotion "DIWALI25" is now live.' },
    { type: 'warning', msg: 'Inventory for "Quantum Laptop" is running low.' },
    { type: 'error', msg: 'Payment gateway API is experiencing delays.' },
    { type: 'info', msg: 'Daily sales target reached.' },
    { type: 'warning', msg: 'Unusual sales spike detected in Bangalore store.' },
];
export const generateAlert = (): Alert => {
  const randomAlert = alertMessages[Math.floor(Math.random() * alertMessages.length)];
  return {
    id: alertId++,
    type: randomAlert.type as 'info' | 'warning' | 'error',
    message: randomAlert.msg,
    timestamp: format(new Date(), 'HH:mm:ss'),
  };
};

// --- PRODUCTS ---
export const getTopProducts = (): Product[] => {
    return [
        { id: 'P001', name: 'Quantum Laptop', sales: 7850050 + Math.random() * 10000 },
        { id: 'P002', name: 'Nebula Smartwatch', sales: 6520075 + Math.random() * 10000 },
        { id: 'P003', name: 'Fusion Wireless Buds', sales: 5130020 + Math.random() * 10000 },
        { id: 'P004', name: 'Cybernetic Keyboard', sales: 4510000 + Math.random() * 10000 },
        { id: 'P005', name: 'Titan Gaming Mouse', sales: 3980090 + Math.random() * 10000 },
    ].sort((a, b) => b.sales - a.sales);
};


// --- ASSOCIATION RULES ---
export const getAssociationRules = (): AssociationRule[] => {
    return [
        { antecedents: ['Laptop'], consequents: ['Mouse'], support: 0.045, confidence: 0.68, lift: 3.1 },
        { antecedents: ['Headphones'], consequents: ['Smartwatch'], support: 0.031, confidence: 0.55, lift: 2.5 },
        { antecedents: ['Keyboard'], consequents: ['Mouse'], support: 0.062, confidence: 0.75, lift: 3.4 },
        { antecedents: ['Laptop Bag'], consequents: ['Laptop'], support: 0.05, confidence: 0.8, lift: 2.1 },
        { antecedents: ['Webcam'], consequents: ['Microphone'], support: 0.02, confidence: 0.6, lift: 4.0 }
    ];
};

// --- CUSTOMER SEGMENTATION ---
const generateRandomCustomer = (r_range: [number, number], f_range: [number, number], m_range: [number, number]): { id: string; rfm: RFMData } => ({
  id: `C${Math.floor(Math.random() * 10000)}`,
  rfm: {
    recency: r_range[0] + Math.random() * (r_range[1] - r_range[0]),
    frequency: f_range[0] + Math.random() * (f_range[1] - f_range[0]),
    monetary: m_range[0] + Math.random() * (m_range[1] - m_range[0]),
  }
});

export const getCustomerSegments = (): CustomerSegment[] => {
  const segments: Omit<CustomerSegment, 'description' | 'avgRFM' | 'customerCount'>[] = [
    { id: 1, name: 'Champions', customers: Array.from({ length: 50 }, () => generateRandomCustomer([1, 30], [10, 50], [100000, 500000])) },
    { id: 2, name: 'Loyal Customers', customers: Array.from({ length: 80 }, () => generateRandomCustomer([31, 90], [5, 20], [50000, 200000])) },
    { id: 3, name: 'At-Risk Customers', customers: Array.from({ length: 40 }, () => generateRandomCustomer([91, 180], [1, 5], [10000, 80000])) },
    { id: 4, name: 'New Customers', customers: Array.from({ length: 60 }, () => generateRandomCustomer([1, 60], [1, 3], [5000, 50000])) },
    { id: 5, name: 'Lost Customers', customers: Array.from({ length: 25 }, () => generateRandomCustomer([181, 365], [1, 2], [1000, 10000])) },
  ];

  return segments.map(s => {
    const totalRFM = s.customers.reduce((acc, c) => ({
      recency: acc.recency + c.rfm.recency,
      frequency: acc.frequency + c.rfm.frequency,
      monetary: acc.monetary + c.rfm.monetary,
    }), { recency: 0, frequency: 0, monetary: 0 });

    return {
      ...s,
      description: 'Click "Generate AI Descriptions" to get insights for this segment.',
      customerCount: s.customers.length,
      avgRFM: {
        recency: totalRFM.recency / s.customers.length,
        frequency: totalRFM.frequency / s.customers.length,
        monetary: totalRFM.monetary / s.customers.length,
      }
    };
  });
};
