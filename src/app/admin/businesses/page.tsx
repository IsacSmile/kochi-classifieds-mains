"use client";

import { useState, useEffect } from "react";
import {
  Building2,
  FolderTree,
  MapPin,
  Star,
  Edit2,
  Filter,
  Search,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  Mail,
  Phone,
  Globe,
  Navigation,
  FileText,
} from "lucide-react";

interface Category {
  id: number;
  name: string;
}

interface LocationItem {
  id: number;
  name: string;
}

interface BusinessItem {
  id: number;
  name: string;
  slug: string;
  status: "pending" | "approved" | "rejected";
  rejectionReason: string | null;
  featured: boolean;
  showcaseOrder: number | null;
  verified: boolean;
  categoryId: number;
  locationId: number;
  description: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  website: string | null;
  createdAt: string;
  category: Category;
  location: LocationItem;
  owner: { id: number; name: string; email: string };
}

export default function AdminAllBusinessesPage() {
  const [businesses, setBusinesses] = useState<BusinessItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [locations, setLocations] = useState<LocationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters State
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Edit Modal State
  const [editingBusiness, setEditingBusiness] = useState<BusinessItem | null>(null);
  const [editFormData, setEditFormData] = useState({
    name: "",
    status: "approved",
    rejectionReason: "",
    featured: false,
    showcaseOrder: "",
    verified: false,
    categoryId: "",
    locationId: "",
    phone: "",
    email: "",
    website: "",
    address: "",
    description: "",
  });
  const [saving, setSaving] = useState(false);

  // Fetch initial filters (Categories & Locations)
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [catRes, locRes] = await Promise.all([
          fetch("/api/admin/categories"),
          fetch("/api/admin/locations"),
        ]);
        if (catRes.ok) setCategories(await catRes.json());
        if (locRes.ok) setLocations(await locRes.json());
      } catch (err) {
        console.error("Failed to load categories/locations metadata:", err);
      }
    };
    fetchMetadata();
  }, []);

  // Fetch businesses list based on filters
  const fetchBusinesses = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (selectedStatus !== "all") params.append("status", selectedStatus);
      if (selectedCategory !== "all") params.append("categoryId", selectedCategory);
      if (selectedLocation !== "all") params.append("locationId", selectedLocation);
      if (searchQuery.trim()) params.append("search", searchQuery.trim());

      const res = await fetch(`/api/admin/businesses?${params.toString()}`);
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setBusinesses(data);
    } catch (err: any) {
      setError(err.message || "Failed to load businesses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBusinesses();
  }, [selectedStatus, selectedCategory, selectedLocation]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchBusinesses();
  };

  // Update Showcase Order
  const handleUpdateShowcaseOrder = async (b: BusinessItem, orderVal: string) => {
    const parsed = orderVal.trim() === "" ? null : parseInt(orderVal, 10);
    const validParsed = parsed !== null && !isNaN(parsed) ? parsed : null;

    setBusinesses((prev) =>
      prev.map((item) => (item.id === b.id ? { ...item, showcaseOrder: validParsed } : item))
    );

    try {
      const res = await fetch(`/api/admin/businesses/${b.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ showcaseOrder: validParsed }),
      });

      if (!res.ok) {
        throw new Error("Failed to update showcase order");
      }
    } catch (err: any) {
      setError(err.message);
      fetchBusinesses();
    }
  };

  // Toggle Featured status instantaneously
  const handleToggleFeatured = async (b: BusinessItem) => {
    const newFeaturedState = !b.featured;
    setBusinesses((prev) =>
      prev.map((item) => (item.id === b.id ? { ...item, featured: newFeaturedState } : item))
    );

    try {
      const res = await fetch(`/api/admin/businesses/${b.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ featured: newFeaturedState }),
      });

      if (!res.ok) {
        // Revert if failed
        setBusinesses((prev) =>
          prev.map((item) => (item.id === b.id ? { ...item, featured: b.featured } : item))
        );
        throw new Error("Failed to update featured status");
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Open Edit Modal
  const openEditModal = (b: BusinessItem) => {
    setEditingBusiness(b);
    setEditFormData({
      name: b.name,
      status: b.status,
      rejectionReason: b.rejectionReason || "",
      featured: b.featured,
      showcaseOrder: b.showcaseOrder !== null && b.showcaseOrder !== undefined ? String(b.showcaseOrder) : "",
      verified: b.verified,
      categoryId: String(b.categoryId),
      locationId: String(b.locationId),
      phone: b.phone || "",
      email: b.email || "",
      website: b.website || "",
      address: b.address || "",
      description: b.description || "",
    });
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBusiness) return;
    setSaving(true);
    setError(null);

    try {
      const parsedOrder = editFormData.showcaseOrder.trim() === "" ? null : parseInt(editFormData.showcaseOrder, 10);
      const payload = {
        name: editFormData.name,
        status: editFormData.status,
        rejectionReason: editFormData.status === "rejected" ? editFormData.rejectionReason : null,
        featured: editFormData.featured,
        showcaseOrder: editFormData.featured && parsedOrder !== null && !isNaN(parsedOrder) ? parsedOrder : null,
        verified: editFormData.verified,
        categoryId: Number(editFormData.categoryId),
        locationId: Number(editFormData.locationId),
        phone: editFormData.phone,
        email: editFormData.email,
        website: editFormData.website,
        address: editFormData.address,
        description: editFormData.description,
      };

      const res = await fetch(`/api/admin/businesses/${editingBusiness.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to update business");
      }

      setEditingBusiness(null);
      await fetchBusinesses();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 bg-white">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-brand-card p-5 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-brand-navy flex items-center gap-2">
            <Building2 className="w-5 h-5 text-brand-green" />
            All Directory Businesses
          </h2>
          <p className="text-xs text-slate-600 mt-1">
            Filter, search, edit details, manage rejection reasons, and toggle featured status for all listed local businesses.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchBusinesses}
            className="p-2 text-slate-600 hover:text-brand-navy bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-medium transition-colors"
            title="Refresh List"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="font-bold">✕</button>
        </div>
      )}

      {/* Filter Controls Bar */}
      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-brand-navy">
          <Filter className="w-4 h-4 text-brand-green" />
          Filter Businesses
        </div>

        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
          {/* Status Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-brand-green"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-brand-green"
            >
              <option value="all">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Location Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Location</label>
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-brand-green"
            >
              <option value="all">All Locations</option>
              {locations.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.name}
                </option>
              ))}
            </select>
          </div>

          {/* Search Query */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Search</label>
            <div className="flex items-center gap-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Name, email, phone..."
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-brand-green"
              />
              <button
                type="submit"
                className="px-3 py-2 bg-brand-green text-white font-semibold rounded-lg text-xs hover:bg-brand-green-hover transition-colors"
              >
                <Search className="w-4 h-4" />
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Businesses Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500 text-sm flex flex-col items-center gap-2">
            <RefreshCw className="w-6 h-6 animate-spin text-brand-green" />
            Loading directory businesses...
          </div>
        ) : businesses.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-sm">
            No businesses match the selected filters.
          </div>
        ) : (
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-brand-card text-brand-navy border-b border-slate-200 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Business Name</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Location</th>
                <th className="py-3.5 px-4">Owner Email</th>
                <th className="py-3.5 px-4 text-center">Featured</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {businesses.map((b) => (
                <tr key={b.id} className="hover:bg-brand-card transition-colors">
                  <td className="py-3.5 px-4 font-bold text-brand-navy">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-brand-green shrink-0" />
                      <div>
                        <p>{b.name}</p>
                        {b.rejectionReason && (
                          <p className="text-[10px] text-rose-600 font-normal italic truncate max-w-xs">
                            Reason: {b.rejectionReason}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    {b.status === "approved" ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-semibold">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Approved
                      </span>
                    ) : b.status === "rejected" ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-[11px] font-semibold">
                        <XCircle className="w-3 h-3 text-rose-600" /> Rejected
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[11px] font-semibold">
                        <Clock className="w-3 h-3 text-amber-600" /> Pending
                      </span>
                    )}
                  </td>

                  <td className="py-3.5 px-4 text-slate-700">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-brand-green-light text-brand-green font-semibold text-[11px]">
                      <FolderTree className="w-3 h-3" />
                      {b.category?.name || "Uncategorized"}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-slate-700">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-brand-blue-light text-brand-blue font-semibold text-[11px]">
                      <MapPin className="w-3 h-3" />
                      {b.location?.name || "Unspecified"}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-slate-600 font-mono text-[11px]">
                    {b.owner?.email || b.email || "N/A"}
                  </td>

                  <td className="py-3.5 px-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleToggleFeatured(b)}
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold transition-all ${
                          b.featured
                            ? "bg-amber-100 text-amber-800 border border-amber-300 shadow-sm"
                            : "bg-slate-100 text-slate-400 hover:text-slate-600 border border-slate-200"
                        }`}
                        title="Click to toggle featured status"
                      >
                        <Star className={`w-3.5 h-3.5 ${b.featured ? "fill-amber-500 text-amber-500" : ""}`} />
                        {b.featured ? "Featured" : "Standard"}
                      </button>

                      {b.featured && (
                        <div
                          className="flex items-center gap-1 bg-amber-50 border border-amber-300 rounded-lg px-2 py-0.5"
                          title="Showcase Order (1-4 for hero grid)"
                        >
                          <span className="text-[10px] font-bold text-amber-800 shrink-0">Order:</span>
                          <input
                            type="number"
                            min="1"
                            max="99"
                            value={b.showcaseOrder ?? ""}
                            onChange={(e) => handleUpdateShowcaseOrder(b, e.target.value)}
                            placeholder="#"
                            className="w-10 px-1 py-0.5 text-center text-xs font-bold bg-white border border-amber-300 rounded text-amber-900 focus:outline-none focus:ring-1 focus:ring-amber-500"
                          />
                        </div>
                      )}
                    </div>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => openEditModal(b)}
                      className="p-1.5 text-slate-600 hover:text-brand-blue hover:bg-brand-blue-light rounded transition-colors inline-flex items-center gap-1 text-xs font-medium"
                      title="Edit Business"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Edit Modal Form */}
      {editingBusiness && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-brand-card">
              <h3 className="text-base font-bold text-brand-navy flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-brand-green" />
                Edit Business: {editingBusiness.name}
              </h3>
              <button
                onClick={() => setEditingBusiness(null)}
                className="text-slate-400 hover:text-brand-navy font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-brand-navy mb-1">Business Name</label>
                  <input
                    type="text"
                    required
                    value={editFormData.name}
                    onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-green text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-brand-navy mb-1">Approval Status</label>
                  <select
                    value={editFormData.status}
                    onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-green text-xs"
                  >
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </div>

              {/* Rejection Reason field if status is rejected */}
              {editFormData.status === "rejected" && (
                <div>
                  <label className="block font-bold text-rose-700 mb-1">Rejection Reason</label>
                  <textarea
                    rows={3}
                    value={editFormData.rejectionReason}
                    onChange={(e) => setEditFormData({ ...editFormData, rejectionReason: e.target.value })}
                    placeholder="Specify the reason why this business was rejected..."
                    className="w-full px-3 py-2 border border-rose-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 text-xs bg-rose-50/50"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-brand-navy mb-1">Category</label>
                  <select
                    value={editFormData.categoryId}
                    onChange={(e) => setEditFormData({ ...editFormData, categoryId: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-green text-xs"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-brand-navy mb-1">Location</label>
                  <select
                    value={editFormData.locationId}
                    onChange={(e) => setEditFormData({ ...editFormData, locationId: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-green text-xs"
                  >
                    {locations.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-brand-navy mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={editFormData.phone}
                    onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-green text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-brand-navy mb-1">Email</label>
                  <input
                    type="email"
                    value={editFormData.email}
                    onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-green text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="edit-featured"
                    checked={editFormData.featured}
                    onChange={(e) => setEditFormData({ ...editFormData, featured: e.target.checked })}
                    className="w-4 h-4 text-brand-green rounded border-slate-300 focus:ring-brand-green"
                  />
                  <label htmlFor="edit-featured" className="font-bold text-brand-navy cursor-pointer">
                    Featured Listing
                  </label>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="edit-verified"
                    checked={editFormData.verified}
                    onChange={(e) => setEditFormData({ ...editFormData, verified: e.target.checked })}
                    className="w-4 h-4 text-brand-green rounded border-slate-300 focus:ring-brand-green"
                  />
                  <label htmlFor="edit-verified" className="font-bold text-brand-navy cursor-pointer">
                    Verified Badge
                  </label>
                </div>
              </div>

              {editFormData.featured && (
                <div>
                  <label className="block font-bold text-amber-800 mb-1">
                    Showcase Order (1-4 for hero showcase grid)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="99"
                    placeholder="e.g. 1 (Leave empty for default sorting)"
                    value={editFormData.showcaseOrder}
                    onChange={(e) => setEditFormData({ ...editFormData, showcaseOrder: e.target.value })}
                    className="w-full px-3 py-2 border border-amber-300 bg-amber-50/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs font-bold text-amber-900"
                  />
                </div>
              )}

              <div>
                <label className="block font-bold text-brand-navy mb-1">Address</label>
                <input
                  type="text"
                  value={editFormData.address}
                  onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-green text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-brand-navy mb-1">Description</label>
                <textarea
                  rows={3}
                  value={editFormData.description}
                  onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-green text-xs"
                />
              </div>

              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingBusiness(null)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-medium hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-brand-green hover:bg-brand-green-hover text-white font-semibold rounded-lg shadow-sm transition-colors disabled:opacity-50"
                >
                  {saving ? "Saving Changes..." : "Save Business"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
