import { Label } from "../../components/ui/label"
import { Input } from "../../components/ui/input"
import { Checkbox } from "../../components/ui/checkbox"
import { Button } from "../../components/ui/button"
import { X } from "lucide-react"
import { useQuery } from "@tanstack/react-query"

const Step3 = ({ formData, updateFormData, errors = {} }) => {
  const { data: options, isLoading } = useQuery({
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
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch onboarding options");
      }

      return response.json();
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    cacheTime: 1000 * 60 * 10, // 10 minutes
  });

  const handleMultiSelectChange = (name, value) => {
    const updatedValues = formData[name].includes(value)
      ? formData[name].filter((item) => item !== value)
      : [...formData[name], value]
    updateFormData({ [name]: updatedValues })
  }

  const handleArrayInputChange = (e, index, field) => {
    const newArray = [...formData[field]]
    newArray[index] = e.target.value
    updateFormData({ [field]: newArray })
  }

  const addArrayItem = (field) => {
    updateFormData({ [field]: [...formData[field], ""] })
  }

  const removeArrayItem = (index, field) => {
    const newArray = formData[field].filter((_, i) => i !== index)
    updateFormData({ [field]: newArray })
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Interests skeleton */}
        <div className="space-y-2">
          <div className="h-5 w-20 bg-gray-200 rounded animate-pulse"></div>
          <div className="grid grid-cols-3 gap-2">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="flex items-center space-x-2">
                <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Collaboration Types skeleton */}
        <div className="space-y-2">
          <div className="h-5 w-48 bg-gray-200 rounded animate-pulse"></div>
          <div className="grid grid-cols-3 gap-2">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="flex items-center space-x-2">
                <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Past Projects skeleton */}
        <div className="space-y-2">
          <div className="h-5 w-28 bg-gray-200 rounded animate-pulse"></div>
          {[...Array(2)].map((_, i) => (
            <div key={i} className="flex items-center space-x-2 mb-2">
              <div className="h-10 flex-grow bg-gray-200 rounded animate-pulse"></div>
              <div className="h-10 w-10 bg-gray-200 rounded animate-pulse"></div>
            </div>
          ))}
          <div className="h-9 w-28 bg-gray-200 rounded animate-pulse"></div>
        </div>
        
        {/* Equipment Owned skeleton */}
        <div className="space-y-2">
          <div className="h-5 w-32 bg-gray-200 rounded animate-pulse"></div>
          <div className="grid grid-cols-3 gap-2">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="flex items-center space-x-2">
                <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label className="text-sm font-medium">Interests<span className="text-red-500 ml-1">*</span></Label>
        <div className={`grid grid-cols-3 gap-2 ${errors.interests ? "border rounded border-red-500 p-2" : ""}`}>
          {options?.interests?.map((interest) => (
            <div key={interest} className="flex items-center space-x-2">
              <Checkbox
                id={interest}
                checked={formData.interests.includes(interest)}
                onCheckedChange={() => handleMultiSelectChange("interests", interest)}
              />
              <label htmlFor={interest} className="text-sm">
                {interest}
              </label>
            </div>
          ))}
        </div>
        {errors.interests && (
          <p className="text-sm text-red-500 mt-1">{errors.interests}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium">Preferred Collaboration Types<span className="text-red-500 ml-1">*</span></Label>
        <div className={`grid grid-cols-3 gap-2 ${errors.preferredCollabTypes ? "border rounded border-red-500 p-2" : ""}`}>
          {options?.preferredCollabTypes?.map((type) => (
            <div key={type} className="flex items-center space-x-2">
              <Checkbox
                id={type}
                checked={formData.preferredCollabTypes.includes(type)}
                onCheckedChange={() => handleMultiSelectChange("preferredCollabTypes", type)}
              />
              <label htmlFor={type} className="text-sm">
                {type}
              </label>
            </div>
          ))}
        </div>
        {errors.preferredCollabTypes && (
          <p className="text-sm text-red-500 mt-1">{errors.preferredCollabTypes}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium">Past Projects</Label>
        {formData.pastProjects.map((project, index) => (
          <div key={index} className="flex items-center space-x-2 mb-2">
            <Input
              value={project}
              onChange={(e) => handleArrayInputChange(e, index, "pastProjects")}
              placeholder="Project URL"
              className="flex-grow"
            />
            <Button type="button" variant="outline" size="icon" onClick={() => removeArrayItem(index, "pastProjects")}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
        <Button type="button" onClick={() => addArrayItem("pastProjects")} variant="outline" size="sm">
          Add Project
        </Button>
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium">Equipment Owned</Label>
        <div className={`grid grid-cols-3 gap-2 ${errors.equipmentOwned ? "border rounded border-red-500 p-2" : ""}`}>
          {options?.equipmentOwned?.map((equipment) => (
            <div key={equipment} className="flex items-center space-x-2">
              <Checkbox
                id={equipment}
                checked={formData.equipmentOwned.includes(equipment)}
                onCheckedChange={() => handleMultiSelectChange("equipmentOwned", equipment)}
              />
              <label htmlFor={equipment} className="text-sm">
                {equipment}
              </label>
            </div>
          ))}
        </div>
        {errors.equipmentOwned && (
          <p className="text-sm text-red-500 mt-1">{errors.equipmentOwned}</p>
        )}
      </div>
    </div>
  )
}

export default Step3

