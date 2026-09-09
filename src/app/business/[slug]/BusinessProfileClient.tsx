"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Building2,
  FolderTree,
  MapPin,
  ShieldCheck,
  Star,
  Phone,
  MessageSquare,
  Globe,
  Navigation,
  FileText,
  Clock,
  ImageIcon,
  ChevronLeft,
  ChevronRight,
  X,
  Share2,
  Check,
  Mail,
  ExternalLink,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import Header from "@/components/Header";

export interface BusinessPhoto {
  id: number;
  imageUrl: string;
  altText: string | null;
  sortOrder: number;
}

export interface BusinessService {
  id: number;
  serviceName: string;
  description: string | null;
  price: any;
}

export interface BusinessHour {
  id: number;
  day: string;
  openingTime: string | null;
  closingTime: string | null;
  closed: boolean;
}

export interface RelatedBusiness {
  id: number;
  name: string;
  slug: string;
  category: { name: string; slug: string };
  location: { name: string; slug: string };
  businessPhotos: { imageUrl: string; altText: string | null }[];
  verified: boolean;
  featured: boolean;
}

export interface BusinessProfileData {
  id: number;
  name: string;
  slug: string;
  status: string;
  description: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  website: string | null;
  verified: boolean;
  featured: boolean;
  createdAt: Date | string;
  category: { id: number; name: string; slug: string };
  location: { id: number; name: string; slug: string };
  owner: { id: number; name: string; email: string; phone: string | null };
  businessPhotos: BusinessPhoto[];
  businessServices: BusinessService[];
  businessHours: BusinessHour[];
}

interface BusinessProfileClientProps {
  business: BusinessProfileData;
  relatedBusinesses: RelatedBusiness[];
}

export default function BusinessProfileClient({
  business,
  relatedBusinesses,
}: BusinessProfileClientProps) {
  // Lightbox State
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Share Notification state
  const [copied, setCopied] = useState(false);

  // Determine current day of week (e.g., "Monday", "Tuesday"...)
  const [currentDayName, setCurrentDayName] = useState<string>("");

  useEffect(() => {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const today = days[new Date().getDay()];
    setCurrentDayName(today);
  }, []);

  // WhatsApp Link formatting
  const rawWa = business.whatsapp || business.phone || "";
  const cleanWa = rawWa.replace(/\D/g, "");
  const formattedWa = cleanWa.length === 10 ? `91${cleanWa}` : cleanWa;
  const whatsappUrl = formattedWa
    ? `https://wa.me/${formattedWa}?text=${encodeURIComponent(`Hi ${business.name}, I found your listing on KochiClassifieds.in`)}`
    : null;

  // Google Maps Directions link
  const directionsUrl =
    business.latitude && business.longitude
      ? `https://www.google.com/maps/search/?api=1&query=${business.latitude},${business.longitude}`
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
          business.address
            ? `${business.address}, ${business.location.name}, Kochi`
            : `${business.name}, ${business.location.name}, Kochi`
        )}`;

  // Google Maps Embedded iframe location query
  const mapEmbedQuery =
    business.latitude && business.longitude
      ? `${business.latitude},${business.longitude}`
      : business.address
      ? `${business.address}, ${business.location.name}, Kochi`
      : `${business.name}, ${business.location.name}, Kochi`;

  // Cover photo (1st photo or default image)
  const coverPhoto = business.businessPhotos?.[0]?.imageUrl || null;

  // Lightbox handlers
  const openLightbox = (index: number) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);
  const prevLightbox = () => {
    if (lightboxIndex === null || !business.businessPhotos.length) return;
    setLightboxIndex((prev) => (prev! === 0 ? business.businessPhotos.length - 1 : prev! - 1));
  };
  const nextLightbox = () => {
    if (lightboxIndex === null || !business.businessPhotos.length) return;
    setLightboxIndex((prev) => (prev! === business.businessPhotos.length - 1 ? 0 : prev! + 1));
  };

  // Keyboard navigation for Lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (lightboxIndex === null) return;
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") prevLightbox();
      if (e.key === "ArrowRight") nextLightbox();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxIndex]);

  // Share Listing link
  const handleShare = async () => {
    const shareUrl = typeof window !== "undefined" ? window.location.href : "";
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${business.name} - KochiClassifieds`,
          text: `Check out ${business.name} in ${business.location.name} on KochiClassifieds.in`,
          url: shareUrl,
        });
      } catch (err) {
        // Fallback to copy link
        copyToClipboard(shareUrl);
      }
    } else {
      copyToClipboard(shareUrl);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  // Today's Operating Hour Status
  const todayHour = business.businessHours?.find(
    (h) => h.day.toLowerCase() === currentDayName.toLowerCase()
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-16">
      {/* Main Header */}
      <Header />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 space-y-8">
        {/* Cover Banner & Profile Header */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Cover Hero Banner Image */}
          <div className="relative h-48 sm:h-64 bg-gradient-to-r from-brand-navy via-brand-blue to-slate-800 overflow-hidden">
            {coverPhoto ? (
              <img
                src={coverPhoto}
                alt={business.name}
                className="w-full h-full object-cover opacity-40 blur-sm scale-105"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-r from-brand-navy via-brand-blue to-slate-900 opacity-90" />
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />

            {/* Badges Overlay */}
            <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
              {business.featured && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-500/90 backdrop-blur-md text-white font-bold text-xs shadow-md border border-amber-300/40">
                  <Star className="w-3.5 h-3.5 fill-white" />
                  Featured Business
                </span>
              )}
              {business.verified && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-600/90 backdrop-blur-md text-white font-bold text-xs shadow-md border border-emerald-300/40">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Verified
                </span>
              )}
            </div>
          </div>

          {/* Profile Header Details */}
          <div className="p-6 sm:p-8 relative">
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-6 -mt-20 sm:-mt-24 mb-6">
              {/* Logo / Thumbnail Avatar Box */}
              <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-2xl bg-white p-2 shadow-xl border border-slate-200 shrink-0 relative z-10 overflow-hidden">
                {coverPhoto ? (
                  <img
                    src={coverPhoto}
                    alt={business.name}
                    className="w-full h-full object-cover rounded-xl"
                  />
                ) : (
                  <div className="w-full h-full rounded-xl bg-brand-green-light text-brand-green flex items-center justify-center font-bold text-3xl">
                    <Building2 className="w-12 h-12 text-brand-green" />
                  </div>
                )}
              </div>

              {/* Title & Metadata */}
              <div className="space-y-2 flex-1">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-brand-green-light text-brand-green font-bold text-xs border border-brand-green/20">
                      <FolderTree className="w-3.5 h-3.5" />
                      {business.category?.name || "Category"}
                    </span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-brand-blue-light text-brand-blue font-bold text-xs border border-brand-blue/20">
                      <MapPin className="w-3.5 h-3.5" />
                      {business.location?.name || "Kochi"}
                    </span>
                  </div>

                  {/* Share Profile Button */}
                  <button
                    onClick={handleShare}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors border border-slate-200/80 shadow-2xs"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5 text-slate-600" />}
                    <span>{copied ? "Link Copied!" : "Share Profile"}</span>
                  </button>
                </div>

                <h1 className="text-2xl sm:text-4xl font-extrabold text-brand-navy tracking-tight leading-tight">
                  {business.name}
                </h1>

                {todayHour && (
                  <div className="flex items-center gap-2 text-xs font-semibold">
                    <Clock className="w-4 h-4 text-slate-400" />
                    {todayHour.closed ? (
                      <span className="text-rose-600 font-bold">Closed Today ({currentDayName})</span>
                    ) : (
                      <span className="text-emerald-700 font-bold flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        Open Today ({todayHour.openingTime} - {todayHour.closingTime})
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons Row */}
            <div className="pt-4 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* Call Action */}
              {business.phone ? (
                <a
                  href={`tel:${business.phone}`}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-brand-green hover:bg-brand-green-hover text-white font-bold rounded-xl text-xs shadow-sm transition-all"
                >
                  <Phone className="w-4 h-4" />
                  Call Business
                </a>
              ) : (
                <button
                  disabled
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-100 text-slate-400 font-bold rounded-xl text-xs cursor-not-allowed"
                >
                  <Phone className="w-4 h-4" />
                  No Phone
                </button>
              )}

              {/* WhatsApp Action */}
              {whatsappUrl ? (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold rounded-xl text-xs shadow-sm transition-all"
                >
                  <svg className="w-4 h-4 fill-white shrink-0" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.572-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c-.001 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  WhatsApp
                </a>
              ) : (
                <button
                  disabled
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-100 text-slate-400 font-bold rounded-xl text-xs cursor-not-allowed"
                >
                  <svg className="w-4 h-4 fill-slate-400 shrink-0" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.572-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c-.001 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  No WhatsApp
                </button>
              )}

              {/* Website Action */}
              {business.website ? (
                <a
                  href={business.website.startsWith("http") ? business.website : `https://${business.website}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-brand-blue hover:bg-brand-blue-hover text-white font-bold rounded-xl text-xs shadow-sm transition-all"
                >
                  <Globe className="w-4 h-4" />
                  Visit Website
                </a>
              ) : (
                <button
                  disabled
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-100 text-slate-400 font-bold rounded-xl text-xs cursor-not-allowed"
                >
                  <Globe className="w-4 h-4" />
                  No Website
                </button>
              )}

              {/* Directions Action */}
              <a
                href={directionsUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs shadow-sm transition-all"
              >
                <Navigation className="w-4 h-4 text-emerald-400" />
                Get Directions
              </a>
            </div>
          </div>
        </div>

        {/* Content Layout Grid: Left Details & Right Side Info */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Main Content (2 Columns) */}
          <div className="lg:col-span-2 space-y-8">
            {/* About Section */}
            <section className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h2 className="text-lg font-bold text-brand-navy flex items-center gap-2 border-b border-slate-100 pb-3">
                <FileText className="w-5 h-5 text-brand-green" />
                About {business.name}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                {business.description || "No description provided for this business listing."}
              </p>
            </section>

            {/* Services / Products Section */}
            {business.businessServices && business.businessServices.length > 0 && (
              <section className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <h2 className="text-lg font-bold text-brand-navy flex items-center gap-2 border-b border-slate-100 pb-3">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                  Services & Products Offered ({business.businessServices.length})
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {business.businessServices.map((service) => (
                    <div
                      key={service.id}
                      className="p-4 rounded-xl bg-slate-50 border border-slate-200 hover:border-brand-green/40 transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h3 className="font-bold text-brand-navy text-xs sm:text-sm">
                            {service.serviceName}
                          </h3>
                          {service.price && (
                            <span className="font-mono font-bold text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 shrink-0">
                              ₹{String(service.price)}
                            </span>
                          )}
                        </div>
                        {service.description && (
                          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                            {service.description}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Photo Gallery Section */}
            {business.businessPhotos && business.businessPhotos.length > 0 && (
              <section className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <h2 className="text-lg font-bold text-brand-navy flex items-center gap-2 border-b border-slate-100 pb-3">
                  <ImageIcon className="w-5 h-5 text-brand-blue" />
                  Photo Gallery ({business.businessPhotos.length})
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {business.businessPhotos.map((photo, idx) => (
                    <button
                      key={photo.id}
                      onClick={() => openLightbox(idx)}
                      className="group relative h-36 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 text-left focus:outline-none focus:ring-2 focus:ring-brand-blue"
                    >
                      <img
                        src={photo.imageUrl}
                        alt={photo.altText || business.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-slate-900/20 group-hover:bg-slate-900/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <span className="px-2.5 py-1 rounded bg-white/90 text-slate-900 text-[11px] font-bold shadow">
                          View Photo
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Right Sidebar (1 Column) */}
          <div className="space-y-8">
            {/* Business Hours Table */}
            {business.businessHours && business.businessHours.length > 0 && (
              <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <h2 className="text-base font-bold text-brand-navy flex items-center gap-2 border-b border-slate-100 pb-3">
                  <Clock className="w-5 h-5 text-slate-500" />
                  Business Hours
                </h2>
                <div className="space-y-2 text-xs">
                  {business.businessHours.map((hour) => {
                    const isToday = hour.day.toLowerCase() === currentDayName.toLowerCase();
                    return (
                      <div
                        key={hour.id}
                        className={`flex items-center justify-between p-2.5 rounded-lg border transition-colors ${
                          isToday
                            ? "bg-brand-green-light border-brand-green/40 font-bold text-brand-navy shadow-xs"
                            : "bg-slate-50 border-slate-100 text-slate-700"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span>{hour.day}</span>
                          {isToday && (
                            <span className="text-[10px] bg-brand-green text-white px-1.5 py-0.2 rounded font-bold uppercase">
                              Today
                            </span>
                          )}
                        </div>
                        {hour.closed ? (
                          <span className="text-rose-600 font-bold">Closed</span>
                        ) : (
                          <span className="font-mono text-slate-600">
                            {hour.openingTime} - {hour.closingTime}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Contact & Embedded Map */}
            <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h2 className="text-base font-bold text-brand-navy flex items-center gap-2 border-b border-slate-100 pb-3">
                <MapPin className="w-5 h-5 text-brand-green" />
                Contact & Location
              </h2>

              <div className="space-y-3 text-xs">
                {business.address && (
                  <div>
                    <span className="text-slate-400 font-bold uppercase text-[10px] block mb-0.5">Address</span>
                    <p className="text-slate-700 font-medium leading-relaxed">{business.address}</p>
                  </div>
                )}

                {business.phone && (
                  <div>
                    <span className="text-slate-400 font-bold uppercase text-[10px] block mb-0.5">Phone</span>
                    <a href={`tel:${business.phone}`} className="text-brand-blue font-semibold hover:underline">
                      {business.phone}
                    </a>
                  </div>
                )}

                {business.email && (
                  <div>
                    <span className="text-slate-400 font-bold uppercase text-[10px] block mb-0.5">Email</span>
                    <a href={`mailto:${business.email}`} className="text-brand-blue font-semibold hover:underline">
                      {business.email}
                    </a>
                  </div>
                )}
              </div>

              {/* Embedded Google Maps iframe (if lat/long or address is available) */}
              {(business.latitude !== null && business.longitude !== null || business.address) ? (
                <>
                  <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-100 h-64 relative shadow-inner">
                    <iframe
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      loading="lazy"
                      allowFullScreen
                      src={`https://maps.google.com/maps?q=${encodeURIComponent(mapEmbedQuery)}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                    />
                  </div>

                  <a
                    href={directionsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-brand-blue-light hover:text-brand-blue text-slate-700 font-semibold rounded-xl text-xs transition-colors"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    Open Map in Google Maps
                  </a>
                </>
              ) : (
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-slate-500 text-xs text-center">
                  Map coordinates not specified. Address: {business.address || "Kochi, Kerala"}
                </div>
              )}
            </section>

            {/* Social & Direct Contact Links Section */}
            <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h2 className="text-base font-bold text-brand-navy flex items-center gap-2 border-b border-slate-100 pb-3">
                <Globe className="w-5 h-5 text-brand-blue" />
                Social & Direct Connect
              </h2>

              <div className="flex flex-wrap gap-2 text-xs">
                {business.website && (
                  <a
                    href={business.website.startsWith("http") ? business.website : `https://${business.website}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-brand-blue-light hover:text-brand-blue font-semibold text-slate-700 rounded-lg transition-colors"
                  >
                    <Globe className="w-4 h-4 text-brand-blue" />
                    Official Website
                  </a>
                )}

                {whatsappUrl && (
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold rounded-lg transition-colors"
                  >
                    <MessageSquare className="w-4 h-4 fill-emerald-600 text-emerald-600" />
                    WhatsApp Chat
                  </a>
                )}

                {business.email && (
                  <a
                    href={`mailto:${business.email}`}
                    className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg transition-colors"
                  >
                    <Mail className="w-4 h-4 text-slate-500" />
                    Email Contact
                  </a>
                )}

                <button
                  onClick={handleShare}
                  className="inline-flex items-center gap-1.5 px-3 py-2 bg-brand-navy hover:bg-brand-navy/90 text-white font-semibold rounded-lg transition-colors"
                >
                  <Share2 className="w-4 h-4 text-emerald-400" />
                  {copied ? "Link Copied!" : "Share Profile"}
                </button>
              </div>
            </section>
          </div>
        </div>

        {/* Related Businesses Section */}
        {relatedBusinesses && relatedBusinesses.length > 0 && (
          <section className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-lg font-bold text-brand-navy flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-brand-green" />
                  Related Businesses in {business.category?.name}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Discover other top-rated listings in the same category
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {relatedBusinesses.map((rel) => {
                const relPhoto = rel.businessPhotos?.[0]?.imageUrl || null;
                return (
                  <Link
                    key={rel.id}
                    href={`/business/${rel.slug}`}
                    className="group bg-slate-50 hover:bg-white rounded-xl border border-slate-200 hover:border-brand-green hover:shadow-md transition-all overflow-hidden flex flex-col justify-between"
                  >
                    <div className="h-32 bg-slate-200 relative overflow-hidden">
                      {relPhoto ? (
                        <img
                          src={relPhoto}
                          alt={rel.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full bg-brand-green-light text-brand-green flex items-center justify-center font-bold text-xl">
                          <Building2 className="w-8 h-8 text-brand-green" />
                        </div>
                      )}
                      {rel.verified && (
                        <span className="absolute top-2 right-2 bg-emerald-600 text-white p-1 rounded-full shadow">
                          <ShieldCheck className="w-3.5 h-3.5" />
                        </span>
                      )}
                    </div>

                    <div className="p-4 space-y-2 flex-1 flex flex-col justify-between text-xs">
                      <div>
                        <div className="text-[10px] font-bold text-brand-green uppercase tracking-wider mb-1">
                          {rel.category?.name}
                        </div>
                        <h3 className="font-bold text-brand-navy text-sm group-hover:text-brand-green transition-colors line-clamp-1">
                          {rel.name}
                        </h3>
                        <div className="flex items-center gap-1 text-slate-500 mt-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{rel.location?.name}</span>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-200 flex items-center justify-end text-brand-blue font-bold text-[11px] group-hover:translate-x-1 transition-transform">
                        View Details <ArrowRight className="w-3 h-3 ml-1" />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}
      </main>

      {/* Lightbox Modal */}
      {lightboxIndex !== null && business.businessPhotos[lightboxIndex] && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 p-2 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-colors z-50"
            title="Close Lightbox (Esc)"
          >
            <X className="w-6 h-6" />
          </button>

          <button
            onClick={prevLightbox}
            className="absolute left-4 p-3 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-colors z-50"
            title="Previous Photo"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <button
            onClick={nextLightbox}
            className="absolute right-4 p-3 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-colors z-50"
            title="Next Photo"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          <div className="max-w-4xl max-h-[85vh] flex flex-col items-center justify-center">
            <img
              src={business.businessPhotos[lightboxIndex].imageUrl}
              alt={business.businessPhotos[lightboxIndex].altText || business.name}
              className="max-w-full max-h-[75vh] object-contain rounded-lg shadow-2xl"
            />
            <div className="mt-4 text-white text-xs font-semibold flex items-center gap-3 bg-white/10 px-4 py-1.5 rounded-full border border-white/10">
              <span>
                Photo {lightboxIndex + 1} of {business.businessPhotos.length}
              </span>
              {business.businessPhotos[lightboxIndex].altText && (
                <span>• {business.businessPhotos[lightboxIndex].altText}</span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
