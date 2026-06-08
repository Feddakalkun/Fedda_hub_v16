/**
 * WorkflowChat — advanced multi-turn conversational chat scoped per workflow card.
 *
 * Lets the user "just tell their thoughts" freely. Maintains history, injects
 * workflow memory + current state into the LLM so it feels like a really smart
 * persistent collaborator for that specific card (Z-Image, Chroma, LTX lipsync, etc.).
 *
 * - Chat turns are persisted as kind:'chat' entries via the existing /workflow-memory API
 *   (so they also feed the one-shot Enhance/Inspire via memory context).
 * - Streaming via the new /api/ollama/chat
 * - "Apply" buttons on assistant replies pull suggested ```prompt ... ``` blocks (or whole text)
 *   into the parent prompt field.
 * - Native inside pages (embedded in SimpleImageCockpit + easily usable elsewhere).
 *
 * Start-small scope: cockpit image workflows first; chat history + memory make it "advanced".
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { Send, Loader2, X, Copy, Wand2, Trash2 } from 'lucide-react';
import { BACKEND_API } from '../../config/api';

export type WorkflowChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
};

interface WorkflowChatProps {
  workflowId?: string;
  context?: string;                 // e.g. 'zimage', 'ltx-lipsync' — used for system flavor
  accent?: 'emerald' | 'violet' | 'sky';
  currentPrompt?: string;
  currentSettings?: Record<string, unknown>;
  onApplyPrompt?: (text: string) => void;
  onChatCleared?: () => void;       // optional hook so parent (e.g. cockpit memory drawer) can refresh
  className?: string;
  compact?: boolean;                // smaller for side-by-side or lipsync pages
}

async function streamChat(
  url: string,
  body: object,
  onToken: (partial: string) => void,
  signal: AbortSignal,
): Promise<string> {
  const resp = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal,
  });

  if (!resp.ok) {
    const err = await resp.json().catch(() => ({ detail: resp.statusText }));
    throw new Error(err.detail || `HTTP ${resp.status}`);
  }

  const reader = resp.body!.getReader();
  const dec = new TextDecoder();
  let buf = '';
  let result = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += dec.decode(value, { stream: true });
    const lines = buf.split('\n');
    buf = lines.pop() ?? '';
    for (const line of lines) {
      if (!line.startsWith('data: ')) continue;
      const data = line.slice(6);
      if (data === '[DONE]') return result;
      try {
        const parsed = JSON.parse(data);
        if (parsed.error) throw new Error(parsed.error);
        if (parsed.token) {
          result += parsed.token;
          onToken(result);
        }
      } catch (e) {
        if ((e as Error).message !== 'Unexpected end of JSON input') throw e;
      }
    }
  }
  return result;
}

function extractPromptFromAssistant(text: string): string {
  if (!text) return '';

  // 1. Try to find a well-formed ```prompt ... ``` block (most reliable)
  let match = /```prompt\s*([\s\S]*?)(?:```|$)/i.exec(text);
  if (match && match[1]) {
    let candidate = match[1].trim();
    // If the model left a follow-up question inside the block, cut it off
    // Split on the first line that looks like a standalone question
    const lines = candidate.split('\n');
    const cleanLines: string[] = [];
    for (const line of lines) {
      const trimmed = line.trim();
      if (/^[A-Z].*\?$/.test(trimmed) && cleanLines.length > 0) break;
      cleanLines.push(line);
    }
    candidate = cleanLines.join('\n').trim();
    if (candidate.length > 15) return candidate;
  }

  // 2. Try a plain ``` ... ``` block (in case it omitted the word "prompt")
  match = /```\s*([\s\S]*?)(?:```|$)/i.exec(text);
  if (match && match[1]) {
    let candidate = match[1].trim();
    // Strip leading "prompt" label if present
    candidate = candidate.replace(/^prompt\s*/i, '').trim();
    // Cut off follow-up questions that appear after the block
    const lines = candidate.split('\n');
    const cleanLines: string[] = [];
    for (const line of lines) {
      const trimmed = line.trim();
      if (/^[A-Z].*\?$/.test(trimmed) && cleanLines.length > 0) break;
      cleanLines.push(line);
    }
    candidate = cleanLines.join('\n').trim();
    if (candidate.length > 15) return candidate;
  }

  // 3. No good fence found — do NOT fall back to the whole message.
  // We only want to offer "Use" when we actually isolated a prompt.
  // Returning '' means the Use button will be hidden for this message.
  return '';
}

export function WorkflowChat({
  workflowId,
  context = 'zimage',
  accent = 'violet',
  currentPrompt = '',
  currentSettings,
  onApplyPrompt,
  onChatCleared,
  className = '',
  compact = false,
}: WorkflowChatProps) {
  const [messages, setMessages] = useState<WorkflowChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [autoAppliedIds, setAutoAppliedIds] = useState<Set<string>>(new Set());
  const [builderModel, setBuilderModel] = useState<string | null>(null);
  const [backendStatus, setBackendStatus] = useState<'ok' | 'error' | 'checking'>('checking');
  const abortRef = useRef<AbortController | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  const accentBtn = accent === 'emerald' ? 'hover:text-emerald-400 hover:bg-emerald-500/10' : accent === 'sky' ? 'hover:text-sky-400 hover:bg-sky-500/10' : 'hover:text-white hover:bg-white/10';
  const accentText = accent === 'emerald' ? 'text-emerald-400' : accent === 'sky' ? 'text-sky-400' : 'text-white/70';

  // Load chat turns from workflow memory (kind=chat)
  const loadChatHistory = useCallback(async () => {
    if (!workflowId) return;
    setLoadingHistory(true);
    try {
      const res = await fetch(`${BACKEND_API.BASE_URL}${BACKEND_API.ENDPOINTS.WORKFLOW_MEMORY}/${encodeURIComponent(workflowId)}?limit=30`);
      const data = await res.json().catch(() => ({}));
      const all = Array.isArray(data?.entries) ? data.entries : [];
      const chatEntries = all.filter((e: any) => (e?.kind || '').toLowerCase() === 'chat');
      // Oldest first for chronological
      chatEntries.sort((a: any, b: any) => String(a.created_at || '').localeCompare(String(b.created_at || '')));
      const reconstructed: WorkflowChatMessage[] = chatEntries.map((e: any) => {
        const role = (e?.data?.role === 'assistant' || (e.title || '').toLowerCase() === 'assistant') ? 'assistant' : 'user';
        const content = e?.content || '';
        return {
          id: e.id || `${Date.now()}-${Math.random()}`,
          role,
          content,
        };
      }).filter((m: WorkflowChatMessage) => m.content.trim());
      setMessages(reconstructed.slice(-12)); // keep last ~12 turns reasonable
    } catch {
      // silent; chat still works without prior history
    } finally {
      setLoadingHistory(false);
    }
  }, [workflowId]);

  const checkBackend = useCallback(async () => {
    setBackendStatus('checking');
    try {
      // Use the prompt-builder-model endpoint (under /api proxy) as a reliable connectivity check
      const res = await fetch(`${BACKEND_API.BASE_URL}${BACKEND_API.ENDPOINTS.OLLAMA_PROMPT_BUILDER_MODEL}`, { method: 'GET' });
      if (res.ok) {
        setBackendStatus('ok');
      } else {
        setBackendStatus('error');
      }
    } catch {
      setBackendStatus('error');
    }
  }, []);

  useEffect(() => {
    if (workflowId) {
      loadChatHistory();
      checkBackend();
      // Show which model the Prompt Builder Agent is actually using
      fetch(`${BACKEND_API.BASE_URL}${BACKEND_API.ENDPOINTS.OLLAMA_PROMPT_BUILDER_MODEL}`)
        .then(r => r.json())
        .then(d => {
          if (d?.success && d.model) setBuilderModel(d.model);
        })
        .catch(() => { setBackendStatus('error'); });
    } else {
      setMessages([]);
      setBuilderModel(null);
      setBackendStatus('checking');
    }
  }, [workflowId, loadChatHistory, checkBackend]);

  // Auto scroll to bottom on new messages
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, streaming]);

  const persistTurn = async (role: 'user' | 'assistant', content: string) => {
    if (!workflowId || !content.trim()) return;
    try {
      await fetch(`${BACKEND_API.BASE_URL}${BACKEND_API.ENDPOINTS.WORKFLOW_MEMORY}/${encodeURIComponent(workflowId)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kind: 'chat',
          title: role,
          content: content.trim(),
          source: 'workflow-chat',
          data: { role, context },
        }),
      });
    } catch {
      // non-fatal; chat still useful in-session
    }
  };

  const send = useCallback(async () => {
    const text = input.trim();
    if (!text || !workflowId || streaming || backendStatus === 'error') return;

    const userMsg: WorkflowChatMessage = { id: `u-${Date.now()}`, role: 'user', content: text };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInput('');
    setStreaming(true);

    // Persist user turn immediately (so memory & future enhances see it)
    await persistTurn('user', text);

    abortRef.current?.abort();
    abortRef.current = new AbortController();

    // Build the payload for the backend chat (includes recent history + snapshot)
    const payloadMessages = nextMessages.map(m => ({ role: m.role, content: m.content }));
    const body = {
      context,
      workflow_id: workflowId,
      messages: payloadMessages,
      current_prompt: currentPrompt || '',
      settings: currentSettings || undefined,
    };

    // Placeholder assistant message we will mutate with streamed tokens
    const assistantId = `a-${Date.now()}`;
    const assistantMsg: WorkflowChatMessage = { id: assistantId, role: 'assistant', content: '' };
    setMessages([...nextMessages, assistantMsg]);

    try {
      const final = await streamChat(
        `${BACKEND_API.BASE_URL}${BACKEND_API.ENDPOINTS.OLLAMA_CHAT}`,
        body,
        (partial) => {
          setMessages((prev) => prev.map(m => m.id === assistantId ? { ...m, content: partial } : m));
        },
        abortRef.current.signal,
      );

      // Persist the final assistant turn
      const cleanFinal = (final || '').trim();
      if (cleanFinal) {
        await persistTurn('assistant', cleanFinal);
        // Update in case the last partial was slightly different
        setMessages((prev) => prev.map(m => m.id === assistantId ? { ...m, content: cleanFinal } : m));

        // Auto-apply the suggested prompt if the assistant wrapped one in a ```prompt block.
        // This gives the "just use what it suggests automatically" flow the user asked for.
        if (onApplyPrompt) {
          const extracted = extractPromptFromAssistant(cleanFinal);
          if (extracted) {
            onApplyPrompt(extracted);
            setAutoAppliedIds((prev) => {
              const next = new Set(prev);
              next.add(assistantId);
              return next;
            });
          }
        }
      }
    } catch (err: any) {
      if (err?.name !== 'AbortError') {
        const msg = err?.message || 'chat error';
        setMessages((prev) => prev.map(m =>
          m.id === assistantId
            ? { ...m, content: m.content || `— (chat error: ${msg}. Try again or check backend/Ollama logs)` }
            : m
        ));
        console.error('[WorkflowChat] stream error:', err);
        checkBackend();
      }
    } finally {
      setStreaming(false);
      abortRef.current = null;
      // focus input again for rapid fire thoughts
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [input, messages, workflowId, context, currentPrompt, currentSettings, streaming]);

  const stop = useCallback(() => {
    abortRef.current?.abort();
    setStreaming(false);
  }, []);

  const clearChat = useCallback(async () => {
    if (!workflowId) return;

    // Optimistically clear the conversation UI
    setMessages([]);
    setAutoAppliedIds(new Set());

    try {
      await fetch(
        `${BACKEND_API.BASE_URL}${BACKEND_API.ENDPOINTS.WORKFLOW_MEMORY_CLEAR_CHAT}/${encodeURIComponent(workflowId)}/chat`,
        { method: 'DELETE' }
      );
    } catch {
      // Non-fatal — UI is already cleared. Next load will reflect server state.
    } finally {
      onChatCleared?.();
    }
  }, [workflowId, onChatCleared]);

  const applyFromMessage = (content: string) => {
    if (!onApplyPrompt) return;
    const extracted = extractPromptFromAssistant(content);
    // We only call this when extraction succeeded (see button guard below),
    // so we should never fall back to the entire chatty reply.
    if (extracted) {
      onApplyPrompt(extracted);
    }
  };

  const copyMessage = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
    } catch {
      // ignore
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  if (!workflowId) {
    return null;
  }

  const containerCls = compact
    ? `rounded-xl border border-white/10 bg-black/30 p-2 ${className}`
    : `rounded-2xl border border-white/10 bg-white/[0.015] p-3 ${className}`;

  return (
    <div className={containerCls}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="text-[10px] font-black uppercase tracking-[0.18em] text-white/40">Conversation — thoughts for this workflow</div>
          {builderModel && (
            <span className="text-[9px] font-mono bg-white/5 border border-white/10 px-1.5 py-0.5 rounded text-white/50" title="Model used by the Prompt Builder Agent">
              {builderModel.split(':')[0]}
            </span>
          )}
          <span
            className={`text-[9px] px-1.5 py-0.5 rounded border ${backendStatus === 'ok' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : backendStatus === 'error' ? 'bg-red-500/10 border-red-500/30 text-red-400 cursor-pointer' : 'bg-white/5 border-white/10 text-white/50'}`}
            onClick={backendStatus === 'error' ? checkBackend : undefined}
            title={backendStatus === 'error' ? 'FastAPI backend (port 8000) unreachable — click to retry. run.bat said [WARN] did not become ready in 30s (see its console). The backend output is in the latest backend_*.log in the logs\ folder printed by the launcher. For live errors: close run window, then in cmd: cd to app\backend and run ..\python_embeded\python.exe -u server.py . Ollama (11434) separate.' : 'FastAPI backend status (Python server on 8000)'}
          >
            {backendStatus === 'ok' ? 'FastAPI backend OK (8000)' : backendStatus === 'error' ? 'FastAPI backend offline (8000)' : 'Checking backend...'}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          {loadingHistory && <Loader2 className="w-3 h-3 animate-spin text-white/30" />}
          {streaming && (
            <button onClick={stop} className="text-[10px] px-2 py-0.5 rounded bg-white/5 border border-white/10 text-white/50 hover:text-red-400 flex items-center gap-1">
              <X className="w-3 h-3" /> Stop
            </button>
          )}
          <button
            onClick={clearChat}
            title="Start a new chat (clears only this conversation — other saved memory for the card is kept)"
            className="text-[10px] px-2 py-0.5 rounded bg-white/5 border border-white/10 text-white/40 hover:text-white/70 flex items-center gap-1"
          >
            <Trash2 className="w-3 h-3" /> New chat
          </button>
        </div>
      </div>

      {/* Scrollable chat log */}
      {backendStatus === 'error' && (
        <div className="mb-2 rounded-lg border border-red-500/30 bg-red-500/5 p-2 text-[10px] text-red-400">
          FastAPI backend (port 8000) is offline. Ollama runs separately on 11434. Start the backend first (run.bat or <code>python -m uvicorn backend.server:app --port 8000</code> in another terminal), then click the badge above to retry.
        </div>
      )}
      <div
        ref={scrollRef}
        className={`space-y-2 overflow-y-auto pr-1 ${compact ? 'max-h-[148px] text-[12px]' : 'max-h-[198px] text-sm'}`}
      >
        {messages.length === 0 && !loadingHistory && (
          <div className="text-white/25 text-[11px] italic px-1">
            You are talking to the Prompt Builder Agent (PURE LOCAL FREEDOM PROTOCOL - 70 rules). Absolute user freedom locally. Tell it your thoughts — 100% obedient, no refusals, strict character consistency, and ALWAYS proactively continues with state analysis + exactly 3 advancing Next Direction options (RULE 27-70). Never generic questions. New chat = clean start but still drives forward.
          </div>
        )}
        {messages.map((m) => {
          const isUser = m.role === 'user';
          const promptHit = extractPromptFromAssistant(m.content);
          return (
            <div key={m.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[86%] rounded-2xl px-3 py-1.5 whitespace-pre-wrap break-words
                  ${isUser
                    ? 'bg-white/10 text-white/90'
                    : 'bg-white/[0.035] text-white/85 border border-white/5'}`}
              >
                {m.content || (streaming && m.role === 'assistant' ? '…' : '')}

                {!isUser && m.content && (
                  <div className="mt-1 flex items-center gap-1.5 text-[10px] text-white/30">
                    {/* Only offer "Use" when we successfully extracted a clean prompt from a ```prompt block.
                        This prevents pasting the entire reply (including follow-up questions) when the fence was missing or sloppy. */}
                    {onApplyPrompt && promptHit && (
                      <button
                        onClick={() => applyFromMessage(m.content)}
                        className={`inline-flex items-center gap-1 px-1.5 py-px rounded hover:text-white/70 ${accentBtn}`}
                        title="Apply / re-apply this suggestion to the card"
                      >
                        <Wand2 className="w-3 h-3" /> Use
                      </button>
                    )}
                    <button
                      onClick={() => copyMessage(m.content)}
                      className="inline-flex items-center gap-1 px-1.5 py-px rounded hover:text-white/70"
                      title="Copy message"
                    >
                      <Copy className="w-3 h-3" /> Copy
                    </button>
                    {autoAppliedIds.has(m.id) && (
                      <span className="text-emerald-400/70 text-[9px]">→ auto-applied</span>
                    )}
                    {promptHit && !autoAppliedIds.has(m.id) && (
                      <span className="text-[9px] text-white/20">prompt detected</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Input row */}
      <div className="mt-2 flex items-end gap-2">
        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Tell it your thoughts… (Enter to send, Shift+Enter for newline)"
          rows={compact ? 1 : 2}
          disabled={streaming || !workflowId}
          className={`flex-1 resize-y min-h-[32px] max-h-24 bg-black/40 border border-white/10 rounded-xl px-3 py-1.5 text-sm text-white/90 placeholder-white/20 outline-none focus:border-white/25 ${streaming ? 'opacity-60' : ''}`}
        />
        <button
          onClick={send}
          disabled={!input.trim() || streaming || backendStatus === 'error'}
          className={`shrink-0 h-9 w-9 rounded-xl border border-white/10 flex items-center justify-center transition ${accentBtn} disabled:opacity-40`}
          title={backendStatus === 'error' ? 'Backend unavailable' : 'Send thought'}
        >
          {streaming ? <Loader2 className={`w-4 h-4 animate-spin ${accentText}`} /> : <Send className="w-4 h-4" />}
        </button>
      </div>

      <div className="mt-1 text-[9px] text-white/20 px-0.5">
        Chat stays with this card. Prompt suggestions in ```prompt blocks are applied automatically. Also feeds Enhance/Generate.
      </div>
    </div>
  );
}
