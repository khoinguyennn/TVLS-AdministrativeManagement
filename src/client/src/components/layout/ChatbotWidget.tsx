"use client";

import { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, Sparkles, Loader2, Maximize2, Minimize2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { chatbotService } from "@/services/chatbot.service";

interface Message {
  id: string;
  role: "user" | "ai";
  content: string;
}

export function ChatbotWidget() {
  const t = useTranslations("Chatbot");
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "ai",
      content: t("description")
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: inputValue.trim()
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      const res = await chatbotService.chat(userMessage.content);
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "ai",
        content: res.data.reply
      };
      
      setMessages((prev) => [...prev, aiMessage]);
    } catch {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "ai",
        content: t("error")
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="fixed bottom-6 right-6 z-50 rounded-full shadow-2xl"
          >
            <Button
              onClick={() => setIsOpen(true)}
              className="relative flex size-14 items-center justify-center overflow-hidden rounded-full bg-gradient-to-r from-primary to-blue-600 p-0 text-white shadow-lg transition-transform hover:scale-105"
            >
              <div className="absolute inset-0 animate-pulse bg-white/20" />
              <Sparkles className="relative z-10 size-6 animate-pulse" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className={cn(
              "fixed bottom-6 right-6 z-50 flex flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-2xl transition-all duration-300",
              isExpanded ? "h-[80vh] w-[90vw] sm:w-[500px]" : "h-[500px] w-[350px]"
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between bg-gradient-to-r from-primary/10 to-blue-600/10 p-4 border-b border-border/50">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-full bg-primary/20 text-primary">
                  <Sparkles className="size-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground text-sm tracking-tight">{t("title")}</h3>
                  <div className="flex items-center gap-1.5">
                    <span className="relative flex size-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex size-2 rounded-full bg-green-500"></span>
                    </span>
                    <p className="text-xs text-muted-foreground font-medium">Online</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1 text-muted-foreground">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="size-8 hover:bg-black/5 dark:hover:bg-white/10" 
                  onClick={() => setIsExpanded(!isExpanded)}
                >
                  {isExpanded ? <Minimize2 className="size-4" /> : <Maximize2 className="size-4" />}
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="size-8 hover:bg-red-500/10 hover:text-red-500" 
                  onClick={() => setIsOpen(false)}
                >
                  <X className="size-4" />
                </Button>
              </div>
            </div>

            {/* Chat Area */}
            <ScrollArea className="flex-1 p-4 bg-muted/20">
              <div className="flex flex-col gap-4">
                {messages.map((msg) => (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={msg.id}
                    className={cn(
                      "flex gap-3 max-w-[85%]",
                      msg.role === "user" ? "self-end flex-row-reverse" : "self-start"
                    )}
                  >
                    <Avatar className={cn("size-8 shrink-0 border border-border shadow-sm", msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-white dark:bg-zinc-800")}>
                      {msg.role === "ai" ? (
                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/20 to-blue-600/20 text-primary">
                          <Sparkles className="size-4" />
                        </div>
                      ) : (
                        <AvatarFallback className="bg-primary text-primary-foreground text-xs">U</AvatarFallback>
                      )}
                    </Avatar>
                    
                    <div
                      className={cn(
                        "rounded-2xl px-4 py-2.5 text-sm shadow-sm",
                        msg.role === "user"
                          ? "bg-primary text-primary-foreground rounded-tr-none"
                          : "bg-white dark:bg-zinc-900 border border-border/50 text-foreground rounded-tl-none prose prose-sm dark:prose-invert max-w-none prose-p:leading-relaxed prose-pre:bg-muted prose-pre:p-2 prose-pre:rounded-md"
                      )}
                    >
                      {msg.role === "ai" ? (
                        <ReactMarkdown>
                          {msg.content}
                        </ReactMarkdown>
                      ) : (
                        msg.content
                      )}
                    </div>
                  </motion.div>
                ))}
                
                {isLoading && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex gap-3 max-w-[85%] self-start"
                  >
                    <Avatar className="size-8 shrink-0 bg-white dark:bg-zinc-800 border border-border shadow-sm">
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/20 to-blue-600/20 text-primary">
                        <Sparkles className="size-4" />
                      </div>
                    </Avatar>
                    <div className="rounded-2xl rounded-tl-none bg-white dark:bg-zinc-900 border border-border/50 px-4 py-3 flex items-center gap-1 shadow-sm">
                      <div className="size-2 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: "0ms" }} />
                      <div className="size-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "150ms" }} />
                      <div className="size-2 rounded-full bg-primary/80 animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </motion.div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="p-3 border-t border-border bg-background">
              <div className="flex items-center gap-2 rounded-full border border-input bg-muted/50 focus-within:ring-1 focus-within:ring-primary focus-within:border-primary transition-all px-2 py-1.5 shadow-sm">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={t("placeholder")}
                  disabled={isLoading}
                  className="flex-1 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 px-2 h-9"
                />
                <Button
                  size="icon"
                  disabled={!inputValue.trim() || isLoading}
                  onClick={handleSend}
                  className={cn(
                    "size-8 rounded-full transition-all shrink-0",
                    inputValue.trim() ? "bg-primary text-primary-foreground shadow-md hover:scale-105" : "bg-muted text-muted-foreground hover:bg-muted"
                  )}
                >
                  {isLoading ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4 ml-0.5" />}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
