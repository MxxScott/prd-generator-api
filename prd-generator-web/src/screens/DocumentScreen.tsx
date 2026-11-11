import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { FileText, Code, Download, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

export default function DocumentScreen() {
  const { projectId } = useParams();
  
  const [generatingType, setGeneratingType] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const [generatedDocs, setGeneratedDocs] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<'PRD' | 'DESIGN_DOC'>('PRD');

  const handleGenerate = async (type: 'PRD' | 'DESIGN_DOC') => {
    if (generatedDocs[type]) {
      setActiveTab(type);
      return;
    }

    setGeneratingType(type); // Start the spinner on the specific button
    setError(null);

    try {
      const response = await fetch(`http://localhost:5000/api/projects/${projectId}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentType: type })
      });

      const data = await response.json();

      if (response.ok) {
        setGeneratedDocs(prev => ({ ...prev, [type]: data.markdown }));
        setActiveTab(type); // Switch tabs only after success
      } else {
        setError(data.error || 'Failed to generate document.');
      }
    } catch (err) {
      setError('Failed to connect to the backend.');
    } finally {
      setGeneratingType(null); // Stop the spinner
    }
  };

  // The exact Blob memory flow from the diagram
  const handleDownload = (type: 'PRD' | 'DESIGN_DOC') => {
    const markdownContent = generatedDocs[type];
    if (!markdownContent) return;

    const blob = new Blob([markdownContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `Almondsprings_${type}.md`; // In a real app, you'd pull the project name from state
    document.body.appendChild(a);
    a.click();
    
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-5xl mx-auto py-8">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-extrabold text-slate-900">Project Workspace</h1>
        <p className="mt-2 text-lg text-slate-600">
          Your scope is locked. Generate your engineering documents below.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700">
          <AlertCircle size={20} />
          <p className="font-medium">{error}</p>
        </div>
      )}

      {/* Control Panel */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        
        {/* PRD Card */}
        <div className={`p-6 rounded-2xl border-2 transition-all ${activeTab === 'PRD' ? 'border-blue-600 bg-blue-50/20' : 'border-slate-200 bg-white'}`}>
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 text-blue-700 rounded-lg">
                <FileText size={24} />
              </div>
              <div>
                <h2 className="font-bold text-lg">Product Requirements</h2>
                <p className="text-sm text-slate-500">Executive summary & feature list</p>
              </div>
            </div>
            {generatedDocs['PRD'] && <CheckCircle2 className="text-green-500" />}
          </div>
          
          <button 
            onClick={() => handleGenerate('PRD')}
            disabled={generatingType !== null}
            className="w-full py-3 rounded-lg font-semibold bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-50 transition-colors flex justify-center items-center gap-2"
          >
            {generatingType === 'PRD' ? <Loader2 className="animate-spin" size={18} /> : null}
            {generatedDocs['PRD'] ? 'View Document' : 'Generate PRD'}
          </button>
        </div>

        {/* Design Doc Card */}
        <div className={`p-6 rounded-2xl border-2 transition-all ${activeTab === 'DESIGN_DOC' ? 'border-purple-600 bg-purple-50/20' : 'border-slate-200 bg-white'}`}>
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 text-purple-700 rounded-lg">
                <Code size={24} />
              </div>
              <div>
                <h2 className="font-bold text-lg">Architecture & Design</h2>
                <p className="text-sm text-slate-500">Database schemas, APIs & UI</p>
              </div>
            </div>
            {generatedDocs['DESIGN_DOC'] && <CheckCircle2 className="text-green-500" />}
          </div>
          
          <button 
            onClick={() => handleGenerate('DESIGN_DOC')}
            disabled={generatingType !== null}
            className="w-full py-3 rounded-lg font-semibold bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-50 transition-colors flex justify-center items-center gap-2"
          >
            {generatingType === 'DESIGN_DOC' ? <Loader2 className="animate-spin" size={18} /> : null}
            {generatedDocs['DESIGN_DOC'] ? 'View Document' : 'Generate Design Doc'}
          </button>
        </div>

      </div>

      {/* Markdown Preview Area */}
      {generatedDocs[activeTab] && (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
          <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center justify-between">
            <h3 className="font-bold text-slate-700 flex items-center gap-2">
              {activeTab === 'PRD' ? <FileText size={18} /> : <Code size={18} />}
              {activeTab === 'PRD' ? 'PRD Preview' : 'Design Doc Preview'}
            </h3>
            <button 
              onClick={() => handleDownload(activeTab)}
              className="flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 px-4 py-2 rounded-lg transition-colors"
            >
              <Download size={16} />
              Download .md
            </button>
          </div>
          
          <div className="p-6 bg-slate-900 text-slate-300 overflow-y-auto max-h-[500px]">
            <pre className="whitespace-pre-wrap font-mono text-sm leading-relaxed">
              {generatedDocs[activeTab]}
            </pre>
          </div>
        </div>
      )}

    </div>
  );
}