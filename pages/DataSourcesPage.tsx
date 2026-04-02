import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { parseFile } from '../services/fileParserService';
import { SalesData } from '../types';
import { UploadIcon } from '../components/icons';

interface DataSourcesPageProps {
  onDataUpload: (data: { salesData?: SalesData[], textData?: string }) => void;
}

const DataSourcesPage: React.FC<DataSourcesPageProps> = ({ onDataUpload }) => {
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [parsing, setParsing] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setError(null);
    setParsing(true);
    setFiles(acceptedFiles);

    for (const file of acceptedFiles) {
      try {
        const result = await parseFile(file);
        onDataUpload(result);
      } catch (e: any) {
        setError(`Error processing ${file.name}: ${e.message}`);
      }
    }
    setParsing(false);
  }, [onDataUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/pdf': ['.pdf'],
    }
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Data Sources</h2>
        <p className="text-gray-400">Upload your own data files to power the dashboard.</p>
      </div>

      <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700/50">
        <div
          {...getRootProps()}
          className={`p-10 border-2 border-dashed rounded-lg cursor-pointer transition-colors
            ${isDragActive ? 'border-indigo-500 bg-indigo-900/20' : 'border-gray-600 hover:border-gray-500'}
            text-center`}
        >
          <input {...getInputProps()} />
          <UploadIcon className="h-12 w-12 mx-auto text-gray-500 mb-4" />
          {isDragActive ? (
            <p className="text-indigo-400">Drop the files here ...</p>
          ) : (
            <p className="text-gray-400">Drag & drop files here, or click to select files</p>
          )}
          <p className="text-xs text-gray-500 mt-2">Supported: CSV, XLS, XLSX, PDF</p>
        </div>
      </div>

      {(files.length > 0 || error) && (
        <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700/50">
            <h3 className="text-lg font-semibold text-white mb-4">Upload Status</h3>
            {parsing && <p className="text-yellow-400">Parsing files...</p>}
            {error && <p className="text-red-400 p-3 bg-red-900/30 rounded-md">{error}</p>}
            {files.length > 0 && !parsing && !error && (
                <p className="text-green-400 p-3 bg-green-900/30 rounded-md">
                    Successfully processed {files.length} file(s). Dashboards have been updated.
                </p>
            )}
            <ul className="list-disc list-inside mt-4 text-gray-300">
                {files.map(file => (
                    <li key={file.name}>{file.name} - {file.type}</li>
                ))}
            </ul>
        </div>
      )}
    </div>
  );
};

export default DataSourcesPage;