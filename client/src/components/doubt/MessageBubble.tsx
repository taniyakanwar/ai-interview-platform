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
        <div className="max-w-[75%] rounded-2xl rounded-br-sm bg-[#2D3B2A] text-[#FAF7F2] px-4 py-2.5 text-[15px] leading-relaxed whitespace-pre-wrap break-words">
          {message.content}
        </div>
      </motion.div>
    );
  }

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
            code({ className, children, ...props }) {
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