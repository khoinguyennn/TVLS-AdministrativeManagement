"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { useGoogleLogin } from "@react-oauth/google";
import { AxiosError } from "axios";
import { Eye, EyeOff, KeyRound, Loader2, LogIn, User } from "lucide-react";
import { toast } from "react-toastify";

import { AuthFooter } from "@/components/layout/AuthFooter";
import { AuthHeader } from "@/components/layout/AuthHeader";
import { authStorage } from "@/lib/auth-storage";
import { authService } from "@/services/auth.service";
import type { AuthError } from "@/types/auth.types";
import { Button, Card, CardContent, CardFooter, Input, Label, Separator } from "@/ui";

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate
    if (!email.trim()) {
      toast.error("Vui lòng nhập email");
      return;
    }
    if (!password) {
      toast.error("Vui lòng nhập mật khẩu");
      return;
    }
    if (password.length < 6) {
      toast.error("Mật khẩu phải có ít nhất 6 ký tự");
      return;
    }

    setIsLoading(true);

    try {
      const response = await authService.login({ email: email.trim(), password });

      // Save tokens and user info
      authStorage.setAccessToken(response.data.accessToken);
      authStorage.setRefreshToken(response.data.refreshToken);
      authStorage.setUser(response.data.user);

      toast.success(response.message || "Đăng nhập thành công!");

      // Redirect to dashboard
      router.push("/dashboard");
    } catch (error) {
      const axiosError = error as AxiosError<AuthError>;
      const message = axiosError.response?.data?.message || "Đăng nhập thất bại. Vui lòng thử lại.";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setIsGoogleLoading(true);
      try {
        // Call our API with the Google access token
        const response = await authService.googleLogin({ credential: tokenResponse.access_token });

        // Save tokens and user info
        authStorage.setAccessToken(response.data.accessToken);
        authStorage.setRefreshToken(response.data.refreshToken);
        authStorage.setUser(response.data.user);

        toast.success(response.message || "Đăng nhập với Google thành công!");

        // Redirect to dashboard
        router.push("/dashboard");
      } catch (error) {
        const axiosError = error as AxiosError<AuthError>;
        const message =
          axiosError.response?.data?.message ||
          "Đăng nhập với Google thất bại. Vui lòng thử lại.";
        toast.error(message);
      } finally {
        setIsGoogleLoading(false);
      }
    },
    onError: () => {
      toast.error("Đăng nhập với Google thất bại");
    }
  });

  const handleGoogleLogin = () => {
    googleLogin();
  };

  return (
    <div className="flex min-h-screen flex-col">
      <AuthHeader />

      {/* Main */}
      <main className="flex grow items-center justify-center px-4 py-8 sm:py-12">
        <div className="w-full max-w-md">
          <Card className="overflow-hidden border-slate-200 shadow-xl dark:border-slate-800">
            <CardContent className="p-5 sm:p-8">
              {/* Title */}
              <div className="mb-6 text-center sm:mb-8">
                <h3 className="mb-2 text-xl font-bold text-slate-900 sm:text-2xl dark:text-slate-100">
                  Đăng nhập hệ thống
                </h3>
                <p className="text-xs text-slate-500 sm:text-sm dark:text-slate-400">
                  Vui lòng nhập thông tin tài khoản của bạn
                </p>
              </div>

              {/* Form */}
              <form className="space-y-4 sm:space-y-5" onSubmit={handleSubmit}>
                {/* Email/Username field */}
                <div className="space-y-2">
                  <Label
                    htmlFor="email"
                    className="text-sm font-semibold text-slate-700 dark:text-slate-300"
                  >
                    Email hoặc Tên đăng nhập
                  </Label>
                  <div className="relative">
                    <User className="absolute top-1/2 left-3 size-5 -translate-y-1/2 text-slate-400" />
                    <Input
                      id="email"
                      type="text"
                      placeholder="example@thsp.edu.vn"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isLoading}
                      className="h-11 rounded-lg border-slate-300 pr-4 pl-10 transition-all sm:h-12 focus-visible:border-primary focus-visible:ring-primary dark:border-slate-700"
                    />
                  </div>
                </div>

                {/* Password field */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label
                      htmlFor="password"
                      className="text-sm font-semibold text-slate-700 dark:text-slate-300"
                    >
                      Mật khẩu
                    </Label>
                    <Link
                      href="/forgot-password"
                      className="text-xs font-medium text-primary hover:underline"
                    >
                      Quên mật khẩu?
                    </Link>
                  </div>
                  <div className="relative">
                    <KeyRound className="absolute top-1/2 left-3 size-5 -translate-y-1/2 text-slate-400" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={isLoading}
                      className="h-11 rounded-lg border-slate-300 pr-12 pl-10 transition-all sm:h-12 focus-visible:border-primary focus-visible:ring-primary dark:border-slate-700"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute top-1/2 right-3 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                    </button>
                  </div>
                </div>

                {/* Remember me */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="remember-me"
                    className="size-4 rounded border-slate-300 text-primary focus:ring-primary"
                  />
                  <label
                    htmlFor="remember-me"
                    className="ml-2 block text-sm text-slate-600 dark:text-slate-400"
                  >
                    Ghi nhớ đăng nhập
                  </label>
                </div>

                {/* Submit button */}
                <Button
                  type="submit"
                  size="lg"
                  disabled={isLoading}
                  className="w-full gap-2 rounded-lg bg-primary py-5 font-bold shadow-lg shadow-primary/20 sm:py-6 hover:bg-primary/90 disabled:opacity-70"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="size-5 animate-spin" />
                      <span>Đang đăng nhập...</span>
                    </>
                  ) : (
                    <>
                      <span>Đăng nhập</span>
                      <LogIn className="size-5" />
                    </>
                  )}
                </Button>

                {/* Divider */}
                <div className="relative my-6 sm:my-8">
                  <Separator className="bg-slate-200 dark:bg-slate-800" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="bg-white px-2 text-[10px] text-slate-500 uppercase sm:text-xs dark:bg-slate-900">
                      Hoặc sử dụng phương thức khác
                    </span>
                  </div>
                </div>

                {/* Alternative login */}
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  disabled={isGoogleLoading || isLoading}
                  onClick={handleGoogleLogin}
                  className="w-full gap-2 rounded-lg py-5 font-semibold sm:py-6"
                >
                  {isGoogleLoading ? (
                    <>
                      <Loader2 className="size-5 animate-spin" />
                      <span>Đang xác thực...</span>
                    </>
                  ) : (
                    <>
                      <svg className="size-5" viewBox="0 0 24 24">
                        <path
                          fill="#4285F4"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                      </svg>
                      <span>Đăng nhập với Google</span>
                    </>
                  )}
                </Button>
              </form>
            </CardContent>

            {/* Card Footer */}
            <CardFooter className="justify-center border-t border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/50">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Gặp khó khăn khi đăng nhập?{" "}
                <Link href="/contact" className="font-semibold text-primary hover:underline">
                  Liên hệ bộ phận IT
                </Link>
              </p>
            </CardFooter>
          </Card>
        </div>
      </main>

      <AuthFooter />
    </div>
  );
}
