"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "../../../components/ui/button"
import { Input } from "../../../components/ui/input"
import { Label } from "../../../components/ui/label"
import { Textarea } from "../../../components/ui/textarea"
import { Checkbox } from "../../../components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select"
import { X, Upload, Calendar, DollarSign, MapPin, Film, Tag, Users } from "lucide-react"
import { useQueryClient } from "@tanstack/react-query"

export default function PostACollab({ onSubmit }) {
  const queryClient = useQueryClient()
  const modalRef = useRef(null)
  const [isOpen, setIsOpen] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    projectType: "",
    genres: [],
    description: "",
    isPaid: false,
    pay: 0,
    timePeriod: "",
    location: "",
    requiredCraftsmen: [],
    imgs: [],
    deadline: "",
    referenceLinks: [],
  })

  // Handle click outside to close - modified to prevent closing when clicking on select elements
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if the click is on a select element or its children
      const isSelectElement =
        event.target.closest('[role="combobox"]') ||
        event.target.closest('[role="listbox"]') ||
        event.target.closest("[data-radix-select-viewport]")

      if (modalRef.current && !modalRef.current.contains(event.target) && isOpen && !isSelectElement) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen])

  // Handle escape key to close
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === "Escape" && isOpen) {
        setIsOpen(false)
      }
    }

    document.addEventListener("keydown", handleEscKey)
    return () => {
      document.removeEventListener("keydown", handleEscKey)
    }
  }, [isOpen])

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "auto"
    }
    return () => {
      document.body.style.overflow = "auto"
    }
  }, [isOpen])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }))
  }

  const handleCraftsmenChange = (craft, checked) => {
    setFormData((prevData) => {
      const updatedCraftsmen = checked
        ? [...prevData.requiredCraftsmen, craft]
        : prevData.requiredCraftsmen.filter((item) => item !== craft)
      return { ...prevData, requiredCraftsmen: updatedCraftsmen }
    })
  }

  const handleGenresChange = (genre, checked) => {
    setFormData((prevData) => {
      const updatedGenres = checked ? [...prevData.genres, genre] : prevData.genres.filter((item) => item !== genre)
      return { ...prevData, genres: updatedGenres }
    })
  }

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files)
    const base64Files = await Promise.all(
      files.map(
        (file) =>
          new Promise((resolve) => {
            const reader = new FileReader()
            reader.onload = () => resolve(reader.result)
            reader.readAsDataURL(file)
          }),
      ),
    )
    setFormData((prevData) => ({
      ...prevData,
      imgs: base64Files,
    }))
  }

  // Prevent event propagation for select components
  const handleSelectClick = (e) => {
    e.stopPropagation()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.title || !formData.description || !formData.deadline) {
      return alert("Title, description, and deadline are required.")
    }

    const requestData = {
      ...formData,
      user: "userId_placeholder", // Replace with actual user ID from context or auth
      imgs: formData.imgs,
      location: formData.location,
    }

    try {
      const response = await fetch("api/collabs/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestData),
      })

      if (!response.ok) {
        throw new Error("Failed to create collaboration.")
      }

      alert("Collaboration posted successfully!")
      setFormData({
        title: "",
        projectType: "",
        genres: [],
        description: "",
        isPaid: false,
        pay: 0,
        timePeriod: "",
        location: "",
        requiredCraftsmen: [],
        imgs: [],
        deadline: "",
        referenceLinks: [],
      })
      setIsOpen(false)
      onSubmit()

      // Invalidate and refetch collabs query
      queryClient.invalidateQueries(["collabs"])
    } catch (error) {
      console.error("Error submitting form:", error)
      alert("Error creating collaboration.")
    }
  }

  return (
    <>
      <div className="w-full">
        <Button
          onClick={() => setIsOpen(true)}
          className="w-full rounded-full bg-gradient-to-r from-gray-900 to-slate-900 hover:from-gray-800 hover:to-slate-800 text-white font-medium"
        >
          Post a Collab
        </Button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Modal */}
            <motion.div
              ref={modalRef}
              initial={{ x: "-100%" }}
              animate={{ x: 0 }} 
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed top-6 left-0 h-[94%] z-30 w-full sm:w-[90%] md:w-[80%] lg:w-[70%] xl:w-[60%] max-w-4xl bg-white dark:bg-gray-900 shadow-2xl overflow-y-auto"
              style={{ zIndex: 50 }}
            >
              <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b dark:border-gray-800 p-4 flex justify-between items-center">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-slate-800 bg-clip-text text-transparent">
                  Create Collaboration
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
                <form onSubmit={handleSubmit} className="space-y-8">
                  {/* Title Section */}
                  <div className="space-y-2 px-5">
                    <Label htmlFor="title" className="text-lg font-semibold">
                      Project Title
                    </Label>
                    <Input
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      placeholder="Enter a catchy title for your project"
                      className="text-lg"
                      required
                    />
                  </div>

                  {/* Two Column Layout */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Left Column */}
                    <div className="space-y-4">
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className=" p-5 rounded-xl bg-gray-50 dark:bg-gray-800 shadow-sm"
                      >
                        <div className="flex items-center gap-2">
                          <Film className="h-5 w-5 text-zinc-700" />
                          <h3 className="font-semibold text-lg">Project Details</h3>
                        </div>

                        <div className="space-y-3">
                          <div className="space-y-2">
                            <Label htmlFor="projectType">Project Type</Label>
                            <div onClick={handleSelectClick}>
                              <Select
                                name="projectType"
                                value={formData.projectType}
                                onValueChange={(value) => setFormData({ ...formData, projectType: value })}
                              >
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="Select Project Type" />
                                </SelectTrigger>
                                <SelectContent position="popper" className="z-[100]">
                                  {[
                                    "Short Film",
                                    "Feature Film",
                                    "Documentary",
                                    "Music Video",
                                    "Commercial",
                                    "Youtube Video",
                                    "Reels or Shorts",
                                    "Other",
                                  ].map((type) => (
                                    <SelectItem key={type} value={type}>
                                      {type}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="timePeriod">Time Period</Label>
                            <div onClick={handleSelectClick}>
                              <Select
                                name="timePeriod"
                                value={formData.timePeriod}
                                onValueChange={(value) => setFormData({ ...formData, timePeriod: value })}
                              >
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="Select Time Period" />
                                </SelectTrigger>
                                <SelectContent position="popper" className="z-[100]">
                                  {[
                                    "Less than a week",
                                    "Less than a month",
                                    "Less than 3 months",
                                    "More than 3 months",
                                  ].map((period) => (
                                    <SelectItem key={period} value={period}>
                                      {period}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="deadline" className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-zinc-700" />
                              Deadline
                            </Label>
                            <Input
                              id="deadline"
                              name="deadline"
                              type="date"
                              value={formData.deadline}
                              onChange={handleChange}
                              required
                              className="w-full"
                            />
                          </div>
                        </div>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="space-y-4 p-5 rounded-xl bg-gray-50 dark:bg-gray-800 shadow-sm"
                      >
                        <div className="flex items-center gap-2">
                          <Tag className="h-5 w-5 text-zinc-700" />
                          <h3 className="font-semibold text-lg">Genres</h3>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          {["Action", "Comedy", "Drama", "Horror", "Sci-Fi", "Romance", "Documentary", "Other"].map(
                            (genre) => (
                              <div key={genre} className="flex items-center space-x-2">
                                <Checkbox
                                  id={genre}
                                  checked={formData.genres.includes(genre)}
                                  onCheckedChange={(checked) => handleGenresChange(genre, checked)}
                                  className="data-[state=checked]:bg-zinc-800"
                                />
                                <Label htmlFor={genre} className="text-sm">
                                  {genre}
                                </Label>
                              </div>
                            ),
                          )}
                        </div>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="space-y-4 p-5 rounded-xl bg-gray-50 dark:bg-gray-800 shadow-sm"
                      >
                        <div className="flex items-center gap-2">
                          <MapPin className="h-5 w-5 text-zinc-700" />
                          <h3 className="font-semibold text-lg">Location</h3>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="location">Where will this project take place?</Label>
                          <Input
                            id="location"
                            name="location"
                            value={formData.location}
                            onChange={handleChange}
                            placeholder="City, Country or Remote"
                            required
                          />
                        </div>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="space-y-4 p-5 rounded-xl bg-gray-50 dark:bg-gray-800 shadow-sm"
                      >
                          <div className="space-y-2">
                            <Label htmlFor="referenceLinks">Reference Links</Label>
                            <Textarea
                              id="referenceLinks"
                              name="referenceLinks"
                              value={formData.referenceLinks.join("\n")}
                              onChange={(e) => setFormData({ ...formData, referenceLinks: e.target.value.split("\n") })}
                              placeholder="Enter reference links, one per line"
                              className="resize-none"
                            />
                          </div>
                      </motion.div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-4">
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="space-y-4 p-5 rounded-xl bg-gray-50 dark:bg-gray-800 shadow-sm"
                      >
                        <Label htmlFor="description" className="font-semibold text-lg">
                          Project Description
                        </Label>
                        <Textarea
                          id="description"
                          name="description"
                          value={formData.description}
                          onChange={handleChange}
                          placeholder="Describe your project in detail. What's the concept? What are you looking for?"
                          className="min-h-[215px] resize-none"
                          required
                        />
                      </motion.div>


                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="space-y-4 p-5 rounded-xl bg-gray-50 dark:bg-gray-800 shadow-sm"
                      >
                        <div className="flex items-center gap-2">
                          <Users className="h-5 w-5 text-zinc-700" />
                          <h3 className="font-semibold text-lg">Required Craftsmen</h3>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          {[
                            "Video Editor",
                            "Audio Mixer",
                            "Cinematographer",
                            "Scriptwriter",
                            "Voice Artist",
                            "Actor",
                            "Director",
                            "Producer",
                            "Other",
                          ].map((craft) => (
                            <div key={craft} className="flex items-center space-x-2">
                              <Checkbox
                                id={craft}
                                checked={formData.requiredCraftsmen.includes(craft)}
                                onCheckedChange={(checked) => handleCraftsmenChange(craft, checked)}
                                className="data-[state=checked]:bg-zinc-800"
                              />
                              <Label htmlFor={craft} className="text-sm">
                                {craft}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                      
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="space-y-4 px-5 rounded-xl bg-gray-50 dark:bg-gray-800 shadow-sm"
                      >
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-5 w-5 text-green-500" />
                          <h3 className="font-semibold text-lg">Compensation</h3>
                        </div>

                        <div className="flex items-center space-x-2 mb-4">
                          <Checkbox
                            id="isPaid"
                            checked={formData.isPaid}
                            onCheckedChange={(checked) => setFormData({ ...formData, isPaid: checked })}
                            className="data-[state=checked]:bg-green-600"
                          />
                          <Label htmlFor="isPaid">This is a paid project</Label>
                        </div>

                        {formData.isPaid && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="space-y-2"
                          >
                            <Label htmlFor="pay">Pay Amount</Label>
                            <Input
                              id="pay"
                              name="pay"
                              type="number"
                              value={formData.pay}
                              onChange={handleChange}
                              placeholder="Enter pay amount"
                              required={formData.isPaid}
                            />
                          </motion.div>
                        )}
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="space-y-4 p-5 rounded-xl bg-gray-50 dark:bg-gray-800 shadow-sm"
                      >
                        <div className="flex items-center gap-2">
                          <Upload className="h-5 w-5 text-zinc-700" />
                          <h3 className="font-semibold text-lg">Media & References</h3>
                        </div>

                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="imgs">Upload Images</Label>
                            <Input
                              id="imgs"
                              name="imgs"
                              type="file"
                              accept="image/*"
                              multiple
                              onChange={handleFileChange}
                              className="cursor-pointer"
                            />
                          </div>
                        </div>
                      </motion.div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="flex justify-end space-x-3 pt-4 sticky bottom-0 bg-white dark:bg-gray-900 p-4 border-t dark:border-gray-800 -mx-6 -mb-6 rounded-br-2xl"
                  >
                    <Button variant="outline" onClick={() => setIsOpen(false)} type="button" className="rounded-full">
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="rounded-full bg-gradient-to-r from-gray-900 to-slate-800 hover:from-gray-800 hover:to-slate-700"
                    >
                      Post Collaboration
                    </Button>
                  </motion.div>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

