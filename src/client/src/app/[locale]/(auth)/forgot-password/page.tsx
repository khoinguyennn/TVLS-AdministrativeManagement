"use client";

import Link from "next/link";

import { ArrowLeft, Mail, Send } from "lucide-react";

import { AuthFooter } from "@/components/layout/AuthFooter";
import { AuthHeader } from "@/components/layout/AuthHeader";
import { Button, Card, CardContent, Input, Label } from "@/ui";

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <AuthHeader />

      {/* Main Content */}
      <main className="flex grow items-center justify-center px-4 py-8 sm:py-12">
        <div className="w-full max-w-md">
          <Card className="border-slate-100 shadow-xl shadow-slate-200/50 dark:border-slate-800 dark:shadow-none">
            <CardContent className="p-6 sm:p-8">
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
              <form className="space-y-5 sm:space-y-6">
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
                      placeholder="example@tvu.edu.vn"
                      required
                      className="h-11 rounded-lg border-slate-200 pr-4 pl-10 transition-all sm:h-12 focus:border-[#2060df] focus:ring-2 focus:ring-[#2060df]/20 dark:border-slate-700 dark:bg-slate-800"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full gap-2 rounded-lg bg-[#2060df] py-5 font-bold transition-colors sm:py-6 hover:bg-[#2060df]/90"
                >
                  <span>Gửi mã xác thực</span>
                  <Send className="size-4" />
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
            </CardContent>
          </Card>
        </div>
      </main>

      <AuthFooter />
    </div>
  );
}
