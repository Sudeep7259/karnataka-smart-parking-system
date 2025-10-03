import { feature, product, priceItem, featureItem } from "atmn";

export const parkingSpaces = feature({
  id: "parking_spaces",
  name: "Parking Spaces",
  type: "continuous_use",
});

export const realTimeUpdates = feature({
  id: "real_time_updates",
  name: "Real-time Availability Updates",
  type: "boolean",
});

export const basicAnalytics = feature({
  id: "basic_analytics",
  name: "Basic Analytics Dashboard",
  type: "boolean",
});

export const advancedAnalytics = feature({
  id: "advanced_analytics",
  name: "Advanced Analytics & Insights",
  type: "boolean",
});

export const emailNotifications = feature({
  id: "email_notifications",
  name: "Email Notifications",
  type: "boolean",
});

export const revenueOptimization = feature({
  id: "revenue_optimization",
  name: "Revenue Optimization Tools",
  type: "boolean",
});

export const customBookingRules = feature({
  id: "custom_booking_rules",
  name: "Custom Booking Rules",
  type: "boolean",
});

export const apiAccess = feature({
  id: "api_access",
  name: "API Access",
  type: "boolean",
});

export const featuredListing = feature({
  id: "featured_listing",
  name: "Featured Listing Placement",
  type: "boolean",
});

export const multiLocationManagement = feature({
  id: "multi_location_management",
  name: "Multi-location Management",
  type: "boolean",
});

export const dedicatedAccountManager = feature({
  id: "dedicated_account_manager",
  name: "Dedicated Account Manager",
  type: "boolean",
});

export const customIntegrations = feature({
  id: "custom_integrations",
  name: "Custom Integrations",
  type: "boolean",
});

export const whiteLabelOptions = feature({
  id: "white_label_options",
  name: "White-label Options",
  type: "boolean",
});

export const advancedReporting = feature({
  id: "advanced_reporting",
  name: "Advanced Reporting",
  type: "boolean",
});

export const slaGuarantee = feature({
  id: "sla_guarantee",
  name: "SLA Guarantee",
  type: "boolean",
});

export const free = product({
  id: "free",
  name: "Free Plan",
  is_default: true,
  items: [
    featureItem({
      feature_id: parkingSpaces.id,
      included_usage: 2,
    }),
  ],
});

export const starter = product({
  id: "starter",
  name: "Starter Plan",
  items: [
    priceItem({
      price: 29,
      interval: "month",
    }),
    featureItem({
      feature_id: parkingSpaces.id,
      included_usage: 10,
    }),
    featureItem({
      feature_id: realTimeUpdates.id,
    }),
    featureItem({
      feature_id: basicAnalytics.id,
    }),
    featureItem({
      feature_id: emailNotifications.id,
    }),
  ],
});

export const professional = product({
  id: "professional",
  name: "Professional Plan",
  items: [
    priceItem({
      price: 79,
      interval: "month",
    }),
    featureItem({
      feature_id: parkingSpaces.id,
      included_usage: -1,
    }),
    featureItem({
      feature_id: realTimeUpdates.id,
    }),
    featureItem({
      feature_id: advancedAnalytics.id,
    }),
    featureItem({
      feature_id: revenueOptimization.id,
    }),
    featureItem({
      feature_id: customBookingRules.id,
    }),
    featureItem({
      feature_id: apiAccess.id,
    }),
    featureItem({
      feature_id: featuredListing.id,
    }),
  ],
});

export const enterprise = product({
  id: "enterprise",
  name: "Enterprise Plan",
  items: [
    priceItem({
      price: 199,
      interval: "month",
    }),
    featureItem({
      feature_id: parkingSpaces.id,
      included_usage: -1,
    }),
    featureItem({
      feature_id: realTimeUpdates.id,
    }),
    featureItem({
      feature_id: advancedAnalytics.id,
    }),
    featureItem({
      feature_id: revenueOptimization.id,
    }),
    featureItem({
      feature_id: customBookingRules.id,
    }),
    featureItem({
      feature_id: apiAccess.id,
    }),
    featureItem({
      feature_id: featuredListing.id,
    }),
    featureItem({
      feature_id: multiLocationManagement.id,
    }),
    featureItem({
      feature_id: dedicatedAccountManager.id,
    }),
    featureItem({
      feature_id: customIntegrations.id,
    }),
    featureItem({
      feature_id: whiteLabelOptions.id,
    }),
    featureItem({
      feature_id: advancedReporting.id,
    }),
    featureItem({
      feature_id: slaGuarantee.id,
    }),
  ],
});