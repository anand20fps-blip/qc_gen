import { PYTHON_BACKEND_CODE } from '../lib/python-code';
import { Terminal, Copy, CheckCircle2, Server } from 'lucide-react';
import { useState } from 'react';

export function PythonBackend() {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(PYTHON_BACKEND_CODE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-8 max-w-5xl mx-auto h-full overflow-y-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 mb-2">Local Python Backend</h1>
        <p className="text-zinc-500">
          To process PDFs locally without internet access, you need to run the Python backend on your machine.
          This UI will automatically connect to it.
        </p>
      </div>

      <div className="space-y-8">
        {/* Step 1 */}
        <section>
          <h2 className="text-lg font-medium text-zinc-900 mb-4 flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-zinc-900 text-white text-xs font-bold">1</span>
            Install Dependencies
          </h2>
          <div className="bg-zinc-950 rounded-xl p-4 flex items-center justify-between group">
            <code className="text-emerald-400 font-mono text-sm">
              pip install fastapi uvicorn pymupdf scikit-learn numpy python-multipart
            </code>
            <button 
              onClick={() => navigator.clipboard.writeText('pip install fastapi uvicorn pymupdf scikit-learn numpy python-multipart')}
              className="text-zinc-500 hover:text-white transition-colors"
              title="Copy to clipboard"
            >
              <Copy className="w-4 h-4" />
            </button>
          </div>
        </section>

        {/* Step 2 */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-zinc-900 flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-zinc-900 text-white text-xs font-bold">2</span>
              Save the Backend Code
            </h2>
            <button 
              onClick={handleCopy}
              className="flex items-center gap-2 text-sm font-medium text-zinc-600 hover:text-zinc-900 bg-white border border-zinc-200 px-3 py-1.5 rounded-lg shadow-sm transition-all"
            >
              {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied!' : 'Copy Code'}
            </button>
          </div>
          <p className="text-sm text-zinc-500 mb-4">Save the following code as <code>main.py</code> in your local directory.</p>
          
          <div className="bg-zinc-950 rounded-xl overflow-hidden border border-zinc-800">
            <div className="flex items-center px-4 py-2 bg-zinc-900 border-b border-zinc-800 text-xs text-zinc-400 font-mono">
              main.py
            </div>
            <div className="p-4 overflow-x-auto">
              <pre className="text-sm font-mono text-zinc-300">
                <code>{PYTHON_BACKEND_CODE}</code>
              </pre>
            </div>
          </div>
        </section>

        {/* Step 3 */}
        <section>
          <h2 className="text-lg font-medium text-zinc-900 mb-4 flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-zinc-900 text-white text-xs font-bold">3</span>
            Run the Server
          </h2>
          <div className="bg-zinc-950 rounded-xl p-4 flex items-center justify-between group">
            <code className="text-emerald-400 font-mono text-sm">
              uvicorn main:app --reload --host 0.0.0.0 --port 8000
            </code>
            <button 
              onClick={() => navigator.clipboard.writeText('uvicorn main:app --reload --host 0.0.0.0 --port 8000')}
              className="text-zinc-500 hover:text-white transition-colors"
              title="Copy to clipboard"
            >
              <Copy className="w-4 h-4" />
            </button>
          </div>
          <div className="mt-4 p-4 bg-emerald-50 border border-emerald-100 rounded-xl flex items-start gap-3">
            <Server className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-emerald-900 mb-1">Ready to Connect</h4>
              <p className="text-sm text-emerald-700">
                Once the server is running, go back to the <strong>Analyzer</strong> tab. 
                When you upload a PDF, this dashboard will automatically send it to your local Python backend for processing.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
