"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { Camera, ChevronRight, Eye, EyeOff, Loader2, Save, X } from "lucide-react";
import { SettingsSkeleton } from "@/components/skeletons";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { toast } from "react-toastify";

import { Avatar, AvatarFallback, AvatarImage } from "@/ui/avatar";
import { Button } from "@/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/card";
import { Input } from "@/ui/input";
import { Label } from "@/ui/label";
import { Separator } from "@/ui/separator";

import { useAuth } from "@/hooks/use-auth";
import { env } from "@/env";
import { authStorage } from "@/lib/auth-storage";
import { userService, type UpdateProfilePayload } from "@/services/user.service";

export default function SettingsPage() {
  const t = useTranslations("Settings");
  const tBreadcrumb = useTranslations("Breadcrumb");
  const tSidebar = useTranslations("Sidebar");
  const { user, getInitials } = useAuth();

  // Build full avatar URL from server path or blob URL
  const getAvatarUrl = useCallback((src: string | null) => {
    if (!src) return undefined;
    // blob: URLs (local preview) or full http URLs - return as-is
    if (src.startsWith("blob:") || src.startsWith("http")) return src;
    // Server relative path like /uploads/avatars/xxx.jpg
    return `${env.NEXT_PUBLIC_API_URL.replace(/\/api\/?$/, "")}${src}`;
  }, []);

  // Personal info state
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  // Password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Visibility toggles
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Loading state
  const [isSaving, setIsSaving] = useState(false);

  // File input ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize form with user data
  useEffect(() => {
    if (user) {
      setFullName(user.fullName || "");
      setEmail(user.email || "");
      setAvatarPreview(user.avatar || null);
    }
  }, [user]);

  const handleAvatarChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error(t("avatarInvalidType"));
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error(t("avatarTooLarge"));
      return;
    }

    // Store file for upload on save
    setAvatarFile(file);
    // Show local preview
    setAvatarPreview(URL.createObjectURL(file));
  }, [t]);

  const handleCancel = useCallback(() => {
    if (user) {
      setFullName(user.fullName || "");
      setEmail(user.email || "");
      setAvatarPreview(user.avatar || null);
    }
    setAvatarFile(null);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  }, [user]);

  const handleSave = useCallback(async () => {
    // Validate
    if (!fullName.trim()) {
      toast.error(t("fullNameRequired"));
      return;
    }

    if (!email.trim()) {
      toast.error(t("emailRequired"));
      return;
    }

    // If changing password, validate
    if (newPassword || confirmPassword || currentPassword) {
      if (!currentPassword) {
        toast.error(t("currentPasswordRequired"));
        return;
      }
      if (!newPassword) {
        toast.error(t("newPasswordRequired"));
        return;
      }
      if (newPassword.length < 6) {
        toast.error(t("passwordMinLength"));
        return;
      }
      if (newPassword !== confirmPassword) {
        toast.error(t("passwordMismatch"));
        return;
      }
    }

    setIsSaving(true);

    try {
      // Upload avatar file first if changed
      let avatarUploaded = false;
      if (avatarFile) {
        await userService.uploadAvatar(avatarFile);
        avatarUploaded = true;
        setAvatarFile(null);
      }

      const payload: UpdateProfilePayload = {};

      // Only send changed fields
      if (fullName !== user?.fullName) {
        payload.fullName = fullName.trim();
      }
      if (email !== user?.email) {
        payload.email = email.trim();
      }
      if (currentPassword && newPassword) {
        payload.currentPassword = currentPassword;
        payload.newPassword = newPassword;
      }

      // If only avatar changed, we already uploaded it above
      if (Object.keys(payload).length === 0 && !avatarUploaded) {
        toast.info(t("noChanges"));
        setIsSaving(false);
        return;
      }

      // Update profile fields if any changed
      let latestUser;
      if (Object.keys(payload).length > 0) {
        const response = await userService.updateProfile(payload);
        latestUser = response.data;
      } else {
        // Fetch latest user data after avatar upload
        const response = await userService.getProfile();
        latestUser = response.data;
      }

      // Update localStorage with new user data
      const updatedUser = {
        id: latestUser.id,
        email: latestUser.email,
        fullName: latestUser.fullName,
        role: latestUser.role,
        avatar: latestUser.avatar
      };
      authStorage.setUser(updatedUser);

      // Update local preview with server URL
      setAvatarPreview(latestUser.avatar || null);

      // Clear password fields
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      toast.success(t("saveSuccess"));
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || t("saveError"));
    } finally {
      setIsSaving(false);
    }
  }, [fullName, email, avatarFile, currentPassword, newPassword, confirmPassword, user, t]);

  if (!user) {
    return <SettingsSkeleton />;
  }

  return (
    <div className="mx-auto max-w-5xl">
      {/* Breadcrumbs */}
      <nav className="mb-6 flex items-center gap-2 text-sm text-slate-500">
        <Link className="hover:text-primary transition-colors" href="/dashboard">
          {tBreadcrumb("home")}
        </Link>
        <ChevronRight className="size-4" />
        <span className="font-medium text-slate-900 dark:text-slate-200">
          {tSidebar("settings")}
        </span>
      </nav>

      <div className="flex flex-col gap-8">
        {/* Title Section */}
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            {t("title")}
          </h2>
          <p className="mt-1 text-slate-500 dark:text-slate-400">
            {t("description")}
          </p>
        </div>

        {/* Profile Section Card */}
        <Card className="overflow-hidden">
          {/* Personal Information Header */}
          <CardHeader className="border-b">
            <CardTitle className="text-lg">{t("personalInfo")}</CardTitle>
            <CardDescription>{t("personalInfoDescription")}</CardDescription>
          </CardHeader>

          <CardContent className="p-6">
            <div className="flex flex-col gap-8 md:flex-row">
              {/* Avatar Upload */}
              <div className="flex flex-col items-center gap-4">
                <div className="relative group">
                  <Avatar className="size-32 border-4 border-slate-50 shadow-sm dark:border-slate-800">
                    <AvatarImage src={getAvatarUrl(avatarPreview)} alt={fullName} />
                    <AvatarFallback className="text-2xl font-bold bg-primary/10 text-primary">
                      {getInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-0 right-0 rounded-full bg-primary p-2 text-white shadow-lg transition-transform hover:bg-primary/90 active:scale-95"
                  >
                    <Camera className="size-4" />
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarChange}
                  />
                </div>
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-sm font-semibold text-primary hover:underline"
                  >
                    {t("changeAvatar")}
                  </button>
                  <p className="mt-1 text-xs text-slate-400">{t("avatarHint")}</p>
                </div>
              </div>

              {/* Personal Form */}
              <div className="flex-1 grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="fullName" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    {t("fullName")}
                  </Label>
                  <Input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="rounded-lg"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="email" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    {t("email")}
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="rounded-lg"
                  />
                </div>
              </div>
            </div>
          </CardContent>

          <Separator className="mx-6" />

          {/* Password Section */}
          <div className="p-6">
            <div className="mb-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {t("changePassword")}
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                {t("changePasswordDescription")}
              </p>
            </div>

            <div className="max-w-2xl">
              <div className="flex flex-col gap-6">
                {/* Current Password */}
                <div className="flex flex-col gap-2">
                  <Label htmlFor="currentPassword" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    {t("currentPassword")}
                  </Label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type={showCurrentPassword ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="••••••••"
                      className="rounded-lg pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showCurrentPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                    </button>
                  </div>
                </div>

                {/* New & Confirm Password */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="newPassword" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      {t("newPassword")}
                    </Label>
                    <div className="relative">
                      <Input
                        id="newPassword"
                        type={showNewPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="••••••••"
                        className="rounded-lg pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showNewPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label htmlFor="confirmPassword" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      {t("confirmPassword")}
                    </Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="rounded-lg pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showConfirmPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-4 pb-12">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isSaving}
            className="px-6"
          >
            <X className="size-4" />
            {t("cancel")}
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-primary px-6 shadow-lg shadow-primary/25 hover:bg-primary/90"
          >
            {isSaving ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Save className="size-4" />
            )}
            {t("save")}
          </Button>
        </div>
      </div>
    </div>
  );
}
