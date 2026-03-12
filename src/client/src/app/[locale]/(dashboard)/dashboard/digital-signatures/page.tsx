"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import {
  AlertTriangle,
  ChevronRight,
  Eye,
  EyeOff,
  Info,
  Loader2,
  PenTool,
  Save,
  Trash2,
  Undo2,
  Upload,
} from "lucide-react";
import { SignatureSkeleton } from "@/components/skeletons";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { toast } from "react-toastify";

import { Button } from "@/ui/button";
import { Input } from "@/ui/input";
import { Label } from "@/ui/label";

import { env } from "@/env";
import { digitalSignatureService } from "@/services/digital-signature.service";

// ── Helpers ──
function getImageUrl(src?: string | null) {
  if (!src) return undefined;
  if (src.startsWith("blob:") || src.startsWith("data:") || src.startsWith("http")) return src;
  return `${env.NEXT_PUBLIC_API_URL.replace(/\/api\/?$/, "")}${src}`;
}

// ═══════════════════════════════════════════════════════════
export default function DigitalSignaturesPage() {
  const t = useTranslations("DigitalSignature");
  const tBreadcrumb = useTranslations("Breadcrumb");
  const tSidebar = useTranslations("Sidebar");

  // ── State ──
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"draw" | "upload">("draw");
  const [signatureImage, setSignatureImage] = useState<string | null>(null);
  const [hasPin, setHasPin] = useState(false);

  // PIN form state
  const [currentPin, setCurrentPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [showCurrentPin, setShowCurrentPin] = useState(false);
  const [showNewPin, setShowNewPin] = useState(false);
  const [showConfirmPin, setShowConfirmPin] = useState(false);
  const [pinError, setPinError] = useState("");

  // Upload state
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Canvas drawing state
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const drawHistoryRef = useRef<ImageData[]>([]);

  // ── Load config ──
  const fetchConfig = useCallback(async () => {
    try {
      setLoading(true);
      const res = await digitalSignatureService.getConfig();
      setSignatureImage(res.data.signatureImage);
      setHasPin(res.data.hasPin);
    } catch {
      toast.error(t("toast.error"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  // ── Canvas setup ──
  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = "#1a1a2e";
  }, []);

  useEffect(() => {
    if (activeTab === "draw") {
      // defer to next frame so canvas is rendered
      requestAnimationFrame(() => {
        initCanvas();
      });
    }
  }, [activeTab, initCanvas]);

  // ── Canvas drawing handlers ──
  const getCanvasPos = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }, []);

  const startDrawing = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (!ctx || !canvas) return;

      // Save current state for undo
      drawHistoryRef.current.push(ctx.getImageData(0, 0, canvas.width, canvas.height));

      const pos = getCanvasPos(e);
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
      setIsDrawing(true);
    },
    [getCanvasPos],
  );

  const draw = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!isDrawing) return;
      const ctx = canvasRef.current?.getContext("2d");
      if (!ctx) return;
      const pos = getCanvasPos(e);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    },
    [isDrawing, getCanvasPos],
  );

  const stopDrawing = useCallback(() => {
    if (isDrawing) {
      setIsDrawing(false);
      setHasDrawn(true);
    }
  }, [isDrawing]);

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx || !canvas) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawHistoryRef.current = [];
    setHasDrawn(false);
  }, []);

  const undoCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx || !canvas) return;
    const history = drawHistoryRef.current;
    if (history.length === 0) return;
    const prev = history.pop()!;
    ctx.putImageData(prev, 0, 0);
    if (history.length === 0) setHasDrawn(false);
  }, []);

  // ── File upload ──
  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const allowedTypes = ["image/png", "image/jpeg", "image/jpg"];
      if (!allowedTypes.includes(file.type)) {
        toast.error(t("toast.invalidFile"));
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        toast.error(t("toast.fileTooLarge"));
        return;
      }

      setUploadFile(file);
      const url = URL.createObjectURL(file);
      setUploadPreview(url);
    },
    [t],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      const file = e.dataTransfer.files?.[0];
      if (!file) return;

      const allowedTypes = ["image/png", "image/jpeg", "image/jpg"];
      if (!allowedTypes.includes(file.type)) {
        toast.error(t("toast.invalidFile"));
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        toast.error(t("toast.fileTooLarge"));
        return;
      }

      setUploadFile(file);
      const url = URL.createObjectURL(file);
      setUploadPreview(url);
    },
    [t],
  );

  // ── Validate PIN ──
  const validatePin = useCallback((): boolean => {
    setPinError("");

    // If no PIN fields filled, skip PIN validation (save signature only)
    if (!newPin && !confirmPin && !currentPin) return true;

    if (hasPin && !currentPin) {
      setPinError(t("pin.currentPin"));
      return false;
    }
    if (!newPin) return true; // no new pin to set

    if (!/^\d+$/.test(newPin)) {
      setPinError(t("pin.pinOnlyDigits"));
      return false;
    }
    if (newPin.length !== 6) {
      setPinError(t("pin.pinMinLength"));
      return false;
    }
    if (newPin !== confirmPin) {
      setPinError(t("pin.pinMismatch"));
      return false;
    }
    return true;
  }, [newPin, confirmPin, currentPin, hasPin, t]);

  // ── Save all ──
  const handleSave = useCallback(async () => {
    if (!validatePin()) return;

    try {
      setSaving(true);

      // 1. Save signature image
      if (activeTab === "draw" && hasDrawn) {
        const canvas = canvasRef.current;
        if (canvas) {
          const dataUrl = canvas.toDataURL("image/png");
          await digitalSignatureService.saveDrawn(dataUrl);
          toast.success(t("toast.saveSignatureSuccess"));
        }
      } else if (activeTab === "upload" && uploadFile) {
        await digitalSignatureService.uploadImage(uploadFile);
        toast.success(t("toast.saveSignatureSuccess"));
      }

      // 2. Save PIN if provided
      if (newPin) {
        if (hasPin) {
          await digitalSignatureService.changePin(currentPin, newPin);
          toast.success(t("toast.changePinSuccess"));
        } else {
          await digitalSignatureService.setPin(newPin);
          toast.success(t("toast.setPinSuccess"));
        }
        setCurrentPin("");
        setNewPin("");
        setConfirmPin("");
      }

      // Refresh config
      fetchConfig();
    } catch (err: unknown) {
      const errorMsg =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;
      toast.error(errorMsg || t("toast.error"));
    } finally {
      setSaving(false);
    }
  }, [activeTab, hasDrawn, uploadFile, newPin, currentPin, hasPin, validatePin, fetchConfig, t]);

  // ── Delete signature ──
  const handleDeleteSignature = useCallback(async () => {
    try {
      setSaving(true);
      await digitalSignatureService.deleteImage();
      toast.success(t("toast.deleteSignatureSuccess"));
      setSignatureImage(null);
      setUploadPreview(null);
      setUploadFile(null);
      clearCanvas();
      fetchConfig();
    } catch {
      toast.error(t("toast.error"));
    } finally {
      setSaving(false);
    }
  }, [t, clearCanvas, fetchConfig]);

  // ═══════════════════════════════════════════════════════════
  if (loading) {
    return <SignatureSkeleton />;
  }

  return (
    <div className="mx-auto max-w-4xl flex flex-col gap-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/dashboard" className="hover:text-foreground transition-colors">
          {tBreadcrumb("home")}
        </Link>
        <ChevronRight className="size-4" />
        <span className="font-medium text-foreground">{tSidebar("digitalSignatures")}</span>
      </nav>

      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">{t("title")}</h2>
        <p className="text-muted-foreground text-sm mt-1">{t("description")}</p>
      </div>

      <div className="space-y-6">
        {/* ── Signature Image Card ── */}
        <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 border-b flex items-center gap-2">
            <PenTool className="size-5 text-primary" />
            <h4 className="font-bold">{t("signatureImage")}</h4>
          </div>
          <div className="p-6">
            {/* Tabs */}
            <div className="flex gap-1 bg-muted p-1 rounded-lg mb-6 w-fit">
              <button
                onClick={() => setActiveTab("draw")}
                className={`px-6 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-all ${
                  activeTab === "draw"
                    ? "bg-background shadow-sm font-bold text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <PenTool className="size-4" />
                {t("tabs.draw")}
              </button>
              <button
                onClick={() => setActiveTab("upload")}
                className={`px-6 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-all ${
                  activeTab === "upload"
                    ? "bg-background shadow-sm font-bold text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Upload className="size-4" />
                {t("tabs.upload")}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Draw / Upload Area */}
              <div className="space-y-3">
                {activeTab === "draw" ? (
                  <>
                    <Label className="text-sm font-semibold">{t("draw.label")}</Label>
                    <div className="relative">
                      <canvas
                        ref={canvasRef}
                        className="aspect-video w-full border-2 border-dashed border-border rounded-xl bg-muted/30 cursor-crosshair touch-none"
                        onMouseDown={startDrawing}
                        onMouseMove={draw}
                        onMouseUp={stopDrawing}
                        onMouseLeave={stopDrawing}
                      />
                      {!hasDrawn && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40">
                          <div className="text-center">
                            <PenTool className="size-10 mx-auto mb-2" />
                            <p className="text-xs">{t("draw.placeholder")}</p>
                          </div>
                        </div>
                      )}
                      <div className="absolute bottom-3 right-3 flex gap-2">
                        <button
                          onClick={clearCanvas}
                          className="p-2 rounded-lg bg-background border shadow-sm hover:text-destructive transition-colors"
                          title={t("draw.clear")}
                        >
                          <Trash2 className="size-4" />
                        </button>
                        <button
                          onClick={undoCanvas}
                          className="p-2 rounded-lg bg-background border shadow-sm hover:text-primary transition-colors"
                          title={t("draw.undo")}
                        >
                          <Undo2 className="size-4" />
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <Label className="text-sm font-semibold">{t("upload.label")}</Label>
                    {uploadPreview ? (
                      <div className="relative aspect-video w-full border-2 border-border rounded-xl bg-muted/30 flex items-center justify-center overflow-hidden">
                        <img
                          src={uploadPreview}
                          alt="Signature preview"
                          className="max-w-full max-h-full object-contain p-4"
                        />
                        <div className="absolute bottom-3 right-3 flex gap-2">
                          <button
                            onClick={() => {
                              setUploadPreview(null);
                              setUploadFile(null);
                            }}
                            className="p-2 rounded-lg bg-background border shadow-sm hover:text-destructive transition-colors"
                          >
                            <Trash2 className="size-4" />
                          </button>
                          <button
                            onClick={() => fileInputRef.current?.click()}
                            className="p-2 rounded-lg bg-background border shadow-sm hover:text-primary transition-colors"
                          >
                            <Upload className="size-4" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div
                        className="aspect-video w-full border-2 border-dashed border-border rounded-xl bg-muted/30 flex items-center justify-center cursor-pointer hover:border-primary/50 transition-colors"
                        onClick={() => fileInputRef.current?.click()}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={handleDrop}
                      >
                        <div className="text-center opacity-50">
                          <Upload className="size-10 mx-auto mb-2" />
                          <p className="text-xs">{t("upload.hint")}</p>
                          <p className="text-[10px] mt-1 text-muted-foreground">{t("upload.formats")}</p>
                        </div>
                      </div>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/jpg"
                      className="hidden"
                      onChange={handleFileSelect}
                    />
                  </>
                )}

                {/* Current signature preview */}
                {signatureImage && (
                  <div className="mt-4 p-3 bg-muted/30 rounded-lg border">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-semibold text-muted-foreground">{t("preview.title")}</p>
                      <button
                        onClick={handleDeleteSignature}
                        className="text-xs text-destructive hover:underline flex items-center gap-1"
                        disabled={saving}
                      >
                        <Trash2 className="size-3" />
                        {t("draw.clear")}
                      </button>
                    </div>
                    <div className="aspect-video max-w-48 border rounded-lg bg-background overflow-hidden flex items-center justify-center">
                      <img
                        src={getImageUrl(signatureImage)}
                        alt="Current signature"
                        className="max-w-full max-h-full object-contain p-2"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Guidelines */}
              <div className="space-y-4 bg-primary/5 rounded-xl p-5 border border-primary/10">
                <h5 className="text-sm font-bold text-primary flex items-center gap-2">
                  <Info className="size-4" />
                  {t("guide.title")}
                </h5>
                <ul className="text-xs space-y-3 text-muted-foreground leading-relaxed">
                  <li className="flex gap-2">
                    <span className="text-primary font-bold">•</span>
                    <span>{t("guide.tip1")}</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-primary font-bold">•</span>
                    <span>{t("guide.tip2")}</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-primary font-bold">•</span>
                    <span>{t("guide.tip3")}</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-primary font-bold">•</span>
                    <span>{t("guide.tip4")}</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* ── PIN Card ── */}
        <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 border-b flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg className="size-5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <h4 className="font-bold">{t("pin.title")}</h4>
            </div>
            {hasPin ? (
              <span className="text-xs font-medium text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-2.5 py-1 rounded-full">
                {t("pin.hasPinAlready")}
              </span>
            ) : (
              <span className="text-xs font-medium text-amber-600 bg-amber-50 dark:bg-amber-900/20 px-2.5 py-1 rounded-full">
                {t("pin.noPinYet")}
              </span>
            )}
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Current PIN (only if has PIN) */}
            {hasPin && (
              <div className="space-y-2">
                <Label className="text-sm font-semibold">{t("pin.currentPin")}</Label>
                <div className="relative">
                  <Input
                    type={showCurrentPin ? "text" : "password"}
                    value={currentPin}
                    onChange={(e) => setCurrentPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    placeholder={t("pin.currentPinPlaceholder")}
                    maxLength={6}
                    inputMode="numeric"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPin(!showCurrentPin)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showCurrentPin ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>
            )}

            {/* New PIN */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold">{t("pin.newPin")}</Label>
              <div className="relative">
                <Input
                  type={showNewPin ? "text" : "password"}
                  value={newPin}
                  onChange={(e) => {
                    setNewPin(e.target.value.replace(/\D/g, "").slice(0, 6));
                    setPinError("");
                  }}
                  placeholder={t("pin.newPinPlaceholder")}
                  maxLength={6}
                  inputMode="numeric"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPin(!showNewPin)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showNewPin ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            {/* Confirm PIN */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold">{t("pin.confirmPin")}</Label>
              <div className="relative">
                <Input
                  type={showConfirmPin ? "text" : "password"}
                  value={confirmPin}
                  onChange={(e) => {
                    setConfirmPin(e.target.value.replace(/\D/g, "").slice(0, 6));
                    setPinError("");
                  }}
                  placeholder={t("pin.confirmPinPlaceholder")}
                  maxLength={6}
                  inputMode="numeric"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPin(!showConfirmPin)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showConfirmPin ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>
          </div>

          {pinError && (
            <div className="px-6 pb-3">
              <p className="text-xs text-destructive font-medium">{pinError}</p>
            </div>
          )}

          <div className="px-6 pb-6">
            <p className="text-[11px] text-muted-foreground italic flex items-center gap-1">
              <AlertTriangle className="size-3.5 shrink-0" />
              {t("pin.warning")}
            </p>
          </div>
        </div>

        {/* ── Action Buttons ── */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <Button
            variant="outline"
            onClick={() => {
              setCurrentPin("");
              setNewPin("");
              setConfirmPin("");
              setPinError("");
              clearCanvas();
              setUploadPreview(null);
              setUploadFile(null);
            }}
          >
            {t("actions.cancel")}
          </Button>
          <Button onClick={handleSave} disabled={saving} className="gap-2">
            {saving ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Save className="size-4" />
            )}
            {t("actions.save")}
          </Button>
        </div>
      </div>
    </div>
  );
}
