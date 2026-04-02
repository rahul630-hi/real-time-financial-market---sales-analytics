import React, { useState, useCallback, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import HomeDashboard from './pages/HomeDashboard';
import ForecastingPage from './pages/ForecastingPage';
import SegmentationPage from './pages/SegmentationPage';
import MarketBasketPage from './pages/MarketBasketPage';
import SalesRaisePage from './pages/SalesRaisePage';
import DataSourcesPage from './pages/DataSourcesPage';
import { MenuIcon } from './components/icons';
import { SalesData } from './types';
import * as MockData from './services/mockDataService';
import * as GeminiService from './services/geminiService';

type Page = 'home' | 'forecasting' | 'segmentation' | 'market-basket' | 'sales-raise' | 'datasources';

// Mock previous day's total for daily change calculation
const PREVIOUS_DAY_TOTAL = 1.85e7; // Mock 1.85 Cr

const App: React.FC = () => {
  const [activePage, setActivePage] = useState<Page>('home');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // --- State Management ---
  // Flag to check if we are using live data or uploaded data
  const [isLiveData, setIsLiveData] = useState(true);

  // State for real-time simulated data
  const [liveSalesData, setLiveSalesData] = useState<SalesData[]>(MockData.generateInitialSalesData());
  const [totalSalesToday, setTotalSalesToday] = useState(0);
  const [dailyChange, setDailyChange] = useState(0);

  // State for user-uploaded data
  const [uploadedSalesData, setUploadedSalesData] = useState<SalesData[] | null>(null);
  const [documentText, setDocumentText] = useState<string | null>(null);
  const [documentAnalysis, setDocumentAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // Effect for live data simulation
  useEffect(() => {
    if (!isLiveData) return;

    const initialTotal = liveSalesData.reduce((sum, d) => sum + d.sales, 0);
    setTotalSalesToday(initialTotal);
    setDailyChange(((initialTotal - PREVIOUS_DAY_TOTAL) / PREVIOUS_DAY_TOTAL) * 100);

    const salesInterval = setInterval(() => {
      const newDataPoint = MockData.generateNewSalesDataPoint();
      
      setLiveSalesData(prevData => {
        const newData = [...prevData, newDataPoint];
        if (newData.length > 1800) newData.shift();
        return newData;
      });

      setTotalSalesToday(prevTotal => {
          const newTotal = prevTotal + newDataPoint.sales;
          setDailyChange(((newTotal - PREVIOUS_DAY_TOTAL) / PREVIOUS_DAY_TOTAL) * 100);
          return newTotal;
      });
    }, 2000);

    return () => clearInterval(salesInterval);
  }, [isLiveData]);

  const handleDataUpload = (data: { salesData?: SalesData[], textData?: string }) => {
    if (data.salesData) {
      setUploadedSalesData(data.salesData);
      setDocumentText(null);
      setDocumentAnalysis(null);
      setIsLiveData(false);
      setActivePage('home'); // Switch to dashboard after upload
    }
    if (data.textData) {
      setDocumentText(data.textData);
      setDocumentAnalysis(null);
      // Don't switch off live data for text uploads, as they are for insights
    }
  };
  
  const handleAnalyzeDocument = async () => {
      if (!documentText) return;
      setIsAnalyzing(true);
      setDocumentAnalysis(null);
      try {
          const result = await GeminiService.analyzeDocumentText(documentText);
          setDocumentAnalysis(result);
      } catch (error) {
          setDocumentAnalysis("Sorry, an error occurred while analyzing the document.");
      } finally {
          setIsAnalyzing(false);
      }
  };

  const renderPage = useCallback(() => {
    const currentSalesData = uploadedSalesData || liveSalesData;
    const latestSales = currentSalesData.length > 0 ? currentSalesData[currentSalesData.length - 1].sales : 50000;

    switch (activePage) {
      case 'home':
        return <HomeDashboard 
                  isLiveData={isLiveData}
                  salesData={currentSalesData} 
                  totalSalesToday={totalSalesToday} 
                  dailyChange={dailyChange}
                  documentText={documentText}
                  documentAnalysis={documentAnalysis}
                  isAnalyzing={isAnalyzing}
                  onAnalyzeDocument={handleAnalyzeDocument}
                />;
      case 'forecasting':
        return <ForecastingPage latestSales={latestSales} historicalData={uploadedSalesData} />;
      case 'segmentation':
        return <SegmentationPage />;
      case 'market-basket':
        return <MarketBasketPage />;
      case 'sales-raise':
        return <SalesRaisePage />;
      case 'datasources':
        return <DataSourcesPage onDataUpload={handleDataUpload} />;
      default:
        return <HomeDashboard isLiveData={isLiveData} salesData={currentSalesData} totalSalesToday={totalSalesToday} dailyChange={dailyChange} />;
    }
  }, [activePage, isLiveData, liveSalesData, uploadedSalesData, totalSalesToday, dailyChange, documentText, documentAnalysis, isAnalyzing]);

  return (
    <div className="flex h-screen bg-gray-900 text-gray-200 font-sans">
      <Sidebar 
        activePage={activePage} 
        setActivePage={setActivePage}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700 p-4 flex items-center">
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 mr-4 text-gray-400 hover:text-white lg:hidden">
            <MenuIcon />
          </button>
          <h1 className="text-xl font-semibold text-white capitalize">{activePage.replace('-', ' ')}</h1>
        </header>
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-900 p-4 sm:p-6 lg:p-8">
          {renderPage()}
        </main>
      </div>
    </div>
  );
};

export default App;