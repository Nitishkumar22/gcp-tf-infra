"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "../../../components/ui/button"
import { Input } from "../../../components/ui/input"
import { Label } from "../../../components/ui/label"
import { Textarea } from "../../../components/ui/textarea"
import { Checkbox } from "../../../components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select"
import { X, Upload, DollarSign, MapPin, Tag, HelpCircle, Image as ImageIcon, List } from "lucide-react"
import { useQueryClient } from "@tanstack/react-query"
import toast from "react-hot-toast";
import LoadingSpinner from "../../../components/LoadingSpinner";

// Data from RohModel enums
const categories = [
    "Cameras and Accessories",
    "Lighting Equipment",
    "Audio Gear",
    "Storage and Memory",
    "Studio Setup",
    "Drones and Aerial Equipment",
    "Mobile Filmmaking",
];
const departments = ["Filmmaking", "Photography", "Audio Production", "Post-Production", "Other"];

export default function PostRoh({ onSubmit }) {
  const queryClient = useQueryClient()
  const modalRef = useRef(null)
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    productName: "",
    description: "",
    category: "",
    department: "",
    isForHelp: false,
    rentPrice: "", // Keep as string for input control
    isNegotiable: false,
    location: "",
    // availabilityFrom: "", // Simplified for now
    // availabilityTo: "",
    imgs: [], // Stores base64 strings
    imgFiles: [], // Stores File objects for preview/removal
  })

  // --- Modal Handling (Open/Close, Escape, Click Outside, Scroll Lock) ---
  useEffect(() => {
    const handleClickOutside = (event) => {
      const isSelectElement = event.target.closest('[role="combobox"], [data-radix-select-viewport]');
      if (modalRef.current && !modalRef.current.contains(event.target) && isOpen && !isSelectElement) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [isOpen])

  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === "Escape" && isOpen) setIsOpen(false)
    }
    document.addEventListener("keydown", handleEscKey)
    return () => document.removeEventListener("keydown", handleEscKey)
  }, [isOpen])

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "auto"
    return () => { document.body.style.overflow = "auto" }
  }, [isOpen])
  // --- End Modal Handling ---

  // --- Form Input Handlers ---
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleCheckboxChange = (name, checked) => {
    setFormData(prev => ({
        ...prev,
        [name]: checked,
        // Reset rentPrice if switching to "For Help"
        ...(name === 'isForHelp' && checked && { rentPrice: '' }),
    }));
  };

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files)
    if (files.length === 0) return;

    // Limit number of files (e.g., 5)
    const MAX_FILES = 5;
    if (formData.imgFiles.length + files.length > MAX_FILES) {
      toast.error(`You can upload a maximum of ${MAX_FILES} images.`);
      return;
    }

    // Convert to base64 for submission
    const base64Promises = files.map(file => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
        reader.readAsDataURL(file);
    }));

    try {
        const base64Files = await Promise.all(base64Promises);
        setFormData((prevData) => ({
            ...prevData,
            imgs: [...prevData.imgs, ...base64Files],
            imgFiles: [...prevData.imgFiles, ...files],
        }));
    } catch (error) {
        console.error("Error reading files:", error);
        toast.error("Could not read selected files.");
    }
  }

  const removeImage = (indexToRemove) => {
     setFormData(prev => ({
         ...prev,
         imgs: prev.imgs.filter((_, index) => index !== indexToRemove),
         imgFiles: prev.imgFiles.filter((_, index) => index !== indexToRemove),
     }));
  };

  // Prevent event propagation for select components within modal
  const handleSelectClick = (e) => {
    e.stopPropagation()
  }
  // --- End Form Input Handlers ---

  // --- Form Submission ---
  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true);

    // --- FIX 1: Frontend Validation --- 
    if (!formData.productName || !formData.description || !formData.category || !formData.department || !formData.location) {
       toast.error("Please fill in all required fields.");
       setIsSubmitting(false);
       return;
    }
    // Check description length
    if (formData.description.length < 10) {
        toast.error("Description must be at least 10 characters long.");
        setIsSubmitting(false);
        return;
    }
    if (!formData.isForHelp && !formData.rentPrice) {
       toast.error("Please enter a rent price for rental items.");
       setIsSubmitting(false);
       return;
    }
    // --- END FIX 1 ---

    const requestData = {
      ...formData,
      rentPrice: !formData.isForHelp ? (parseFloat(formData.rentPrice) || null) : undefined,
      isNegotiable: !formData.isForHelp ? formData.isNegotiable : undefined,
      imgFiles: undefined,
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/roh/create`, {
        method: "POST",
        headers: { 
            "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(requestData),
      })

      const result = await response.json(); // Always parse JSON response

      if (!response.ok || !result.success) {
         // --- FIX 2: Display specific backend error --- 
         // Try to get specific validation errors if available (Mongoose structure)
        let errorMessage = result.message || "Failed to post item.";
        if (result.errors) { // Check if Mongoose validation errors object exists
            const fieldErrors = Object.values(result.errors).map(err => err.message).join("\n");
            if (fieldErrors) {
                errorMessage = fieldErrors; 
            }
        }
        throw new Error(errorMessage);
        // --- END FIX 2 ---
      }

      toast.success("Your item has been posted.");
      setFormData({
        productName: "", description: "", category: "", department: "",
        isForHelp: false, rentPrice: "", isNegotiable: false, location: "",
        imgs: [], imgFiles: [],
      })
      setIsOpen(false)
      onSubmit()
      queryClient.invalidateQueries({ queryKey: ['roh'] });
      queryClient.invalidateQueries({ queryKey: ['userRohs'] });

    } catch (error) { // Catch errors from fetch OR thrown errors from !response.ok
      console.error("Error submitting form:", error)
      // Display the error message (already improved by Fix 2)
      toast.error(error.message || "An unexpected error occurred."); 
    } finally {
        setIsSubmitting(false);
    }
  }
  // --- End Form Submission ---

  return (
    <>
      {/* Button to open the modal */} 
      <div className="w-full">
        <Button
          onClick={() => setIsOpen(true)}
          className="w-full rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
        >
          Post an Item
        </Button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */} 
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
              onClick={() => setIsOpen(false)} 
            />

            {/* Modal Panel */} 
            <motion.div
              ref={modalRef}
              // Slide in from left animation
              initial={{ x: "-100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "-100%", opacity: 0 }}
              transition={{ type: "spring", damping: 30, stiffness: 250 }}
              className="fixed top-0 left-0 h-full z-50 w-full sm:w-[90%] md:w-[80%] lg:w-[70%] xl:w-[60%] max-w-3xl bg-background shadow-2xl flex flex-col"
            >
              {/* Modal Header */} 
              <div className="sticky top-0 z-10 bg-background border-b p-4 flex justify-between items-center shrink-0">
                <h2 className="text-xl font-semibold">
                  Post Item for Rent or Help
                </h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                  className="rounded-full"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* Modal Body - Scrollable Form */} 
              <div className="flex-1 overflow-y-auto p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  
                  {/* Basic Info Section */}
                  <div className="space-y-4 p-5 rounded-lg border bg-card shadow-sm">
                     <h3 className="font-medium text-lg mb-3">Item Details</h3>
                     <div className="space-y-2">
                        <Label htmlFor="productName">Product Name <span className="text-destructive">*</span></Label>
                        <Input id="productName" name="productName" value={formData.productName} onChange={handleChange} placeholder="e.g., Canon EOS R5 Camera Body" required />
                     </div>
                     <div className="space-y-2">
                        <Label htmlFor="description">Description <span className="text-destructive">*</span></Label>
                        <Textarea id="description" name="description" value={formData.description} onChange={handleChange} placeholder="Describe the item, its condition, included accessories, etc." required className="min-h-[100px] resize-none" />
                     </div>
                  </div>

                  {/* Categorization Section */}
                  <div className="space-y-4 p-5 rounded-lg border bg-card shadow-sm">
                     <h3 className="font-medium text-lg mb-3">Categorization</h3>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="category">Category <span className="text-destructive">*</span></Label>
                            <div onClick={handleSelectClick}> {/* Prevent closing modal */} 
                            <Select name="category" value={formData.category} onValueChange={(value) => handleSelectChange("category", value)} required>
                                <SelectTrigger><SelectValue placeholder="Select Category" /></SelectTrigger>
                                <SelectContent position="popper" className="z-[100]"> 
                                {categories.map((cat) => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                                </SelectContent>
                            </Select>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="department">Department <span className="text-destructive">*</span></Label>
                             <div onClick={handleSelectClick}> {/* Prevent closing modal */} 
                            <Select name="department" value={formData.department} onValueChange={(value) => handleSelectChange("department", value)} required>
                                <SelectTrigger><SelectValue placeholder="Select Department" /></SelectTrigger>
                                <SelectContent position="popper" className="z-[100]">
                                {departments.map((dep) => <SelectItem key={dep} value={dep}>{dep}</SelectItem>)}
                                </SelectContent>
                            </Select>
                            </div>
                        </div>
                     </div>
                  </div>
                  
                  {/* Purpose & Pricing Section */} 
                   <div className="space-y-4 p-5 rounded-lg border bg-card shadow-sm">
                     <h3 className="font-medium text-lg mb-3">Purpose & Pricing</h3>
                      <div className="flex items-center space-x-3">
                          <Checkbox id="isForHelp" name="isForHelp" checked={formData.isForHelp} onCheckedChange={(checked) => handleCheckboxChange('isForHelp', checked)} />
                          <Label htmlFor="isForHelp" className="flex items-center gap-1.5 cursor-pointer">
                             <HelpCircle className="h-4 w-4" /> This item is a request for help (not for rent)
                          </Label>
                      </div>

                      {!formData.isForHelp && (
                        <motion.div 
                            initial={{ opacity: 0, height: 0 }} 
                            animate={{ opacity: 1, height: 'auto' }} 
                            exit={{ opacity: 0, height: 0 }}
                            className="space-y-4 pt-3 border-t mt-3"
                        >
                            <div className="space-y-2">
                                <Label htmlFor="rentPrice">Rent Price (USD) <span className="text-destructive">*</span></Label>
                                <Input id="rentPrice" name="rentPrice" type="number" min="0" step="0.01" value={formData.rentPrice} onChange={handleChange} placeholder="e.g., 50.00" required={!formData.isForHelp} />
                            </div>
                             <div className="flex items-center space-x-3">
                                <Checkbox id="isNegotiable" name="isNegotiable" checked={formData.isNegotiable} onCheckedChange={(checked) => handleCheckboxChange('isNegotiable', checked)} disabled={formData.isForHelp} />
                                <Label htmlFor="isNegotiable" className="cursor-pointer">Price is negotiable</Label>
                            </div>
                        </motion.div>
                      )}
                  </div>

                  {/* Location & Availability Section */} 
                  <div className="space-y-4 p-5 rounded-lg border bg-card shadow-sm">
                     <h3 className="font-medium text-lg mb-3">Location & Availability</h3>
                      <div className="space-y-2">
                        <Label htmlFor="location">Location <span className="text-destructive">*</span></Label>
                        <Input id="location" name="location" value={formData.location} onChange={handleChange} placeholder="City, State, Country or General Area" required />
                      </div>
                       {/* Add Availability Date Pickers if needed - simplified for now */}
                  </div>

                  {/* Media Section */} 
                  <div className="space-y-4 p-5 rounded-lg border bg-card shadow-sm">
                      <h3 className="font-medium text-lg mb-3">Images</h3>
                      <div className="space-y-2">
                          <Label htmlFor="imgs" className="flex items-center gap-2 cursor-pointer hover:text-primary">
                              <Upload className="h-5 w-5" /> Upload Images (Max 5)
                          </Label>
                          <Input id="imgs" name="imgs" type="file" accept="image/*" multiple onChange={handleFileChange} className="hidden" />
                          <p className="text-xs text-muted-foreground">Upload relevant images of the item.</p>
                      </div>
                      {/* Image Previews */} 
                      {formData.imgFiles.length > 0 && (
                          <div className="mt-4 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                              {formData.imgFiles.map((file, index) => (
                                  <div key={index} className="relative group aspect-square">
                                      <img 
                                          src={URL.createObjectURL(file)} 
                                          alt={`preview ${index}`} 
                                          className="w-full h-full object-cover rounded-md border"
                                          onLoad={() => URL.revokeObjectURL(file.preview)} // Clean up blob URL
                                      />
                                      <Button 
                                          type="button"
                                          variant="destructive"
                                          size="icon"
                                          className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity rounded-full"
                                          onClick={() => removeImage(index)}
                                      >
                                          <X className="h-4 w-4" />
                                      </Button>
                                  </div>
                              ))}
                          </div>
                      )}
                  </div>

                 {/* Form Actions are now in the sticky footer */} 
                </form>
              </div>

              {/* Modal Footer - Sticky */} 
              <div className="sticky bottom-0 bg-background border-t p-4 flex justify-end space-x-3 shrink-0">
                <Button variant="outline" onClick={() => setIsOpen(false)} type="button" disabled={isSubmitting}>
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  onClick={handleSubmit} // Trigger form submission
                  disabled={isSubmitting}
                  className="min-w-[100px]"
                 >
                   {isSubmitting ? <LoadingSpinner size="sm" /> : "Post Item"}
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
