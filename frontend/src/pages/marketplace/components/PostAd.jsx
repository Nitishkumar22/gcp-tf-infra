import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Textarea } from "../../../components/ui/textarea";
import { Label } from "../../../components/ui/label";
import { Switch } from "../../../components/ui/switch";
import { Checkbox } from "../../../components/ui/checkbox";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "../../../components/ui/select";
import { 
  X, 
  Upload, 
  DollarSign, 
  Tag, 
  CalendarRange, 
  MapPin, 
  ShieldCheck, 
  Briefcase, 
  MessageCircle 
} from "lucide-react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";

const categories = [
  { value: "Camera", label: "Cameras" },
  { value: "Lens", label: "Lenses" },
  { value: "Audio", label: "Audio Equipment" },
  { value: "Lighting", label: "Lighting" },
  { value: "Accessories", label: "Accessories" },
  { value: "Other", label: "Other" }
];

const conditions = [
  { value: "New", label: "New" },
  { value: "Like New", label: "Like New" },
  { value: "Good", label: "Good" },
  { value: "Fair", label: "Fair" },
  { value: "Poor", label: "Poor" }
];

const currencies = [
  { value: "USD", label: "USD ($)" },
  { value: "EUR", label: "EUR (€)" },
  { value: "INR", label: "INR (₹)" }
];

const contactPreferences = [
  { value: "email", label: "Email" },
  { value: "phone", label: "Phone" },
  { value: "chat", label: "In-app Chat" }
];

const subcategoryOptions = {
  Camera: [
    "DSLR", "Mirrorless", "Action Camera", "Film Camera", "Video Camera", "Medium Format"
  ],
  Lens: [
    "Prime", "Zoom", "Wide Angle", "Telephoto", "Macro", "Fisheye", "Cine Lens"
  ],
  Audio: [
    "Microphones", "Recorders", "Mixers", "Headphones", "Speakers", "Wireless Systems"
  ],
  Lighting: [
    "Continuous", "Strobe", "LED", "Natural", "Modifiers", "Light Stands"
  ],
  Accessories: [
    "Tripods", "Gimbals", "Batteries", "Memory Cards", "Bags", "Filters", "Cables"
  ],
  Other: [
    "Computers", "Software", "Drones", "Printers", "Scanners", "Misc"
  ]
};

const shippingOptions = [
  { value: "freeShipping", label: "Free Shipping" },
  { value: "localPickup", label: "Local Pickup Only" },
  { value: "shippingNotIncluded", label: "Shipping Not Included" }
];

const PostAd = ({ onSubmit }) => {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSubcategories, setSelectedSubcategories] = useState([]);
  const [hasWarranty, setHasWarranty] = useState(false);
  const modalRef = useRef(null);
  const fileInputRef = useRef(null);
  const { register, handleSubmit, setValue, reset, watch } = useForm({
    defaultValues: {
      productName: "",
      category: "",
      subcategory: [],
      description: "",
      bought_on: "",
      price: "",
      currency: "USD",
      isNegotiable: false,
      location: "",
      tags: "",
      warranty: {
        hasWarranty: false,
        expiryDate: "",
        details: ""
      },
      condition: "",
      shipping: "localPickup",
      brand: "",
      model: "",
      contactPreferences: ["chat"]
    }
  });

  const watchedValues = watch();

  // Handle click outside to close - modified to prevent closing when clicking on select elements
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if the click is on a select element or its children
      const isSelectElement =
        event.target.closest('[role="combobox"]') ||
        event.target.closest('[role="listbox"]') ||
        event.target.closest("[data-radix-select-viewport]");

      if (modalRef.current && !modalRef.current.contains(event.target) && isOpen && !isSelectElement) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Handle escape key to close
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscKey);
    return () => {
      document.removeEventListener("keydown", handleEscKey);
    };
  }, [isOpen]);

  // Update subcategory options when category changes
  useEffect(() => {
    if (watchedValues.category && watchedValues.category !== selectedCategory) {
      setSelectedCategory(watchedValues.category);
      setSelectedSubcategories([]);
      setValue("subcategory", []);
    }
  }, [watchedValues.category, selectedCategory, setValue]);

  const handleImageSelect = (event) => {
    const files = Array.from(event.target.files);
    
    // Validate file count
    if (files.length > 5) {
      toast.error("Maximum 5 images allowed");
      return;
    }

    // Validate file types and sizes
    const validFiles = files.filter(file => {
      const isValidType = ['image/jpeg', 'image/png', 'image/webp'].includes(file.type);
      const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB
      
      if (!isValidType) toast.error(`${file.name} is not a valid image type`);
      if (!isValidSize) toast.error(`${file.name} is too large (max 5MB)`);
      
      return isValidType && isValidSize;
    });

    setSelectedImages(validFiles);

    // Create preview URLs
    const urls = validFiles.map(file => URL.createObjectURL(file));
    setPreviewUrls(urls);
  };

  const removeImage = (index) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubcategoryToggle = (subcategory) => {
    setSelectedSubcategories(current => {
      const updated = current.includes(subcategory)
        ? current.filter(item => item !== subcategory)
        : [...current, subcategory];
      
      setValue("subcategory", updated);
      return updated;
    });
  };

  const handleWarrantyToggle = (checked) => {
    setHasWarranty(checked);
    setValue("warranty.hasWarranty", checked);
    if (!checked) {
      setValue("warranty.expiryDate", "");
      setValue("warranty.details", "");
    }
  };

  const onFormSubmit = async (data) => {
    try {
      // Create form data for image upload
      const formData = new FormData();
      
      // Add all the basic form fields
      formData.append("productName", data.productName);
      formData.append("description", data.description);
      formData.append("price", data.price);
      formData.append("currency", data.currency);
      formData.append("category", data.category);
      formData.append("condition", data.condition);
      formData.append("location", data.location);
      formData.append("isNegotiable", data.isNegotiable);
      formData.append("bought_on", data.bought_on);
      formData.append("shipping", data.shipping);
      
      // Only add these if they exist
      if (data.brand) formData.append("brand", data.brand);
      if (data.model) formData.append("model", data.model);

      // Add all basic fields
      Object.keys(data).forEach((key) => {
        if (Array.isArray(data[key])) {
          formData.append(key, JSON.stringify(data[key])); // Convert arrays to JSON strings
        } else {
          formData.append(key, data[key]);
        }
      });
      
      // Handle subcategories properly - ensure it's a JSON string
      formData.append("subcategory", JSON.stringify(selectedSubcategories));
      
      // Handle warranty
      formData.append("warranty[hasWarranty]", data.warranty.hasWarranty);
      if (data.warranty.hasWarranty) {
        if (data.warranty.expiryDate) formData.append("warranty[expiryDate]", data.warranty.expiryDate);
        if (data.warranty.details) formData.append("warranty[details]", data.warranty.details);
      }
      
      // Handle contact preferences - ensure it's a JSON string
      formData.append("contactPreferences", JSON.stringify(data.contactPreferences));
      
      // Handle tags - parse as array first then stringify
      if (data.tags) {
        let tagsArray = Array.isArray(data.tags) ? data.tags : data.tags.split(',').map(tag => tag.trim());
        formData.append("tags", JSON.stringify(tagsArray));
      }
      
      // Add images
      if (selectedImages.length > 0) {
        selectedImages.forEach((image, index) => {
          formData.append("images", image);
          if (index === 0) {
            formData.append("isPrimary[0]", true);
          }
        });
      }
      
      // Log the formData to verify content (for debugging)
      for (let [key, value] of formData.entries()) {
        console.log(`${key}: ${value}`);
      }
      
      // Make the API request
      const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/ads/create`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create ad");
      }
      
      toast.success("Ad posted successfully!");
      reset();
      setSelectedImages([]);
      setPreviewUrls([]);
      setSelectedSubcategories([]);
      setIsOpen(false);
            
      // Invalidate and refetch ads queries
      queryClient.invalidateQueries(["ads"]);
      queryClient.invalidateQueries(["userAds"]);
    } catch (error) {
      console.error("Error posting ad:", error);
      toast.error(error.message || "Error creating ad");
    }
  };

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="w-full rounded-full bg-gradient-to-r from-gray-900 to-slate-900 hover:from-gray-800 hover:to-slate-800 text-white font-medium"
      >
        List Equipment
      </Button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} 
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black z-40"
              onClick={() => setIsOpen(false)}
            />

            <motion.div
              ref={modalRef}
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed top-6 left-0 h-[94%] z-50 w-full sm:w-[90%] md:w-[80%] lg:w-[70%] xl:w-[60%] max-w-4xl bg-white dark:bg-gray-900 shadow-2xl overflow-y-auto"
            >
              <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b dark:border-gray-800 p-4 flex justify-between items-center">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-slate-800 bg-clip-text text-transparent">
                  List Equipment
                </h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                  className="rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <div className="p-6">
                <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-8">
                  {/* Basic Information Section */}
                  <div className="space-y-4 px-5">
                    <h3 className="text-lg font-semibold border-b pb-2">Basic Information</h3>
                    
                    {/* Product Name */}
                    <div className="space-y-2">
                      <Label htmlFor="productName" className="font-medium">
                        Product Name *
                    </Label>
                    <Input
                      id="productName"
                      {...register("productName", { required: true })}
                      placeholder="Enter the name of your product"
                    />
                  </div>

                    {/* Brand & Model */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="brand" className="font-medium">Brand</Label>
                        <Input
                          id="brand"
                          {...register("brand")}
                          placeholder="Brand name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="model" className="font-medium">Model</Label>
                        <Input
                          id="model"
                          {...register("model")}
                          placeholder="Model number/name"
                        />
                      </div>
                    </div>
                    
                    {/* Description */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Tag className="h-5 w-5 text-zinc-700" />
                        <Label htmlFor="description" className="font-medium">Description *</Label>
                        </div>
                        <Textarea
                          id="description"
                          {...register("description", { required: true })}
                          placeholder="Describe your product in detail"
                          className="min-h-[150px]"
                        />
                      </div>
                  </div>

                  {/* Category & Subcategory Section */}
                  <div className="space-y-4 px-5">
                    <h3 className="text-lg font-semibold border-b pb-2">Categories</h3>
                    
                    {/* Category */}
                    <div className="space-y-2">
                      <Label htmlFor="category" className="font-medium">Category *</Label>
                    <Select
                      onValueChange={(value) => setValue("category", value)}
                    >
                        <SelectTrigger id="category">
                          <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.value} value={category.value}>
                            {category.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    </div>
                    
                    {/* Subcategory Checkboxes */}
                    {watchedValues.category && (
                      <div className="space-y-2">
                        <Label className="font-medium">Subcategory *</Label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {subcategoryOptions[watchedValues.category]?.map((subcategory) => (
                            <div key={subcategory} className="flex items-center space-x-2">
                              <Checkbox 
                                id={`subcategory-${subcategory}`} 
                                checked={selectedSubcategories.includes(subcategory)}
                                onCheckedChange={() => handleSubcategoryToggle(subcategory)}
                              />
                              <label 
                                htmlFor={`subcategory-${subcategory}`}
                                className="text-sm cursor-pointer"
                              >
                                {subcategory}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Tags */}
                    <div className="space-y-2">
                      <Label htmlFor="tags" className="font-medium">Tags (comma separated)</Label>
                      <Input
                        id="tags"
                        {...register("tags")}
                        placeholder="e.g. portrait, wildlife, vintage"
                      />
                    </div>
                  </div>

                  {/* Price & Condition Section */}
                  <div className="space-y-4 px-5">
                    <h3 className="text-lg font-semibold border-b pb-2">Price & Condition</h3>
                    
                    {/* Price & Currency */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-5 w-5 text-zinc-700" />
                          <Label htmlFor="price" className="font-medium">Price *</Label>
                        </div>
                    <Input
                          id="price"
                      type="number"
                      {...register("price", { required: true, min: 0 })}
                          placeholder="Enter price"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="currency" className="font-medium">Currency *</Label>
                        <Select
                          defaultValue="USD"
                          onValueChange={(value) => setValue("currency", value)}
                        >
                          <SelectTrigger id="currency">
                            <SelectValue placeholder="Select currency" />
                          </SelectTrigger>
                          <SelectContent>
                            {currencies.map((currency) => (
                              <SelectItem key={currency.value} value={currency.value}>
                                {currency.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      </div>

                    {/* Negotiable Switch */}
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="isNegotiable" className="font-medium">Price Negotiable</Label>
                        <p className="text-sm text-muted-foreground">Allow buyers to negotiate on price</p>
                      </div>
                      <Switch
                        id="isNegotiable"
                        checked={watchedValues.isNegotiable}
                        onCheckedChange={(checked) => setValue("isNegotiable", checked)}
                      />
                    </div>

                    {/* Condition & Purchase Date */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="condition" className="font-medium">Condition *</Label>
                    <Select
                      onValueChange={(value) => setValue("condition", value)}
                    >
                          <SelectTrigger id="condition">
                            <SelectValue placeholder="Select condition" />
                      </SelectTrigger>
                      <SelectContent>
                        {conditions.map((condition) => (
                          <SelectItem key={condition.value} value={condition.value}>
                            {condition.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <CalendarRange className="h-5 w-5 text-zinc-700" />
                          <Label htmlFor="bought_on" className="font-medium">Purchase Date</Label>
                        </div>
                        <Input
                          id="bought_on"
                          type="date"
                          {...register("bought_on")}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Warranty Section */}
                  <div className="space-y-4 px-5">
                    <h3 className="text-lg font-semibold border-b pb-2">Warranty Information</h3>
                    
                    {/* Has Warranty Switch */}
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <ShieldCheck className="h-5 w-5 text-zinc-700" />
                          <Label htmlFor="warranty.hasWarranty" className="font-medium">Has Warranty</Label>
                        </div>
                        <p className="text-sm text-muted-foreground">Is this item still under warranty?</p>
                      </div>
                      <Switch
                        id="warranty.hasWarranty"
                        checked={hasWarranty}
                        onCheckedChange={handleWarrantyToggle}
                      />
                    </div>
                    
                    {/* Warranty Details (conditional) */}
                    {hasWarranty && (
                      <div className="space-y-4 pl-4 border-l-2 border-gray-200">
                        <div className="space-y-2">
                          <Label htmlFor="warranty.expiryDate" className="font-medium">Warranty Expiry Date</Label>
                          <Input
                            id="warranty.expiryDate"
                            type="date"
                            {...register("warranty.expiryDate")}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="warranty.details" className="font-medium">Warranty Details</Label>
                          <Textarea
                            id="warranty.details"
                            {...register("warranty.details")}
                            placeholder="Additional details about the warranty"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Shipping & Location Section */}
                  <div className="space-y-4 px-5">
                    <h3 className="text-lg font-semibold border-b pb-2">Shipping & Location</h3>
                    
                    {/* Location */}
                    <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-zinc-700" />
                        <Label htmlFor="location" className="font-medium">Location *</Label>
                      </div>
                      <Input
                        id="location"
                        {...register("location", { required: true })}
                        placeholder="City, State/Province, Country"
                      />
                    </div>
                    
                    {/* Shipping Options */}
                    <div className="space-y-2">
                      <Label htmlFor="shipping" className="font-medium">Shipping Options</Label>
                      <Select
                        defaultValue="localPickup"
                        onValueChange={(value) => setValue("shipping", value)}
                      >
                        <SelectTrigger id="shipping">
                          <SelectValue placeholder="Select shipping option" />
                        </SelectTrigger>
                        <SelectContent>
                          {shippingOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {/* Contact Preferences */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <MessageCircle className="h-5 w-5 text-zinc-700" />
                        <Label className="font-medium">Contact Preferences</Label>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {contactPreferences.map((pref) => (
                          <div key={pref.value} className="flex items-center space-x-2">
                            <Checkbox 
                              id={`contactPref-${pref.value}`} 
                              defaultChecked={pref.value === "chat"}
                              onCheckedChange={(checked) => {
                                const current = watch("contactPreferences") || [];
                                const updated = checked 
                                  ? [...current, pref.value]
                                  : current.filter(val => val !== pref.value);
                                setValue("contactPreferences", updated);
                              }}
                            />
                            <label 
                              htmlFor={`contactPref-${pref.value}`}
                              className="text-sm cursor-pointer"
                            >
                              {pref.label}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Images Section */}
                  <div className="space-y-4 px-5">
                    <h3 className="text-lg font-semibold border-b pb-2">Images</h3>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Upload className="h-5 w-5 text-zinc-700" />
                        <Label className="font-medium">Upload Images *</Label>
                        <span className="text-sm text-muted-foreground">(First image will be the primary image)</span>
                    </div>
                    
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageSelect}
                      accept="image/jpeg,image/png,image/webp"
                      multiple
                      className="hidden"
                    />

                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed rounded-xl p-8 text-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm text-gray-500">
                        Click to upload images (max 5)
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        JPEG, PNG, WebP (max 5MB each)
                      </p>
                    </div>

                    {/* Image Previews */}
                    {previewUrls.length > 0 && (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mt-4">
                        {previewUrls.map((url, index) => (
                          <div key={index} className="relative group">
                              <div className={`absolute inset-0 flex items-center justify-center text-white font-bold bg-black/30 ${index === 0 ? 'opacity-100' : 'opacity-0'} group-hover:opacity-100 transition-opacity`}>
                                {index === 0 && <span>Primary</span>}
                              </div>
                            <img
                              src={url}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-24 object-cover rounded-md"
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="px-5 pt-4">
                    <Button 
                      type="submit" 
                      className="w-full bg-gradient-to-r from-gray-900 to-slate-900 hover:from-gray-800 hover:to-slate-800 text-white"
                    >
                    Post Listing
                  </Button>
                  </div>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default PostAd; 