"use client";

import React, { useState, useEffect } from "react";
import { Code, Bug, Zap, Sparkles, Loader2, RefreshCw, AlertCircle, Copy, Check, History } from "lucide-react";
import Editor from "react-simple-code-editor";
import Prism from "prismjs";

// Import basic Prism dark theme styles for highlight matching
import "prismjs/components/prism-clike";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-python";
import "prismjs/components/prism-java";
import "prismjs/components/prism-c"; //  Cleaned up version

// Fallback CSS token highlighting styles injected into the document scope
const highlightStyles = `
  .token.comment, .token.prolog, .token.doctype, .token.cdata { color: #5c6370; font-style: italic; }
  .token.function { color: #61afef; }
  .token.keyword { color: #c678dd; }
  .token.string, .token.char { color: #98c379; }
  .token.number, .token.boolean { color: #d19a66; }
  .token.operator, .token.entity, .token.url { color: #56b6c2; }
  .token.class-name, .token.type { color: #e5c07b; }
`;

export default function Home() {
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("Python");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [result, setResult] = useState<{
    bugs: string;
    optimization: string;
    improved_code: string;
  } | null>(null);

  // Injects styling context for token elements matching Prism outputs
  useEffect(() => {
    const styleElement = document.createElement("style");
    styleElement.innerHTML = highlightStyles;
    document.head.appendChild(styleElement);
    return () => { document.head.removeChild(styleElement); };
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await fetch("http://127.0.0.1:8000/api/history");
      if (res.ok) {
        const data = await res.json();
        setHistory(data);
      }
    } catch (err) {
      console.error("Failed fetching record histories", err);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleAnalyze = async () => {
    if (!code.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("http://127.0.0.1:8000/api/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ raw_code: code, language }),
      });

      if (!response.ok) throw new Error("Failed to communicate with core gateway server.");
      const data = await response.json();
      
      if (data.ai_analysis) {
        setResult(data.ai_analysis);
        fetchHistory();
      } else {
        throw new Error("Invalid payload format received from upstream service.");
      }
    } catch (err: any) {
      setError(err.message || "Failed to fetch data.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!result?.improved_code) return;
    try {
      await navigator.clipboard.writeText(result.improved_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text into clipboard context", err);
    }
  };

  // Selects grammar mapping models for Prism styling passes
  const getHighlightGrammar = () => {
    switch (language.toLowerCase()) {
      case "javascript": return Prism.languages.javascript;
      case "typescript": return Prism.languages.typescript || Prism.languages.javascript;
      case "python": return Prism.languages.python;
      case "java": return Prism.languages.java || Prism.languages.clike;
      default: return Prism.languages.clike;
    }
  };

  return (
    <div className="min-h-screen bg-[#090b10] text-slate-100 font-sans flex">
      {/* LEFT SIDEBAR: History Panel */}
      <aside className="w-80 bg-[#05070c] border-r border-slate-800/60 p-6 flex flex-col gap-4 hidden md:flex shrink-0">
        <h2 className="text-xs font-bold tracking-widest text-slate-400 uppercase flex items-center gap-2">
          <History className="w-3.5 h-3.5 text-indigo-400" /> System Submission logs
        </h2>
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
          {history.length === 0 ? (
            <p className="text-slate-600 text-xs italic mt-2">No historical checks logged.</p>
          ) : (
            history.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  setCode(item.raw_code);
                  setLanguage(item.language);
                  setResult(item.ai_analysis);
                }}
                className="p-3 bg-slate-900/40 border border-slate-800/80 rounded-xl hover:border-indigo-500/40 hover:bg-slate-900/80 cursor-pointer transition-all group"
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] px-2 py-0.5 font-bold rounded-md bg-indigo-950 text-indigo-400 group-hover:bg-indigo-900 group-hover:text-indigo-300">
                    {item.language}
                  </span>
                  <span className="text-[10px] text-slate-500">ID: #{item.id}</span>
                </div>
                <p className="text-slate-400 text-xs font-mono truncate">{item.raw_code}</p>
              </div>
            ))
          )}
        </div>
      </aside>

      {/* MAIN LAYOUT PAGE */}
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto mb-8 flex justify-between items-center border-b border-slate-800/60 pb-6">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
              AI Code Reviewer Hub
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Submit your workspace syntax files for instant static checks and optimizations.
            </p>
          </div>
          <button
            onClick={() => { setCode(""); setResult(null); setError(null); }}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200 bg-slate-900/60 hover:bg-slate-900 border border-slate-800 rounded-lg transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Reset Workspace
          </button>
        </div>

        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Editor Input Column */}
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center bg-slate-900/40 border border-slate-800/60 p-3 rounded-xl backdrop-blur-md">
              <span className="text-xs font-bold tracking-widest text-slate-400 uppercase">Interactive Workspace Editor</span>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="bg-[#0f121d] border border-slate-800 text-slate-300 text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer font-medium"
              >
                <option>Python</option>
                <option>JavaScript</option>
                <option>TypeScript</option>
                <option>Java</option>
              </select>
            </div>

            {/* UPGRADED DYNAMIC TEXT HIGHLIGHTER PANEL */}
            <div className="rounded-xl border border-slate-800/80 bg-[#05070c] overflow-y-auto h-[500px] p-4 font-mono text-sm shadow-2xl shadow-indigo-950/10 custom-editor-scrollbar">
              <Editor
                value={code}
                onValueChange={(code) => setCode(code)}
                highlight={(code) => Prism.highlight(code, getHighlightGrammar(), language.toLowerCase())}
                padding={10}
                placeholder="Paste code structures inside workspace editor panel..."
                style={{
                  fontFamily: '"Fira code", "Fira Mono", monospace',
                  fontSize: 14,
                  outline: "none",
                  minHeight: "100%",
                }}
                className="w-full text-slate-300 bg-transparent leading-relaxed"
              />
            </div>

            <button
              onClick={handleAnalyze}
              disabled={loading || !code.trim()}
              className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:from-slate-800/80 disabled:to-slate-800/80 disabled:text-slate-500 text-white font-semibold rounded-xl shadow-xl shadow-indigo-950/20 active:scale-[0.99] transition-all flex items-center justify-center gap-2 text-sm border border-indigo-400/20 disabled:border-none"
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Compiling Engine Vectors...</>
              ) : (
                <><Sparkles className="w-4 h-4" /> Analyze Codebase</>
              )}
            </button>
          </div>

          {/* Results Analysis Column */}
          <div className="space-y-6">
            {error && (
              <div className="p-4 bg-red-950/40 border border-red-900/60 text-red-200 rounded-xl flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm text-red-400">Network Exception Encountered</h4>
                  <p className="text-xs text-red-300/80 mt-1">{error}</p>
                </div>
              </div>
            )}

            {!result && !loading && !error && (
              <div className="h-full min-h-[580px] border border-dashed border-slate-800/80 rounded-2xl flex flex-col items-center justify-center text-center p-8 bg-slate-900/10">
                <Code className="w-8 h-8 opacity-40 text-slate-600 mb-4" />
                <h3 className="text-slate-400 font-medium text-sm tracking-wide">Awaiting Submission Vector</h3>
                <p className="text-slate-500 text-xs max-w-xs mt-2 leading-relaxed">
                  Paste code structures inside the source editor panel and click Analyze to initiate AI processes.
                </p>
              </div>
            )}

            {loading && (
              <div className="h-full min-h-[580px] border border-slate-800/60 rounded-2xl flex flex-col items-center justify-center text-center p-8 bg-[#05070c]">
                <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mb-4" />
                <h3 className="text-slate-300 font-medium text-sm">Running Pipeline Analytics</h3>
                <p className="text-slate-500 text-xs max-w-xs mt-2 animate-pulse">
                  Consulting remote machine models and committing telemetry schemas to database layer...
                </p>
              </div>
            )}

            {result && (
              <div className="space-y-6">
                <div className="p-6 bg-red-950/10 border border-red-900/30 rounded-xl relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-red-500/60" />
                  <h3 className="text-red-400 font-bold text-sm flex items-center gap-2 mb-3"><Bug className="w-4 h-4" /> Security Gaps & Logical Bugs</h3>
                  <p className="text-red-200/90 text-xs whitespace-pre-wrap font-medium">{result.bugs}</p>
                </div>

                <div className="p-6 bg-amber-950/10 border border-amber-900/20 rounded-xl relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-amber-500/60" />
                  <h3 className="text-amber-400 font-bold text-sm flex items-center gap-2 mb-3"><Zap className="w-4 h-4" /> Optimization & Bottleneck Reviews</h3>
                  <p className="text-amber-200/90 text-xs whitespace-pre-wrap font-medium">{result.optimization}</p>
                </div>

                <div className="border border-slate-800/80 bg-[#05070c] rounded-xl overflow-hidden shadow-2xl">
                  <div className="flex justify-between items-center bg-slate-950/80 border-b border-slate-800/60 px-5 py-3">
                    <h3 className="text-indigo-400 font-bold text-sm flex items-center gap-2"><Code className="w-4 h-4" /> Structural Refactoring Output</h3>
                    <button onClick={handleCopy} className="flex items-center gap-1.5 px-3 py-1 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200 text-xs font-medium rounded-md transition-all">
                      {copied ? <><Check className="w-3.5 h-3.5 text-emerald-400" /><span className="text-emerald-400">Copied!</span></> : <><Copy className="w-3.5 h-3.5" /><span>Copy Code</span></>}
                    </button>
                  </div>
                  <div className="p-5 overflow-x-auto max-h-[300px]">
                    <pre className="text-emerald-400/90 font-mono text-xs whitespace-pre">{result.improved_code}</pre>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}