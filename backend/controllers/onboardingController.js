const onboardingOptions = {
  // User profile related options
  profession: [
    "Director", 
    "Editor", 
    "Actor", 
    "Cinematographer", 
    "Producer",
    "Sound Designer",
    "Screenwriter",
    "VFX Artist",
    "Production Designer",
    "Video Editor",
    "Audio Mixer",
    "Voice Artist",
    "Other"
  ],
  experienceLevels: ["Beginner", "Intermediate", "Professional"],
  skills: [
    "Cinematography", 
    "VFX", 
    "Sound Editing", 
    "Screenwriting", 
    "Lighting", 
    "Color Grading",
    "Storyboarding",
    "Camera Operation",
    "Set Design",
    "Film Scoring"
  ],
  genres: [
    "Action", 
    "Drama", 
    "Comedy", 
    "Sci-Fi", 
    "Horror", 
    "Documentary",
    "Animation",
    "Thriller",
    "Romance",
    "Fantasy",
    "Other"
  ],
  interests: [
    "Filmmaking", 
    "Screenwriting", 
    "Editing", 
    "Cinematography", 
    "Sound Design", 
    "Production",
    "Visual Effects",
    "Film Theory",
    "Film History",
    "Independent Cinema"
  ],
  
  // Collab related options
  projectTypes: [
    "Short Film", 
    "Documentary", 
    "Music Video", 
    "Feature Film", 
    "Web Series", 
    "Commercial",
    "Corporate Video", 
    "Television",
    "Experimental",
    "Student Film",
    "Other"
  ],
  timePeriods: [
    "Less than a week", 
    "Less than a month", 
    "Less than 3 months", 
    "More than 3 months"
  ],
  requiredRoles: [
    "Director", 
    "Editor", 
    "Actor", 
    "Cinematographer", 
    "Producer",
    "Sound Designer",
    "Screenwriter",
    "VFX Artist",
    "Production Designer",
    "Video Editor",
    "Audio Mixer", 
    "Voice Artist",
    "Other"
  ],
  
  // Ad related options
  adCategories: [
    "Cameras and Accessories",
    "Lighting Equipment",
    "Audio Gear",
    "Storage and Memory",
    "Studio Setup",
    "Drones and Aerial Equipment",
    "Mobile Filmmaking",
    "Other"
  ],
  adSubcategories: {
    "Cameras and Accessories": ["DSLR", "Mirrorless", "Cinema Camera", "Action Camera", "Film Camera", "Lenses", "Filters", "Camera Accessories", "Other"],
    "Lighting Equipment": ["LED Panels", "Fresnel", "Ring Lights", "Light Stands", "Modifiers", "Gels", "Diffusers", "Reflectors", "Other"],
    "Audio Gear": ["Microphones", "Recorders", "Mixers", "Headphones", "Speakers", "Boom Poles", "Lavalier Mics", "Wireless Systems", "Other"],
    "Storage and Memory": ["Memory Cards", "External Drives", "SSDs", "RAID Systems", "Portable Storage", "Cloud Storage", "Other"],
    "Studio Setup": ["Tripods", "Gimbals", "Stabilizers", "Green Screens", "Backdrops", "Studio Monitors", "Teleprompters", "Other"],
    "Drones and Aerial Equipment": ["Camera Drones", "FPV Drones", "Drone Accessories", "Drone Batteries", "Controllers", "Other"],
    "Mobile Filmmaking": ["Smartphone Rigs", "Mobile Lenses", "Mobile Gimbals", "Mobile Microphones", "Mobile Lighting", "Other"],
  },
  currencies: ["USD", "EUR", "INR"],
  itemConditions: ["New", "Like New", "Good", "Fair", "Poor"],
  adStatuses: ["available", "pending", "sold", "reserved", "expired"],
  shippingMethods: ["Local Pickup", "Domestic Shipping", "International"],
  
  // ROH related options
  rohCategories: [
    "Cameras and Accessories",  
    "Lighting Equipment",
    "Audio Gear",
    "Storage and Memory",
    "Studio Setup",
    "Drones and Aerial Equipment",
    "Mobile Filmmaking",
    "Other"
  ],
  departments: [
    "Filmmaking", 
    "Photography", 
    "Audio Production", 
    "Post-Production", 
    "Other"
  ],
  rohStatuses: [
    "available", 
    "unavailable", 
    "lent", 
    "reserved"
  ],
  visibilityOptions: [
    "public", 
    "private", 
    "followers"
  ],
  
  // General equipment options (used across multiple features)
  equipmentOwned: [
    "Camera", 
    "Lighting", 
    "Sound", 
    "Editing Software", 
    "Drone", 
    "Stabilizer",
    "Lenses",
    "Audio Recorder",
    "Green Screen",
    "Microphones"
  ],
  
  // Project collaboration types
  preferredCollabTypes: [
    "Short Film", 
    "Documentary", 
    "Music Video", 
    "Feature Film", 
    "Web Series", 
    "Commercial",
    "Corporate Video",
    "Television",
    "Experimental",
    "Student Film"
  ]
};

// Route handler for API endpoint
const getOnboardingOptions = async (req, res) => {
  try {
    res.status(200).json(onboardingOptions);
  } catch (error) {
    console.error("Error in getOnboardingOptions:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Function to get options directly (for internal use)
const getOptions = () => {
  return onboardingOptions;
};

module.exports = { 
  getOnboardingOptions,  // API route handler
  getOptions,            // For internal use
  options: onboardingOptions  // Direct access to options
};

