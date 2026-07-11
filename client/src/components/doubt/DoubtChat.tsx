import { useState, useRef, useEffect } from "react";
import { ArrowUp, Paperclip, X } from "lucide-react"; // NEW: Paperclip (attach) + X (remove preview)
import { DoubtMessage } from "@/services/doubtService";
import MessageBubble from "@/components/doubt/MessageBubble";

interface DoubtChatProps {
  messages: DoubtMessage[];
  isSending: boolean;
  // CHANGED: onSendMessage now optionally carries a File
  onSendMessage: (text: string, image?: File) => void;
}

export default function DoubtChat({ messages, isSending, onSendMessage }: DoubtChatProps) {
  const [input, setInput] = useState("");

  // NEW: the currently selected image, staged but not yet sent — same
  // idea as a chat app showing a thumbnail preview before you hit send.
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  // NEW: local preview URL for the staged image, so we can show it in
  // the UI before send — separate from the one built in useDoubtSolver,
  // because THIS one needs to exist even before sendMessage is ever called.
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const bottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null); // NEW: lets the paperclip button trigger the hidden native file input

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isSending]);

  // NEW: clean up the preview blob URL whenever it changes or the
  // component unmounts — same leak-prevention reasoning as in the hook.
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Client-side guard mirroring doubtUpload.ts's rules — this doesn't
    // replace the backend check (a user could bypass the UI entirely),
    // it just gives instant feedback instead of waiting on a round trip
    // to the server just to be told "too big" or "wrong type."
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      alert("Only JPG, PNG, or WEBP images are allowed.");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      alert("Image must be under 8MB.");
      return;
    }

    setSelectedImage(file);
    setPreviewUrl(URL.createObjectURL(file));

    // Reset the input's value so selecting the SAME file again later
    // (e.g. after removing it) still fires this onChange — browsers
    // don't re-fire onChange if the selected file path is unchanged.
    e.target.value = "";
  }

  function removeSelectedImage() {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setSelectedImage(null);
    setPreviewUrl(null);
  }

  function handleSend() {
    const trimmed = input.trim();
    // CHANGED: allow sending if there's text OR an image — matches the
    // backend's updated validation rule exactly. Previously this only
    // checked `trimmed`, which would silently block an image-only send.
    if ((!trimmed && !selectedImage) || isSending) return;

    onSendMessage(trimmed, selectedImage ?? undefined);

    setInput("");
    removeSelectedImage(); // clear the staged image after sending
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  // NEW: whether the send button should be enabled — text OR image,
  // same rule as handleSend's guard, pulled out so the button's
  // `disabled` prop and the guard can't drift apart from each other.
  const canSend = (input.trim().length > 0 || !!selectedImage) && !isSending;

  const InputPill = (
    <div className="flex flex-col gap-2 rounded-2xl border border-[#9CB68A]/40 bg-white px-4 py-2 shadow-sm">
      {/* NEW: staged image preview, shown above the text row when a
          file has been picked but not yet sent */}
      {previewUrl && (
        <div className="relative w-fit">
          <img
            src={previewUrl}
            alt="Selected problem"
            className="h-20 w-auto rounded-lg border border-[#9CB68A]/30 object-cover"
          />
          <button
            onClick={removeSelectedImage}
            className="absolute -top-2 -right-2 w-5 h-5 flex items-center justify-center rounded-full bg-[#2D3B2A] text-[#FAF7F2] hover:bg-[#2D3B2A]/90"
            aria-label="Remove image"
          >
            <X size={12} />
          </button>
        </div>
      )}

      <div className="flex items-end gap-2">
        {/* NEW: hidden native file input, triggered by the paperclip
            button below rather than shown directly — this is the
            standard pattern for styling file pickers, since the native
            input's default appearance can't be restyled directly. */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileSelect}
          className="hidden"
        />

        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isSending}
          className="shrink-0 w-8 h-8 flex items-center justify-center rounded-full text-[#2D3B2A]/60 hover:bg-[#9CB68A]/15 hover:text-[#2D3B2A] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          aria-label="Attach an image"
        >
          <Paperclip size={16} />
        </button>

        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask anything, or attach a photo of a problem"
          rows={1}
          className="flex-1 resize-none bg-transparent text-sm text-[#2D3B2A] placeholder:text-[#2D3B2A]/40 focus:outline-none max-h-32 py-1.5"
          disabled={isSending}
        />
        <button
          onClick={handleSend}
          disabled={!canSend}
          className="shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-[#2D3B2A] text-[#FAF7F2] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#2D3B2A]/90 transition-colors"
          aria-label="Send message"
        >
          <ArrowUp size={16} />
        </button>
      </div>
    </div>
  );

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