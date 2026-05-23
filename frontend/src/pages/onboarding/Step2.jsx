import { Label } from "../../components/ui/label"
import { Input } from "../../components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"
import { Checkbox } from "../../components/ui/checkbox"
import { useQuery } from "@tanstack/react-query"

const Step2 = ({ formData, updateFormData, errors = {} }) => {
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

  const handleChange = (e) => {
    const { name, value } = e.target
    updateFormData({ [name]: value })
  }

  const handleSelectChange = (name, value) => {
    updateFormData({ [name]: value })
  }

  const handleMultiSelectChange = (name, value) => {
    const updatedValues = formData[name].includes(value)
      ? formData[name].filter((item) => item !== value)
      : [...formData[name], value]
    updateFormData({ [name]: updatedValues })
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-6">
        {/* Profession skeleton */}
        <div className="space-y-2">
          <div className="h-5 w-24 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-10 w-full bg-gray-200 rounded animate-pulse"></div>
        </div>
        
        {/* Experience level skeleton */}
        <div className="space-y-2">
          <div className="h-5 w-32 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-10 w-full bg-gray-200 rounded animate-pulse"></div>
        </div>
        
        {/* Skills skeleton */}
        <div className="space-y-2 col-span-2">
          <div className="h-5 w-16 bg-gray-200 rounded animate-pulse"></div>
          <div className="grid grid-cols-3 gap-2">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="flex items-center space-x-2">
                <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Genres skeleton */}
        <div className="space-y-2 col-span-2">
          <div className="h-5 w-16 bg-gray-200 rounded animate-pulse"></div>
          <div className="grid grid-cols-3 gap-2">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="flex items-center space-x-2">
                <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Location skeleton */}
        <div className="space-y-2">
          <div className="h-5 w-20 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-10 w-full bg-gray-200 rounded animate-pulse"></div>
        </div>
        
        {/* Collaboration checkbox skeleton */}
        <div className="flex items-center space-x-2">
          <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-4 w-48 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-6">
      <div className="space-y-2">
        <Label htmlFor="profession" className="text-sm font-medium">
          Profession<span className="text-red-500 ml-1">*</span>
        </Label>
        <Select name="profession" onValueChange={(value) => handleSelectChange("profession", value)}>
          <SelectTrigger className={errors.profession ? "border-red-500" : ""}>
            <SelectValue placeholder="Select profession" />
          </SelectTrigger>
          <SelectContent>
            {options?.profession?.map((profession) => (
              <SelectItem key={profession} value={profession.toLowerCase()}>
                {profession}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.profession && (
          <p className="text-sm text-red-500 mt-1">{errors.profession}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="experienceLevel" className="text-sm font-medium">
          Experience Level<span className="text-red-500 ml-1">*</span>
        </Label>
        <Select name="experienceLevel" onValueChange={(value) => handleSelectChange("experienceLevel", value)}>
          <SelectTrigger className={errors.experienceLevel ? "border-red-500" : ""}>
            <SelectValue placeholder="Select experience level" />
          </SelectTrigger>
          <SelectContent>
            {options?.experienceLevels?.map((level) => (
              <SelectItem key={level} value={level}>
                {level}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.experienceLevel && (
          <p className="text-sm text-red-500 mt-1">{errors.experienceLevel}</p>
        )}
      </div>

      <div className="space-y-2 col-span-2">
        <Label className="text-sm font-medium">Skills<span className="text-red-500 ml-1">*</span></Label>
        <div className={`grid grid-cols-3 gap-2 ${errors.skills ? "border rounded border-red-500 p-2" : ""}`}>
          {options?.skills?.map((skill) => (
            <div key={skill} className="flex items-center space-x-2">
              <Checkbox
                id={skill}
                checked={formData.skills.includes(skill)}
                onCheckedChange={() => handleMultiSelectChange("skills", skill)}
              />
              <label htmlFor={skill} className="text-sm">
                {skill}
              </label>
            </div>
          ))}
        </div>
        {errors.skills && (
          <p className="text-sm text-red-500 mt-1">{errors.skills}</p>
        )}
      </div>

      <div className="space-y-2 col-span-2">
        <Label className="text-sm font-medium">Genres<span className="text-red-500 ml-1">*</span></Label>
        <div className={`grid grid-cols-3 gap-2 ${errors.genres ? "border rounded border-red-500 p-2" : ""}`}>
          {options?.genres?.map((genre) => (
            <div key={genre} className="flex items-center space-x-2">
              <Checkbox
                id={genre}
                checked={formData.genres.includes(genre)}
                onCheckedChange={() => handleMultiSelectChange("genres", genre)}
              />
              <label htmlFor={genre} className="text-sm">
                {genre}
              </label>
            </div>
          ))}
        </div>
        {errors.genres && (
          <p className="text-sm text-red-500 mt-1">{errors.genres}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="location" className="text-sm font-medium">
          Location<span className="text-red-500 ml-1">*</span>
        </Label>
        <Input
          id="location"
          name="location"
          value={formData.location}
          onChange={handleChange}
          placeholder="City, Country"
          className={errors.location ? "border-red-500" : ""}
        />
        {errors.location && (
          <p className="text-sm text-red-500 mt-1">{errors.location}</p>
        )}
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="availableForCollaboration"
          checked={formData.availableForCollaboration}
          onCheckedChange={(checked) => updateFormData({ availableForCollaboration: checked })}
        />
        <Label htmlFor="availableForCollaboration" className="text-sm">
          Available for Collaboration
        </Label>
      </div>
    </div>
  )
}

export default Step2

