import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";
import { DoubtMessage } from "@/services/doubtService";

interface MessageBubbleProps {
  message: DoubtMessage;
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";

  if (isUser) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="flex justify-end"
      >
        {/* NEW: wrap in a flex-col container so an image (if present)
            stacks above the text bubble, both right-aligned together as
            one visual unit — matches how the staged preview looks in
            DoubtChat's input pill before sending, for visual consistency. */}
        <div className="max-w-[75%] flex flex-col items-end gap-1.5">
          {message.imageUrl && (
            <img
              src={message.imageUrl}
              alt="Uploaded problem"
              // Capped height, NOT full-width — a full-resolution phone
              // photo could be huge (or tall/portrait), and letting it
              // render at native size would blow out the chat layout.
              // object-cover + a fixed max-height keeps every uploaded
              // image visually consistent regardless of its original
              // dimensions or aspect ratio.
              className="max-h-64 w-auto rounded-2xl border border-[#9CB68A]/30 object-cover"
            />
          )}

          {/* Only render the text bubble if there IS text — an
              image-only message (empty content string) shouldn't show
              an empty, oddly-padded dark bubble under the photo. */}
          {message.content && (
            <div className="rounded-2xl rounded-br-sm bg-[#2D3B2A] text-[#FAF7F2] px-4 py-2.5 text-[15px] leading-relaxed whitespace-pre-wrap break-words">
              {message.content}
            </div>
          )}
        </div>
      </motion.div>
    );
  }

  // Model messages never carry imageUrl (Gemini doesn't send images
  // back, only text) — this branch is intentionally unchanged.
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="flex justify-start w-full"
    >
      <div className="max-w-full prose prose-sm prose-headings:font-serif prose-headings:text-[#2D3B2A] prose-p:text-[#2D3B2A]/90 prose-strong:text-[#2D3B2A] prose-li:text-[#2D3B2A]/90 text-[15px] leading-relaxed">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            code({ className, children }) {
              const match = /language-(\w+)/.exec(className || "");
              const isBlock = Boolean(match);

              if (!isBlock) {
                return (
                  <code className="px-1.5 py-0.5 rounded bg-[#9CB68A]/20 text-[#2D3B2A] text-[13px] font-mono">
                    {children}
                  </code>
                );
              }

              return (
                <div className="rounded-xl overflow-hidden border border-[#9CB68A]/30 my-3">
                  <div className="px-3 py-1.5 bg-[#2D3B2A]/5 text-xs text-[#2D3B2A]/50 font-mono border-b border-[#9CB68A]/30">
                    {match![1]}
                  </div>
                  <SyntaxHighlighter
                    language={match![1]}
                    style={oneLight}
                    customStyle={{
                      margin: 0,
                      padding: "1rem",
                      fontSize: "13px",
                      background: "#FAF7F2",
                    }}
                  >
                    {String(children).replace(/\n$/, "")}
                  </SyntaxHighlighter>
                </div>
              );
            },
          }}
        >
          {message.content}
        </ReactMarkdown>
      </div>
    </motion.div>
  );
}