/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef } from "react";
import Markdown from "react-markdown";
import { Copy, Loader2, Sparkles, Send, CheckCircle2, History, Trash2, ArrowRight, Printer, ExternalLink } from "lucide-react";
import { summarizeUpdates } from "./lib/gemini";
import { cn } from "./lib/utils";

export default function App() {
  const [inputText, setInputText] = useState("");
  const [summary, setSummary] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [showPrintWarning, setShowPrintWarning] = useState(false);

  const handleGenerate = async () => {
    if (!inputText.trim()) return;
    
    setIsGenerating(true);
    setError(null);
    setSummary(null);
    setIsCopied(false);
    setShowPrintWarning(false);

    try {
      const result = await summarizeUpdates(inputText);
      setSummary(result);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "An unexpected error occurred while generating the summary.");
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    if (summary) {
      navigator.clipboard.writeText(summary);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const handlePrint = () => {
    // If the app is running inside an iframe (like AI Studio's preview), window.print() might be blocked.
    if (window.self !== window.top) {
      setShowPrintWarning(true);
      setTimeout(() => setShowPrintWarning(false), 6000);
    } else {
      window.print();
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFCFB] text-[#1C1C1C] font-sans flex flex-col p-6 md:p-12 overflow-hidden print:overflow-visible print:p-0">
      
      {/* Toast Notification for Iframe Printing */}
      {showPrintWarning && (
        <div className="fixed top-6 left-1/2 justify-center -translate-x-1/2 z-50 flex items-center gap-3 bg-[#1C1C1C] text-white px-6 py-4 shadow-xl border border-stone-800 animate-in fade-in slide-in-from-top-4 duration-300 print:hidden">
          <ExternalLink className="w-5 h-5 text-gray-300" />
          <div className="flex flex-col">
            <span className="text-sm font-bold uppercase tracking-widest truncate">Open in New Tab</span>
            <span className="text-xs font-serif italic text-gray-300">Printing is disabled in this preview. Use the icon in the top right of the editor to open this app in a new tab.</span>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="flex flex-col md:flex-row md:justify-between items-start md:items-baseline border-b-2 border-[#1C1C1C] pb-6 mb-10 shrink-0 gap-4">
        <div>
          <h1 className="text-5xl md:text-7xl font-serif font-black tracking-tighter leading-none italic">The Roll-up.</h1>
          <p className="text-[10px] md:text-xs uppercase tracking-widest font-bold mt-2 md:mt-4 opacity-60">AI-Powered Digest Generator</p>
        </div>
        <div className="hidden md:block print:hidden">
           <span className="px-4 py-2 bg-[#1C1C1C] text-white text-[10px] font-bold uppercase tracking-widest">
            Executive View
          </span>
        </div>
      </header>

      {/* Main Content */}
      <main className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 flex-1 min-h-0 print:block">
        {/* Left Column: Input */}
        <section className="lg:col-span-5 lg:border-r border-black border-opacity-10 lg:pr-10 flex flex-col min-h-[400px] print:hidden">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#1C1C1C] block">Extract from Raw Chaos</span>
            {inputText && (
              <button 
                onClick={() => setInputText("")}
                className="text-[10px] text-gray-400 hover:text-red-600 font-bold uppercase tracking-widest flex items-center gap-1 transition-colors"
                title="Clear input"
              >
                Clear
              </button>
            )}
          </div>
          
          <div className="flex-1 relative mb-8">
            <textarea
               className="w-full h-full resize-none outline-none text-[#1C1C1C] font-serif italic leading-relaxed bg-stone-100 p-6 border-l-4 border-[#1C1C1C] placeholder:text-gray-400 placeholder:not-italic focus:border-red-600 transition-colors"
              placeholder="Paste raw updates, scattered Slack threads, bullet points, meeting notes...&#10;&#10;e.g.&#10;- Frontend team finished the dashboard revamp!&#10;- Still waiting on design assets for the mobile nav.&#10;- DB migration went smoothly with 0 downtime.&#10;- Need to follow up with John regarding Q3 roadmap..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />
          </div>

          <div className="mt-auto">
            <button
              onClick={handleGenerate}
              disabled={!inputText.trim() || isGenerating}
              className="w-full bg-[#1C1C1C] hover:bg-opacity-80 disabled:bg-stone-200 disabled:text-stone-400 disabled:cursor-not-allowed text-white text-xs font-bold uppercase tracking-widest py-4 px-6 flex items-center justify-center gap-3 transition-all"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Synthesizing
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Generate Synthesis
                </>
              )}
            </button>
            {error && (
               <div className="mt-4 p-4 bg-red-50 border-l-4 border-red-600">
                 <h3 className="text-[10px] font-bold leading-tight text-red-900 uppercase tracking-widest">Generation Error</h3>
                 <p className="text-sm text-red-800 mt-2 font-serif italic">{error}</p>
               </div>
            )}
          </div>
        </section>

        {/* Right Column: Output */}
        <section className="lg:col-span-7 flex flex-col min-h-[400px] print:col-span-12 print:min-h-0 print:block">
          <div className="flex justify-between items-end border-b border-[#1C1C1C] pb-2 mb-8 print:hidden">
            <span className="text-[10px] font-bold uppercase tracking-widest text-red-600">Executive Synthesis</span>
            <div className="flex items-center gap-4">
              <button
                onClick={handlePrint}
                disabled={!summary || isGenerating}
                className="text-[10px] text-[#1C1C1C] hover:text-gray-500 disabled:opacity-30 font-bold uppercase tracking-widest flex items-center gap-2 transition-colors cursor-pointer disabled:cursor-not-allowed"
              >
                <Printer className="w-3 h-3" />
                Print / PDF
              </button>
              <button
                onClick={copyToClipboard}
                disabled={!summary || isGenerating}
                 className="text-[10px] text-[#1C1C1C] hover:text-gray-500 disabled:opacity-30 font-bold uppercase tracking-widest flex items-center gap-2 transition-colors cursor-pointer disabled:cursor-not-allowed"
              >
                {isCopied ? <CheckCircle2 className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                {isCopied ? "Copied" : "Copy Document"}
              </button>
            </div>
          </div>

          <div className={cn(
            "flex-1 overflow-y-auto pr-4 print:overflow-visible print:pr-0 print:h-auto",
            !summary && !isGenerating && "flex items-center justify-center text-center",
            isGenerating && "opacity-50 pointer-events-none"
          )}>
            {isGenerating ? (
              <div className="h-full flex flex-col items-center justify-center space-y-6 text-[#1C1C1C] mt-10">
                <Loader2 className="w-8 h-8 animate-spin" />
                <p className="font-serif italic text-lg opacity-80">Curating narratives from raw text...</p>
              </div>
            ) : summary ? (
              <div className="markdown-body prose prose-stone lg:prose-lg prose-headings:font-sans prose-headings:uppercase prose-headings:tracking-widest prose-headings:text-sm prose-headings:font-bold prose-headings:border-b prose-headings:border-black prose-headings:pb-3 prose-h2:mt-10 prose-h2:mb-6 prose-p:font-serif prose-p:text-[15px] prose-p:leading-relaxed prose-li:font-serif prose-li:text-[15px] prose-strong:font-black prose-a:text-red-600 max-w-none">
                <Markdown>{summary}</Markdown>
              </div>
            ) : (
              <div className="max-w-md text-gray-400 mt-16 mx-auto">
                 <h2 className="text-4xl text-[#1C1C1C] font-serif font-light leading-tight mb-6 text-center underline underline-offset-8 decoration-1">
                   Awaiting Context.
                 </h2>
                 <p className="font-serif italic text-[15px] text-center leading-relaxed text-[#1C1C1C] opacity-70">
                   Paste disparate updates and threads on the left. The engine will synthesize a clean, structured rollup, omitting noise and elevating signal.
                 </p>
              </div>
            )}
          </div>
          
           {/* Footer Branding */}
          <div className="mt-8 flex justify-between items-center pt-8 border-t border-black border-opacity-10 shrink-0">
            <div className="flex gap-4">
               <div className="w-3 h-3 lg:w-4 lg:h-4 bg-black"></div>
               <div className="w-3 h-3 lg:w-4 lg:h-4 bg-stone-300"></div>
               <div className="w-3 h-3 lg:w-4 lg:h-4 border border-black"></div>
            </div>
            <p className="text-[10px] font-serif italic opacity-60">Generated by Roll-up Intelligence • Studio Edition</p>
          </div>
        </section>
      </main>
    </div>
  );
}
