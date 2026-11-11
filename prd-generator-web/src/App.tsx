import { BrowserRouter, Routes, Route } from 'react-router-dom';
import IntakeScreen from './screens/IntakeScreen';
import AuditScreen from './screens/AuditScreen';
import DocumentScreen from './screens/DocumentScreen';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-50 flex flex-col">
        {/* Simple Global Header */}
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
              AI
            </div>
            <h1 className="font-semibold text-lg tracking-tight">Product Architect</h1>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 max-w-5xl w-full mx-auto p-6">
          <Routes>
            <Route path="/" element={<IntakeScreen />} />
            <Route path="/audit/:projectId" element={<AuditScreen />} />
            <Route path="/document/:projectId" element={<DocumentScreen />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;