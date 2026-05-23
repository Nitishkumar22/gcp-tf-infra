import { useRef, useState, useEffect } from "react";
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Textarea } from "../../components/ui/textarea"
import { useDebounce } from "../../hooks/useDebounce"
import { cn } from "../../lib/utils"

const Step1 = ({ formData, updateFormData, errors }) => {

  const [coverImgPreview, setCoverImgPreview] = useState(null);
  const [profileImgPreview, setProfileImgPreview] = useState(null);
  const coverImgRef = useRef(null);
  const profileImgRef = useRef(null);

  const [usernameStatus, setUsernameStatus] = useState(null);
  const [usernameMessage, setUsernameMessage] = useState("");

  const debouncedUsername = useDebounce(formData.username, 500);

  useEffect(() => {
    const checkUsername = async () => {
      if (errors?.username || !debouncedUsername || debouncedUsername.length < 3) {
        setUsernameStatus(null);
        setUsernameMessage("");
        return;
      }
      
      setUsernameStatus('checking');
      setUsernameMessage("Checking availability...");
      
      try {
        const response = await fetch(
          `${import.meta.env.VITE_BASE_URL}/api/users/check-username?username=${debouncedUsername}`,
          {
            method: "GET",
            credentials: "include",
            headers: {
              "Accept": "application/json",
            }
          }
        );
        
        const data = await response.json();
        
        if (response.ok) {
          if (data.available) {
            setUsernameStatus('available');
            setUsernameMessage("Username is available!");
          } else {
            setUsernameStatus('taken');
            setUsernameMessage("Username is already taken.");
          }
        } else {
          if (!errors?.username) {
            setUsernameStatus('error');
            setUsernameMessage(data.error || "Error checking username.");
          }
        }
      } catch (error) {
        if (!errors?.username) {
            setUsernameStatus('error');
            setUsernameMessage("Error checking username.");
        }
        console.error("Username check error:", error);
      }
    };
    
    checkUsername();
  }, [debouncedUsername, errors?.username]);

  const handleChange = (e) => {
    const { name, value } = e.target
    updateFormData({ [name]: value })
    if (name === 'username') {
      setUsernameStatus(null);
      setUsernameMessage('');
    }
  }

  const handleFileChange = (e) => {
    const { name, files } = e.target
    updateFormData({ [name]: files[0] })
  }

  const handleImgChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
            updateFormData({ [type]: reader.result }); // Store Base64 string
            if (type === "profileImg") {
                setProfileImgPreview(reader.result);
            } else if (type === "coverImg") {
                setCoverImgPreview(reader.result);
            }
        };
        reader.readAsDataURL(file);
    }
};


  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
      <div className="space-y-1">
        <Label htmlFor="fullName" className="text-sm font-medium">
          Full Name <span className="text-red-500">*</span>
        </Label>
        <Input id="fullName" name="fullName" value={formData.fullName} onChange={handleChange} required className={cn(errors.fullName ? 'border-red-500 focus:ring-red-500' : '')} aria-invalid={!!errors.fullName} aria-describedby={errors.fullName ? "fullName-error" : undefined} />
        {errors.fullName && <p id="fullName-error" className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
      </div>

      <div className="space-y-1">
        <Label htmlFor="username" className="text-sm font-medium">
          Username <span className="text-red-500">*</span>
        </Label>
        <Input 
          id="username" 
          name="username" 
          value={formData.username} 
          onChange={handleChange} 
          required 
          className={cn(
            (errors.username || usernameStatus === 'taken') && 'border-red-500 focus:ring-red-500',
            usernameStatus === 'available' && !errors.username && 'border-green-500 focus:ring-green-500'
          )}
          aria-invalid={!!errors.username || usernameStatus === 'taken'}
          aria-describedby={errors.username ? "username-error-req" : (usernameMessage ? "username-error-avail" : undefined)}
        />
        {errors.username && <p id="username-error-req" className="text-red-500 text-xs mt-1">{errors.username}</p>}
        {!errors.username && usernameMessage && (
          <p
            id="username-error-avail"
            className={`text-xs mt-1 ${
              usernameStatus === 'available'
                ? 'text-green-600'
                : usernameStatus === 'taken'
                  ? 'text-red-500'
                  : 'text-gray-500'
            }`}
          >
            {usernameMessage}
          </p>
        )}
      </div>

      <div className="space-y-1">
        <Label htmlFor="email" className="text-sm font-medium">
          Email <span className="text-red-500">*</span>
        </Label>
        <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required className={cn(errors.email ? 'border-red-500 focus:ring-red-500' : '')} aria-invalid={!!errors.email} aria-describedby={errors.email ? "email-error" : undefined} />
        {errors.email && <p id="email-error" className="text-red-500 text-xs mt-1">{errors.email}</p>}
      </div>

      <div className="space-y-1">
        <Label htmlFor="password" className="text-sm font-medium">
          Password <span className="text-red-500">*</span>
        </Label>
        <Input
          id="password"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          required
          className={cn(errors.password ? 'border-red-500 focus:ring-red-500' : '')}
          aria-invalid={!!errors.password}
          aria-describedby={errors.password ? "password-error" : undefined}
        />
        {errors.password && <p id="password-error" className="text-red-500 text-xs mt-1">{errors.password}</p>}
      </div>

      <div className="space-y-1">
        <Label htmlFor="profileImg" className="text-sm font-medium">
          Profile Image
        </Label>
        <div className="flex items-center gap-4">
          {profileImgPreview && (
            <img src={profileImgPreview} alt="Profile Preview" className="w-16 h-16 object-cover rounded-full" />
          )}
          <Input id="profileImg" name="profileImg" type="file" ref={profileImgRef} onChange={(e) => handleImgChange(e, "profileImg")} accept="image/*" className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"/>
        </div>
      </div>

      <div className="space-y-1">
        <Label htmlFor="coverImg" className="text-sm font-medium">
          Cover Image
        </Label>
        <div>
          <Input id="coverImg" name="coverImg" type="file" ref={coverImgRef} onChange={(e) => handleImgChange(e, "coverImg")} accept="image/*" className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"/>
          {coverImgPreview && (
            <img src={coverImgPreview} alt="Cover Preview" className="mt-2 w-full h-32 object-cover rounded" />
          )}
        </div>
      </div>

      <div className="space-y-1 col-span-1 md:col-span-2">
        <Label htmlFor="bio" className="text-sm font-medium">
          Bio
        </Label>
        <Textarea id="bio" name="bio" value={formData.bio} onChange={handleChange} rows={3} className="resize-none" />
      </div>

      <div className="space-y-1 col-span-1 md:col-span-2">
        <Label htmlFor="link" className="text-sm font-medium">
          Website/Portfolio Link
        </Label>
        <Input
          id="link"
          name="link"
          type="url"
          value={formData.link}
          onChange={handleChange}
          placeholder="https://example.com"
          className={cn(errors.link ? 'border-red-500 focus:ring-red-500' : '')}
          aria-invalid={!!errors.link}
          aria-describedby={errors.link ? "link-error" : undefined}
        />
        {errors.link && <p id="link-error" className="text-red-500 text-xs">{errors.link}</p>}
      </div>
    </div>
  )
}

export default Step1

