import { useState, useRef, useEffect } from "react";
import { ArrowUp } from "lucide-react";
import { DoubtMessage } from "@/services/doubtService";
import MessageBubble from "@/components/doubt/MessageBubble";

interface DoubtChatProps {
  messages: DoubtMessage[];
  isSending: boolean;
  onSendMessage: (text: string) => void;
}

export default function DoubtChat({ messages, isSending, onSendMessage }: DoubtChatProps) {
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isSending]);

  function handleSend() {
    const trimmed = input.trim();
    if (!trimmed || isSending) return;
    onSendMessage(trimmed);
    setInput("");
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  // The pill-shaped input box — reused in both the empty-state (centered)
  // and active-chat (pinned bottom) layouts, so it's pulled out once here
  // instead of duplicated.
  const InputPill = (
    <div className="flex items-end gap-2 rounded-full border border-[#9CB68A]/40 bg-white px-4 py-2 shadow-sm">
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Ask anything"
        rows={1}
        className="flex-1 resize-none bg-transparent text-sm text-[#2D3B2A] placeholder:text-[#2D3B2A]/40 focus:outline-none max-h-32 py-1.5"
        disabled={isSending}
      />
      <button
        onClick={handleSend}
        disabled={isSending || !input.trim()}
        className="shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-[#2D3B2A] text-[#FAF7F2] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#2D3B2A]/90 transition-colors"
        aria-label="Send message"
      >
        <ArrowUp size={16} />
      </button>
    </div>
  );

  // ---- EMPTY STATE: centered, matches "Ready when you are" reference ----
  if (messages.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center px-6">
        <p className="font-serif text-2xl text-[#2D3B2A] mb-6">
          Ready when you are.
        </p>
        <div className="w-full max-w-xl">{InputPill}</div>
      </div>
    );
  }

  // ---- ACTIVE CONVERSATION: scrollable messages + pinned bottom input ----
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}

        {isSending && (
          <div className="flex justify-start">
            <div className="flex gap-1 py-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#2D3B2A]/40 animate-bounce [animation-delay:-0.3s]" />
              <span className="w-1.5 h-1.5 rounded-full bg-[#2D3B2A]/40 animate-bounce [animation-delay:-0.15s]" />
              <span className="w-1.5 h-1.5 rounded-full bg-[#2D3B2A]/40 animate-bounce" />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="px-6 pb-6 pt-2">{InputPill}</div>
    </div>
  );
}