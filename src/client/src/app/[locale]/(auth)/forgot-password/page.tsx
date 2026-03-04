"use client";

import { useRef, useState, type KeyboardEvent, type ClipboardEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { AxiosError } from "axios";
import { ArrowLeft, KeyRound, Loader2, Lock, Mail, MailCheck, Send } from "lucide-react";
import { toast } from "react-toastify";

import { AuthFooter } from "@/components/layout/AuthFooter";
import { AuthHeader } from "@/components/layout/AuthHeader";
import { authService } from "@/services/auth.service";
import type { AuthError } from "@/types/auth.types";
import { Button, Card, CardContent, Input, Label } from "@/ui";

type Step = "email" | "otp" | "newPassword";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("email");
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [otpDigits, setOtpDigits] = useState<string[]>(Array(6).fill(""));
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [countdown, setCountdown] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Get OTP string from digits array
  const getOtpString = () => otpDigits.join("");

  // Handle OTP input change
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otpDigits];
    newOtp[index] = value.slice(-1);
    setOtpDigits(newOtp);

    // Auto focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle keyboard navigation for OTP inputs
  const handleOtpKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Handle paste for OTP inputs
  const handleOtpPaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return;

    const newOtp = [...otpDigits];
    pastedData.split("").forEach((char, index) => {
      if (index < 6) newOtp[index] = char;
    });
    setOtpDigits(newOtp);

    // Focus last filled input or the next empty one
    const lastIndex = Math.min(pastedData.length, 5);
    inputRefs.current[lastIndex]?.focus();
  };

  // Step 1: Submit email
  const handleSubmitEmail = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error("Vui lòng nhập email");
      return;
    }

    setIsLoading(true);
    try {
      const response = await authService.forgotPassword({ email: email.trim() });
      toast.success(response.message);
      setStep("otp");
      startCountdown();
    } catch (error) {
      const axiosError = error as AxiosError<AuthError>;
      const message = axiosError.response?.data?.message || "Có lỗi xảy ra. Vui lòng thử lại.";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  // Start countdown for resend OTP
  const startCountdown = () => {
    setCountdown(60);
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Resend OTP
  const handleResendOTP = async () => {
    if (countdown > 0) return;

    setIsLoading(true);
    try {
      const response = await authService.forgotPassword({ email });
      toast.success(response.message);
      startCountdown();
    } catch (error) {
      const axiosError = error as AxiosError<AuthError>;
      toast.error(axiosError.response?.data?.message || "Không thể gửi lại mã");
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();

    const otpString = getOtpString();
    if (otpString.length !== 6) {
      toast.error("Vui lòng nhập mã OTP 6 chữ số");
      return;
    }

    setIsLoading(true);
    try {
      await authService.verifyOTP({ email, otp: otpString });
      toast.success("Mã xác thực hợp lệ");
      setStep("newPassword");
    } catch (error) {
      const axiosError = error as AxiosError<AuthError>;
      const message = axiosError.response?.data?.message || "Mã xác thực không hợp lệ";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  // Step 3: Reset Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newPassword || newPassword.length < 6) {
      toast.error("Mật khẩu phải có ít nhất 6 ký tự");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp");
      return;
    }

    setIsLoading(true);
    try {
      const response = await authService.resetPassword({ email, otp: getOtpString(), newPassword });
      toast.success(response.message);
      router.push("/login");
    } catch (error) {
      const axiosError = error as AxiosError<AuthError>;
      const message = axiosError.response?.data?.message || "Không thể đặt lại mật khẩu";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <AuthHeader />

      {/* Main Content */}
      <main className="flex grow items-center justify-center px-4 py-8 sm:py-12">
        <div className="w-full max-w-md">
          <Card className="border-slate-100 shadow-xl shadow-slate-200/50 dark:border-slate-800 dark:shadow-none">
            <CardContent className="p-6 sm:p-8">
              {/* Step 1: Enter Email */}
              {step === "email" && (
                <>
                  {/* Icon & Title */}
                  <div className="mb-6 flex flex-col items-center text-center sm:mb-8">
                    <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-[#2060df]/5 sm:size-16">
                      <Mail className="size-7 text-[#2060df] sm:size-8" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 sm:text-2xl dark:text-white">
                      Quên mật khẩu
                    </h2>
                    <p className="mt-2 text-xs leading-relaxed text-slate-500 sm:text-sm dark:text-slate-400">
                      Vui lòng nhập email đăng ký để nhận mã OTP xác thực.
                    </p>
                  </div>

                  {/* Form */}
                  <form onSubmit={handleSubmitEmail} className="space-y-5 sm:space-y-6">
                    <div className="space-y-2">
                      <Label
                        htmlFor="email"
                        className="text-sm font-medium text-slate-700 dark:text-slate-300"
                      >
                        Email đăng ký
                      </Label>
                      <div className="relative">
                        <Mail className="absolute top-1/2 left-3 size-5 -translate-y-1/2 text-slate-400" />
                        <Input
                          id="email"
                          type="email"
                          name="email"
                          placeholder="example@thsp.edu.vn"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          disabled={isLoading}
                          required
                          className="h-11 rounded-lg border-slate-200 pr-4 pl-10 transition-all sm:h-12 focus:border-[#2060df] focus:ring-2 focus:ring-[#2060df]/20 dark:border-slate-700 dark:bg-slate-800"
                        />
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="w-full gap-2 rounded-lg bg-[#2060df] py-5 font-bold transition-colors sm:py-6 hover:bg-[#2060df]/90"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="size-4 animate-spin" />
                          <span>Đang gửi...</span>
                        </>
                      ) : (
                        <>
                          <span>Gửi mã xác thực</span>
                          <Send className="size-4" />
                        </>
                      )}
                    </Button>
                  </form>

                  {/* Back to Login */}
                  <div className="mt-6 flex justify-center border-t border-slate-100 pt-6 sm:mt-8 dark:border-slate-800">
                    <Link
                      href="/login"
                      className="flex items-center gap-2 text-sm font-semibold text-[#2060df] transition-colors hover:text-[#2060df]/80"
                    >
                      <ArrowLeft className="size-4" />
                      Quay lại đăng nhập
                    </Link>
                  </div>
                </>
              )}

              {/* Step 2: Enter OTP */}
              {step === "otp" && (
                <>
                  {/* Icon & Title */}
                  <div className="mb-5 flex flex-col items-center text-center sm:mb-6">
                    <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-[#2060df]/10 sm:size-16">
                      <MailCheck className="size-7 text-[#2060df] sm:size-8" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 sm:text-2xl dark:text-white">
                      Xác thực OTP
                    </h2>
                    <p className="mt-2 text-xs leading-relaxed text-slate-500 sm:text-sm dark:text-slate-400">
                      Mã xác thực đã được gửi đến email{" "}
                      <span className="font-semibold text-slate-700 dark:text-slate-300">{email}</span>
                      <br />
                      Vui lòng nhập mã gồm 6 chữ số bên dưới.
                    </p>
                  </div>

                  {/* OTP Form */}
                  <form onSubmit={handleVerifyOTP}>
                    {/* OTP Input Boxes */}
                    <div className="mb-6 flex justify-center gap-2 sm:mb-8 md:gap-3">
                      {otpDigits.map((digit, index) => (
                        <Input
                          key={index}
                          ref={(el) => {
                            inputRefs.current[index] = el;
                          }}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleOtpChange(index, e.target.value)}
                          onKeyDown={(e) => handleOtpKeyDown(index, e)}
                          onPaste={handleOtpPaste}
                          disabled={isLoading}
                          className="size-10 rounded-lg border-slate-200 bg-slate-50 p-0 text-center text-lg font-bold transition-all sm:size-12 sm:text-xl md:h-14 md:w-12 focus:border-[#2060df] focus:ring-2 focus:ring-[#2060df]/20 dark:border-slate-700 dark:bg-slate-800"
                        />
                      ))}
                    </div>

                    <Button
                      type="submit"
                      disabled={isLoading || getOtpString().length !== 6}
                      className="mb-6 w-full rounded-lg bg-[#2060df] py-3 font-bold shadow-lg shadow-[#2060df]/20 transition-colors sm:py-3.5 hover:bg-[#2060df]/90"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="size-4 animate-spin" />
                          <span>Đang xác thực...</span>
                        </>
                      ) : (
                        "Xác nhận"
                      )}
                    </Button>

                    {/* Resend Text */}
                    <div className="flex flex-col items-center gap-2">
                      <p className="text-xs text-slate-500 sm:text-sm dark:text-slate-400">
                        Không nhận được mã?
                      </p>
                      <button
                        type="button"
                        className="flex items-center gap-1 text-xs font-medium text-[#2060df] sm:text-sm hover:underline disabled:cursor-not-allowed disabled:opacity-50"
                        disabled={countdown > 0 || isLoading}
                        onClick={handleResendOTP}
                      >
                        {countdown > 0 ? `Gửi lại sau ${countdown}s` : "Gửi lại mã"}
                      </button>
                    </div>
                  </form>

                  {/* Back to change email */}
                  <div className="mt-6 flex justify-center border-t border-slate-100 pt-6 sm:mt-8 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => setStep("email")}
                      className="flex items-center gap-2 text-sm font-semibold text-[#2060df] transition-colors hover:text-[#2060df]/80"
                    >
                      <ArrowLeft className="size-4" />
                      Thay đổi email
                    </button>
                  </div>
                </>
              )}

              {/* Step 3: New Password */}
              {step === "newPassword" && (
                <>
                  {/* Icon & Title */}
                  <div className="mb-6 flex flex-col items-center text-center sm:mb-8">
                    <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-purple-500/10 sm:size-16">
                      <Lock className="size-7 text-purple-600 sm:size-8" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 sm:text-2xl dark:text-white">
                      Đặt mật khẩu mới
                    </h2>
                    <p className="mt-2 text-xs leading-relaxed text-slate-500 sm:text-sm dark:text-slate-400">
                      Tạo mật khẩu mới cho tài khoản của bạn.
                    </p>
                  </div>

                  {/* Form */}
                  <form onSubmit={handleResetPassword} className="space-y-5 sm:space-y-6">
                    <div className="space-y-2">
                      <Label
                        htmlFor="newPassword"
                        className="text-sm font-medium text-slate-700 dark:text-slate-300"
                      >
                        Mật khẩu mới
                      </Label>
                      <div className="relative">
                        <KeyRound className="absolute top-1/2 left-3 size-5 -translate-y-1/2 text-slate-400" />
                        <Input
                          id="newPassword"
                          type="password"
                          placeholder="••••••••"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          disabled={isLoading}
                          className="h-11 rounded-lg border-slate-200 pr-4 pl-10 transition-all sm:h-12 focus:border-[#2060df] focus:ring-2 focus:ring-[#2060df]/20 dark:border-slate-700 dark:bg-slate-800"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="confirmPassword"
                        className="text-sm font-medium text-slate-700 dark:text-slate-300"
                      >
                        Xác nhận mật khẩu
                      </Label>
                      <div className="relative">
                        <KeyRound className="absolute top-1/2 left-3 size-5 -translate-y-1/2 text-slate-400" />
                        <Input
                          id="confirmPassword"
                          type="password"
                          placeholder="••••••••"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          disabled={isLoading}
                          className="h-11 rounded-lg border-slate-200 pr-4 pl-10 transition-all sm:h-12 focus:border-[#2060df] focus:ring-2 focus:ring-[#2060df]/20 dark:border-slate-700 dark:bg-slate-800"
                        />
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="w-full gap-2 rounded-lg bg-[#2060df] py-5 font-bold transition-colors sm:py-6 hover:bg-[#2060df]/90"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="size-4 animate-spin" />
                          <span>Đang cập nhật...</span>
                        </>
                      ) : (
                        <>
                          <span>Đặt lại mật khẩu</span>
                          <Lock className="size-4" />
                        </>
                      )}
                    </Button>
                  </form>

                  {/* Back to Login */}
                  <div className="mt-6 flex justify-center border-t border-slate-100 pt-6 sm:mt-8 dark:border-slate-800">
                    <Link
                      href="/login"
                      className="flex items-center gap-2 text-sm font-semibold text-[#2060df] transition-colors hover:text-[#2060df]/80"
                    >
                      <ArrowLeft className="size-4" />
                      Quay lại đăng nhập
                    </Link>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <AuthFooter />
    </div>
  );
}
