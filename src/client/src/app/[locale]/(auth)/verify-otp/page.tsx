"use client";

import { useEffect, useRef, useState, type KeyboardEvent, type ClipboardEvent } from "react";

import { MailCheck } from "lucide-react";

import { AuthFooter } from "@/components/layout/AuthFooter";
import { AuthHeader } from "@/components/layout/AuthHeader";
import { Button, Card, CardContent, Input } from "@/ui";

export default function OTPVerificationPage() {
  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const [countdown, setCountdown] = useState(59);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Countdown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleResend = () => {
    if (countdown === 0) {
      setCountdown(59);
      // TODO: Trigger resend OTP API
    }
  };

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    // Auto focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return;

    const newOtp = [...otp];
    pastedData.split("").forEach((char, index) => {
      if (index < 6) newOtp[index] = char;
    });
    setOtp(newOtp);

    // Focus last filled input or the next empty one
    const lastIndex = Math.min(pastedData.length, 5);
    inputRefs.current[lastIndex]?.focus();
  };

  return (
    <div className="flex min-h-screen flex-col">
      <AuthHeader />

      {/* Main Content */}
      <main className="flex grow items-center justify-center p-4 md:p-8">
        <Card className="w-full max-w-md overflow-hidden border-slate-100 shadow-xl dark:border-slate-800">
          <CardContent className="flex flex-col items-center p-6 text-center sm:p-8">
            {/* Icon */}
            <div className="mb-5 flex size-14 items-center justify-center rounded-full bg-primary/10 sm:mb-6 sm:size-16">
              <MailCheck className="size-7 text-primary sm:size-8" />
            </div>

            {/* Title & Subtitle */}
            <h3 className="mb-2 text-xl font-bold text-slate-900 sm:text-2xl dark:text-white">
              Xác thực OTP
            </h3>
            <p className="mb-6 text-xs text-slate-600 sm:mb-8 sm:text-sm dark:text-slate-400">
              Mã xác thực đã được gửi đến email của bạn.
              <br />
              Vui lòng nhập mã gồm 6 chữ số bên dưới.
            </p>

            {/* OTP Input Form */}
            <div className="w-full">
              <div className="mb-6 flex justify-center gap-2 sm:mb-8 md:gap-3">
                {otp.map((digit, index) => (
                  <Input
                    key={index}
                    ref={(el) => {
                      inputRefs.current[index] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={handlePaste}
                    className="size-10 rounded-lg border-slate-200 bg-slate-50 p-0 text-center text-lg font-bold transition-all sm:size-12 sm:text-xl md:h-14 md:w-12 focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-slate-700 dark:bg-slate-800"
                  />
                ))}
              </div>

              <Button
                type="submit"
                className="mb-6 w-full rounded-lg bg-primary py-3 font-bold shadow-lg shadow-primary/20 transition-colors sm:py-3.5 hover:bg-primary/90"
              >
                Xác nhận
              </Button>

              {/* Resend Text */}
              <div className="flex flex-col items-center gap-2">
                <p className="text-xs text-slate-500 sm:text-sm dark:text-slate-400">
                  Không nhận được mã?
                </p>
                <button
                  type="button"
                  className="flex items-center gap-1 text-xs font-medium text-primary sm:text-sm hover:underline disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={countdown > 0}
                  onClick={handleResend}
                >
                  {countdown > 0 ? `Gửi lại sau ${countdown}s` : "Gửi lại mã"}
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      <AuthFooter />
    </div>
  );
}
