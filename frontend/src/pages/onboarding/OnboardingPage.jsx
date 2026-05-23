"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowLeft, Check, User, Briefcase, Settings, Loader2 } from "lucide-react"
import { cn } from "../../lib/utils"
import Step1 from "./Step1"
import Step2 from "./Step2"
import Step3 from "./Step3"
import { useToast } from "../../hooks/use-toast"
import { useNavigate } from "react-router-dom"
import { useQueryClient, useMutation } from "@tanstack/react-query"

const steps = [
  {
    title: "Basic Information",
    icon: User,
    description: "Create your profile",
  },
  {
    title: "Professional Details",
    icon: Briefcase,
    description: "Your work preferences",
  },
  {
    title: "Additional Info",
    icon: Settings,
    description: "Final touches",
  },
]

const OnboardingForm = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const [step, setStep] = useState(0)
  const [errors, setErrors] = useState({})
  const [isLoadingOptions, setIsLoadingOptions] = useState(true)
  const [optionsLoaded, setOptionsLoaded] = useState(false)

  // Get the existing user data from React Query cache
  const existingUserData = queryClient.getQueryData(["authUser"])

  // Load saved form data from sessionStorage on component mount
  const [formData, setFormData] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedData = sessionStorage.getItem('onboardingFormData');
      if (savedData) return JSON.parse(savedData);
    }
    return {
      fullName: "",
      username: "",
      email: "",
      password: "",
      profileImg: null,
      coverImg: null,
      bio: "",
      link: "",
      profession: "",
      skills: [],
      genres: [],
      location: "",
      experienceLevel: "",
      interests: [],
      preferredCollabTypes: [],
      equipmentOwned: [],
      pastProjects: [],
    };
  })

  // Pre-fill form data when component mounts
  useEffect(() => {
    if (existingUserData) {
      setFormData(prev => ({
        ...prev,
        fullName: existingUserData.fullName || "",
        username: existingUserData.username || "",
        email: existingUserData.email || "",
        password: sessionStorage.getItem('tempPassword') || "",
      }))
    }
  }, [existingUserData])

  // Prefetch the options to ensure they're cached for the child components
  useEffect(() => {
    const prefetchOptions = async () => {
      if (optionsLoaded) return;
      
      try {
        setIsLoadingOptions(true);
        // Use queryClient to prefetch the options
        await queryClient.prefetchQuery({
          queryKey: ['onboardingOptions'],
          queryFn: async () => {
            const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/onboarding/options`, {
              credentials: 'include',
              headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
              }
            });
            
            if (!response.ok) {
              throw new Error("Failed to fetch onboarding options");
            }
            
            return response.json();
          },
        });
        setOptionsLoaded(true);
      } catch (error) {
        console.error("Error prefetching onboarding options:", error);
      } finally {
        setIsLoadingOptions(false);
      }
    };

    prefetchOptions();
  }, [optionsLoaded, queryClient]);

  const updateFormData = (newData) => {
    setFormData((prev) => {
      const updatedData = { ...prev, ...newData };
      // Save to sessionStorage whenever form data is updated
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('onboardingFormData', JSON.stringify(updatedData));
      }
      return updatedData;
    });
  }

  const handleNext = () => {
    // Validation for Step 1 fields before proceeding
    if (step === 0) {
      const { fullName, username, email, password } = formData;
      const newErrors = {};

      if (!fullName.trim()) newErrors.fullName = "Full Name is required";
      if (!username.trim()) newErrors.username = "Username is required";
      // Keep existing username availability check logic in Step1 for real-time feedback
      if (!email.trim()) {
        newErrors.email = "Email is required";
      } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          newErrors.email = "Invalid email format";
        }
      }

      if (!password.trim()) {
         newErrors.password = "Password is required";
       } else if (password.length < 6) {
         newErrors.password = "Password must be at least 6 characters";
       }

       setErrors(newErrors);

       // Prevent proceeding to the next step if errors exist
       if (Object.keys(newErrors).length > 0) {
         return;
       }

      // Note: Username availability check is still best handled within Step1
      // for immediate feedback, but final check could happen here or on submit.
      // We removed the toast errors for basic required fields.
    }
    
    // Validation for Step 2 fields
    if (step === 1) {
      const { profession, experienceLevel, skills, genres, location } = formData;
      const newErrors = {};
      
      if (!profession) {
        newErrors.profession = "Please select a profession";
      }
      
      if (!experienceLevel) {
        newErrors.experienceLevel = "Please select your experience level";
      }
      
      if (skills.length === 0) {
        newErrors.skills = "Please select at least one skill";
      }
      
      if (genres.length === 0) {
        newErrors.genres = "Please select at least one genre";
      }
      
      if (!location.trim()) {
        newErrors.location = "Please enter your location";
      }
      
      setErrors(newErrors);
      
      // Prevent proceeding to the next step if errors exist
      if (Object.keys(newErrors).length > 0) {
        toast({
          variant: "destructive",
          title: "Validation Error",
          description: "Please fill in all required fields"
        });
        return;
      }
    }
    
    // Validation for Step 3 fields
    if (step === 2) {
      const { interests, preferredCollabTypes, equipmentOwned } = formData;
      const newErrors = {};
      
      if (interests.length === 0) {
        newErrors.interests = "Please select at least one interest";
      }
      
      if (preferredCollabTypes.length === 0) {
        newErrors.preferredCollabTypes = "Please select at least one collaboration type";
      }
      
      if (equipmentOwned.length === 0) {
        newErrors.equipmentOwned = "Please select at least one equipment item";
      }
      
      setErrors(newErrors);
      
      // Don't proceed with submission if errors exist
      if (Object.keys(newErrors).length > 0) {
        toast({
          variant: "destructive",
          title: "Validation Error",
          description: "Please fill in all required fields"
        });
        return;
      }
    }
    
    // All validations passed, proceed to next step
    setStep((prev) => Math.min(prev + 1, 2))
  }

  const handleBack = () => {
    setStep((prev) => Math.max(prev - 1, 0))
  }

  // Create mutation for onboarding submission
  const onboardingMutation = useMutation({
    cacheTime: 1000 * 60 * 10, // 10 minutes
    staleTime: 1000 * 60 * 5,  // 5 minutes
    retry: 2,
    retryDelay: 1000,
    mutationFn: async (data) => {
      const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/auth/onboarding`, {
        method: "POST",
        credentials: "include",
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to complete onboarding")
      }

      return response.json()
    },
    onSuccess: (data) => {
      if (!data.username) {
        throw new Error("Username is missing from the response!")
      }

      // Invalidate and refetch user data
      queryClient.invalidateQueries(["authUser"])
      
      toast({
        title: "Success",
        description: "Onboarding completed successfully!"
      })
      navigate(`/profile/${data.username}`) 
    },
    onError: (error) => {
      console.error("Error during onboarding submission:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Onboarding failed"
      })
    }
  })

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validation for Step 3 fields if current step is 2
    if (step === 2) {
      const { interests, preferredCollabTypes, equipmentOwned } = formData;
      const newErrors = {};
      
      if (interests.length === 0) {
        newErrors.interests = "Please select at least one interest";
      }
      
      if (preferredCollabTypes.length === 0) {
        newErrors.preferredCollabTypes = "Please select at least one collaboration type";
      }
      // equipmentOwned validation removed
      
      setErrors(newErrors); // Update errors state for UI display
      
      // Don't proceed with submission if Step 3 errors exist
      if (Object.keys(newErrors).length > 0) {
        toast({
          variant: "destructive",
          title: "Validation Error",
          description: "Please fill in all required fields for Step 3."
        });
        return;
      }
    }

    // Final validation for basic required fields (should ideally be covered by Step 1 validation)
    const { fullName, username, email, password } = formData;
    
    // Validate Full Name
    if (!fullName || fullName.trim().length < 2) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please enter a valid Full Name (at least 2 characters)."
      });
      return; // Prevent submission
    }
    
    if (!username || !email || !password) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please ensure Username, Email, and Password are provided."
      });
      return; // Prevent submission
    }
    // Add other necessary final checks if needed
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please enter a valid email address."
      });
      return;
    }
    if (password.length < 6) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Password must be at least 6 characters long."
      });
      return;
    }

    // Remove empty fields before sending
    const sanitizedData = Object.fromEntries(
      Object.entries(formData).filter(([_, value]) => value !== "" && value !== null)
    )

    onboardingMutation.mutate(sanitizedData)
    
      // Clear the temporary password and form data after successful submission
    sessionStorage.removeItem('tempPassword');
    sessionStorage.removeItem('onboardingFormData');
  }


  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="w-full max-w-[1300px] min-h-[800px] mx-16 lg:mx-0 flex flex-col lg:flex-row">
        {/* Header for mobile */}
        <div className="lg:hidden p-6">
          <button className="flex items-center text-sm text-gray-600">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to dashboard
          </button>
        </div>

        {/* Progress Section */}
        <motion.div
          className="w-full lg:w-80 p-6 lg:py-8 px-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {/* Back button for desktop */}
          <div className="hidden lg:flex items-center text-sm text-gray-600 mb-12">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to dashboard
          </div>

          {/* Progress Steps */}
          <div className="flex lg:flex-col gap-4 lg:gap-8">
            {steps.map((s, i) => {
              const Icon = s.icon
              return (
                <div key={i} className="flex items-start flex-1 lg:flex-none">
                  <div className="relative flex flex-col items-center">
                    <div className="relative flex items-center">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.3, delay: i * 0.1 }}
                        className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors duration-300",
                          i === step
                            ? "border-gray-900 bg-gray-50"
                            : i < step
                              ? "border-gray-900 bg-gray-900"
                              : "border-gray-200 bg-white",
                        )}
                      >
                        {i < step ? (
                          <Check className="h-4 w-4 text-white" />
                        ) : (
                          <Icon className={cn("h-4 w-4", i === step ? "text-gray-900" : "text-gray-400")} />
                        )}
                      </motion.div>
                      {/* Horizontal line for mobile/tablet */}
                      {i < steps.length - 1 && (
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: "80px" }}
                          transition={{ duration: 0.9, delay: i * 0.5 }}
                          className={cn(
                            "lg:hidden absolute left-full top-1/2 -translate-y-1/2 h-0.5 ml-2", // Position line relative to icon
                            i < step ? "bg-gray-900" : "bg-gray-200"
                          )}
                        />
                      )}
                    </div>
                    
                    {/* Vertical line for desktop */}
                    {i < steps.length - 1 && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: "12px" }}
                        transition={{ duration: 0.3, delay: i * 0.1 }}
                        className={cn(
                          "hidden lg:block absolute top-8 left-1/2 w-0.5 transition-colors duration-300",
                          i < step ? "bg-gray-900" : "bg-gray-200",
                        )}
                      />
                    )}
                    {/* Badge for Step Title */}
                    <div className="lg:hidden mt-2 text-nowrap">
                      <span className="bg-slate-50 text-gray-700 text-xs font-medium px-2 py-1 rounded-full">
                        {s.title}
                      </span>
                    </div>
                  </div>
                  <div className="ml-4 hidden lg:block">
                    <h3
                      className={cn(
                        "font-medium transition-colors duration-300",
                        i === step ? "text-gray-900" : i < step ? "text-gray-700" : "text-gray-400",
                      )}
                    >
                      {s.title}
                    </h3>
                    <p className="text-sm text-gray-500">{s.description}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </motion.div>

        {/* Form Content */}
        <motion.div
          className="flex-1 p-6 lg:mt-12 lg:p-12 lg:max-w-[800px]"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3 }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="h-full flex flex-col"
            >
              <div className="flex-1">
                <div> 
                  <h2 className="text-2xl font-semibold mb-1">{steps[step].title}</h2>
                  <p className="text-gray-500 mb-8">{steps[step].description}</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6 lg:pl-6">
                  {step === 0 && <Step1 formData={formData} updateFormData={updateFormData} errors={errors} />}
                  {step === 1 && <Step2 formData={formData} updateFormData={updateFormData} errors={errors} />}
                  {step === 2 && <Step3 formData={formData} updateFormData={updateFormData} errors={errors} />}
                </form>
              </div>

              <div className="flex justify-between pt-6">
                <button
                  type="button"
                  onClick={handleBack}
                  className={cn(
                    "px-6 py-2 rounded-lg text-sm font-medium transition-colors",
                    step === 0 ? "invisible" : "text-gray-600 hover:bg-gray-100",
                  )}
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={step === 2 ? handleSubmit : handleNext}
                  disabled={onboardingMutation.isLoading}
                  className="px-8 py-3 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-sm font-semibold hover:from-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-300 ease-in-out shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                >
                  {step === 2 ? (
                    onboardingMutation.isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <span className="inline-flex items-center">
                        Complete
                        <Check className="ml-2 h-4 w-4" />
                      </span>
                    )
                  ) : (
                    "Continue"
                  )}
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  )
}

export default OnboardingForm

