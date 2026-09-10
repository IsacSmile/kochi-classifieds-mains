"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Building2,
  FolderTree,
  FileText,
  MapPin,
  PhoneCall,
  Clock,
  Image as ImageIcon,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Plus,
  Trash2,
  UploadCloud,
  Loader2,
  AlertCircle,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Globe,
  Mail,
  MessageSquare,
  Home,
  ArrowLeft,
  Lock,
  Pencil,
  XCircle,
} from "lucide-react";
import Header from "@/components/Header";
import CustomSelect from "@/components/CustomSelect";

interface Category {
  id: number;
  name: string;
  slug: string;
  parentId: number | null;
}

interface LocationItem {
  id: number;
  name: string;
  slug: string;
  parentId: number | null;
}

interface ServiceItem {
  serviceName: string;
  description: string;
  price: string;
}

interface DayHour {
  day: string;
  openingTime: string;
  closingTime: string;
  closed: boolean;
}

const DEFAULT_DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export default function EditBusinessPage() {
  const router = useRouter();
  const params = useParams();
  const businessId = params?.id as string;

  const { data: session, status: authStatus } = useSession();

  // Loading & Permission States
  const [loadingBusiness, setLoadingBusiness] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [initialError, setInitialError] = useState<string | null>(null);

  // Wizard Step State
  const [currentStep, setCurrentStep] = useState(1);

  // Data Sources
  const [categories, setCategories] = useState<Category[]>([]);
  const [locations, setLocations] = useState<LocationItem[]>([]);

  // Original Status (preserved)
  const [businessStatus, setBusinessStatus] = useState<string>("pending");
  const [rejectionReason, setRejectionReason] = useState<string | null>(null);
  const [businessSlug, setBusinessSlug] = useState<string>("");

  // Form State
  // Step 1: Basic Info
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState<string>("");

  // Step 2: Description & Services
  const [description, setDescription] = useState("");
  const [services, setServices] = useState<ServiceItem[]>([
    { serviceName: "", description: "", price: "" },
  ]);

  // Step 3: Address & Location
  const [street, setStreet] = useState("");
  const [area, setArea] = useState("");
  const [pincode, setPincode] = useState("");
  const [locationId, setLocationId] = useState<string>("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");

  // Step 4: Contact Info
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");

  // Step 5: Business Hours
  const [businessHours, setBusinessHours] = useState<DayHour[]>(
    DEFAULT_DAYS.map((day) => ({
      day,
      openingTime: day === "Sunday" ? "" : "09:00",
      closingTime: day === "Sunday" ? "" : "18:00",
      closed: day === "Sunday",
    }))
  );

  // Step 6: Logo & Photos Upload
  const [logoUrl, setLogoUrl] = useState<string>("");
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  // Form Submission & Status
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submittedResult, setSubmittedResult] = useState<{
    businessId: number;
    name: string;
    status: string;
    slug: string;
  } | null>(null);

  // Validation Error state for current step
  const [stepError, setStepError] = useState<string | null>(null);

  // Load Categories, Locations, and Business Data
  useEffect(() => {
    if (authStatus === "unauthenticated") {
      router.push(`/login?callbackUrl=/my-businesses/${businessId}/edit`);
      return;
    }

    if (authStatus !== "authenticated" || !businessId) return;

    async function loadAllData() {
      setLoadingBusiness(true);
      setAccessDenied(false);
      setNotFound(false);
      setInitialError(null);

      try {
        const [catRes, locRes, bizRes] = await Promise.all([
          fetch("/api/categories"),
          fetch("/api/locations"),
          fetch(`/api/businesses/${businessId}`),
        ]);

        if (catRes.ok) {
          setCategories(await catRes.json());
        }
        if (locRes.ok) {
          setLocations(await locRes.json());
        }

        if (bizRes.status === 403) {
          setAccessDenied(true);
          return;
        }

        if (bizRes.status === 404) {
          setNotFound(true);
          return;
        }

        if (!bizRes.ok) {
          const errData = await bizRes.json();
          throw new Error(errData.error || "Failed to load business details.");
        }

        const biz = await bizRes.json();

        // Populate Form Fields
        setName(biz.name || "");
        setCategoryId(biz.categoryId ? String(biz.categoryId) : "");
        setBusinessStatus(biz.status || "pending");
        setRejectionReason(biz.rejectionReason || null);
        setBusinessSlug(biz.slug || "");

        setDescription(biz.description || "");

        // Services
        if (Array.isArray(biz.businessServices) && biz.businessServices.length > 0) {
          setServices(
            biz.businessServices.map((s: any) => ({
              serviceName: s.serviceName || "",
              description: s.description || "",
              price: s.price !== null && s.price !== undefined ? String(s.price) : "",
            }))
          );
        } else {
          setServices([{ serviceName: "", description: "", price: "" }]);
        }

        // Location & Address
        setLocationId(biz.locationId ? String(biz.locationId) : "");
        if (biz.address) {
          const parts = biz.address.split(",").map((p: string) => p.trim());
          if (parts.length >= 3) {
            setStreet(parts.slice(0, parts.length - 2).join(", "));
            setArea(parts[parts.length - 2]);
            setPincode(parts[parts.length - 1]);
          } else if (parts.length === 2) {
            setStreet(parts[0]);
            setArea(parts[1]);
            setPincode("");
          } else {
            setStreet(biz.address);
            setArea("");
            setPincode("");
          }
        } else {
          setStreet("");
          setArea("");
          setPincode("");
        }

        setLatitude(biz.latitude !== null && biz.latitude !== undefined ? String(biz.latitude) : "");
        setLongitude(biz.longitude !== null && biz.longitude !== undefined ? String(biz.longitude) : "");

        // Contact Info
        setPhone(biz.phone || "");
        setWhatsapp(biz.whatsapp || "");
        setEmail(biz.email || "");
        setWebsite(biz.website || "");

        // Business Hours
        if (Array.isArray(biz.businessHours) && biz.businessHours.length > 0) {
          const loadedHours = DEFAULT_DAYS.map((dayName) => {
            const match = biz.businessHours.find(
              (h: any) => h.day.toLowerCase() === dayName.toLowerCase()
            );
            if (match) {
              return {
                day: dayName,
                openingTime: match.openingTime || "",
                closingTime: match.closingTime || "",
                closed: Boolean(match.closed),
              };
            }
            return {
              day: dayName,
              openingTime: dayName === "Sunday" ? "" : "09:00",
              closingTime: dayName === "Sunday" ? "" : "18:00",
              closed: dayName === "Sunday",
            };
          });
          setBusinessHours(loadedHours);
        }

        // Logo & Photos
        if (Array.isArray(biz.businessPhotos) && biz.businessPhotos.length > 0) {
          // Photo with sortOrder === 0 is Logo
          const logoObj = biz.businessPhotos.find(
            (p: any) => p.sortOrder === 0 || (p.altText && p.altText.toLowerCase().includes("logo"))
          );
          if (logoObj) {
            setLogoUrl(logoObj.imageUrl);
          } else {
            setLogoUrl("");
          }

          // Gallery photos (sortOrder > 0 or not logo)
          const galleryObjs = biz.businessPhotos.filter(
            (p: any) => p !== logoObj && p.sortOrder !== 0
          );
          setPhotoUrls(galleryObjs.map((p: any) => p.imageUrl));
        } else {
          setLogoUrl("");
          setPhotoUrls([]);
        }
      } catch (err: any) {
        setInitialError(err.message || "Failed to fetch business data.");
      } finally {
        setLoadingBusiness(false);
      }
    }

    loadAllData();
  }, [authStatus, businessId, router]);

  // Service Actions
  const handleAddService = () => {
    setServices([...services, { serviceName: "", description: "", price: "" }]);
  };

  const handleRemoveService = (index: number) => {
    setServices(services.filter((_, i) => i !== index));
  };

  const handleServiceChange = (
    index: number,
    field: keyof ServiceItem,
    value: string
  ) => {
    const updated = [...services];
    updated[index][field] = value;
    setServices(updated);
  };

  // Hours Actions
  const handleHourChange = (
    index: number,
    field: keyof DayHour,
    value: any
  ) => {
    const updated = [...businessHours];
    updated[index] = { ...updated[index], [field]: value };
    setBusinessHours(updated);
  };

  // Upload Handlers
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingLogo(true);
    setStepError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || "Failed to upload logo.");
      }
      setLogoUrl(data.url);
    } catch (err: any) {
      setStepError(err.message || "Logo upload failed.");
    } finally {
      setUploadingLogo(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (photoUrls.length + files.length > 8) {
      setStepError("Maximum 8 gallery photos allowed.");
      return;
    }

    setUploadingPhoto(true);
    setStepError(null);

    try {
      const newUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        const data = await res.json();
        if (res.ok && data.url) {
          newUrls.push(data.url);
        }
      }
      setPhotoUrls([...photoUrls, ...newUrls]);
    } catch (err: any) {
      setStepError(err.message || "Failed to upload photo(s).");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleRemovePhoto = (index: number) => {
    setPhotoUrls(photoUrls.filter((_, i) => i !== index));
  };

  // Step Validation & Navigation
  const validateStep = (step: number): boolean => {
    setStepError(null);

    if (step === 1) {
      if (!name.trim()) {
        setStepError("Business Name is required.");
        return false;
      }
      if (!categoryId) {
        setStepError("Please select a Category.");
        return false;
      }
    }

    if (step === 3) {
      if (!locationId) {
        setStepError("Please select a Location.");
        return false;
      }
    }

    if (step === 4) {
      if (!phone.trim() && !email.trim()) {
        setStepError("Please provide at least a Phone number or Email address.");
        return false;
      }
    }

    return true;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 7));
    }
  };

  const handleBack = () => {
    setStepError(null);
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  // Final Update Submission
  const handleSubmit = async () => {
    setSubmitting(true);
    setSubmitError(null);

    const payload = {
      name,
      categoryId: Number(categoryId),
      locationId: Number(locationId),
      description,
      street,
      area,
      pincode,
      latitude: latitude ? parseFloat(latitude) : null,
      longitude: longitude ? parseFloat(longitude) : null,
      phone,
      whatsapp,
      email,
      website,
      services: services.filter((s) => s.serviceName.trim().length > 0),
      businessHours,
      logoUrl,
      photoUrls,
    };

    try {
      const res = await fetch(`/api/businesses/${businessId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || "Failed to update business.");
      }

      setSubmittedResult({
        businessId: data.businessId,
        name: data.name,
        status: data.status,
        slug: data.slug || businessSlug,
      });
      setCurrentStep(8); // Confirmation step
    } catch (err: any) {
      setSubmitError(err.message || "An unexpected error occurred while updating.");
    } finally {
      setSubmitting(false);
    }
  };

  const selectedCategoryObj = categories.find((c) => c.id === Number(categoryId));
  const selectedLocationObj = locations.find((l) => l.id === Number(locationId));

  const STEPS_NAV = [
    { id: 1, label: "Basic Info", icon: Building2 },
    { id: 2, label: "Description & Services", icon: FileText },
    { id: 3, label: "Location & Address", icon: MapPin },
    { id: 4, label: "Contact Info", icon: PhoneCall },
    { id: 5, label: "Business Hours", icon: Clock },
    { id: 6, label: "Logo & Photos", icon: ImageIcon },
    { id: 7, label: "Review & Submit", icon: CheckCircle2 },
  ];

  if (authStatus === "loading" || loadingBusiness) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-xs text-slate-500 font-semibold space-y-3 flex-col">
        <div className="w-8 h-8 border-3 border-brand-green border-t-transparent rounded-full animate-spin" />
        <p>Loading business details for editing...</p>
      </div>
    );
  }

  if (accessDenied) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-16">
        <Header />
        <div className="max-w-lg mx-auto p-6 sm:p-12 my-12 bg-white border border-slate-200 rounded-3xl shadow-xl text-center space-y-6">
          <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto">
            <Lock className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Access Denied
            </h1>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              You must be the owner of this business listing or an administrator to access the edit page.
            </p>
          </div>
          <Link
            href="/my-businesses"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-brand-navy hover:bg-slate-800 text-white font-bold rounded-2xl text-xs transition-colors shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Return to My Businesses
          </Link>
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-16">
        <Header />
        <div className="max-w-lg mx-auto p-6 sm:p-12 my-12 bg-white border border-slate-200 rounded-3xl shadow-xl text-center space-y-6">
          <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Business Not Found
            </h1>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              The requested business listing does not exist or has been removed.
            </p>
          </div>
          <Link
            href="/my-businesses"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-brand-navy hover:bg-slate-800 text-white font-bold rounded-2xl text-xs transition-colors shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to My Businesses
          </Link>
        </div>
      </div>
    );
  }

  if (initialError) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-16">
        <Header />
        <div className="max-w-lg mx-auto p-6 sm:p-12 my-12 bg-white border border-slate-200 rounded-3xl shadow-xl text-center space-y-6">
          <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h1 className="text-xl font-bold text-slate-900">
              Failed to Load Business
            </h1>
            <p className="text-xs text-rose-600 font-medium">{initialError}</p>
          </div>
          <Link
            href="/my-businesses"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-brand-navy hover:bg-slate-800 text-white font-bold rounded-2xl text-xs transition-colors shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to My Businesses
          </Link>
        </div>
      </div>
    );
  }

  // STEP 8: Success / Confirmation Screen
  if (submittedResult && currentStep === 8) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-800 font-sans p-4 sm:p-8 flex items-center justify-center">
        <div className="max-w-lg w-full bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xl text-center space-y-6 animate-in zoom-in-95 duration-200">
          {/* Animated Success Icon */}
          <div className="relative mx-auto w-20 h-20">
            <div className="absolute inset-0 bg-emerald-400/20 rounded-full animate-ping" />
            <div className="relative w-20 h-20 bg-gradient-to-tr from-emerald-600 to-teal-500 rounded-full flex items-center justify-center text-white shadow-md">
              <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
            </div>
          </div>

          {/* Heading & Status Banner */}
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-extrabold shadow-2xs">
              {submittedResult.status === "approved" && (
                <span className="bg-emerald-50 text-emerald-800 border border-emerald-200/80 px-3 py-1 rounded-full flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Listing Status: Approved & Active
                </span>
              )}
              {submittedResult.status === "pending" && (
                <span className="bg-amber-50 text-amber-800 border border-amber-200/80 px-3 py-1 rounded-full flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  Listing Status: Pending Admin Review
                </span>
              )}
              {submittedResult.status === "rejected" && (
                <span className="bg-rose-50 text-rose-800 border border-rose-200/80 px-3 py-1 rounded-full flex items-center gap-1.5">
                  <XCircle className="w-3.5 h-3.5 text-rose-600" />
                  Listing Status: Rejected
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Business Updated!
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-medium">
              Changes to <strong className="text-slate-900 font-extrabold">{submittedResult.name}</strong> have been saved successfully.
            </p>
          </div>

          {/* Listing Details Card */}
          <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80 text-left text-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200/70 pb-2.5">
              <span className="text-slate-500 font-semibold">Listing ID:</span>
              <span className="font-mono font-extrabold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                #{submittedResult.businessId}
              </span>
            </div>

            <div className="flex items-center justify-between border-b border-slate-200/70 pb-2.5">
              <span className="text-slate-500 font-semibold">Business Name:</span>
              <span className="font-extrabold text-slate-900 truncate max-w-[200px]">
                {submittedResult.name}
              </span>
            </div>

            <div className="flex items-center justify-between pb-0.5">
              <span className="text-slate-500 font-semibold">Status Preserved:</span>
              <span className="font-bold capitalize text-slate-800">
                {submittedResult.status}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-2.5 pt-2">
            {submittedResult.status === "approved" && (
              <Link
                href={`/business/${submittedResult.slug}`}
                className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 active:scale-[0.99] text-white text-xs sm:text-sm font-extrabold rounded-2xl transition-all shadow-md flex items-center justify-center gap-2"
              >
                <span>View Public Page</span>
                <ExternalLink className="w-4 h-4" />
              </Link>
            )}

            <Link
              href="/my-businesses"
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 active:scale-[0.99] text-white text-xs sm:text-sm font-extrabold rounded-2xl transition-all shadow-md flex items-center justify-center gap-2"
            >
              <span>Return to My Business Listings</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-brand-navy font-sans pb-16">
      <Header />
      <div className="max-w-4xl mx-auto p-4 sm:p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <Link
                href="/my-businesses"
                className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-brand-navy transition-colors font-medium"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-slate-400" />
                <span>Back to My Businesses</span>
              </Link>

              <span className="text-slate-300 text-xs font-light select-none">|</span>

              <span className="px-2.5 py-0.5 rounded bg-amber-50 text-amber-800 font-bold text-[10px] uppercase tracking-wide border border-amber-200">
                Edit Listing #{businessId}
              </span>
            </div>
            <h1 className="text-2xl font-black text-brand-navy mt-1 flex items-center gap-2">
              <Pencil className="w-6 h-6 text-brand-green" />
              Edit Business Listing
            </h1>
            <p className="text-xs text-slate-500">
              Update information, contact details, operating hours, and photo gallery for <strong>{name || "this business"}</strong>.
            </p>
          </div>

          <Link
            href="/my-businesses"
            className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-brand-navy font-semibold px-3 py-1.5 bg-slate-100 rounded-lg transition-colors"
          >
            <Home className="w-4 h-4" />
            My Listings
          </Link>
        </div>

        {/* Current Status Notification Banner */}
        {businessStatus === "rejected" && rejectionReason && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 space-y-1">
            <span className="font-bold flex items-center gap-1.5 text-rose-900 text-sm">
              <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
              Rejection Reason from Admin:
            </span>
            <p className="pl-5 leading-relaxed font-medium text-rose-700">{rejectionReason}</p>
            <p className="pl-5 text-[11px] text-slate-500 pt-1">
              You can update the fields below and submit your corrections.
            </p>
          </div>
        )}

        {/* Progress Stepper Bar */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          {/* Mobile Stepper Header (< sm) */}
          <div className="block sm:hidden space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-slate-800">
              <span className="flex items-center gap-1.5 text-brand-green">
                <span className="w-6 h-6 rounded-full bg-brand-green text-white flex items-center justify-center text-[10px] font-extrabold">
                  {currentStep}
                </span>
                <span>Step {currentStep} of 7: <strong className="text-slate-900">{STEPS_NAV[currentStep - 1]?.label}</strong></span>
              </span>
              <span className="text-slate-500 font-extrabold">{Math.round((currentStep / 7) * 100)}%</span>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200/60">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-600 transition-all duration-300 rounded-full"
                style={{ width: `${(currentStep / 7) * 100}%` }}
              />
            </div>

            {/* Scrollable Step Chips on Mobile */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 no-scrollbar" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
              {STEPS_NAV.map((step) => {
                const IconComp = step.icon;
                const isActive = currentStep === step.id;
                const isCompleted = currentStep > step.id;

                return (
                  <button
                    key={step.id}
                    type="button"
                    onClick={() => setCurrentStep(step.id)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold shrink-0 transition-all ${
                      isActive
                        ? "bg-brand-navy text-white shadow-xs"
                        : isCompleted
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-slate-100 text-slate-500 border border-slate-200/60"
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    ) : (
                      <IconComp className="w-3.5 h-3.5 shrink-0" />
                    )}
                    <span className="whitespace-nowrap">{step.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Desktop Stepper Bar (>= sm) */}
          <div className="hidden sm:flex items-center justify-between gap-3">
            {STEPS_NAV.map((step) => {
              const IconComp = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;

              return (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => setCurrentStep(step.id)}
                  className="flex flex-col items-center gap-1.5 flex-1 relative cursor-pointer"
                >
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                      isCompleted
                        ? "bg-brand-green text-white shadow-xs"
                        : isActive
                        ? "bg-brand-navy text-white ring-4 ring-brand-navy/10 shadow-xs"
                        : "bg-slate-100 text-slate-400 border border-slate-200"
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      <IconComp className="w-4 h-4" />
                    )}
                  </div>
                  <span
                    className={`text-[11px] font-bold text-center whitespace-nowrap tracking-tight ${
                      isActive
                        ? "text-brand-navy font-extrabold"
                        : isCompleted
                        ? "text-brand-green"
                        : "text-slate-400"
                    }`}
                  >
                    {step.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Error Alert */}
        {stepError && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{stepError}</span>
          </div>
        )}

        {submitError && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{submitError}</span>
          </div>
        )}

        {/* Step Container Card */}
        <div className="bg-brand-card p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          {/* STEP 1: Basic Info */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="border-b border-slate-200 pb-3">
                <h2 className="text-base font-bold text-brand-navy flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-brand-green" />
                  Step 1: Basic Business Information
                </h2>
                <p className="text-xs text-slate-500">
                  Update your official business name and main category.
                </p>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-brand-navy mb-1">
                    Business Name <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Cochin Digital Solutions"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-green text-xs font-medium"
                  />
                </div>

                <CustomSelect
                  label="Primary Category"
                  required
                  value={categoryId}
                  onChange={(val) => setCategoryId(val)}
                  placeholder="-- Select Category --"
                  icon={<FolderTree className="w-4 h-4" />}
                  options={categories.map((cat) => ({
                    value: String(cat.id),
                    label: cat.name,
                  }))}
                  searchable
                />
              </div>
            </div>
          )}

          {/* STEP 2: Description & Services */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="border-b border-slate-200 pb-3">
                <h2 className="text-base font-bold text-brand-navy flex items-center gap-2">
                  <FileText className="w-5 h-5 text-brand-green" />
                  Step 2: Description & Offered Services
                </h2>
                <p className="text-xs text-slate-500">
                  Update overview of your business and manage individual services or products.
                </p>
              </div>

              <div className="space-y-5 text-xs">
                <div>
                  <label className="block font-bold text-brand-navy mb-1">
                    Business Description
                  </label>
                  <textarea
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe your products, services, specialization, and unique selling points..."
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-green text-xs font-medium"
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block font-bold text-brand-navy">
                      Services / Products Offered
                    </label>
                    <button
                      type="button"
                      onClick={handleAddService}
                      className="px-3 py-1.5 bg-brand-green hover:bg-brand-green-hover text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Service Row
                    </button>
                  </div>

                  <div className="space-y-3">
                    {services.map((srv, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 bg-white border border-slate-200 rounded-xl space-y-3 relative group"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                            Service #{idx + 1}
                          </span>
                          {services.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveService(idx)}
                              className="text-rose-500 hover:text-rose-700 text-xs flex items-center gap-1 font-medium"
                            >
                              <Trash2 className="w-3.5 h-3.5" /> Remove
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div className="sm:col-span-2">
                            <input
                              type="text"
                              value={srv.serviceName}
                              onChange={(e) =>
                                handleServiceChange(idx, "serviceName", e.target.value)
                              }
                              placeholder="Service Name (e.g. Web Development)"
                              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                            />
                          </div>
                          <div>
                            <input
                              type="number"
                              step="0.01"
                              value={srv.price}
                              onChange={(e) =>
                                handleServiceChange(idx, "price", e.target.value)
                              }
                              placeholder="Price (₹ optional)"
                              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                            />
                          </div>
                        </div>

                        <div>
                          <input
                            type="text"
                            value={srv.description}
                            onChange={(e) =>
                              handleServiceChange(idx, "description", e.target.value)
                            }
                            placeholder="Short description of this service (optional)"
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-600"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Address & Location */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="border-b border-slate-200 pb-3">
                <h2 className="text-base font-bold text-brand-navy flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-brand-green" />
                  Step 3: Physical Address & Location
                </h2>
                <p className="text-xs text-slate-500">
                  Update location area and detailed address.
                </p>
              </div>

              <div className="space-y-4 text-xs">
                <CustomSelect
                  label="Location Area"
                  required
                  value={locationId}
                  onChange={(val) => setLocationId(val)}
                  placeholder="-- Select Location --"
                  icon={<MapPin className="w-4 h-4" />}
                  options={locations.map((loc) => ({
                    value: String(loc.id),
                    label: loc.name,
                  }))}
                  searchable
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-brand-navy mb-1">
                      Street Address / Building Name
                    </label>
                    <input
                      type="text"
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                      placeholder="e.g. 2nd Floor, Grand Tower, MG Road"
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-brand-navy mb-1">
                      Area / Suburb
                    </label>
                    <input
                      type="text"
                      value={area}
                      onChange={(e) => setArea(e.target.value)}
                      placeholder="e.g. Ernakulam South"
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-brand-navy mb-1">
                    Pincode
                  </label>
                  <input
                    type="text"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    placeholder="e.g. 682016"
                    className="w-full sm:w-1/2 px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-xs"
                  />
                </div>

                <div className="pt-4 border-t border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-brand-navy">
                      GPS Coordinates (Optional)
                    </span>
                    <span className="text-[11px] text-slate-400">Skippable</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-600 mb-1">Latitude</label>
                      <input
                        type="number"
                        step="any"
                        value={latitude}
                        onChange={(e) => setLatitude(e.target.value)}
                        placeholder="e.g. 9.9312"
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 mb-1">Longitude</label>
                      <input
                        type="number"
                        step="any"
                        value={longitude}
                        onChange={(e) => setLongitude(e.target.value)}
                        placeholder="e.g. 76.2673"
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Contact Info */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="border-b border-slate-200 pb-3">
                <h2 className="text-base font-bold text-brand-navy flex items-center gap-2">
                  <PhoneCall className="w-5 h-5 text-brand-green" />
                  Step 4: Contact Details & Online Links
                </h2>
                <p className="text-xs text-slate-500">
                  Update customer contact channels.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-brand-navy mb-1">
                    Phone Number
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-xs"
                    />
                    <PhoneCall className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-brand-navy mb-1">
                    WhatsApp Number
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-xs"
                    />
                    <MessageSquare className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-brand-navy mb-1">
                    Business Email
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="contact@business.com"
                      className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-xs"
                    />
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-brand-navy mb-1">
                    Website URL
                  </label>
                  <div className="relative">
                    <input
                      type="url"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      placeholder="https://www.yourbusiness.com"
                      className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-xs"
                    />
                    <Globe className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: Business Hours */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <div className="border-b border-slate-200 pb-3">
                <h2 className="text-base font-bold text-brand-navy flex items-center gap-2">
                  <Clock className="w-5 h-5 text-brand-green" />
                  Step 5: Business Operating Hours
                </h2>
                <p className="text-xs text-slate-500">
                  Update opening and closing times or toggle days closed.
                </p>
              </div>

              <div className="space-y-3 text-xs">
                {businessHours.map((h, idx) => (
                  <div
                    key={h.day}
                    className="p-3 bg-white border border-slate-200 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                  >
                    <div className="w-28 font-bold text-brand-navy text-xs flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-brand-green"></span>
                      {h.day}
                    </div>

                    <div className="flex items-center gap-3 flex-1">
                      <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                        <input
                          type="checkbox"
                          checked={h.closed}
                          onChange={(e) =>
                            handleHourChange(idx, "closed", e.target.checked)
                          }
                          className="rounded text-brand-green focus:ring-brand-green w-4 h-4"
                        />
                        <span className={h.closed ? "text-rose-600 font-bold" : "text-slate-600"}>
                          Closed
                        </span>
                      </label>

                      {!h.closed && (
                        <div className="flex items-center gap-2 text-xs">
                          <input
                            type="time"
                            value={h.openingTime}
                            onChange={(e) =>
                              handleHourChange(idx, "openingTime", e.target.value)
                            }
                            className="px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs"
                          />
                          <span className="text-slate-400">to</span>
                          <input
                            type="time"
                            value={h.closingTime}
                            onChange={(e) =>
                              handleHourChange(idx, "closingTime", e.target.value)
                            }
                            className="px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 6: Logo & Photos Upload */}
          {currentStep === 6 && (
            <div className="space-y-6">
              <div className="border-b border-slate-200 pb-3">
                <h2 className="text-base font-bold text-brand-navy flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-brand-green" />
                  Step 6: Logo & Gallery Photos
                </h2>
                <p className="text-xs text-slate-500">
                  Keep existing photos, upload new ones, remove photos, or replace the logo.
                </p>
              </div>

              <div className="space-y-6 text-xs">
                {/* Logo Section */}
                <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-3">
                  <label className="block font-bold text-brand-navy">
                    Business Logo
                  </label>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    {logoUrl ? (
                      <div className="relative group w-20 h-20 border border-slate-200 rounded-lg overflow-hidden shrink-0">
                        <img
                          src={logoUrl}
                          alt="Logo Preview"
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => setLogoUrl("")}
                          className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Remove Logo"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    ) : (
                      <div className="w-20 h-20 border-2 border-dashed border-slate-300 rounded-lg flex items-center justify-center text-slate-400 bg-slate-50 shrink-0">
                        <Building2 className="w-8 h-8" />
                      </div>
                    )}

                    <div className="w-full sm:w-auto">
                      <label className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-brand-green hover:bg-brand-green-hover text-white text-xs font-bold rounded-xl cursor-pointer transition-colors shadow-xs">
                        {uploadingLogo ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Uploading Logo...</span>
                          </>
                        ) : (
                          <>
                            <UploadCloud className="w-3.5 h-3.5" />
                            <span>{logoUrl ? "Replace Logo File" : "Choose Logo File"}</span>
                          </>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleLogoUpload}
                          disabled={uploadingLogo}
                          className="hidden"
                        />
                      </label>
                      <p className="text-[11px] text-slate-400 mt-1.5">
                        Recommended size: 400x400px (PNG, JPG, WEBP)
                      </p>
                    </div>
                  </div>
                </div>

                {/* Gallery Photos Section */}
                <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div>
                      <label className="block font-bold text-brand-navy">
                        Gallery Showcase Photos
                      </label>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        Upload up to 8 photos showcasing your storefront, products, or team ({photoUrls.length}/8 uploaded)
                      </p>
                    </div>

                    {photoUrls.length < 8 && (
                      <label className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer transition-colors shrink-0 border border-slate-200/80">
                        {uploadingPhoto ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Uploading...</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add New Photos</span>
                          </>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handlePhotoUpload}
                          disabled={uploadingPhoto}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {photoUrls.map((url, idx) => (
                      <div
                        key={idx}
                        className="relative group aspect-square border border-slate-200 rounded-lg overflow-hidden bg-slate-50"
                      >
                        <img
                          src={url}
                          alt={`Photo ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemovePhoto(idx)}
                          className="absolute inset-0 bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Remove photo"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    ))}

                    {photoUrls.length === 0 && (
                      <div className="col-span-full py-8 border-2 border-dashed border-slate-200 rounded-xl text-center text-slate-400 space-y-1">
                        <ImageIcon className="w-8 h-8 mx-auto text-slate-300" />
                        <p className="text-xs font-semibold">No gallery photos uploaded yet.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 7: Preview & Submit */}
          {currentStep === 7 && (
            <div className="space-y-6">
              <div className="border-b border-slate-200 pb-3">
                <h2 className="text-base font-bold text-brand-navy flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-brand-green" />
                  Step 7: Review & Save Changes
                </h2>
                <p className="text-xs text-slate-500">
                  Review all modified details carefully before saving updates.
                </p>
              </div>

              <div className="space-y-4 text-xs">
                {/* Basic & Location Card */}
                <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="font-bold text-brand-navy text-sm flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-brand-green" />
                      {name || "Untitled Business"}
                    </span>
                    <button
                      onClick={() => setCurrentStep(1)}
                      className="text-brand-blue hover:underline text-[11px] font-bold"
                    >
                      Edit Basic Info
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-600">
                    <div>
                      <span className="text-slate-400 block text-[11px]">Category:</span>
                      <span className="font-semibold text-brand-navy">
                        {selectedCategoryObj?.name || "None Selected"}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Location:</span>
                      <span className="font-semibold text-brand-navy">
                        {selectedLocationObj?.name || "None Selected"}
                      </span>
                    </div>
                    <div className="sm:col-span-2">
                      <span className="text-slate-400 block text-[11px]">Address:</span>
                      <span className="font-medium text-slate-800">
                        {[street, area, pincode].filter(Boolean).join(", ") || "No street address provided"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Description & Services */}
                <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="font-bold text-brand-navy flex items-center gap-2">
                      <FileText className="w-4 h-4 text-brand-green" />
                      Description & Services ({services.filter((s) => s.serviceName).length} services)
                    </span>
                    <button
                      onClick={() => setCurrentStep(2)}
                      className="text-brand-blue hover:underline text-[11px] font-bold"
                    >
                      Edit Services
                    </button>
                  </div>
                  <p className="text-slate-700 italic">
                    {description || "No description provided."}
                  </p>
                  {services.filter((s) => s.serviceName).length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {services
                        .filter((s) => s.serviceName)
                        .map((s, idx) => (
                          <span
                            key={idx}
                            className="px-2.5 py-1 bg-slate-100 border border-slate-200 rounded text-[11px] font-medium text-brand-navy"
                          >
                            {s.serviceName} {s.price ? `(₹${s.price})` : ""}
                          </span>
                        ))}
                    </div>
                  )}
                </div>

                {/* Contact Info */}
                <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="font-bold text-brand-navy flex items-center gap-2">
                      <PhoneCall className="w-4 h-4 text-brand-green" />
                      Contact Details
                    </span>
                    <button
                      onClick={() => setCurrentStep(4)}
                      className="text-brand-blue hover:underline text-[11px] font-bold"
                    >
                      Edit Contact
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-700">
                    <div>Phone: <strong className="text-brand-navy">{phone || "N/A"}</strong></div>
                    <div>WhatsApp: <strong className="text-brand-navy">{whatsapp || "N/A"}</strong></div>
                    <div>Email: <strong className="text-brand-navy">{email || "N/A"}</strong></div>
                    <div>Website: <strong className="text-brand-navy">{website || "N/A"}</strong></div>
                  </div>
                </div>

                {/* Media Preview */}
                <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="font-bold text-brand-navy flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-brand-green" />
                      Media Attachments (Logo + {photoUrls.length} photos)
                    </span>
                    <button
                      onClick={() => setCurrentStep(6)}
                      className="text-brand-blue hover:underline text-[11px] font-bold"
                    >
                      Edit Photos
                    </button>
                  </div>
                  <div className="flex items-center gap-3 overflow-x-auto py-1">
                    {logoUrl && (
                      <div className="text-center shrink-0">
                        <img
                          src={logoUrl}
                          alt="Logo"
                          className="w-14 h-14 object-cover rounded border border-brand-green"
                        />
                        <span className="text-[10px] text-brand-green font-bold block mt-0.5">Logo</span>
                      </div>
                    )}
                    {photoUrls.map((url, idx) => (
                      <img
                        key={idx}
                        src={url}
                        alt={`Photo ${idx + 1}`}
                        className="w-14 h-14 object-cover rounded border border-slate-200 shrink-0"
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Wizard Controls Footer */}
          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between pt-6 border-t border-slate-200 gap-3">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                className="w-full sm:w-auto px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 border border-slate-200/80 active:scale-[0.99]"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous Step</span>
              </button>
            ) : (
              <div className="hidden sm:block"></div>
            )}

            {currentStep < 7 ? (
              <button
                type="button"
                onClick={handleNext}
                className="w-full sm:w-auto px-7 py-2.5 bg-brand-green hover:bg-brand-green-hover text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-[0.99]"
              >
                <span>Next Step</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full sm:w-auto px-8 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 active:scale-[0.99]"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving Changes...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Save Changes & Update Listing</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
