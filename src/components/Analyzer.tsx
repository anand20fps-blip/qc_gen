import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, AlertCircle, CheckCircle2, Loader2, Info } from 'lucide-react';
import { QCResult, QCIssue } from '../lib/types';

export function Analyzer() {
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<QCResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = async (file: File) => {
    if (file.type !== 'application/pdf') {
      setError('Please upload a valid PDF file.');
      return;
    }

    setError(null);
    setIsAnalyzing(true);
    setResult(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      // Attempt to connect to the local Python backend
      const response = await fetch('http://localhost:8000/api/analyze', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Backend returned an error');
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      console.log("Local backend not found, falling back to mock mode", err);
      // Fallback: Mock mode if Python backend is not running
      setTimeout(() => {
        setResult({
          filename: file.name,
          total_pages: 120,
          issues_found: 4,
          issues: [
            { type: 'Widow', page: 14, description: 'Potential widow detected at the top of the page.', severity: 'medium' },
            { type: 'Orphan', page: 22, description: 'Potential orphan detected at the bottom of the page.', severity: 'medium' },
            { type: 'Empty Page', page: 45, description: 'Page contains no text or images.', severity: 'high' },
            { type: 'Missing Page Number', page: 8, description: 'No page number detected in header or footer.', severity: 'low' },
          ]
        });
        setIsAnalyzing(false);
      }, 2000);
      return;
    }

    setIsAnalyzing(false);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'medium': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'low': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      default: return 'bg-zinc-500/10 text-zinc-500 border-zinc-500/20';
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto h-full overflow-y-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 mb-2">PDF Quality Control</h1>
        <p className="text-zinc-500">Upload a book PDF to analyze for widows, orphans, empty pages, and formatting issues.</p>
      </div>

      {!isAnalyzing && !result && (
        <div
          className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all cursor-pointer
            ${isDragging ? 'border-emerald-500 bg-emerald-50/50' : 'border-zinc-300 hover:border-zinc-400 hover:bg-zinc-50'}
          `}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept=".pdf"
            onChange={handleFileSelect}
          />
          <div className="w-16 h-16 bg-zinc-100 text-zinc-400 rounded-full flex items-center justify-center mx-auto mb-4">
            <UploadCloud className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-medium text-zinc-900 mb-1">Click or drag PDF to upload</h3>
          <p className="text-sm text-zinc-500">Supports PDF files up to 500MB</p>
          
          {error && (
            <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm inline-flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}
        </div>
      )}

      {isAnalyzing && (
        <div className="border rounded-2xl p-12 text-center bg-white shadow-sm">
          <Loader2 className="w-12 h-12 text-emerald-500 animate-spin mx-auto mb-4" />
          <h3 className="text-lg font-medium text-zinc-900 mb-1">Analyzing Document...</h3>
          <p className="text-sm text-zinc-500">Running unsupervised learning models for layout analysis.</p>
        </div>
      )}

      {result && !isAnalyzing && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-zinc-900">{result.filename}</h2>
                <p className="text-sm text-zinc-500">{result.total_pages} pages analyzed</p>
              </div>
            </div>
            <button 
              onClick={() => setResult(null)}
              className="px-4 py-2 text-sm font-medium text-zinc-600 bg-zinc-100 hover:bg-zinc-200 rounded-lg transition-colors"
            >
              Analyze Another File
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-sm">
              <div className="text-sm font-medium text-zinc-500 mb-1">Total Issues Found</div>
              <div className="text-3xl font-semibold text-zinc-900">{result.issues_found}</div>
            </div>
            <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-sm">
              <div className="text-sm font-medium text-zinc-500 mb-1">Critical Errors</div>
              <div className="text-3xl font-semibold text-red-600">
                {result.issues.filter(i => i.severity === 'high').length}
              </div>
            </div>
            <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-sm">
              <div className="text-sm font-medium text-zinc-500 mb-1">Warnings</div>
              <div className="text-3xl font-semibold text-amber-500">
                {result.issues.filter(i => i.severity === 'medium').length}
              </div>
            </div>
          </div>

          <div className="bg-white border border-zinc-200 rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-zinc-200 bg-zinc-50 flex items-center justify-between">
              <h3 className="font-medium text-zinc-900">Detailed Findings</h3>
              {result.issues_found === 0 && (
                <span className="inline-flex items-center gap-1.5 text-sm text-emerald-600 font-medium">
                  <CheckCircle2 className="w-4 h-4" /> Passed all checks
                </span>
              )}
            </div>
            
            {result.issues.length > 0 ? (
              <div className="divide-y divide-zinc-100">
                {result.issues.map((issue, idx) => (
                  <div key={idx} className="p-4 hover:bg-zinc-50 transition-colors flex items-start gap-4">
                    <div className="w-16 flex-shrink-0 text-center">
                      <div className="text-xs font-medium text-zinc-400 uppercase tracking-wider mb-1">Page</div>
                      <div className="text-lg font-semibold text-zinc-900">{issue.page}</div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-zinc-900">{issue.type}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${getSeverityColor(issue.severity)}`}>
                          {issue.severity}
                        </span>
                      </div>
                      <p className="text-sm text-zinc-600">{issue.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center text-zinc-500">
                No issues found in this document.
              </div>
            )}
          </div>
          
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-3 text-blue-800 text-sm">
            <Info className="w-5 h-5 flex-shrink-0 text-blue-500" />
            <p>
              <strong>Note:</strong> If the local Python backend is not running on <code>localhost:8000</code>, 
              this dashboard runs in <em>Mock Mode</em> to demonstrate the UI. To process real PDFs, 
              please set up the Python backend via the instructions in the "Python Backend" tab.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
