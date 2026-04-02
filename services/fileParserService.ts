import * as XLSX from 'xlsx';
import * as pdfjsLib from 'pdfjs-dist';
import { SalesData } from '../types';
import { format as formatDate, parseISO } from 'date-fns';

// Helper to parse date, accommodating various common formats
const parseDate = (dateValue: any): Date | null => {
    if (dateValue instanceof Date) return dateValue;
    if (typeof dateValue === 'string') {
        // Attempt to parse ISO string or other common formats
        const parsed = new Date(dateValue);
        if (!isNaN(parsed.getTime())) return parsed;
    }
    if (typeof dateValue === 'number') {
        // Handle Excel's numeric date format
        const excelEpoch = new Date(1899, 11, 30);
        const jsMillis = excelEpoch.getTime() + dateValue * 86400000;
        const parsed = new Date(jsMillis);
        if (!isNaN(parsed.getTime())) return parsed;
    }
    return null;
}

const parseTabularData = (file: File): Promise<{ salesData: SalesData[] }> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = e.target?.result;
                const workbook = XLSX.read(data, { type: 'array' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet);

                if (jsonData.length === 0) {
                    throw new Error("The file is empty or has no data.");
                }

                // Find header keys, case-insensitive
                const headers = Object.keys(jsonData[0]);
                const dateKey = headers.find(h => h.toLowerCase().includes('date') || h.toLowerCase().includes('time'));
                const salesKey = headers.find(h => h.toLowerCase().includes('sales'));
                
                if (!dateKey || !salesKey) {
                    throw new Error("File must contain columns with 'date'/'time' and 'sales' in the header.");
                }

                const salesData = jsonData.map((row, index) => {
                    const date = parseDate(row[dateKey]);
                    const sales = parseFloat(row[salesKey]);

                    if (!date || isNaN(sales)) {
                        console.warn(`Skipping row ${index + 2} due to invalid data.`);
                        return null;
                    }
                    
                    return {
                        date: date,
                        time: formatDate(date, 'MMM d, yyyy'),
                        sales: sales,
                    };
                // FIX: The original type predicate `(d): d is SalesData` was incorrect because the mapped object type is more specific than SalesData (it has a required `date`).
                // Using `filter(Boolean)` correctly removes nulls and lets TypeScript infer the correct type, which includes a non-optional `date`.
                }).filter(Boolean);

                if (salesData.length === 0) {
                    throw new Error("No valid sales data could be parsed from the file.");
                }
                
                // Sort data by date
                // FIX: Removed non-null assertion `!` as the type is now correctly inferred to have a `date` property after the filter.
                salesData.sort((a, b) => a.date.getTime() - b.date.getTime());

                resolve({ salesData });

            } catch (error: any) {
                reject(error);
            }
        };
        reader.onerror = (err) => reject(new Error("Failed to read file."));
        reader.readAsArrayBuffer(file);
    });
};

const parsePdfData = (file: File): Promise<{ textData: string }> => {
    return new Promise(async (resolve, reject) => {
        try {
            // Configure the worker right before use to avoid race conditions on module load.
            pdfjsLib.GlobalWorkerOptions.workerSrc = (window as any).pdfjsWorker;

            const reader = new FileReader();
            reader.onload = async (e) => {
                const data = e.target?.result as ArrayBuffer;
                const pdf = await pdfjsLib.getDocument({ data }).promise;
                let fullText = '';

                for (let i = 1; i <= pdf.numPages; i++) {
                    const page = await pdf.getPage(i);
                    const textContent = await page.getTextContent();
                    fullText += textContent.items.map(item => ('str' in item ? item.str : '')).join(' ') + '\n';
                }
                resolve({ textData: fullText });
            };
            reader.onerror = (err) => reject(new Error("Failed to read PDF file."));
            reader.readAsArrayBuffer(file);
        } catch (error) {
            reject(error);
        }
    });
};

export const parseFile = async (file: File): Promise<{ salesData?: SalesData[], textData?: string }> => {
    const fileType = file.type;
    const fileName = file.name.toLowerCase();

    if (fileType === 'text/csv' || fileName.endsWith('.csv') || fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
        return parseTabularData(file);
    } else if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
        return parsePdfData(file);
    } else {
        throw new Error(`Unsupported file type: ${fileType || 'unknown'}`);
    }
};