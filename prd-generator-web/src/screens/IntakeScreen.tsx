import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Sparkles, Loader2 } from 'lucide-react';

const THEMES = [
  { id: 'Corporate', label: 'Corporate & Professional', desc: 'Clean lines, high contrast, serious tone.' },
  { id: 'Playful', label: 'Playful & Vibrant', desc: 'Rounded corners, bright accents, friendly.' },
  { id: 'Dark Cyber', label: 'Dark Cyber', desc: 'Neon accents, dark backgrounds, tech-focused.' } // A little nod to your personal aesthetic!
];

const COLORS = [
  { hex: '#0047AB', name: 'Cobalt Blue' },
  { hex: '#10B981', name: 'Emerald' },
  { hex: '#8B5CF6', name: 'Violet' },
  { hex: '#FFB347', name: 'Pastel Orange' },
  { hex: '#0F172A', name: 'Slate Navy' }
];

export default function IntakeScreen() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    projectName: '',
    clientName: '',
    projectGoal: '',
    targetAudience: '',
    coreFeatures: '', // We'll split this by comma before sending
    themeStyle: 'Corporate',
    primaryColor: '#0047AB'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // 1. Format the data to match your backend schema
      const payload = {
        projectName: formData.projectName,
        clientName: formData.clientName,
        projectGoal: formData.projectGoal,
        targetAudience: formData.targetAudience,
        designPreferences: {
          themeStyle: formData.themeStyle,
          primaryColor: formData.primaryColor
        },
        coreFeaturesRequired: formData.coreFeatures.split(',').map(f => f.trim()).filter(Boolean)
      };

      // 2. Call the backend POST route we built on Sunday
      const response = await fetch('http://localhost:5000/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.ok) {
        // 3. Navigate to Phase 2, passing the new Project ID in the URL
        navigate(`/audit/${data.projectId}`);
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error(error);
      alert('Failed to connect to the backend. Is your Node server running?');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
          Architect a New Project
        </h1>
        <p className="mt-4 text-lg text-slate-600">
          Define the core requirements and visual identity. The AI Architect will audit your scope before generating the final engineering documents.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-10">
        
        {/* SECTION 1: Core Details */}
        <section className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm">1</span>
            Core Identity
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Project Name</label>
              <input 
                required
                type="text" 
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition"
                placeholder="e.g. Almondsprings Portal"
                value={formData.projectName}
                onChange={e => setFormData({...formData, projectName: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Client Name</label>
              <input 
                required
                type="text" 
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition"
                placeholder="e.g. Almondsprings School"
                value={formData.clientName}
                onChange={e => setFormData({...formData, clientName: e.target.value})}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">Project Goal</label>
              <textarea 
                required
                rows={3}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition"
                placeholder="What is the primary business objective of this software?"
                value={formData.projectGoal}
                onChange={e => setFormData({...formData, projectGoal: e.target.value})}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">Target Audience</label>
              <input 
                required
                type="text" 
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition"
                placeholder="e.g. Busy parents of toddlers"
                value={formData.targetAudience}
                onChange={e => setFormData({...formData, targetAudience: e.target.value})}
              />
            </div>
          </div>
        </section>

        {/* SECTION 2: Initial Scope */}
        <section className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm">2</span>
            Initial Feature Scope
          </h2>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Requested Features (Comma separated)</label>
            <textarea 
              required
              rows={3}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition"
              placeholder="e.g. Parent dashboard, Photo uploader, Emergency alerts"
              value={formData.coreFeatures}
              onChange={e => setFormData({...formData, coreFeatures: e.target.value})}
            />
            <p className="text-sm text-slate-500 mt-2">
              Don't worry if you miss something. The AI Architect will audit this list in the next step.
            </p>
          </div>
        </section>

        {/* SECTION 3: Visual Identity (The Premium Feel) */}
        <section className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm">3</span>
            Visual Identity
          </h2>
          
          <div className="mb-8">
            <label className="block text-sm font-medium text-slate-700 mb-4">UI Theme Style</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {THEMES.map(theme => (
                <div 
                  key={theme.id}
                  onClick={() => setFormData({...formData, themeStyle: theme.id})}
                  className={`cursor-pointer p-4 rounded-xl border-2 transition-all ${
                    formData.themeStyle === theme.id 
                    ? 'border-blue-600 bg-blue-50/50' 
                    : 'border-slate-200 hover:border-blue-300 bg-white'
                  }`}
                >
                  <div className="font-semibold text-slate-900 mb-1">{theme.label}</div>
                  <div className="text-xs text-slate-500 leading-snug">{theme.desc}</div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-4">Primary Brand Color</label>
            <div className="flex flex-wrap gap-4">
              {COLORS.map(color => (
                <button
                  key={color.hex}
                  type="button"
                  onClick={() => setFormData({...formData, primaryColor: color.hex})}
                  className={`relative w-12 h-12 rounded-full transition-transform hover:scale-110 focus:outline-none ${
                    formData.primaryColor === color.hex ? 'ring-4 ring-offset-2 ring-blue-500' : ''
                  }`}
                  style={{ backgroundColor: color.hex }}
                  title={color.name}
                >
                  {formData.primaryColor === color.hex && (
                    <Check className="absolute inset-0 m-auto text-white" size={20} />
                  )}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-8 py-4 rounded-xl font-semibold transition-colors disabled:opacity-70"
          >
            {isSubmitting ? (
              <><Loader2 className="animate-spin" size={20} /> Auditing Project...</>
            ) : (
              <><Sparkles size={20} /> Proceed to AI Audit</>
            )}
          </button>
        </div>

      </form>
    </div>
  );
}