"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { saveProduct } from "@/app/actions";
import { ProductImageManager } from "@/components/product-image-manager";
import { AdminSelect } from "@/components/admin/admin-select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { BrandRecord, CategoryRecord } from "@/lib/admin-data";
import type { Product } from "@/lib/types";
import { slugify } from "@/lib/utils";

type ProductFormProps = {
  product?: Product | null;
  categories: CategoryRecord[];
  brands: BrandRecord[];
  canWrite: boolean;
};

type FormState = { ok: boolean; message: string; productId?: string };

const emptyProduct: Partial<Product> = {
  name: "",
  slug: "",
  sku: "",
  brand: "",
  category: "",
  description: "",
  price: 0,
  salePrice: undefined,
  stock: 0,
  status: "draft",
  featured: false,
  images: [],
  specs: {},
  condition: "new",
  costPrice: 0,
  warranty: "",
  supplierName: "",
  supplierContact: "",
  lowStockThreshold: 3,
  newArrival: false
};

export function ProductForm({ product, categories, brands, canWrite }: ProductFormProps) {
  const router = useRouter();
  const initial = product ?? emptyProduct;
  const draftKey = product?.id ? `product-draft-${product.id}` : "product-draft-new";
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saveState, formAction, pending] = useActionState(saveProduct, { ok: false, message: "" } as FormState);

  const [name, setName] = useState(initial.name ?? "");
  const [slug, setSlug] = useState(initial.slug ?? "");
  const [sku, setSku] = useState(initial.sku ?? "");
  const [brand, setBrand] = useState(initial.brand ?? brands[0]?.name ?? "");
  const [category, setCategory] = useState(initial.category ?? categories[0]?.name ?? "");
  const [description, setDescription] = useState(initial.description ?? "");
  const [price, setPrice] = useState(String(initial.price ?? 0));
  const [salePrice, setSalePrice] = useState(initial.salePrice != null ? String(initial.salePrice) : "");
  const [stock, setStock] = useState(String(initial.stock ?? 0));
  const [status, setStatus] = useState<Product["status"]>(initial.status ?? "draft");
  const [featured, setFeatured] = useState(Boolean(initial.featured));
  const [productCondition, setProductCondition] = useState<Product["condition"]>(initial.condition ?? "new");
  const [costPrice, setCostPrice] = useState(String(initial.costPrice ?? 0));
  const [warranty, setWarranty] = useState(initial.warranty ?? "");
  const [supplierName, setSupplierName] = useState(initial.supplierName ?? "");
  const [supplierContact, setSupplierContact] = useState(initial.supplierContact ?? "");
  const [lowStockThreshold, setLowStockThreshold] = useState(String(initial.lowStockThreshold ?? 3));
  const [specifications, setSpecifications] = useState(JSON.stringify(initial.specs ?? {}, null, 2));
  const [newArrival, setNewArrival] = useState(Boolean(initial.newArrival));

  useEffect(() => {
    const stored = localStorage.getItem(draftKey);
    if (stored && !product) {
      try {
        const draft = JSON.parse(stored) as Record<string, string | boolean>;
        if (draft.name) setName(String(draft.name));
        if (draft.slug) setSlug(String(draft.slug));
        if (draft.sku) setSku(String(draft.sku));
        if (draft.brand) setBrand(String(draft.brand));
        if (draft.category) setCategory(String(draft.category));
        if (draft.description) setDescription(String(draft.description));
        if (draft.price) setPrice(String(draft.price));
        if (draft.salePrice) setSalePrice(String(draft.salePrice));
        if (draft.stock) setStock(String(draft.stock));
        if (draft.status) setStatus(String(draft.status) as NonNullable<Product["status"]>);
        if (typeof draft.featured === "boolean") setFeatured(draft.featured);
      } catch {
        /* ignore */
      }
    }
  }, [draftKey, product]);

  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.setItem(
        draftKey,
        JSON.stringify({ name, slug, sku, brand, category, description, price, salePrice, stock, status, featured })
      );
    }, 800);
    return () => clearTimeout(timer);
  }, [draftKey, name, slug, sku, brand, category, description, price, salePrice, stock, status, featured]);

  useEffect(() => {
    if (!saveState.message) return;
    if (saveState.ok) {
      toast.success(saveState.message);
      localStorage.removeItem(draftKey);
      if (saveState.productId && !product) router.push(`/admin/products/${saveState.productId}`);
      else router.refresh();
    } else toast.error(saveState.message);
  }, [saveState, draftKey, product, router]);

  useEffect(() => {
    if (!name || slug) return;
    setSlug(slugify(name));
  }, [name, slug]);

  const validation = useMemo(() => {
    const next: Record<string, string> = {};
    if (name.trim().length < 2) next.name = "Name must be at least 2 characters.";
    if (sku.trim().length < 2) next.sku = "SKU is required.";
    if (!brand) next.brand = "Select a brand.";
    if (!category) next.category = "Select a category.";
    if (description.trim().length < 10) next.description = "Description must be at least 10 characters.";
    if (Number(price) < 0 || Number.isNaN(Number(price))) next.price = "Enter a valid price.";
    if (Number(stock) < 0 || !Number.isInteger(Number(stock))) next.stock = "Stock must be a whole number.";
    if (salePrice && Number(salePrice) < 0) next.salePrice = "Sale price must be non-negative.";
    return next;
  }, [name, sku, brand, category, description, price, stock, salePrice]);

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrors(validation);
    if (Object.keys(validation).length) {
      toast.error("Fix validation errors before saving.");
      return;
    }
    formAction(new FormData(event.currentTarget));
  }

  if (!canWrite) {
    return <p className="text-sm text-muted-foreground">You do not have permission to edit products.</p>;
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {product?.id ? <input type="hidden" name="productId" value={product.id} /> : null}
      <input type="hidden" name="slug" value={slug || slugify(name)} />
      <input type="hidden" name="featured" value={featured ? "on" : ""} />
      {!advancedOpen ? (
        <>
          <input type="hidden" name="productCondition" value={productCondition} />
          <input type="hidden" name="specifications" value={specifications} />
          <input type="hidden" name="costPrice" value={costPrice} />
          <input type="hidden" name="warranty" value={warranty} />
          <input type="hidden" name="supplierName" value={supplierName} />
          <input type="hidden" name="supplierContact" value={supplierContact} />
          <input type="hidden" name="lowStockThreshold" value={lowStockThreshold} />
          {newArrival ? <input type="hidden" name="newArrival" value="on" /> : null}
        </>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="name">Product Name *</Label>
          <Input id="name" name="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Product name" />
          {errors.name || validation.name ? <p className="text-xs text-destructive">{errors.name || validation.name}</p> : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="sku">SKU *</Label>
          <Input id="sku" name="sku" value={sku} onChange={(e) => setSku(e.target.value)} placeholder="SKU-001" />
          {errors.sku || validation.sku ? <p className="text-xs text-destructive">{errors.sku || validation.sku}</p> : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="status">Status *</Label>
          <AdminSelect id="status" name="availabilityStatus" value={status ?? "draft"} onChange={(e) => setStatus(e.target.value as NonNullable<Product["status"]>)}>
            <option value="active">Active</option>
            <option value="draft">Draft</option>
            <option value="hidden">Hidden</option>
            <option value="archived">Archived</option>
          </AdminSelect>
        </div>
        <div className="space-y-2">
          <Label htmlFor="category">Category *</Label>
          <AdminSelect id="category" name="category" value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="">Select category</option>
            {categories.map((item) => (
              <option key={item.id} value={item.name}>{item.name}</option>
            ))}
          </AdminSelect>
          {errors.category || validation.category ? <p className="text-xs text-destructive">{errors.category || validation.category}</p> : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="brand">Brand *</Label>
          <AdminSelect id="brand" name="brand" value={brand} onChange={(e) => setBrand(e.target.value)}>
            <option value="">Select brand</option>
            {brands.map((item) => (
              <option key={item.id} value={item.name}>{item.name}</option>
            ))}
          </AdminSelect>
          {errors.brand || validation.brand ? <p className="text-xs text-destructive">{errors.brand || validation.brand}</p> : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="price">Price (KES) *</Label>
          <Input id="price" name="price" type="number" min="0" value={price} onChange={(e) => setPrice(e.target.value)} />
          {errors.price || validation.price ? <p className="text-xs text-destructive">{errors.price || validation.price}</p> : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="salePrice">Sale Price (optional)</Label>
          <Input id="salePrice" name="salePrice" type="number" min="0" value={salePrice} onChange={(e) => setSalePrice(e.target.value)} placeholder="Leave empty if none" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="stock">Stock Quantity *</Label>
          <Input id="stock" name="stock" type="number" min="0" value={stock} onChange={(e) => setStock(e.target.value)} />
          {errors.stock || validation.stock ? <p className="text-xs text-destructive">{errors.stock || validation.stock}</p> : null}
        </div>
        <div className="flex items-center gap-2 pt-7">
          <input id="featured" type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} className="size-4 rounded border-input" />
          <Label htmlFor="featured">Featured Product</Label>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description *</Label>
        <Textarea id="description" name="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={5} placeholder="Product description" />
        {errors.description || validation.description ? <p className="text-xs text-destructive">{errors.description || validation.description}</p> : null}
      </div>

      <div className="space-y-2">
        <Label>Images</Label>
        <ProductImageManager images={initial.images ?? []} productName={name || "Product"} />
      </div>

      <div className="rounded-lg border border-border">
        <button type="button" onClick={() => setAdvancedOpen((open) => !open)} className="flex w-full items-center justify-between px-4 py-3 text-sm font-semibold text-foreground hover:bg-muted/50">
          Advanced fields
          <ChevronDown className={`size-4 transition-transform ${advancedOpen ? "rotate-180" : ""}`} />
        </button>
        {advancedOpen ? (
          <div className="space-y-4 border-t border-border p-4">
            <AdminSelect name="productCondition" value={productCondition} onChange={(e) => setProductCondition(e.target.value as Product["condition"])}>
              <option value="new">New</option>
              <option value="refurbished">Refurbished</option>
              <option value="used">Used</option>
            </AdminSelect>
            <Textarea name="specifications" value={specifications} onChange={(e) => setSpecifications(e.target.value)} placeholder="Specifications JSON" rows={4} />
            <div className="grid gap-3 sm:grid-cols-2">
              <Input name="costPrice" type="number" value={costPrice} onChange={(e) => setCostPrice(e.target.value)} placeholder="Cost price" />
              <Input name="warranty" value={warranty} onChange={(e) => setWarranty(e.target.value)} placeholder="Warranty" />
              <Input name="supplierName" value={supplierName} onChange={(e) => setSupplierName(e.target.value)} placeholder="Supplier name" />
              <Input name="supplierContact" value={supplierContact} onChange={(e) => setSupplierContact(e.target.value)} placeholder="Supplier contact" />
              <Input name="lowStockThreshold" type="number" value={lowStockThreshold} onChange={(e) => setLowStockThreshold(e.target.value)} placeholder="Low stock threshold" />
            </div>
            <label className="flex items-center gap-2 text-sm text-foreground">
              <input name="newArrival" type="checkbox" checked={newArrival} onChange={(e) => setNewArrival(e.target.checked)} className="size-4 rounded border-input" />
              New arrival
            </label>
          </div>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-3">
        <Button type="submit" disabled={pending || Object.keys(validation).length > 0}>
          {pending ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
          {product ? "Save Product" : "Create Product"}
        </Button>
        <p className="self-center text-xs text-muted-foreground">Draft autosaved locally</p>
      </div>
    </form>
  );
}
