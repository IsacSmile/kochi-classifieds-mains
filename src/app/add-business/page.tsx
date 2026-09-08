"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  Briefcase,
  Globe,
  Mail,
  MessageSquare,
  Home,
} from "lucide-react";

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

export default function AddBusinessPage() {
  const router = useRouter();
  const { data: session, update: updateSession } = useSession();

  // Wizard Step State
  const [currentStep, setCurrentStep] = useState(1);

  // Data Sources
  const [categories, setCategories] = useState<Category[]>([]);
  const [locations, setLocations] = useState<LocationItem[]>([]);
  const [loadingInitialData, setLoadingInitialData] = useState(true);

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
  } | null>(null);

  // Validation Error state for current step
  const [stepError, setStepError] = useState<string | null>(null);

  // Fetch Categories & Locations on mount
  useEffect(() => {
    async function fetchData() {
      try {
        const [catRes, locRes] = await Promise.all([
          fetch("/api/categories"),
          fetch("/api/locations"),
        ]);
        if (catRes.ok) {
          const catData = await catRes.json();
          setCategories(catData);
        }
        if (locRes.ok) {
          const locData = await locRes.json();
          setLocations(locData);
        }
      } catch (err) {
        console.error("Failed to load categories/locations:", err);
      } finally {
        setLoadingInitialData(false);
      }
    }
    fetchData();
  }, []);

  // Autofill user email if empty
  useEffect(() => {
    if (session?.user?.email && !email) {
      setEmail(session.user.email);
    }
  }, [session, email]);

  // Service Row Actions
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

  // Hours Change Actions
  const handleHourChange = (
    index: number,
    field: keyof DayHour,
    value: any
  ) => {
    const updated = [...businessHours];
    updated[index] = { ...updated[index], [field]: value };
    setBusinessHours(updated);
  };

  // Image Upload Handlers
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

  // Final Form Submission
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
      const res = await fetch("/api/businesses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || "Failed to submit business.");
      }

      // Refresh session in case user role upgraded to business_owner
      await updateSession();

      setSubmittedResult({
        businessId: data.businessId,
        name: data.name,
        status: data.status,
      });
      setCurrentStep(8); // Confirmation step
    } catch (err: any) {
      setSubmitError(err.message || "An unexpected error occurred.");
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

  if (submittedResult && currentStep === 8) {
    return (
      <div className="min-h-screen bg-white text-brand-navy p-6 sm:p-12 flex items-center justify-center">
        <div className="max-w-xl w-full bg-brand-card border border-slate-200 rounded-2xl p-8 sm:p-10 shadow-sm text-center space-y-6">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              Status: Pending Review
            </span>
            <h1 className="text-2xl font-bold text-brand-navy">
              Business Submission Successful!
            </h1>
            <p className="text-xs text-slate-600">
              Thank you for listing <strong className="text-brand-navy">{submittedResult.name}</strong> on KochiClassifieds.in.
            </p>
          </div>

          <div className="p-4 bg-white rounded-xl border border-slate-200 text-left text-xs space-y-2">
            <div className="flex justify-between border-b border-slate-100 pb-2">
              <span className="text-slate-500">Listing ID:</span>
              <span className="font-mono font-bold text-brand-navy">#{submittedResult.businessId}</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 pb-2">
              <span className="text-slate-500">Business Name:</span>
              <span className="font-bold text-brand-navy">{submittedResult.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Account Status:</span>
              <span className="font-bold text-brand-green flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Upgraded to Business Owner
              </span>
            </div>
          </div>

          <p className="text-xs text-slate-500">
            Our admin team will review your business information shortly. Once approved, your listing will be published publicly across Kochi directories.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href="/dashboard"
              className="w-full sm:w-auto px-6 py-2.5 bg-brand-green hover:bg-brand-green-hover text-white text-xs font-bold rounded-lg transition-colors shadow-sm text-center"
            >
              Go to Owner Dashboard
            </Link>
            <button
              onClick={() => {
                setSubmittedResult(null);
                setCurrentStep(1);
                setName("");
                setCategoryId("");
                setDescription("");
                setServices([{ serviceName: "", description: "", price: "" }]);
                setStreet("");
                setArea("");
                setPincode("");
                setLocationId("");
                setLatitude("");
                setLongitude("");
                setPhone("");
                setWhatsapp("");
                setWebsite("");
                setLogoUrl("");
                setPhotoUrls([]);
              }}
              className="w-full sm:w-auto px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors text-center"
            >
              Add Another Business
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-brand-navy p-4 sm:p-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded bg-brand-green-light text-brand-green font-bold text-[10px] uppercase tracking-wide border border-brand-green/20">
                Business Directory Portal
              </span>
            </div>
            <h1 className="text-2xl font-black text-brand-navy mt-1">
              Add Your Business
            </h1>
            <p className="text-xs text-slate-500">
              Complete the 7-step form to list your local business on KochiClassifieds.in
            </p>
          </div>

          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-brand-navy font-semibold px-3 py-1.5 bg-slate-100 rounded-lg transition-colors"
          >
            <Home className="w-4 h-4" />
            Home
          </Link>
        </div>

        {/* Progress Stepper Bar */}
        <div className="bg-brand-card p-4 rounded-xl border border-slate-200 shadow-sm overflow-x-auto">
          <div className="flex items-center justify-between min-w-[640px]">
            {STEPS_NAV.map((step) => {
              const IconComp = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;

              return (
                <button
                  key={step.id}
                  onClick={() => {
                    if (step.id < currentStep) setCurrentStep(step.id);
                  }}
                  disabled={step.id > currentStep}
                  className={`flex flex-col items-center gap-1.5 flex-1 relative ${
                    step.id < currentStep ? "cursor-pointer" : "cursor-default"
                  }`}
                >
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                      isCompleted
                        ? "bg-brand-green text-white"
                        : isActive
                        ? "bg-brand-navy text-white ring-4 ring-brand-navy/10"
                        : "bg-white text-slate-400 border border-slate-300"
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      <IconComp className="w-4 h-4" />
                    )}
                  </div>
                  <span
                    className={`text-[11px] font-semibold text-center whitespace-nowrap ${
                      isActive
                        ? "text-brand-navy font-bold"
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
                  Enter your official business name and select its main category.
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

                <div>
                  <label className="block font-bold text-brand-navy mb-1">
                    Primary Category <span className="text-rose-600">*</span>
                  </label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-green text-xs font-medium"
                  >
                    <option value="">-- Select Category --</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
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
                  Provide a detailed overview of your business and list individual services or offerings.
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
                  Select your area location in Kochi and enter your detailed street address.
                </p>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-brand-navy mb-1">
                    Location Area <span className="text-rose-600">*</span>
                  </label>
                  <select
                    value={locationId}
                    onChange={(e) => setLocationId(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-green text-xs font-medium"
                  >
                    <option value="">-- Select Location --</option>
                    {locations.map((loc) => (
                      <option key={loc.id} value={loc.id}>
                        {loc.name}
                      </option>
                    ))}
                  </select>
                </div>

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
                  How customers can get in touch with your business directly.
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
                  Set day-by-day opening and closing times or toggle days as Closed.
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
                  Upload your business logo and up to 8 showcase photos (hosted via Cloudinary).
                </p>
              </div>

              <div className="space-y-6 text-xs">
                {/* Logo Section */}
                <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-3">
                  <label className="block font-bold text-brand-navy">
                    Business Logo
                  </label>
                  <div className="flex items-center gap-4">
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
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    ) : (
                      <div className="w-20 h-20 border-2 border-dashed border-slate-300 rounded-lg flex items-center justify-center text-slate-400 bg-slate-50 shrink-0">
                        <Building2 className="w-8 h-8" />
                      </div>
                    )}

                    <div>
                      <label className="inline-flex items-center gap-2 px-4 py-2 bg-brand-green hover:bg-brand-green-hover text-white text-xs font-bold rounded-lg cursor-pointer transition-colors shadow-sm">
                        {uploadingLogo ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            Uploading Logo...
                          </>
                        ) : (
                          <>
                            <UploadCloud className="w-3.5 h-3.5" />
                            Choose Logo File
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
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="block font-bold text-brand-navy">
                        Gallery Showcase Photos
                      </label>
                      <p className="text-[11px] text-slate-400">
                        Upload up to 8 photos showcasing your storefront, products, or team ({photoUrls.length}/8 uploaded)
                      </p>
                    </div>

                    {photoUrls.length < 8 && (
                      <label className="inline-flex items-center gap-2 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg cursor-pointer transition-colors">
                        {uploadingPhoto ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Plus className="w-3.5 h-3.5" />
                            Add Photos
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
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    ))}

                    {photoUrls.length === 0 && (
                      <div className="col-span-full py-8 border-2 border-dashed border-slate-200 rounded-xl text-center text-slate-400 space-y-1">
                        <ImageIcon className="w-8 h-8 mx-auto text-slate-300" />
                        <p className="text-xs font-semibold">No photos uploaded yet.</p>
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
                  Step 7: Review Your Business Listing
                </h2>
                <p className="text-xs text-slate-500">
                  Please review all entered details carefully before submitting for administrative approval.
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
          <div className="flex items-center justify-between pt-6 border-t border-slate-200">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous Step
              </button>
            ) : (
              <div></div>
            )}

            {currentStep < 7 ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-6 py-2.5 bg-brand-green hover:bg-brand-green-hover text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
              >
                Next Step
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="px-8 py-2.5 bg-brand-green hover:bg-brand-green-hover text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-2 shadow-sm"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Submitting Business Listing...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    Submit Business for Approval
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
