import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, FileText, Code2, Sparkles, Check, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const SAMPLE_SCRIPTS = {
  matrix: {
    title: "The Matrix — Cyberpunk Script Excerpt",
    fileName: "matrix_excerpt.txt",
    text: `INT. HEART O' THE CITY HOTEL - NIGHT

A cold, dark room. Neon signs pulse outside the cracked window.
A glowing green phosphorescent light emanates from a computer terminal.

TRINITY:
I'm inside the mainframe. They're onto us.

CYPHER:
(over comms)
I told you this was dangerous. You should have waited for Morpheus.

TRINITY:
Morpheus believes he is the One. We don't have time to hesitate.

CYPHER:
If Agent Smith catches you, there won't be anything Morpheus can do.

TRINITY:
Smith doesn't know about the backdoor in the subway system. I'm extracting the encrypted cipher keys now.

CYPHER:
Good luck, Trinity. You're going to need it.

EXT. CITY STREET - NIGHT

Rain lashes against the asphalt. Black police cruisers screech around the corner.
AGENT SMITH steps out of the lead vehicle, adjusting his dark sunglasses under the street lamp.

AGENT SMITH:
Lieutenant, your men are already dead.

LIEUTENANT:
That's impossible! We sent two squads into that hotel!

AGENT SMITH:
No, Lieutenant. Your men entered a combat zone they do not comprehend. Order your units to seal the perimeter. The anomaly must not escape.`
  },
  goodwill: {
    title: "Good Will Hunting — Psychology Scene",
    fileName: "good_will_hunting.txt",
    text: `INT. SEAN'S OFFICE - DAY

DR. SEAN MAGUIRE sits across from WILL HUNTING in Cambridge, Massachusetts.

SEAN:
You know what occurred to me yesterday? You're just a kid. You don't have the faintest idea what you're talking about.

WILL:
Why, because I haven't been to Paris? Because I haven't read Michelangelo's biography at Harvard University?

SEAN:
If I ask you about art, you'd probably give me the skinny on every art book ever written. Michelangelo, you know a lot about him. But I bet you can't tell me what it smells like in the Sistine Chapel.

WILL:
I know how the paint dries.

SEAN:
You've never actually stood there and looked up at that beautiful ceiling. If I asked you about women, you'd probably give me a syllabus on your personal favorites. But you can't tell me what it feels like to wake up next to a woman and feel truly happy.

WILL:
I appreciate the lecture, Sean.

SEAN:
I look at you; I don't see an intelligent, confident man; I see a cocky, scared kid. But you're a genius, Will. No one denies that.`
  },
  interview: {
    title: "Senior AI Engineer Technical Interview",
    fileName: "tech_interview.txt",
    text: `INTERVIEWER:
Welcome Alex. Thanks for joining us today for the Senior AI Engineer technical discussion at Cognizant.

ALEX:
Thank you, Sarah. I'm excited to be here and discuss natural language processing architectures.

INTERVIEWER:
Great. Let's start with transformer models. How do you approach fine-tuning large language models for domain-specific entity extraction?

ALEX:
When approaching domain-specific NER, I typically begin by evaluating whether zero-shot inference with RoBERTa or spaCy transformers suffices. If the domain terminology is specialized, we curate an annotated dataset and fine-tune token classification heads with focal loss.

INTERVIEWER:
That makes sense. How do you handle latency and throughput in real-time inference microservices?

ALEX:
We leverage model quantization, ONNX runtime acceleration, and batching mechanisms in FastAPI or Triton.`
  }
};

const UploadZone = ({ onUploadSubmit, isSubmitting = false }) => {
  const [activeTab, setActiveTab] = useState('upload'); // 'upload' | 'paste'
  const [selectedFile, setSelectedFile] = useState(null);
  const [pastedText, setPastedText] = useState('');
  const [customTitle, setCustomTitle] = useState('');

  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    if (rejectedFiles && rejectedFiles.length > 0) {
      const err = rejectedFiles[0].errors[0];
      if (err.code === 'file-too-large') {
        toast.error('File exceeds maximum size limit of 5 MB.');
      } else {
        toast.error('Only .txt and .json files are supported.');
      }
      return;
    }

    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setSelectedFile(file);
      if (!customTitle) {
        setCustomTitle(file.name.replace(/\.[^/.]+$/, '').replace(/[_\-]+/g, ' '));
      }
      toast.success(`File "${file.name}" selected.`);
    }
  }, [customTitle]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/plain': ['.txt'],
      'application/json': ['.json']
    },
    maxSize: 5 * 1024 * 1024,
    multiple: false
  });

  const handleLoadSample = (key) => {
    const sample = SAMPLE_SCRIPTS[key];
    if (sample) {
      setActiveTab('paste');
      setPastedText(sample.text);
      setCustomTitle(sample.title);
      setSelectedFile(null);
      toast.success(`Loaded sample: ${sample.title}`);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (activeTab === 'upload') {
      if (!selectedFile) {
        toast.error('Please select or drop a transcript file.');
        return;
      }
      const formData = new FormData();
      formData.append('file', selectedFile);
      if (customTitle.trim()) {
        formData.append('title', customTitle.trim());
      }
      onUploadSubmit({ isFile: true, payload: formData });
    } else {
      if (!pastedText.trim()) {
        toast.error('Please paste transcript text.');
        return;
      }
      onUploadSubmit({
        isFile: false,
        payload: {
          title: customTitle.trim() || 'Pasted Transcript',
          text: pastedText.trim(),
          fileName: 'pasted_transcript.txt'
        }
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Sample Quick-Load Selector for Judges */}
      <div className="bg-gradient-to-r from-indigo-950/40 via-purple-950/30 to-slate-900/60 border border-indigo-500/20 p-4 rounded-2xl">
        <div className="flex items-center gap-2 mb-2.5 text-xs font-semibold text-indigo-300">
          <Sparkles className="w-4 h-4 text-indigo-400" />
          <span>Hackathon Demo Excerpts (Kaggle Movie Scripts & Transcripts)</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => handleLoadSample('matrix')}
            className="px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-indigo-600/30 text-xs font-medium text-slate-200 border border-slate-700 hover:border-indigo-500/50 transition-all flex items-center gap-1.5"
          >
            <FileText className="w-3.5 h-3.5 text-purple-400" />
            <span>The Matrix Script</span>
          </button>
          <button
            type="button"
            onClick={() => handleLoadSample('goodwill')}
            className="px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-indigo-600/30 text-xs font-medium text-slate-200 border border-slate-700 hover:border-indigo-500/50 transition-all flex items-center gap-1.5"
          >
            <FileText className="w-3.5 h-3.5 text-amber-400" />
            <span>Good Will Hunting</span>
          </button>
          <button
            type="button"
            onClick={() => handleLoadSample('interview')}
            className="px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-indigo-600/30 text-xs font-medium text-slate-200 border border-slate-700 hover:border-indigo-500/50 transition-all flex items-center gap-1.5"
          >
            <FileText className="w-3.5 h-3.5 text-cyan-400" />
            <span>Tech Interview</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800">
        <button
          type="button"
          onClick={() => setActiveTab('upload')}
          className={`px-5 py-2.5 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'upload'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <UploadCloud className="w-4 h-4" />
          <span>Upload File (.txt, .json)</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('paste')}
          className={`px-5 py-2.5 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'paste'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Code2 className="w-4 h-4" />
          <span>Paste Transcript Text</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Title Input */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Transcript Title <span className="text-slate-500">(Optional)</span>
          </label>
          <input
            type="text"
            value={customTitle}
            onChange={(e) => setCustomTitle(e.target.value)}
            placeholder="e.g. The Matrix Scene 1 / Q3 Strategy Review"
            className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
          />
        </div>

        {activeTab === 'upload' ? (
          <div>
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all ${
                isDragActive
                  ? 'border-indigo-500 bg-indigo-500/10'
                  : selectedFile
                  ? 'border-emerald-500/50 bg-emerald-500/5'
                  : 'border-slate-700 hover:border-slate-600 bg-slate-900/40 hover:bg-slate-900/60'
              }`}
            >
              <input {...getInputProps()} />
              <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
                <UploadCloud className="w-7 h-7" />
              </div>

              {selectedFile ? (
                <div className="space-y-1">
                  <div className="flex items-center justify-center gap-2 text-sm font-bold text-emerald-400">
                    <Check className="w-4 h-4" />
                    <span>{selectedFile.name}</span>
                  </div>
                  <p className="text-xs text-slate-400 font-mono">
                    {(selectedFile.size / 1024).toFixed(1)} KB • {selectedFile.type || 'Plain Text'}
                  </p>
                  <p className="text-[11px] text-slate-500 pt-2">
                    Click or drag another file to replace
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-slate-200">
                    {isDragActive ? 'Drop the file here' : 'Drag & drop transcript file here, or browse'}
                  </p>
                  <p className="text-xs text-slate-400">
                    Supports <span className="text-slate-300 font-mono">.txt</span> and{' '}
                    <span className="text-slate-300 font-mono">.json</span> files up to 5 MB
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Raw Transcript Text <span className="text-rose-400">*</span>
            </label>
            <textarea
              rows={10}
              value={pastedText}
              onChange={(e) => setPastedText(e.target.value)}
              placeholder="Paste dialogue, interview text, meeting minutes, or movie script with scene headings (e.g. INT. SCENE - DAY)..."
              className="w-full px-4 py-3 rounded-2xl bg-slate-900 border border-slate-700 text-slate-100 placeholder-slate-500 text-sm font-mono focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all leading-relaxed"
            />
            <div className="flex justify-between text-xs text-slate-500 mt-1">
              <span>Supports movie scripts, dialogues, speaker colons, and timestamps.</span>
              <span>{pastedText.length} characters</span>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting || (activeTab === 'upload' && !selectedFile) || (activeTab === 'paste' && !pastedText.trim())}
          className="w-full py-3 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed text-white font-semibold text-sm transition-all shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Uploading & Queuing Pipeline...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Extract Metadata & Analyze</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default UploadZone;
