"use client";

import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, GripVertical, CornerDownRight, FolderTree, RefreshCw, CheckCircle2, XCircle } from "lucide-react";
import { CategoryIcon } from "@/components/CategoryIcon";
import CustomAdminSelect from "@/components/CustomAdminSelect";

interface Category {
  id: number;
  parentId: number | null;
  name: string;
  slug: string;
  iconUrl: string | null;
  description: string | null;
  status: string;
  sortOrder: number;
  parent?: { id: number; name: string } | null;
  _count?: { children: number; businesses: number };
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Form Fields
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    parentId: "",
    iconUrl: "",
    description: "",
    status: "active",
    sortOrder: 0,
  });

  // Delete State
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Drag and Drop State
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const fetchCategories = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/categories");
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setCategories(data);
    } catch (err: any) {
      setError(err.message || "Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openCreateModal = (parentCatId?: number) => {
    setEditingCategory(null);
    setFormData({
      name: "",
      slug: "",
      parentId: parentCatId ? String(parentCatId) : "",
      iconUrl: "",
      description: "",
      status: "active",
      sortOrder: categories.length > 0 ? Math.max(...categories.map((c) => c.sortOrder)) + 1 : 1,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (cat: Category) => {
    setEditingCategory(cat);
    setFormData({
      name: cat.name,
      slug: cat.slug,
      parentId: cat.parentId ? String(cat.parentId) : "",
      iconUrl: cat.iconUrl || "",
      description: cat.description || "",
      status: cat.status,
      sortOrder: cat.sortOrder,
    });
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const payload = {
      name: formData.name,
      slug: formData.slug,
      parentId: formData.parentId ? Number(formData.parentId) : null,
      iconUrl: formData.iconUrl || null,
      description: formData.description || null,
      status: formData.status,
      sortOrder: Number(formData.sortOrder),
    };

    try {
      const url = editingCategory
        ? `/api/admin/categories/${editingCategory.id}`
        : "/api/admin/categories";
      const method = editingCategory ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to save category");
      }

      setIsModalOpen(false);
      await fetchCategories();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/categories/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to delete category");
      }
      setDeletingId(null);
      await fetchCategories();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // Drag and Drop Reordering Handlers
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const updatedList = [...flattenedCategories];
    const draggedItem = updatedList[draggedIndex];
    updatedList.splice(draggedIndex, 1);
    updatedList.splice(index, 0, draggedItem);

    setDraggedIndex(index);
    setFlattenedCategories(updatedList);
  };

  const handleDragEnd = async () => {
    setDraggedIndex(null);

    const reorderedItems = flattenedCategories.map((item, idx) => ({
      id: item.id,
      sortOrder: idx + 1,
    }));

    try {
      await fetch("/api/admin/categories/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: reorderedItems }),
      });
    } catch (err) {
      console.error("Failed to persist reordering:", err);
    }
  };

  const [flattenedCategories, setFlattenedCategories] = useState<(Category & { level: number })[]>([]);

  useEffect(() => {
    const tree: (Category & { level: number })[] = [];
    
    const parents = categories.filter((c) => !c.parentId);
    parents.forEach((parent) => {
      tree.push({ ...parent, level: 0 });
      const children = categories.filter((c) => c.parentId === parent.id);
      children.forEach((child) => {
        tree.push({ ...child, level: 1 });
      });
    });

    const inTreeIds = new Set(tree.map((t) => t.id));
    categories.forEach((c) => {
      if (!inTreeIds.has(c.id)) {
        tree.push({ ...c, level: 0 });
      }
    });

    setFlattenedCategories(tree);
  }, [categories]);

  return (
    <div className="space-y-6 bg-white">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-brand-card p-5 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-brand-navy flex items-center gap-2">
            <FolderTree className="w-5 h-5 text-brand-green" />
            Categories Management
          </h2>
          <p className="text-xs text-slate-600 mt-1">
            Create, edit, delete, reorder via drag & drop, and manage nested subcategories.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchCategories}
            className="p-2 text-slate-600 hover:text-brand-navy bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-medium transition-colors"
            title="Refresh List"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={() => openCreateModal()}
            className="flex items-center gap-1.5 px-4 py-2 bg-brand-green hover:bg-brand-green-hover text-white font-semibold text-xs rounded-lg shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Category
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="font-bold">✕</button>
        </div>
      )}

      {/* Table List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500 text-sm">Loading categories...</div>
        ) : flattenedCategories.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-sm">
            No categories found. Click "Add Category" to create your first category.
          </div>
        ) : (
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-brand-card text-brand-navy border-b border-slate-200 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4 w-10">Reorder</th>
                <th className="py-3 px-4">Category Name</th>
                <th className="py-3 px-4">Slug</th>
                <th className="py-3 px-4">Type / Parent</th>
                <th className="py-3 px-4">Sort Order</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {flattenedCategories.map((cat, index) => (
                <tr
                  key={cat.id}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragEnd={handleDragEnd}
                  className={`hover:bg-brand-card transition-colors ${
                    draggedIndex === index ? "bg-brand-green-light/50 opacity-60" : ""
                  }`}
                >
                  <td className="py-3 px-4 cursor-grab text-slate-400 hover:text-brand-navy">
                    <GripVertical className="w-4 h-4" />
                  </td>

                  <td className="py-3 px-4 font-bold text-brand-navy">
                    <div className="flex items-center gap-2" style={{ paddingLeft: `${cat.level * 24}px` }}>
                      {cat.level > 0 && <CornerDownRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />}
                      <span className="w-6 h-6 rounded bg-brand-green-light flex items-center justify-center shrink-0">
                        <CategoryIcon iconName={cat.iconUrl} categoryName={cat.name} className="w-3.5 h-3.5 text-brand-green" />
                      </span>
                      <span>{cat.name}</span>
                    </div>
                  </td>

                  <td className="py-3 px-4 text-slate-600 font-mono text-[11px]">
                    {cat.slug}
                  </td>

                  <td className="py-3 px-4 text-slate-600">
                    {cat.parentId ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-brand-blue-light text-brand-blue font-medium text-[11px]">
                        Subcategory of: <strong>{cat.parent?.name || `ID ${cat.parentId}`}</strong>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-brand-green-light text-brand-green font-semibold text-[11px]">
                        Top-Level Category
                      </span>
                    )}
                  </td>

                  <td className="py-3 px-4 font-mono font-medium text-brand-navy">
                    {cat.sortOrder}
                  </td>

                  <td className="py-3 px-4">
                    {cat.status === "active" ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-brand-green-light text-brand-green border border-brand-green/20 text-[11px] font-semibold">
                        <CheckCircle2 className="w-3 h-3 text-brand-green" /> Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 text-[11px] font-medium">
                        <XCircle className="w-3 h-3 text-slate-400" /> Inactive
                      </span>
                    )}
                  </td>

                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {!cat.parentId && (
                        <button
                          onClick={() => openCreateModal(cat.id)}
                          className="px-2 py-1 bg-brand-blue-light hover:bg-brand-blue hover:text-white text-brand-blue rounded text-[11px] font-semibold transition-colors"
                          title="Add Subcategory"
                        >
                          + Sub
                        </button>
                      )}
                      <button
                        onClick={() => openEditModal(cat)}
                        className="p-1.5 text-slate-600 hover:text-brand-blue hover:bg-brand-blue-light rounded transition-colors"
                        title="Edit Category"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeletingId(cat.id)}
                        className="p-1.5 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                        title="Delete Category"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal Form: Create / Edit Category */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-brand-card">
              <h3 className="text-base font-bold text-brand-navy">
                {editingCategory ? "Edit Category" : "Create New Category"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-brand-navy font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-brand-navy mb-1">
                  Category Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Restaurants, Auto Services..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-green text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-brand-navy mb-1">
                  Slug (URL Segment)
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="auto-generated-if-empty"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-green text-xs font-mono"
                />
                <span className="text-[11px] text-slate-500 mt-0.5 block">
                  Unique identifier used in URL routes (e.g. /category/auto-services).
                </span>
              </div>

              <CustomAdminSelect
                label="Parent Category (Nesting)"
                value={formData.parentId}
                onChange={(val) => setFormData({ ...formData, parentId: val })}
                options={[
                  { value: "", label: "-- Top Level Category (No Parent) --" },
                  ...categories
                    .filter((c) => !c.parentId && c.id !== editingCategory?.id)
                    .map((parentCat) => ({ value: String(parentCat.id), label: parentCat.name })),
                ]}
                searchable
              />

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-brand-navy mb-1">
                    Sort Order
                  </label>
                  <input
                    type="number"
                    value={formData.sortOrder}
                    onChange={(e) => setFormData({ ...formData, sortOrder: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-green text-xs font-mono"
                  />
                </div>

                <CustomAdminSelect
                  label="Status"
                  value={formData.status}
                  onChange={(val) => setFormData({ ...formData, status: val })}
                  options={[
                    { value: "active", label: "Active" },
                    { value: "inactive", label: "Inactive" },
                  ]}
                />
              </div>

              <div>
                <label className="block font-bold text-brand-navy mb-1">
                  Lucide Icon Name / Icon URL
                </label>
                <input
                  type="text"
                  value={formData.iconUrl}
                  onChange={(e) => setFormData({ ...formData, iconUrl: e.target.value })}
                  placeholder="e.g. UtensilsCrossed, Hotel, Stethoscope, GraduationCap, Home, Car..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-green text-xs"
                />
                <span className="text-[11px] text-slate-500 mt-0.5 block">
                  Enter a Lucide React icon name (e.g., UtensilsCrossed, Hotel, Stethoscope, GraduationCap, Home, Car, Sparkles, ShoppingBag, Briefcase, PartyPopper, Wrench, LayoutGrid).
                </span>
              </div>

              <div>
                <label className="block font-bold text-brand-navy mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Short summary of this category..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-green text-xs"
                />
              </div>

              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-medium hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-brand-green hover:bg-brand-green-hover text-white font-semibold rounded-lg shadow-sm transition-colors"
                >
                  {saving ? "Saving..." : editingCategory ? "Update Category" : "Create Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingId && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-xl shadow-xl border border-slate-200 p-6 text-center">
            <h3 className="text-lg font-bold text-brand-navy mb-2">Delete Category?</h3>
            <p className="text-xs text-slate-600 mb-6">
              Are you sure you want to delete this category? Subcategories will automatically become top-level categories.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setDeletingId(null)}
                className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-medium text-xs hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deletingId)}
                disabled={saving}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs rounded-lg shadow-sm"
              >
                {saving ? "Deleting..." : "Confirm Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
