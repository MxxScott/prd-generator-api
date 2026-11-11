import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2, CheckCircle2, XCircle, ArrowRight } from 'lucide-react';

interface Suggestion {
  suggestionId: string;
  title: string;
  description: string;
}

export default function AuditScreen() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [acceptedIds, setAcceptedIds] = useState<Set<string>>(new Set());
  
  const [isAuditing, setIsAuditing] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Use a ref to prevent React StrictMode from double-firing the AI generation on mount
  const hasAudited = useRef(false);

  useEffect(() => {
    const runAIAudit = async () => {
      if (hasAudited.current) return;
      hasAudited.current = true;

      try {
        const response = await fetch(`http://localhost:5000/api/projects/${projectId}/audit`, {
          method: 'POST',
        });
        const data = await response.json();

        if (response.ok) {
          setSuggestions(data.suggestions);
        } else {
          setError(data.error);
        }
      } catch (err) {
        setError('Failed to connect to the AI Architect.');
      } finally {
        setIsAuditing(false);
      }
    };

    runAIAudit();
  }, [projectId]);

  const toggleSuggestion = (id: string) => {
    setAcceptedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSaveDecisions = async () => {
    setIsSaving(true);
    try {
      const response = await fetch(`http://localhost:5000/api/projects/${projectId}/suggestions`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          acceptedSuggestionIds: Array.from(acceptedIds)
        })
      });

      if (response.ok) {
        navigate(`/document/${projectId}`);
      } else {
        const data = await response.json();
        alert(`Error: ${data.error}`);
      }
    } catch (err) {
      alert('Failed to save decisions.');
    } finally {
      setIsSaving(false);
    }
  };

  if (error) {
    return <div className="p-10 text-red-600 text-center font-bold">{error}</div>;
  }

  if (isAuditing) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
        <div className="relative">
          <div className="absolute inset-0 bg-blue-500 rounded-full animate-ping opacity-20"></div>
          <Loader2 className="w-16 h-16 text-blue-600 animate-spin relative z-10" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800">The AI is Auditing your Scope...</h2>
        <p className="text-slate-500 max-w-md text-center">
          Analyzing target audience and requirements to identify missing enterprise features, security gaps, and monetization opportunities.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="mb-10">
        <h1 className="text-3xl font-extrabold text-slate-900">Audit Complete</h1>
        <p className="mt-2 text-lg text-slate-600">
          The AI Architect has reviewed your project and suggested the following additions. Select the features you want to include in the final engineering document.
        </p>
      </div>

      <div className="space-y-4 mb-10">
        {suggestions.map((suggestion) => {
          const isSelected = acceptedIds.has(suggestion.suggestionId);
          return (
            <div 
              key={suggestion.suggestionId}
              onClick={() => toggleSuggestion(suggestion.suggestionId)}
              className={`cursor-pointer group relative p-6 rounded-2xl border-2 transition-all duration-200 ${
                isSelected 
                  ? 'border-blue-600 bg-blue-50/30 shadow-md' 
                  : 'border-slate-200 bg-white hover:border-blue-300 hover:shadow-sm'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="mt-1 flex-shrink-0">
                  {isSelected ? (
                    <CheckCircle2 className="w-7 h-7 text-blue-600" />
                  ) : (
                    <div className="w-7 h-7 rounded-full border-2 border-slate-300 group-hover:border-blue-300 transition-colors" />
                  )}
                </div>
                <div>
                  <h3 className={`text-lg font-bold ${isSelected ? 'text-blue-900' : 'text-slate-900'}`}>
                    {suggestion.title}
                  </h3>
                  <p className="mt-2 text-slate-600 leading-relaxed">
                    {suggestion.description}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="text-slate-600 font-medium">
          <span className="text-blue-600 font-bold text-lg">{acceptedIds.size}</span> features selected to add to scope
        </div>
        <button
          onClick={handleSaveDecisions}
          disabled={isSaving}
          className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-8 py-3 rounded-xl font-semibold transition-colors disabled:opacity-70"
        >
          {isSaving ? <Loader2 className="animate-spin" size={20} /> : 'Finalize & Generate'}
          {!isSaving && <ArrowRight size={20} />}
        </button>
      </div>
    </div>
  );
}