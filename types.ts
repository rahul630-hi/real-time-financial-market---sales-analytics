export interface SalesData {
  time: string; // Typically HH:mm:ss for live data, or a formatted date string for static
  sales: number;
  date?: Date; // Original Date object for calculations
}

export interface ForecastDataPoint {
  date: string;
  forecast: number;
  upper: number;
  lower: number;
}

export interface Alert {
  id: number;
  type: 'info' | 'warning' | 'error';
  message: string;
  timestamp: string;
}

export interface Product {
  id: string;
  name: string;
  sales: number;
}

export interface AssociationRule {
  antecedents: string[];
  consequents: string[];
  support: number;
  confidence: number;
  lift: number;
}

export interface RFMData {
  recency: number;
  frequency: number;
  monetary: number;
}

export interface CustomerSegment {
  id: number;
  name: string;
  description: string;
  customerCount: number;
  avgRFM: RFMData;
  customers: { id: string; rfm: RFMData }[];
}