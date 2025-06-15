'use client';

import { CheckCircle, Download, Book, AlertTriangle, Wand2 } from 'lucide-react';

interface ResultsSectionProps {
  results: {
    result: string;
    requestData: {
      userId: string;
      name?: string;
      autoCompile: boolean;
    };
  };
  onDownloadJar: (userId: string, pluginName: string) => void;
  onDownloadInstructions: () => void;
}

export function ResultsSection({ 
  results, 
  onDownloadJar, 
  onDownloadInstructions 
}: ResultsSectionProps) {
  if (!results) return null;

  const { result, requestData } = results;
  const isSuccess = result.includes('COMPILATION SUCCESSFUL');
  const hasAutoFix = result.includes('fixed after') || result.includes('auto-fix');

  return (
    <div className="mt-8">
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            <CheckCircle className="inline w-5 h-5 text-green-500 mr-2" />
            Generation Results
          </h3>
          <div className="space-y-4">
            {/* Main Result */}
            <div className={`border-l-4 p-4 ${
              isSuccess 
                ? 'border-green-400 bg-green-50' 
                : 'border-yellow-400 bg-yellow-50'
            }`}>
              <div className="flex">
                <div className="flex-shrink-0">
                  {isSuccess ? (
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-yellow-400" />
                  )}
                </div>
                <div className="ml-3 flex-1">
                  <h3 className={`text-sm font-medium ${
                    isSuccess ? 'text-green-800' : 'text-yellow-800'
                  }`}>
                    {isSuccess ? 'Plugin Generated Successfully!' : 'Generation Completed with Warnings'}
                  </h3>
                  <div className={`mt-2 text-sm ${
                    isSuccess ? 'text-green-700' : 'text-yellow-700'
                  }`}>
                    <pre className="whitespace-pre-wrap font-mono text-xs bg-white p-3 rounded border overflow-x-auto">
                      {result}
                    </pre>
                  </div>
                </div>
              </div>
            </div>

            {/* Auto-Fix Notice */}
            {hasAutoFix && (
              <div className="border-l-4 border-blue-400 bg-blue-50 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <Wand2 className="w-5 h-5 text-blue-400" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800">
                      AI Auto-Fix Applied
                    </h3>
                    <p className="mt-1 text-sm text-blue-700">
                      The AI automatically detected and fixed compilation errors during generation.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Request Details */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-gray-800 mb-2">Request Details:</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="font-medium text-gray-600">User ID:</span>
                  <span className="ml-1 text-gray-800">{requestData.userId}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Plugin Name:</span>
                  <span className="ml-1 text-gray-800">{requestData.name || 'Auto-generated'}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Auto-Compile:</span>
                  <span className="ml-1 text-gray-800">{requestData.autoCompile ? 'Yes' : 'No'}</span>
                </div>
              </div>
            </div>

            {/* Download Buttons */}
            {isSuccess && (
              <div className="text-center space-y-2">
                <div className="flex flex-col sm:flex-row gap-2 justify-center">
                  <button
                    onClick={() => onDownloadJar(requestData.userId, requestData.name || 'plugin_' + Date.now())}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download JAR File
                  </button>
                  <button
                    onClick={onDownloadInstructions}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    <Book className="w-4 h-4 mr-2" />
                    Installation Guide
                  </button>
                </div>
                <div id="downloadStatus" className="text-sm text-gray-600"></div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
