import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Analyzer } from './components/Analyzer';
import { PythonBackend } from './components/PythonBackend';

export default function App() {
  const [currentTab, setCurrentTab] = useState('analyzer');

  return (
    <div className="flex h-screen w-full bg-zinc-50 overflow-hidden font-sans">
      <Sidebar currentTab={currentTab} setCurrentTab={setCurrentTab} />
      
      <main className="flex-1 h-full overflow-hidden relative">
        {currentTab === 'analyzer' && <Analyzer />}
        {currentTab === 'python' && <PythonBackend />}
        {currentTab === 'settings' && (
          <div className="p-8 max-w-5xl mx-auto h-full flex flex-col items-center justify-center text-zinc-500">
            <h2 className="text-2xl font-semibold text-zinc-900 mb-2">Settings</h2>
            <p>Configure backend URL and analysis parameters here.</p>
          </div>
        )}
      </main>
    </div>
  );
}
