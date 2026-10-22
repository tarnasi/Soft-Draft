import React, { useState } from 'react';
import {
  Sparkles,
  FileText,
  Layers,
  HelpCircle,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  ShieldAlert,
  Copy,
  Check,
  RotateCcw,
  Edit3,
  Eye,
  Download,
  Languages,
  Briefcase,
  Clock,
  Coins,
  ChevronDown,
  Info,
  Code2,
  Printer,
  Share2,
} from 'lucide-react';

interface Milestone {
  phase: string;
  deliverable: string;
  dependency: string;
  timelineStatus: string;
}

interface ScopeResponse {
  summary: string;
  missingInformation: string[];
  deliverables: {
    confirmed: string[];
    suggested: string[];
  };
  milestones: Milestone[];
  assumptionsAndExclusions: {
    assumptions: string[];
    exclusions: string[];
    risks: string[];
  };
  proposalDraft: string;
}

const SAMPLE_PROJECTS = [
  {
    id: 'bakery',
    title: 'فروشگاه آنلاین قنادی (۳ شعبه)',
    clientRequest: `سلام وقت بخیر. ما یک قنادی با ۳ شعبه فعال در تهران هستیم. مشتریان زیادی داریم که در اینستاگرام و تلفنی سفارش کیک تولد یا شیرینی می‌دهند و ثبت دستی سفارش‌ها باعث بی‌نظمی و نارضایتی شده است.
می‌خواهیم یک وب‌سایت داشته باشیم که مشتری وارد شود، کاتالوگ کیک‌ها و شیرینی‌ها را ببیند، وزن و متن دلخواه روی کیک را تعیین کند و انتخاب کند که خودش حضوری از کدام شعبه تحویل می‌گیرد یا با پیک به آدرسش ارسال شود.
حتماً پرداخت اینترنتی آنلاین داشته باشد و بعد از خرید پیامک تایید با کد پیگیری برای مشتری و فاکتور چاپی/اطلاعیه برای شعبه آماده‌سازی ارسال شود. چقدر زمان و هزینه دارد؟`,
    projectType: 'فروشگاه اینترنتی و سیستم توزیع (E-Commerce & Logistics)',
    technicalPreferences: 'طراحی واکنش‌گرا (موبایل‌محور)، درگاه پرداخت شاپرک (سامان یا زرین‌پال)، پنل پیامک خدماتی، ترجیحاً Next.js یا پلتفرم مدرن',
    budgetDefault: '',
    deadlineDefault: '',
    proposalLanguage: 'fa' as const,
  },
  {
    id: 'clinic',
    title: 'سامانه نوبت‌دهی کلینیک پزشکی',
    clientRequest: `درود. ما یک کلینیک دندان‌پزشکی با ۶ دندان‌پزشک هستیم. منشی‌های ما روزانه ساعت‌ها پاسخگوی تلفن بیماران برای وقت گرفتن هستند و تداخل نوبت پیش می‌آید.
نیاز به سامانه‌ای داریم که بیمار بتواند دکتر مورد نظر و تخصص را انتخاب کند، تقویم روزها و ساعت‌های خالی را مشاهده کند، بیعانه ویزیت را آنلاین پرداخت کند و نوبتش ثبت شود.
یادآوری خودکار پیامکی ۲۴ ساعت قبل از نوبت بیمار ضروری است. آیا روی موبایل بدون نیاز به نصب اپ کار می‌کند؟ هزینه و مدت زمان اجرا چقدر است؟`,
    projectType: 'سامانه رزرواسیون و مدیریت نوبت‌دهی',
    technicalPreferences: 'طراحی PWA یا وب‌اپ واکنش‌گرا، تقویم شمسی دقیق، وب‌سرویس پیامکی یادآوری، درگاه پرداخت اینترنتی',
    budgetDefault: '',
    deadlineDefault: '',
    proposalLanguage: 'fa' as const,
  },
];

export default function App() {
  // Input form state
  const [clientRequest, setClientRequest] = useState('');
  const [projectType, setProjectType] = useState('وب‌سایت / وب‌اپلیکیشن اختصاصی');
  const [technicalPreferences, setTechnicalPreferences] = useState('');
  const [budgetDefault, setBudgetDefault] = useState('');
  const [deadlineDefault, setDeadlineDefault] = useState('');
  const [proposalLanguage, setProposalLanguage] = useState<'fa' | 'en'>('fa');

  // App lifecycle state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ScopeResponse | null>(null);

  // Proposal Draft live editing state
  const [editableDraft, setEditableDraft] = useState('');
  const [isEditingDraft, setIsEditingDraft] = useState(false);

  // Copy feedback tracking
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  // Active section filter or collapse for clean overview
  const [activeTab, setActiveTab] = useState<'all' | 'summary' | 'questions' | 'scope' | 'milestones' | 'risks' | 'draft'>('all');

  // Load sample project
  const loadSample = (sample: typeof SAMPLE_PROJECTS[0]) => {
    setClientRequest(sample.clientRequest);
    setProjectType(sample.projectType);
    setTechnicalPreferences(sample.technicalPreferences);
    setBudgetDefault(sample.budgetDefault);
    setDeadlineDefault(sample.deadlineDefault);
    setProposalLanguage(sample.proposalLanguage);
    setError(null);
  };

  // Reset form
  const handleClear = () => {
    setClientRequest('');
    setProjectType('وب‌سایت / وب‌اپلیکیشن اختصاصی');
    setTechnicalPreferences('');
    setBudgetDefault('');
    setDeadlineDefault('');
    setResult(null);
    setError(null);
    setEditableDraft('');
  };

  // Copy helper with visual checkmark
  const handleCopy = (text: string, sectionId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(sectionId);
    setTimeout(() => {
      setCopiedSection((current) => (current === sectionId ? null : current));
    }, 2000);
  };

  // Download markdown/txt proposal
  const handleDownloadDraft = () => {
    if (!editableDraft) return;
    const blob = new Blob([editableDraft], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ScopeDraft-Proposal-${new Date().toISOString().slice(0, 10)}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Submit request to server API
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientRequest.trim()) {
      setError('لطفاً پیام اولیه یا درخواست خام کارفرما را وارد کنید.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientRequest,
          projectType,
          technicalPreferences,
          budgetDefault,
          deadlineDefault,
          proposalLanguage,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'خطایی در تولید اسکوپ و پروپوزال رخ داد.');
      }

      setResult(data);
      setEditableDraft(data.proposalDraft);
      setIsEditingDraft(false);
      setActiveTab('all');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'خطای ارتباط با سرور هوش مصنوعی';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // Assemble full report text for 1-click export
  const assembleFullReport = () => {
    if (!result) return '';
    const isEn = proposalLanguage === 'en';
    const lines = [
      `# ${isEn ? 'PROJECT SCOPE & PROPOSAL SPECIFICATION' : 'سند تحلیل اسکوپ و پیش‌نویس پروپوزال پروژه'}`,
      `Generated by ScopeDraft - ${new Date().toLocaleDateString('fa-IR')}`,
      '',
      `## 1. ${isEn ? 'Client Request Summary' : 'خلاصه درخواست کارفرما'}`,
      result.summary,
      '',
      `## 2. ${isEn ? 'Clarification Questions & Missing Details' : 'سوالات شفاف‌سازی و ابهامات کلیدی'}`,
      ...result.missingInformation.map((q, i) => `${i + 1}. ${q}`),
      '',
      `## 3. ${isEn ? 'Deliverables & Scope' : 'اقلام تحویلی و محدوده کار'}`,
      `### ${isEn ? 'Confirmed Requirements' : 'موارد قطعی درخواست‌شده:'}`,
      ...result.deliverables.confirmed.map((d) => `- [x] ${d}`),
      '',
      `### ${isEn ? 'Suggested Technical Enhancements' : 'پیشنهادات و مکمل‌های فنی:'}`,
      ...result.deliverables.suggested.map((d) => `- [ ] ${d}`),
      '',
      `## 4. ${isEn ? 'Milestones & Dependencies' : 'فازبندی و نیازمندی‌ها'}`,
      ...result.milestones.map((m, i) => `### فاز ${i + 1}: ${m.phase}\n- تحویل: ${m.deliverable}\n- پیش‌نیاز: ${m.dependency}\n- وضعیت زمان‌بندی: ${m.timelineStatus}`),
      '',
      `## 5. ${isEn ? 'Assumptions, Exclusions & Risks' : 'فرضیات، موارد خارج از تعهد و ریسک‌ها'}`,
      `### ${isEn ? 'Assumptions' : 'فرضیات:'}`,
      ...result.assumptionsAndExclusions.assumptions.map((a) => `- ${a}`),
      `### ${isEn ? 'Exclusions (Out of Scope)' : 'موارد خارج از تعهد (Exclusions):'}`,
      ...result.assumptionsAndExclusions.exclusions.map((e) => `- ${e}`),
      `### ${isEn ? 'Risks' : 'ریسک‌ها:'}`,
      ...result.assumptionsAndExclusions.risks.map((r) => `- ${r}`),
      '',
      `## 6. ${isEn ? 'Formal Proposal Draft' : 'متن رسمی پیش‌نویس پروپوزال'}`,
      editableDraft || result.proposalDraft,
    ];
    return lines.join('\n');
  };

  const isEnglishProposal = proposalLanguage === 'en';

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col antialiased selection:bg-indigo-600 selection:text-white" dir="rtl">
      {/* Top Banner & Header */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 p-[1px] shadow-lg shadow-indigo-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[11px] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-indigo-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-extrabold tracking-tight text-white">ScopeDraft</span>
                <span className="text-[11px] px-2 py-0.5 rounded-full font-semibold bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">
                  دستیار حرفه‌ای فریلنسرها
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                تبدیل درخواست‌های خام کارفرما به اسکوپ دقیق، سوالات ابهام‌زدا و پروپوزال رسمی بدون برآورد دروغین
              </p>
            </div>
          </div>

          {/* Quick Sample Presets */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 hidden md:inline">نمونه‌های واقعی:</span>
            {SAMPLE_PROJECTS.map((sample) => (
              <button
                key={sample.id}
                type="button"
                onClick={() => loadSample(sample)}
                className="text-xs font-medium px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700/80 text-slate-200 border border-slate-700/80 transition flex items-center gap-1.5"
                title="بارگذاری این نمونه برای تست سریع"
              >
                <Code2 className="w-3.5 h-3.5 text-indigo-400" />
                <span>{sample.title}</span>
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Form Column (4.5 cols) */}
          <section className="lg:col-span-5 flex flex-col gap-5">
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400" />

              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-indigo-400" />
                  <h2 className="text-base font-bold text-white">ورودی‌های پروژه</h2>
                </div>
                <button
                  type="button"
                  onClick={handleClear}
                  className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 transition"
                  title="پاک کردن فرم"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>پاکسازی</span>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* 1. Client Request Input */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-slate-200 flex items-center gap-1">
                      پیام اولیه یا نیازمندی خام کارفرما
                      <span className="text-rose-400">*</span>
                    </label>
                    <span className="text-[11px] text-slate-400">
                      {clientRequest.length} کاراکتر
                    </span>
                  </div>
                  <textarea
                    rows={7}
                    required
                    value={clientRequest}
                    onChange={(e) => setClientRequest(e.target.value)}
                    placeholder="پیام یا شرح نیاز کارفرما (تلگرام، ایمیل، واتساپ یا صورت‌جلسه) را مستقیماً اینجا پیست کنید... حتی اگر چندخطی، مبهم و بی‌نظم باشد!"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs sm:text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition leading-relaxed"
                  />
                  <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                    <Info className="w-3 h-3 text-indigo-400 shrink-0" />
                    هوش مصنوعی ابهامات را شناسایی کرده و سوالات شفاف‌سازی اختصاصی می‌سازد.
                  </p>
                </div>

                {/* 2. Project Type */}
                <div>
                  <label className="block text-xs font-bold text-slate-200 mb-1.5">
                    نوع و طبقه‌بندی پروژه
                  </label>
                  <input
                    type="text"
                    value={projectType}
                    onChange={(e) => setProjectType(e.target.value)}
                    placeholder="مثال: فروشگاه آنلاین، پورتال سازمانی، داشبورد SaaS، سیستم رزرواسیون"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                  />
                </div>

                {/* 3. Known Technical Requirements */}
                <div>
                  <label className="block text-xs font-bold text-slate-200 mb-1.5">
                    پیشنیازها و ترجیحات فنی مشخص‌شده
                  </label>
                  <input
                    type="text"
                    value={technicalPreferences}
                    onChange={(e) => setTechnicalPreferences(e.target.value)}
                    placeholder="مثال: Next.js، درگاه بانک سامان، پنل پیامکی کاوه‌نگار، دیتابیس PostgreSQL"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                  />
                </div>

                {/* 4. Budget & Deadline (Anti-hallucination note) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1 flex items-center gap-1">
                      <Coins className="w-3 h-3 text-amber-400" />
                      بودجه کارفرما (اختیاری)
                    </label>
                    <input
                      type="text"
                      value={budgetDefault}
                      onChange={(e) => setBudgetDefault(e.target.value)}
                      placeholder="اگر کارفرما نگفته، خالی بگذارید"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-cyan-400" />
                      مهلت و ددلاین (اختیاری)
                    </label>
                    <input
                      type="text"
                      value={deadlineDefault}
                      onChange={(e) => setDeadlineDefault(e.target.value)}
                      placeholder="اگر کارفرما نگفته، خالی بگذارید"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                    />
                  </div>
                </div>

                {/* 5. Proposal Output Language */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1">
                    <Languages className="w-3.5 h-3.5 text-indigo-400" />
                    زبان خروجی پروپوزال و اسناد
                  </label>
                  <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800">
                    <button
                      type="button"
                      onClick={() => setProposalLanguage('fa')}
                      className={`py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                        proposalLanguage === 'fa'
                          ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <span>🇮🇷</span>
                      <span>فارسی (رسمی تجاری)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setProposalLanguage('en')}
                      className={`py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                        proposalLanguage === 'en'
                          ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <span>🌐</span>
                      <span>English (Business)</span>
                    </button>
                  </div>
                </div>

                {/* Error Banner */}
                {error && (
                  <div className="p-3 bg-rose-950/40 border border-rose-800/80 rounded-xl text-rose-300 text-xs flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{error}</span>
                  </div>
                )}

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 px-4 rounded-xl font-extrabold text-sm text-white bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 active:scale-[0.99] transition shadow-lg shadow-indigo-600/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <RotateCcw className="w-4 h-4 animate-spin" />
                      <span>در حال تحلیل ساختار و استخراج اسکوپ با هوش مصنوعی...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>تحلیل نیازمندی و تولید پروپوزال رسمی</span>
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Quick Principles Card */}
            <div className="bg-slate-900/40 border border-slate-800/60 rounded-xl p-4 text-xs text-slate-400 space-y-2">
              <span className="font-bold text-slate-300 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                قواعد عدم توهم و محافظت از فریلنسر:
              </span>
              <ul className="space-y-1 list-disc list-inside text-[11px] text-slate-400 leading-relaxed">
                <li>هیچ مبلغ یا ددلاین فرضی اختراع نمی‌شود تا کارفرما متوقع نشود.</li>
                <li>اقلام قطعی از پیشنهادات فنی اختیاری کاملاً جدا می‌شوند.</li>
                <li>ابهامات در قالب سوالات شفاف‌سازی فنی استخراج می‌گردند.</li>
              </ul>
            </div>
          </section>

          {/* Right Results Column (7 cols) */}
          <section className="lg:col-span-7 flex flex-col gap-6">
            {/* Empty State */}
            {!loading && !result && (
              <div className="border border-dashed border-slate-800 rounded-2xl p-10 sm:p-14 text-center bg-slate-900/20 flex flex-col items-center justify-center min-h-[480px]">
                <div className="w-16 h-16 rounded-2xl bg-slate-800/70 border border-slate-700/80 flex items-center justify-center text-indigo-400 mb-4 shadow-inner">
                  <Briefcase className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-slate-200 mb-2">هنوز پروژه‌ای تحلیل نشده است</h3>
                <p className="text-xs sm:text-sm text-slate-400 max-w-md leading-relaxed mb-6">
                  متن پیام کارفرما را در فرم مقابل وارد کنید یا از دکمه‌های نمونه سریع در بالا برای تست فوری استفاده نمایید.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => loadSample(SAMPLE_PROJECTS[0])}
                    className="text-xs font-semibold px-4 py-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 transition flex items-center gap-1.5"
                  >
                    <Code2 className="w-3.5 h-3.5" />
                    بارگذاری نمونه قنادی ۳ شعبه
                  </button>
                  <button
                    type="button"
                    onClick={() => loadSample(SAMPLE_PROJECTS[1])}
                    className="text-xs font-semibold px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition flex items-center gap-1.5"
                  >
                    بارگذاری نمونه کلینیک پزشکی
                  </button>
                </div>
              </div>
            )}

            {/* Loading State */}
            {loading && (
              <div className="border border-slate-800 rounded-2xl p-12 text-center bg-slate-900/40 flex flex-col items-center justify-center min-h-[480px] space-y-5">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full border-4 border-slate-800 border-t-indigo-500 animate-spin" />
                  <Sparkles className="w-6 h-6 text-indigo-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                </div>
                <div className="space-y-1.5">
                  <h4 className="text-base font-bold text-slate-100">در حال ارزیابی فنی و تفکیک اسکوپ</h4>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                    استخراج درخواست‌ها، تعیین سوالات بازدارنده اسکوپ کریپ و آماده‌سازی پیش‌نویس رسمی قرارداد...
                  </p>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-slate-500 bg-slate-950/80 px-3 py-1.5 rounded-full border border-slate-800">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span>استفاده از مدل Gemini 3.8 Flash با دقت بالا</span>
                </div>
              </div>
            )}

            {/* Result Display */}
            {result && (
              <div className="space-y-6">
                {/* Result Control Bar */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-md">
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 text-xs">
                    <button
                      type="button"
                      onClick={() => setActiveTab('all')}
                      className={`px-3 py-1.5 rounded-lg font-medium transition ${
                        activeTab === 'all'
                          ? 'bg-indigo-600 text-white'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                      }`}
                    >
                      مشاهده همه بخش‌ها
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('draft')}
                      className={`px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1 ${
                        activeTab === 'draft'
                          ? 'bg-indigo-600 text-white'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                      }`}
                    >
                      <FileText className="w-3.5 h-3.5" />
                      پیش‌نویس پروپوزال
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('questions')}
                      className={`px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1 ${
                        activeTab === 'questions'
                          ? 'bg-amber-600 text-white'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                      }`}
                    >
                      <HelpCircle className="w-3.5 h-3.5" />
                      سوالات ({result.missingInformation.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('scope')}
                      className={`px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1 ${
                        activeTab === 'scope'
                          ? 'bg-emerald-600 text-white'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                      }`}
                    >
                      <Layers className="w-3.5 h-3.5" />
                      اقلام تحویلی
                    </button>
                  </div>

                  {/* Export and Full Copy buttons */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleCopy(assembleFullReport(), 'full_report')}
                      className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition flex items-center gap-1.5"
                      title="کپی کردن کل گزارش شامل تحلیل‌ها و پروپوزال"
                    >
                      {copiedSection === 'full_report' ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400">کل سند کپی شد!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>کپی کل تحلیل</span>
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={handleDownloadDraft}
                      className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 transition flex items-center gap-1.5"
                      title="دانلود پروپوزال با پسوند Markdown (.md)"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>دانلود (.md)</span>
                    </button>
                  </div>
                </div>

                {/* Section 1: Summary */}
                {(activeTab === 'all' || activeTab === 'summary') && (
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
                    <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800/80">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-indigo-400" />
                        <h3 className="text-sm font-bold text-white">۱. خلاصه درخواست و نیاز کارفرما</h3>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopy(result.summary, 'summary')}
                        className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition"
                      >
                        {copiedSection === 'summary' ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-emerald-400 font-medium">کپی شد</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>کپی</span>
                          </>
                        )}
                      </button>
                    </div>
                    <p
                      dir={isEnglishProposal ? 'ltr' : 'rtl'}
                      className="text-xs sm:text-sm text-slate-300 leading-relaxed text-justify"
                    >
                      {result.summary}
                    </p>
                  </div>
                )}

                {/* Section 2: Clarification Questions (Highlighted in Amber) */}
                {(activeTab === 'all' || activeTab === 'questions') && (
                  <div className="bg-slate-900 border border-amber-900/40 rounded-2xl p-5 shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 left-0 h-1 bg-amber-500" />
                    <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800/80">
                      <div className="flex items-center gap-2">
                        <HelpCircle className="w-4 h-4 text-amber-400" />
                        <h3 className="text-sm font-bold text-amber-300">
                          ۲. سوالات شفاف‌سازی و ابهامات کلیدی (پیش‌نیاز قیمت‌گذاری)
                        </h3>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopy(result.missingInformation.map((q, i) => `${i + 1}. ${q}`).join('\n'), 'missing')}
                        className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition"
                      >
                        {copiedSection === 'missing' ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-emerald-400 font-medium">کپی شد</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>کپی سوالات</span>
                          </>
                        )}
                      </button>
                    </div>

                    <p className="text-[11px] text-amber-200/80 mb-3">
                      این موارد در متن کارفرما مبهم بوده‌اند. ارسال این پرسش‌ها نشان‌دهنده دقت فنی شماست و مانع از اختلاف مالی بعدی می‌شود:
                    </p>

                    <ul className="space-y-2.5" dir={isEnglishProposal ? 'ltr' : 'rtl'}>
                      {result.missingInformation.map((item, idx) => (
                        <li
                          key={idx}
                          className="bg-amber-950/25 border border-amber-900/40 rounded-xl p-3 text-xs text-amber-100 flex items-start gap-2.5"
                        >
                          <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center shrink-0 text-[11px] border border-amber-500/30">
                            {idx + 1}
                          </span>
                          <span className="leading-relaxed">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Section 3: Deliverables Breakdown (Confirmed vs Suggested) */}
                {(activeTab === 'all' || activeTab === 'scope') && (
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
                    <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800/80">
                      <div className="flex items-center gap-2">
                        <Layers className="w-4 h-4 text-emerald-400" />
                        <h3 className="text-sm font-bold text-white">۳. تفکیک اقلام تحویلی و محدوده پروژه</h3>
                      </div>
                      <span className="text-[11px] text-slate-400">
                        تفکیک تعهدات مستقیم از پیشنهادات مکمل
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4" dir={isEnglishProposal ? 'ltr' : 'rtl'}>
                      {/* Confirmed requirements */}
                      <div className="bg-slate-950/70 border border-emerald-900/40 rounded-xl p-4 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-emerald-900/30">
                            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-emerald-400" />
                              تعهدات قطعی کارفرما ({result.deliverables.confirmed.length})
                            </span>
                            <button
                              type="button"
                              onClick={() => handleCopy(result.deliverables.confirmed.map((c) => `• ${c}`).join('\n'), 'confirmed')}
                              className="text-[11px] text-slate-400 hover:text-emerald-300"
                            >
                              کپی
                            </button>
                          </div>
                          <ul className="space-y-2">
                            {result.deliverables.confirmed.map((item, idx) => (
                              <li key={idx} className="text-xs text-slate-200 flex items-start gap-2">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                                <span className="leading-relaxed">{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="mt-3 pt-2 border-t border-slate-800/50 text-[10px] text-emerald-400/80">
                          ✓ مستقیماً از متن و خواسته اولیه کارفرما استخراج شده است.
                        </div>
                      </div>

                      {/* Suggested enhancements */}
                      <div className="bg-slate-950/70 border border-indigo-900/40 rounded-xl p-4 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-indigo-900/30">
                            <span className="text-xs font-bold text-indigo-400 flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-indigo-400" />
                              پیشنهادات تکمیلی مهندسی ({result.deliverables.suggested.length})
                            </span>
                            <button
                              type="button"
                              onClick={() => handleCopy(result.deliverables.suggested.map((s) => `• ${s}`).join('\n'), 'suggested')}
                              className="text-[11px] text-slate-400 hover:text-indigo-300"
                            >
                              کپی
                            </button>
                          </div>
                          <ul className="space-y-2">
                            {result.deliverables.suggested.map((item, idx) => (
                              <li key={idx} className="text-xs text-slate-300 flex items-start gap-2">
                                <Sparkles className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                                <span className="leading-relaxed">{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="mt-3 pt-2 border-t border-slate-800/50 text-[10px] text-indigo-400/80">
                          ⚡ موارد پیشنهادی جهت پایداری، امنیت و ارتقای پروژه (اختیاری).
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Section 4: Milestones & Dependencies */}
                {(activeTab === 'all' || activeTab === 'milestones') && (
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
                    <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800/80">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-cyan-400" />
                        <h3 className="text-sm font-bold text-white">۴. فازبندی اجرایی و پیش‌نیازها (Milestones)</h3>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopy(result.milestones.map((m, i) => `فاز ${i + 1}: ${m.phase}\nتحویل: ${m.deliverable}\nپیش‌نیاز: ${m.dependency}\nوضعیت: ${m.timelineStatus}\n`).join('\n---\n'), 'milestones')}
                        className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition"
                      >
                        {copiedSection === 'milestones' ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-emerald-400 font-medium">کپی شد</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>کپی فازها</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="space-y-3" dir={isEnglishProposal ? 'ltr' : 'rtl'}>
                      {result.milestones.map((m, idx) => (
                        <div
                          key={idx}
                          className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-3.5 text-xs flex flex-col md:flex-row md:items-center justify-between gap-3 hover:border-slate-700 transition"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-0.5 rounded font-extrabold bg-cyan-500/20 text-cyan-400 text-[11px]">
                                فاز {idx + 1}
                              </span>
                              <span className="font-bold text-slate-200 text-xs sm:text-sm">{m.phase}</span>
                            </div>
                            <p className="text-slate-300 leading-relaxed pr-1">{m.deliverable}</p>
                          </div>

                          <div className="flex flex-wrap md:flex-col items-start md:items-end gap-1.5 shrink-0 text-[11px]">
                            <div className="bg-slate-900 border border-slate-800 px-2 py-1 rounded text-slate-400">
                              پیش‌نیاز: <span className="text-slate-200 font-medium">{m.dependency}</span>
                            </div>
                            <div className="bg-slate-900/80 text-cyan-300/90 px-2 py-0.5 rounded">
                              {m.timelineStatus}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Section 5: Assumptions, Exclusions & Risks */}
                {(activeTab === 'all' || activeTab === 'risks') && (
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
                    <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800/80">
                      <div className="flex items-center gap-2">
                        <ShieldAlert className="w-4 h-4 text-rose-400" />
                        <h3 className="text-sm font-bold text-white">۵. فرضیات، موارد خارج از تعهد و ریسک‌های پروژه</h3>
                      </div>
                      <span className="text-[11px] text-rose-400 font-medium">سپر دفاعی فریلنسر</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs" dir={isEnglishProposal ? 'ltr' : 'rtl'}>
                      {/* Assumptions */}
                      <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5 space-y-2">
                        <span className="font-bold text-slate-200 block pb-1 border-b border-slate-800">
                          فرضیات پروژه (Assumptions)
                        </span>
                        <ul className="space-y-1.5 text-slate-300">
                          {result.assumptionsAndExclusions.assumptions.map((item, i) => (
                            <li key={i} className="flex items-start gap-1.5">
                              <span className="text-slate-500 font-bold">•</span>
                              <span className="leading-relaxed">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Exclusions */}
                      <div className="bg-slate-950/70 border border-rose-900/40 rounded-xl p-3.5 space-y-2">
                        <span className="font-bold text-rose-400 block pb-1 border-b border-rose-900/30">
                          عدم تعهد (Exclusions)
                        </span>
                        <ul className="space-y-1.5 text-rose-200/90">
                          {result.assumptionsAndExclusions.exclusions.map((item, i) => (
                            <li key={i} className="flex items-start gap-1.5">
                              <span className="text-rose-500 font-bold">✕</span>
                              <span className="leading-relaxed">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Risks */}
                      <div className="bg-slate-950/70 border border-amber-900/40 rounded-xl p-3.5 space-y-2">
                        <span className="font-bold text-amber-400 block pb-1 border-b border-amber-900/30">
                          ریسک‌های احتمالی (Risks)
                        </span>
                        <ul className="space-y-1.5 text-amber-200/90">
                          {result.assumptionsAndExclusions.risks.map((item, i) => (
                            <li key={i} className="flex items-start gap-1.5">
                              <AlertTriangle className="w-3 h-3 text-amber-400 shrink-0 mt-0.5" />
                              <span className="leading-relaxed">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {/* Section 6: Editable Formal Proposal Draft */}
                {(activeTab === 'all' || activeTab === 'draft') && (
                  <div className="bg-slate-900 border-2 border-indigo-500/50 rounded-2xl p-5 sm:p-6 shadow-2xl relative">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-800">
                      <div>
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-5 h-5 text-indigo-400" />
                          <h3 className="text-base font-extrabold text-white">
                            ۶. متن پیش‌نویس پروپوزال رسمی (قابل ویرایش و ارسال)
                          </h3>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">
                          این متن آماده برای ارسال مستقیم به کارفرما در تلگرام، واتساپ یا ایمیل تنظیم شده است.
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setIsEditingDraft(!isEditingDraft)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
                            isEditingDraft
                              ? 'bg-amber-600 text-white shadow-md'
                              : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                          }`}
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>{isEditingDraft ? 'پیش‌نمایش متن' : 'ویرایش پیش‌نویس'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleCopy(editableDraft, 'proposal_draft')}
                          className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1.5 shadow-lg shadow-indigo-600/30 transition cursor-pointer"
                        >
                          {copiedSection === 'proposal_draft' ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-white" />
                              <span>کپی شد!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>کپی کل پروپوزال</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Proposal Editor or Formatted Preview */}
                    {isEditingDraft ? (
                      <div>
                        <textarea
                          rows={18}
                          value={editableDraft}
                          onChange={(e) => setEditableDraft(e.target.value)}
                          dir={isEnglishProposal ? 'ltr' : 'rtl'}
                          className="w-full bg-slate-950 border border-indigo-500/60 rounded-xl p-4 text-xs sm:text-sm text-slate-100 font-mono leading-relaxed focus:outline-none focus:ring-1 focus:ring-indigo-400"
                        />
                        <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2">
                          <span>می‌توانید مبالغ، تخفیف‌ها یا تبصره‌های شخصی خود را اضافه کنید.</span>
                          <span>{editableDraft.length} کاراکتر</span>
                        </div>
                      </div>
                    ) : (
                      <div
                        dir={isEnglishProposal ? 'ltr' : 'rtl'}
                        className="bg-slate-950/80 rounded-xl p-5 border border-slate-800/90 text-xs sm:text-sm text-slate-200 whitespace-pre-wrap leading-relaxed select-text font-sans"
                      >
                        {editableDraft}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/60 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-400">ScopeDraft</span>
            <span>•</span>
            <span>طراحی‌شده برای محافظت از زمان و درآمد برنامه‌نویسان و آژانس‌ها</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[11px] bg-slate-900 px-2.5 py-1 rounded-full border border-slate-800">
              مدل زبانی: Gemini 3.8 Flash
            </span>
            <span>بدون ذخیره اطلاعات در دیتابیس (حفظ حریم خصوصی)</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
