// Import models for database queries
const Ad = require('../models/adModel');
const Post = require('../models/postModel');
const Roh = require('../models/RohModel');
const Collab = require('../models/collabModel');

// Get onboardingOptions directly from the module
const onboardingController = require('./onboardingController');

// Filter options for different content types - using onboardingOptions as the source of truth
const generateFilterOptions = () => {
  // Get the onboarding options directly
  const options = onboardingController.options;
  
  return {
    // Post filter options
    posts: {
      sortBy: ['latest', 'popular', 'trending'],
      timeRange: ['today', 'this week', 'this month', 'all time'],
      contentType: ['text', 'image', 'all']
    },

    // Ad filter options - using onboardingOptions
    ads: {
      categories: options.adCategories,
      subcategories: options.adSubcategories,
      condition: options.itemConditions,
      currencies: options.currencies,
      priceRange: [
        { min: 0, max: 100, label: 'Under $100' },
        { min: 100, max: 500, label: '$100 - $500' },
        { min: 500, max: 1000, label: '$500 - $1,000' },
        { min: 1000, max: 5000, label: '$1,000 - $5,000' },
        { min: 5000, max: null, label: 'Over $5,000' }
      ],
      status: options.adStatuses,
      shippingMethods: options.shippingMethods,
      sortBy: ['newest', 'price-low-high', 'price-high-low', 'most-viewed']
    },

    // ROH filter options - using onboardingOptions
    rohs: {
      categories: options.rohCategories,
      departments: options.departments,
      type: ['for-rent', 'for-help'],
      status: options.rohStatuses,
      visibility: options.visibilityOptions,
      priceRange: [
        { min: 0, max: 50, label: 'Under $50/day' },
        { min: 50, max: 100, label: '$50 - $100/day' },
        { min: 100, max: 250, label: '$100 - $250/day' },
        { min: 250, max: 500, label: '$250 - $500/day' },
        { min: 500, max: null, label: 'Over $500/day' }
      ],
      rating: [1, 2, 3, 4, 5],
      sortBy: ['newest', 'price-low-high', 'price-high-low', 'highest-rated']
    },

    // Collab filter options - using onboardingOptions
    collabs: {
      projectTypes: options.projectTypes,
      genres: options.genres,
      paymentStatus: ['paid', 'unpaid', 'all'],
      timePeriods: options.timePeriods,
      requiredRoles: options.requiredRoles,
      deadlineRange: [
        { label: 'This week', days: 7 },
        { label: 'This month', days: 30 },
        { label: 'Next 3 months', days: 90 },
        { label: 'All time', days: null }
      ],
      sortBy: ['newest', 'deadline-soon', 'most-popular']
    },

    // Common filters that apply to all content types
    common: {
      location: ['nearby', 'remote', 'all'],
      dateRange: [
        { label: 'Today', days: 1 },
        { label: 'This week', days: 7 },
        { label: 'This month', days: 30 },
        { label: 'This year', days: 365 },
        { label: 'All time', days: null }
      ]
    }
  };
};

// Get all filter options
const getFilterOptions = async (req, res) => {
  try {
    const filterOptions = generateFilterOptions();
    res.status(200).json(filterOptions);
  } catch (error) {
    console.error("Error in getFilterOptions:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Get filter options for a specific content type
const getFilterOptionsForType = async (req, res) => {
  const { type } = req.params;
  
  try {
    const filterOptions = generateFilterOptions();
    
    if (!filterOptions[type]) {
      return res.status(404).json({ error: `Filter options for ${type} not found` });
    }
    
    // Return specific filter options along with common filters
    res.status(200).json({
      ...filterOptions[type],
      common: filterOptions.common
    });
  } catch (error) {
    console.error(`Error in getFilterOptionsForType (${type}):`, error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Apply filters to posts
const filterPosts = async (req, res) => {
  try {
    const { sortBy, timeRange, contentType } = req.query;
    const filterOptions = generateFilterOptions();
    
    // Build query
    let query = {};
    
    // Apply time range filter
    if (timeRange && timeRange !== 'all time') {
      const dateFilters = {
        'today': 1,
        'this week': 7,
        'this month': 30
      };
      
      if (dateFilters[timeRange]) {
        const date = new Date();
        date.setDate(date.getDate() - dateFilters[timeRange]);
        query.createdAt = { $gte: date };
      }
    }
    
    // Apply content type filter
    if (contentType === 'text') {
      query.imgs = { $size: 0 };
    } else if (contentType === 'image') {
      query.imgs = { $not: { $size: 0 } };
    }
    
    // Build sort options
    let sortOptions = { createdAt: -1 }; // Default: latest
    
    if (sortBy === 'popular') {
      sortOptions = { 'likes.length': -1 };
    } else if (sortBy === 'trending') {
      // For trending, we could combine recent posts with high engagement
      // This is a simplified version
      sortOptions = { 'likes.length': -1, createdAt: -1 };
    }
    
    // Execute query
    const posts = await Post.find(query)
      .sort(sortOptions)
      .populate('user', 'username fullName profileImg')
      .limit(20);
    
    res.status(200).json(posts);
  } catch (error) {
    console.error("Error in filterPosts:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Apply filters to ads
const filterAds = async (req, res) => {
  try {
    const { 
      category, subcategory, condition, 
      minPrice, maxPrice, status, sortBy 
    } = req.query;
    const filterOptions = generateFilterOptions();
    
    // Build query
    let query = {};
    
    // Apply category filter
    if (category && category !== 'All') {
      query.category = category;
    }
    
    // Apply subcategory filter
    if (subcategory) {
      query.subcategory = { $in: [subcategory] };
    }
    
    // Apply condition filter
    if (condition) {
      query.condition = condition;
    }
    
    // Apply price range filter
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    
    // Apply status filter
    if (status) {
      query.status = status;
    }
    
    // Build sort options
    let sortOptions = { createdAt: -1 }; // Default: newest
    
    if (sortBy === 'price-low-high') {
      sortOptions = { price: 1 };
    } else if (sortBy === 'price-high-low') {
      sortOptions = { price: -1 };
    } else if (sortBy === 'most-viewed') {
      sortOptions = { views: -1 };
    }
    
    // Execute query
    const ads = await Ad.find(query)
      .sort(sortOptions)
      .populate('user', 'username fullName profileImg')
      .limit(20);
    
    res.status(200).json(ads);
  } catch (error) {
    console.error("Error in filterAds:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Apply filters to ROHs
const filterRohs = async (req, res) => {
  try {
    const { 
      category, department, type, status,
      minPrice, maxPrice, rating, sortBy 
    } = req.query;
    const filterOptions = generateFilterOptions();
    
    // Build query
    let query = {};
    
    // Apply category filter
    if (category) {
      query.category = category;
    }
    
    // Apply department filter
    if (department) {
      query.department = department;
    }
    
    // Apply type filter (for-rent or for-help)
    if (type === 'for-rent') {
      query.isForHelp = false;
    } else if (type === 'for-help') {
      query.isForHelp = true;
    }
    
    // Apply status filter
    if (status) {
      query.status = status;
    }
    
    // Apply price range filter (for rentals)
    if (type !== 'for-help' && (minPrice || maxPrice)) {
      query.rentPrice = {};
      if (minPrice) query.rentPrice.$gte = Number(minPrice);
      if (maxPrice) query.rentPrice.$lte = Number(maxPrice);
    }
    
    // Apply rating filter
    if (rating) {
      query.averageRating = { $gte: Number(rating) };
    }
    
    // Build sort options
    let sortOptions = { createdAt: -1 }; // Default: newest
    
    if (sortBy === 'price-low-high') {
      sortOptions = { rentPrice: 1 };
    } else if (sortBy === 'price-high-low') {
      sortOptions = { rentPrice: -1 };
    } else if (sortBy === 'highest-rated') {
      sortOptions = { averageRating: -1 };
    }
    
    // Execute query
    const rohs = await Roh.find(query)
      .sort(sortOptions)
      .populate('user', 'username fullName profileImg')
      .limit(20);
    
    res.status(200).json(rohs);
  } catch (error) {
    console.error("Error in filterRohs:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Apply filters to collabs
const filterCollabs = async (req, res) => {
  try {
    const { 
      projectType, genre, paymentStatus,
      timePeriod, requiredRole, deadlineDays, sortBy 
    } = req.query;
    const filterOptions = generateFilterOptions();
    
    // Build query
    let query = {};
    
    // Apply project type filter
    if (projectType) {
      query.projectType = projectType;
    }
    
    // Apply genre filter
    if (genre) {
      query.genres = { $in: [genre] };
    }
    
    // Apply payment status filter
    if (paymentStatus && paymentStatus !== 'all') {
      query.isPaid = paymentStatus === 'paid';
    }
    
    // Apply time period filter
    if (timePeriod) {
      query.timePeriod = timePeriod;
    }
    
    // Apply required role filter
    if (requiredRole) {
      query.requiredCraftsmen = { $in: [requiredRole] };
    }
    
    // Apply deadline filter
    if (deadlineDays && deadlineDays !== 'all') {
      const date = new Date();
      date.setDate(date.getDate() + Number(deadlineDays));
      query.deadline = { $lte: date };
    }
    
    // Build sort options
    let sortOptions = { createdAt: -1 }; // Default: newest
    
    if (sortBy === 'deadline-soon') {
      sortOptions = { deadline: 1 };
    } else if (sortBy === 'most-popular') {
      // For popularity, we could use the number of join requests
      sortOptions = { 'joinRequests.length': -1 };
    }
    
    // Execute query
    const collabs = await Collab.find(query)
      .sort(sortOptions)
      .populate('user', 'username fullName profileImg')
      .limit(20);
    
    res.status(200).json(collabs);
  } catch (error) {
    console.error("Error in filterCollabs:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = {
  getFilterOptions,
  getFilterOptionsForType,
  filterPosts,
  filterAds,
  filterRohs,
  filterCollabs
};
