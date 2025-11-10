import type { Template } from './engine';

// Re-export Template type for use in other files
export type { Template };

// Business Templates
export const BUSINESS_TEMPLATES: Template[] = [
  {
    id: 'saas-startup',
    name: 'SaaS Startup Business Plan',
    description: 'Comprehensive business plan for software-as-a-service startups',
    category: 'business',
    icon: '🚀',
    variables: [
      {
        id: 'companyName',
        name: 'companyName',
        label: 'Company Name',
        type: 'text',
        placeholder: 'e.g., TechVenture Inc',
        required: true,
      },
      {
        id: 'problem',
        name: 'problem',
        label: 'Problem Statement',
        type: 'textarea',
        placeholder: 'What problem does your SaaS solve?',
        required: true,
      },
      {
        id: 'targetMarket',
        name: 'targetMarket',
        label: 'Target Market',
        type: 'text',
        placeholder: 'e.g., Small businesses, Enterprise',
        required: true,
      },
      {
        id: 'fundingRequired',
        name: 'fundingRequired',
        label: 'Funding Required ($)',
        type: 'number',
        placeholder: '500000',
        required: true,
      },
      {
        id: 'teamSize',
        name: 'teamSize',
        label: 'Current Team Size',
        type: 'number',
        placeholder: '3',
        required: false,
      },
    ],
    sections: [
      {
        title: 'Executive Summary',
        prompt: `Write an executive summary for a SaaS startup called "{{companyName}}" that solves the following problem: {{problem}}.
                 Target market: {{targetMarket}}. Funding required: ${{fundingRequired}}.
                 Make it compelling and concise (150-200 words).`,
        placeholders: ['companyName', 'problem', 'targetMarket', 'fundingRequired'],
      },
      {
        title: 'Market Analysis',
        prompt: `Analyze the market for a SaaS solution in the "{{targetMarket}}" space addressing {{problem}}.
                 Provide TAM (Total Addressable Market), market trends, and competitive landscape.`,
        placeholders: ['targetMarket', 'problem'],
      },
      {
        title: 'Product & Solution',
        prompt: `Describe the product solution for {{companyName}}. Explain key features, technology stack, and how it solves {{problem}}.`,
        placeholders: ['companyName', 'problem'],
      },
      {
        title: 'Go-to-Market Strategy',
        prompt: `Create a go-to-market strategy for {{companyName}} to reach {{targetMarket}}. Include marketing channels,
                 customer acquisition cost, and pricing strategy.`,
        placeholders: ['companyName', 'targetMarket'],
      },
      {
        title: 'Financial Projections',
        prompt: `Create 3-year financial projections (revenue, expenses, profitability) for {{companyName}} with funding of ${{fundingRequired}}.
                 Include assumptions and key metrics.`,
        placeholders: ['companyName', 'fundingRequired'],
      },
      {
        title: 'Use of Funds',
        prompt: `Breakdown the allocation of ${{fundingRequired}} funding for {{companyName}}. Include team, product development,
                 marketing, operations, and contingency.`,
        placeholders: ['fundingRequired', 'companyName'],
      },
    ],
  },
  {
    id: 'restaurant',
    name: 'Restaurant Business Plan',
    description: 'Business plan template for opening a restaurant',
    category: 'business',
    icon: '🍽️',
    variables: [
      {
        id: 'restaurantName',
        name: 'restaurantName',
        label: 'Restaurant Name',
        type: 'text',
        placeholder: 'e.g., The Modern Kitchen',
        required: true,
      },
      {
        id: 'cuisine',
        name: 'cuisine',
        label: 'Cuisine Type',
        type: 'text',
        placeholder: 'e.g., Italian, Fusion, Farm-to-table',
        required: true,
      },
      {
        id: 'location',
        name: 'location',
        label: 'Location/City',
        type: 'text',
        placeholder: 'e.g., San Francisco, Downtown',
        required: true,
      },
      {
        id: 'seatingCapacity',
        name: 'seatingCapacity',
        label: 'Seating Capacity',
        type: 'number',
        placeholder: '80',
        required: true,
      },
      {
        id: 'startupCost',
        name: 'startupCost',
        label: 'Estimated Startup Cost ($)',
        type: 'number',
        placeholder: '250000',
        required: true,
      },
    ],
    sections: [
      {
        title: 'Restaurant Concept',
        prompt: `Describe the concept for {{restaurantName}}, a {{cuisine}} restaurant in {{location}} with {{seatingCapacity}} seats.
                 Include ambiance, target customer, and unique selling proposition.`,
        placeholders: ['restaurantName', 'cuisine', 'location', 'seatingCapacity'],
      },
      {
        title: 'Location & Facilities',
        prompt: `Detail the location strategy for {{restaurantName}} in {{location}}. Discuss foot traffic, parking, visibility,
                 and facility requirements.`,
        placeholders: ['restaurantName', 'location'],
      },
      {
        title: 'Menu & Pricing',
        prompt: `Create a sample menu strategy for {{restaurantName}} featuring {{cuisine}} cuisine. Include pricing,
                 food cost analysis, and margin targets.`,
        placeholders: ['restaurantName', 'cuisine'],
      },
      {
        title: 'Staffing Plan',
        prompt: `Outline the staffing requirements for {{restaurantName}} with {{seatingCapacity}} seats. Include positions,
                 salaries, training, and culture.`,
        placeholders: ['restaurantName', 'seatingCapacity'],
      },
      {
        title: 'Marketing & Promotion',
        prompt: `Create a marketing plan for {{restaurantName}}. Include local marketing, social media, grand opening,
                 and customer retention strategies.`,
        placeholders: ['restaurantName'],
      },
      {
        title: 'Startup Costs & Funding',
        prompt: `Break down the ${{startupCost}} startup cost for {{restaurantName}}. Include buildout, equipment,
                 permits, initial inventory, and working capital.`,
        placeholders: ['startupCost', 'restaurantName'],
      },
    ],
  },
  {
    id: 'consulting-firm',
    name: 'Consulting Firm Business Plan',
    description: 'Business plan for launching a professional consulting firm',
    category: 'business',
    icon: '💼',
    variables: [
      {
        id: 'firmName',
        name: 'firmName',
        label: 'Firm Name',
        type: 'text',
        placeholder: 'e.g., Strategic Advisors LLC',
        required: true,
      },
      {
        id: 'specialization',
        name: 'specialization',
        label: 'Specialization/Expertise',
        type: 'text',
        placeholder: 'e.g., Digital Transformation, Operations, Strategy',
        required: true,
      },
      {
        id: 'targetClients',
        name: 'targetClients',
        label: 'Target Client Type',
        type: 'select',
        options: ['SMB', 'Mid-market', 'Enterprise', 'All'],
        required: true,
      },
      {
        id: 'consultantsCount',
        name: 'consultantsCount',
        label: 'Number of Consultants',
        type: 'number',
        placeholder: '3',
        required: true,
      },
      {
        id: 'yearOneRevenue',
        name: 'yearOneRevenue',
        label: 'Year 1 Revenue Target ($)',
        type: 'number',
        placeholder: '300000',
        required: true,
      },
    ],
    sections: [
      {
        title: 'Executive Summary',
        prompt: `Write an executive summary for {{firmName}}, a consulting firm specializing in {{specialization}} for {{targetClients}} clients.`,
        placeholders: ['firmName', 'specialization', 'targetClients'],
      },
      {
        title: 'Services & Offerings',
        prompt: `Detail the consulting services offered by {{firmName}} in {{specialization}}. Include service lines,
                 methodologies, and engagement models.`,
        placeholders: ['firmName', 'specialization'],
      },
      {
        title: 'Go-to-Market Strategy',
        prompt: `Create a go-to-market strategy for {{firmName}} to acquire {{targetClients}} clients. Include business development,
                 partnerships, and thought leadership.`,
        placeholders: ['firmName', 'targetClients'],
      },
      {
        title: 'Team & Capabilities',
        prompt: `Outline the team structure for {{firmName}} with {{consultantsCount}} consultants. Include expertise,
                 experience, and roles.`,
        placeholders: ['firmName', 'consultantsCount'],
      },
      {
        title: 'Financial Model',
        prompt: `Create a financial model for {{firmName}} targeting ${{yearOneRevenue}} in Year 1 revenue.
                 Include utilization rates, billable rates, and profitability.`,
        placeholders: ['firmName', 'yearOneRevenue'],
      },
    ],
  },
];

// Education Templates
export const EDUCATION_TEMPLATES: Template[] = [
  {
    id: 'programming-course',
    name: 'Programming Course Curriculum',
    description: 'Complete curriculum for a programming course',
    category: 'education',
    icon: '💻',
    variables: [
      {
        id: 'courseName',
        name: 'courseName',
        label: 'Course Name',
        type: 'text',
        placeholder: 'e.g., Python Fundamentals',
        required: true,
      },
      {
        id: 'language',
        name: 'language',
        label: 'Programming Language',
        type: 'text',
        placeholder: 'e.g., Python, JavaScript, Go',
        required: true,
      },
      {
        id: 'level',
        name: 'level',
        label: 'Difficulty Level',
        type: 'select',
        options: ['Beginner', 'Intermediate', 'Advanced'],
        required: true,
      },
      {
        id: 'duration',
        name: 'duration',
        label: 'Course Duration (weeks)',
        type: 'number',
        placeholder: '8',
        required: true,
      },
      {
        id: 'targetAudience',
        name: 'targetAudience',
        label: 'Target Audience',
        type: 'text',
        placeholder: 'e.g., Beginners, Career changers',
        required: true,
      },
    ],
    sections: [
      {
        title: 'Course Overview',
        prompt: `Create an overview for {{courseName}}, a {{level}} {{language}} course for {{targetAudience}}.
                 Include learning outcomes, prerequisites, and course structure.`,
        placeholders: ['courseName', 'level', 'language', 'targetAudience'],
      },
      {
        title: 'Module Breakdown',
        prompt: `Design {{duration}} weeks of {{courseName}} modules. Outline topics for each week with learning objectives.`,
        placeholders: ['duration', 'courseName'],
      },
      {
        title: 'Learning Materials & Resources',
        prompt: `Recommend learning materials and resources for {{courseName}} including textbooks, videos, documentation,
                 and practice platforms.`,
        placeholders: ['courseName'],
      },
      {
        title: 'Projects & Assignments',
        prompt: `Create a project-based learning path for {{courseName}}. Include {{duration}} projects progressing in difficulty.`,
        placeholders: ['courseName', 'duration'],
      },
      {
        title: 'Assessment Strategy',
        prompt: `Design an assessment strategy for {{courseName}} including quizzes, coding assignments, projects,
                 and final capstone.`,
        placeholders: ['courseName'],
      },
    ],
  },
  {
    id: 'language-course',
    name: 'Language Learning Course',
    description: 'Curriculum for teaching a new language',
    category: 'education',
    icon: '🌍',
    variables: [
      {
        id: 'language',
        name: 'language',
        label: 'Language to Learn',
        type: 'text',
        placeholder: 'e.g., Spanish, Mandarin Chinese',
        required: true,
      },
      {
        id: 'level',
        name: 'level',
        label: 'Target Level',
        type: 'select',
        options: ['Beginner', 'Intermediate', 'Advanced', 'Fluency'],
        required: true,
      },
      {
        id: 'hours',
        name: 'hours',
        label: 'Total Course Hours',
        type: 'number',
        placeholder: '40',
        required: true,
      },
    ],
    sections: [
      {
        title: 'Learning Path',
        prompt: `Create a comprehensive {{hours}} hour learning path for {{language}} to {{level}} level.
                 Include phases, milestones, and expected proficiency gains.`,
        placeholders: ['hours', 'language', 'level'],
      },
      {
        title: 'Vocabulary & Grammar',
        prompt: `Outline essential vocabulary (by frequency) and grammar topics for {{language}} {{level}} level.`,
        placeholders: ['language', 'level'],
      },
      {
        title: 'Speaking & Listening',
        prompt: `Design speaking and listening activities for {{language}} learners at {{level}} level.
                 Include conversation scenarios and listening materials.`,
        placeholders: ['language', 'level'],
      },
      {
        title: 'Cultural Integration',
        prompt: `Incorporate {{language}} culture, customs, and real-world context into language learning.
                 Include media, literature, and cultural nuances.`,
        placeholders: ['language'],
      },
    ],
  },
];

// Health Templates
export const HEALTH_TEMPLATES: Template[] = [
  {
    id: 'fitness-plan',
    name: '12-Week Fitness Plan',
    description: 'Personalized 12-week fitness and workout plan',
    category: 'health',
    icon: '💪',
    variables: [
      {
        id: 'name',
        name: 'name',
        label: 'Your Name',
        type: 'text',
        placeholder: 'e.g., John',
        required: false,
      },
      {
        id: 'goal',
        name: 'goal',
        label: 'Fitness Goal',
        type: 'select',
        options: ['Weight Loss', 'Muscle Gain', 'Endurance', 'General Fitness', 'Strength'],
        required: true,
      },
      {
        id: 'experience',
        name: 'experience',
        label: 'Experience Level',
        type: 'select',
        options: ['Beginner', 'Intermediate', 'Advanced'],
        required: true,
      },
      {
        id: 'daysPerWeek',
        name: 'daysPerWeek',
        label: 'Days Available Per Week',
        type: 'number',
        placeholder: '4',
        required: true,
      },
      {
        id: 'equipment',
        name: 'equipment',
        label: 'Available Equipment',
        type: 'text',
        placeholder: 'e.g., Gym, Dumbbells, Bodyweight',
        required: true,
      },
    ],
    sections: [
      {
        title: 'Program Overview',
        prompt: `Create a 12-week {{goal}} fitness program for an {{experience}} exerciser with access to {{equipment}}.
                 {{daysPerWeek}} days per week available. Include goals, phases, and expected results.`,
        placeholders: ['goal', 'experience', 'equipment', 'daysPerWeek'],
      },
      {
        title: 'Workout Schedule',
        prompt: `Design a {{daysPerWeek}} day per week workout schedule for {{goal}}. Include warm-up, main exercises,
                 sets, reps, and rest periods.`,
        placeholders: ['daysPerWeek', 'goal'],
      },
      {
        title: 'Nutrition Plan',
        prompt: `Create a nutrition plan to support {{goal}}. Include daily calorie targets, macro ratios,
                 meal timing, and sample meals.`,
        placeholders: ['goal'],
      },
      {
        title: 'Progressive Overload Strategy',
        prompt: `Detail a progressive overload strategy for the 12-week program targeting {{goal}}.
                 Include how to increase difficulty each phase.`,
        placeholders: ['goal'],
      },
      {
        title: 'Tracking & Adjustments',
        prompt: `Provide a tracking system and adjustment protocol for the 12-week {{goal}} plan.
                 Include metrics and decision rules.`,
        placeholders: ['goal'],
      },
    ],
  },
  {
    id: 'meal-plan',
    name: 'Weekly Meal Plan',
    description: 'Customized weekly meal planning and recipes',
    category: 'health',
    icon: '🍎',
    variables: [
      {
        id: 'dietaryPreference',
        name: 'dietaryPreference',
        label: 'Dietary Preference',
        type: 'select',
        options: ['Omnivore', 'Vegetarian', 'Vegan', 'Keto', 'Mediterranean'],
        required: true,
      },
      {
        id: 'cuisines',
        name: 'cuisines',
        label: 'Preferred Cuisines',
        type: 'text',
        placeholder: 'e.g., Italian, Asian, Mexican',
        required: false,
      },
      {
        id: 'mealsPerDay',
        name: 'mealsPerDay',
        label: 'Meals Per Day',
        type: 'number',
        placeholder: '3',
        required: true,
      },
      {
        id: 'allergies',
        name: 'allergies',
        label: 'Allergies/Intolerances',
        type: 'text',
        placeholder: 'e.g., Nut allergy, Lactose intolerant',
        required: false,
      },
    ],
    sections: [
      {
        title: 'Weekly Menu Plan',
        prompt: `Create a 7-day {{dietaryPreference}} meal plan with {{mealsPerDay}} meals per day.
                 Include recipes and {{cuisines}} cuisines. Avoid: {{allergies}}.`,
        placeholders: ['dietaryPreference', 'mealsPerDay', 'cuisines', 'allergies'],
      },
      {
        title: 'Shopping List',
        prompt: `Generate a comprehensive shopping list for the weekly {{dietaryPreference}} meal plan.
                 Organize by category and include quantities.`,
        placeholders: ['dietaryPreference'],
      },
      {
        title: 'Nutritional Summary',
        prompt: `Provide nutritional analysis for the 7-day meal plan including daily calories, macros, and key micronutrients.`,
        placeholders: [],
      },
      {
        title: 'Meal Prep Guide',
        prompt: `Create a meal prep guide for the weekly {{dietaryPreference}} plan. Include batch cooking, storage,
                 and make-ahead tips.`,
        placeholders: ['dietaryPreference'],
      },
    ],
  },
];

// Complete template registry
export const ALL_TEMPLATES: Template[] = [
  ...BUSINESS_TEMPLATES,
  ...EDUCATION_TEMPLATES,
  ...HEALTH_TEMPLATES,
];

// Helper functions
export function getTemplatesByCategory(category: 'business' | 'education' | 'health'): Template[] {
  return ALL_TEMPLATES.filter((t) => t.category === category);
}

export function getTemplate(templateId: string): Template | undefined {
  return ALL_TEMPLATES.find((t) => t.id === templateId);
}

export function searchTemplates(query: string): Template[] {
  const lowerQuery = query.toLowerCase();
  return ALL_TEMPLATES.filter(
    (t) =>
      t.name.toLowerCase().includes(lowerQuery) ||
      t.description.toLowerCase().includes(lowerQuery) ||
      t.category.toLowerCase().includes(lowerQuery)
  );
}
