import { prisma } from "./lib/prisma";
import { upsertSettingSchema } from "./validators/setting.validator";

// Mock of SETTINGS_KEYS from frontend
const SETTINGS_KEYS = {
  MAINTENANCE_MODE: "maintenance_mode",
  MAINTENANCE_MESSAGE: "maintenance_message",
  MAINTENANCE_END_TIME: "maintenance_end_time",
  WHATSAPP_NUMBER: "whatsapp_number",
  ADMIN_NOTIFICATION_EMAIL: "admin_notification_email",
  SMTP_HOST: "smtp_host",
  SMTP_PORT: "smtp_port",
  SMTP_USER: "smtp_user",
  SMTP_PASS: "smtp_pass",
  SMTP_FROM: "smtp_from",
  INTERNSHIP_HERO_TITLE: "internship_hero_title",
  INTERNSHIP_HERO_SUBTITLE: "internship_hero_subtitle",
  INTERNSHIP_HERO_DESCRIPTION: "internship_hero_description",
  INTERNSHIP_HERO_IMAGE_URL: "internship_hero_image_url",
  INTERNSHIP_INTRO_TITLE: "internship_intro_title",
  INTERNSHIP_INTRO_DESCRIPTION: "internship_intro_description",
  INTERNSHIP_APPROACH_TITLE: "internship_approach_title",
  INTERNSHIP_APPROACH_DESCRIPTION: "internship_approach_description",
  INTERNSHIP_CARD_ONE_VALUE: "internship_card_one_value",
  INTERNSHIP_CARD_ONE_TITLE: "internship_card_one_title",
  INTERNSHIP_CARD_ONE_DESCRIPTION: "internship_card_one_description",
  INTERNSHIP_CARD_TWO_VALUE: "internship_card_two_value",
  INTERNSHIP_CARD_TWO_TITLE: "internship_card_two_title",
  INTERNSHIP_CARD_TWO_DESCRIPTION: "internship_card_two_description",
  INTERNSHIP_CARD_THREE_VALUE: "internship_card_three_value",
  INTERNSHIP_CARD_THREE_TITLE: "internship_card_three_title",
  INTERNSHIP_CARD_THREE_DESCRIPTION: "internship_card_three_description",
  INTERNSHIP_GALLERY_TITLE: "internship_gallery_title",
  INTERNSHIP_GALLERY_IMAGE_URLS: "internship_gallery_image_urls",
  INTERNSHIP_TESTIMONIALS_TITLE: "internship_testimonials_title",
  INTERNSHIP_CLOSING_TITLE: "internship_closing_title",
  INTERNSHIP_CLOSING_CONTENT: "internship_closing_content",
  INTERNSHIP_APPLY_EMAIL: "internship_apply_email",
  INTERNSHIP_PROGRAMS: "internship_programs",
  INTERNSHIP_TESTIMONIALS: "internship_testimonials",
  LABS_HERO_TITLE: "labs_hero_title",
  LABS_HERO_SUBTITLE: "labs_hero_subtitle",
  LABS_HERO_DESCRIPTION: "labs_hero_description",
  LABS_HERO_IMAGE_URL: "labs_hero_image_url",
  LABS_HERO_BTN1_TEXT: "labs_hero_btn1_text",
  LABS_HERO_BTN2_TEXT: "labs_hero_btn2_text",
  LABS_PAGE_TITLE: "labs_page_title",
  LABS_PAGE_SUBTITLE: "labs_page_subtitle",
  LABS_INTRO_DESCRIPTION: "labs_intro_description",
  LABS_INTRO_IMAGE_URL: "labs_intro_image_url",
  LABS_INTRO_BTN_TEXT: "labs_intro_btn_text",
  LABS_INTRO_FEATURE1_TITLE: "labs_intro_feature1_title",
  LABS_INTRO_FEATURE1_DESC: "labs_intro_feature1_desc",
  LABS_INTRO_FEATURE2_TITLE: "labs_intro_feature2_title",
  LABS_INTRO_FEATURE2_DESC: "labs_intro_feature2_desc",
  LABS_INTRO_FEATURE3_TITLE: "labs_intro_feature3_title",
  LABS_INTRO_FEATURE3_DESC: "labs_intro_feature3_desc",
  LABS_INTRO_FEATURE4_TITLE: "labs_intro_feature4_title",
  LABS_INTRO_FEATURE4_DESC: "labs_intro_feature4_desc",
  LABS_SPOTLIGHTS: "labs_spotlights",
  LABS_CAREERS_TITLE: "labs_careers_title",
  LABS_CAREERS_DESCRIPTION: "labs_careers_description",
  LABS_CAREERS_BTN_TEXT: "labs_careers_btn_text",
  LABS_CTA_TITLE: "labs_cta_title",
  LABS_CTA_DESCRIPTION: "labs_cta_description",
  LABS_CTA_BTN_TEXT: "labs_cta_btn_text",
  SERVICES_HERO_TITLE: "services_hero_title",
  SERVICES_HERO_GRADIENT: "services_hero_gradient",
  SERVICES_HERO_BADGE: "services_hero_badge",
  SERVICES_HERO_DESCRIPTION: "services_hero_description",
  SERVICES_HERO_BTN1_TEXT: "services_hero_btn1_text",
  SERVICES_HERO_BTN1_URL: "services_hero_btn1_url",
  SERVICES_HERO_BTN2_TEXT: "services_hero_btn2_text",
  SERVICES_HERO_BTN2_URL: "services_hero_btn2_url",
  SERVICES_CAP_TITLE: "services_cap_title",
  SERVICES_CAP_HIGHLIGHT: "services_cap_highlight",
  SERVICES_CAP_BADGE: "services_cap_badge",
  SERVICES_CAP_DESCRIPTION: "services_cap_description",
  SERVICES_PROCESS_TITLE: "services_process_title",
  SERVICES_PROCESS_BADGE: "services_process_badge",
  SERVICES_PROCESS_DESCRIPTION: "services_process_description",
  SERVICES_PROCESS_STEPS: "services_process_steps",
  SERVICES_WHY_TITLE: "services_why_title",
  SERVICES_WHY_BADGE: "services_why_badge",
  SERVICES_WHY_DESCRIPTION: "services_why_description",
  SERVICES_WHY_ITEMS: "services_why_items",
  SERVICES_WHY_PROMISE_BADGE: "services_why_promise_badge",
  SERVICES_WHY_PROMISE_QUOTE: "services_why_promise_quote",
  SERVICES_WHY_PROMISE_AUTHOR: "services_why_promise_author",
  SERVICES_WHY_PROMISE_SUB: "services_why_promise_sub",
  SERVICES_WHY_PROMISE_TAGS: "services_why_promise_tags",
  SERVICES_CTA_TITLE: "services_cta_title",
  SERVICES_CTA_BADGE: "services_cta_badge",
  SERVICES_CTA_DESCRIPTION: "services_cta_description",
  SERVICES_CTA_BTN1_TEXT: "services_cta_btn1_text",
  SERVICES_CTA_BTN1_URL: "services_cta_btn1_url",
  SERVICES_CTA_BTN2_TEXT: "services_cta_btn2_text",
  SERVICES_CTA_BTN2_URL: "services_cta_btn2_url",
  SERVICES_WHAT_TITLE: "services_what_title",
  SERVICES_WHAT_DESCRIPTION: "services_what_description",
  SERVICES_WHAT_FEATURES: "services_what_features",
  SERVICES_WHAT_IMAGES: "services_what_images",
  HOME_SOLUTIONS_TITLE: "home_solutions_title",
  HOME_SOLUTIONS_BADGE: "home_solutions_badge",
  HOME_SOLUTIONS_DESCRIPTION: "home_solutions_description",
  HOME_SOLUTIONS_ITEMS: "home_solutions_items",
  HOME_SERVICES_TITLE: "home_services_title",
  HOME_SERVICES_BADGE: "home_services_badge",
  HOME_RECENT_WORK_TITLE: "home_recent_work_title",
  HOME_RECENT_WORK_BADGE: "home_recent_work_badge",
  HOME_RECENT_WORK_ITEMS: "home_recent_work_items",
  CONTACT_HERO_TITLE: "contact_hero_title",
  CONTACT_HERO_DESCRIPTION: "contact_hero_description",
  CONTACT_GLOBAL_PRESENCE_BADGE: "contact_global_presence_badge",
  CONTACT_GLOBAL_PRESENCE_TITLE: "contact_global_presence_title",
  CONTACT_BRANCH1_TITLE: "contact_branch1_title",
  CONTACT_BRANCH1_ADDRESS: "contact_branch1_address",
  CONTACT_BRANCH1_MAP_LINK: "contact_branch1_map_link",
  CONTACT_BRANCH1_LAT_LONG: "contact_branch1_lat_long",
  CONTACT_BRANCH1_MARKER_X: "contact_branch1_marker_x",
  CONTACT_BRANCH1_MARKER_Y: "contact_branch1_marker_y",
  CONTACT_BRANCH2_TITLE: "contact_branch2_title",
  CONTACT_BRANCH2_ADDRESS: "contact_branch2_address",
  CONTACT_BRANCH2_MAP_LINK: "contact_branch2_map_link",
  CONTACT_BRANCH2_LAT_LONG: "contact_branch2_lat_long",
  CONTACT_BRANCH2_MARKER_X: "contact_branch2_marker_x",
  CONTACT_BRANCH2_MARKER_Y: "contact_branch2_marker_y",
  CONTACT_BRANCH3_TITLE: "contact_branch3_title",
  CONTACT_BRANCH3_ADDRESS: "contact_branch3_address",
  CONTACT_BRANCH3_MAP_LINK: "contact_branch3_map_link",
  CONTACT_BRANCH3_LAT_LONG: "contact_branch3_lat_long",
  CONTACT_BRANCH3_MARKER_X: "contact_branch3_marker_x",
  CONTACT_BRANCH3_MARKER_Y: "contact_branch3_marker_y",
  CONTACT_SUPPORT_TITLE: "contact_support_title",
  CONTACT_SUPPORT_DESCRIPTION: "contact_support_description",
  CONTACT_SUPPORT_ITEM1_TITLE: "contact_support_item1_title",
  CONTACT_SUPPORT_ITEM1_DESC: "contact_support_item1_desc",
  CONTACT_SUPPORT_ITEM1_LINK: "contact_support_item1_link",
  CONTACT_SUPPORT_ITEM2_TITLE: "contact_support_item2_title",
  CONTACT_SUPPORT_ITEM2_DESC: "contact_support_item2_desc",
  CONTACT_SUPPORT_ITEM2_LINK: "contact_support_item2_link",
  CONTACT_SUPPORT_ITEM3_TITLE: "contact_support_item3_title",
  CONTACT_SUPPORT_ITEM3_DESC: "contact_support_item3_desc",
  CONTACT_SUPPORT_ITEM3_STATUS: "contact_support_item3_status",
  CONTACT_FAQ_TITLE: "contact_faq_title",
  CONTACT_FAQ_DESCRIPTION: "contact_faq_description",
  CONTACT_FAQ1_QUESTION: "contact_faq1_question",
  CONTACT_FAQ1_ANSWER: "contact_faq1_answer",
  CONTACT_FAQ2_QUESTION: "contact_faq2_question",
  CONTACT_FAQ2_ANSWER: "contact_faq2_answer",
  CONTACT_FAQ3_QUESTION: "contact_faq3_question",
  CONTACT_FAQ3_ANSWER: "contact_faq3_answer",
  HOME_VIDEO_URL: "home_video_url",
  HOME_VIDEO_ENABLED: "home_video_enabled",
  CONTACT_BRANCHES: "contact_branches",
  ABOUT_WHO_TITLE: "aboutWhoTitle",
  ABOUT_WHO_DESCRIPTION: "aboutWhoDescription",
  ABOUT_WHO_SECONDARY_DESCRIPTION: "aboutWhoSecondaryDescription",
  ABOUT_WHO_FEATURES: "aboutWhoFeatures",
  ABOUT_WHO_IMAGES: "aboutWhoImages",
  ABOUT_PROCESS_BADGE: "aboutProcessBadge",
  ABOUT_PROCESS_TITLE: "aboutProcessTitle",
  ABOUT_PROCESS_FEATURES: "aboutProcessFeatures",
  ABOUT_PROCESS_IMAGE: "aboutProcessImage",
  ABOUT_MISSION_TITLE: "aboutMissionTitle",
  ABOUT_MISSION_DESC: "aboutMissionDesc",
  ABOUT_VISION_TITLE: "aboutVisionTitle",
  ABOUT_VISION_DESC: "aboutVisionDesc",
  ABOUT_MISSION_CARDS: "aboutMissionCards",
  ABOUT_CONTACT_BADGE: "aboutContactBadge",
  ABOUT_CONTACT_TITLE: "aboutContactTitle",
  ABOUT_CONTACT_IMAGE: "aboutContactImage",
};

// Form defaults from ContactContentMasterPage.tsx
const DEFAULT_VALUES: Record<string, any> = {
  contactHeroTitle: 'Get in Touch with our Global Teams',
  contactHeroDescription: 'Whether you are looking to architect custom enterprise software, scale your cloud infrastructure, or explore standard R&D partnerships, our team is ready to map your technical roadmap.',
  contactGlobalPresenceBadge: 'GLOBAL COVERAGE',
  contactGlobalPresenceTitle: 'IBT Interactive Command Centers',
  contactBranch1Title: 'Coimbatore Headquarters',
  contactBranch1Address: 'IBT Tower, 45, Residency Road, Coimbatore, Tamil Nadu, 641018',
  contactBranch1MapLink: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3916.3175853245404!2d76.9587422!3d11.0168445!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ba859af2f973b7f%3A0x2fe26c6d48c8b417!2sCoimbatore%2C%20Tamil%20Nadu!5e0!3m2!1sen!2sin!4v1684343423452!5m2!1sen!2sin',
  contactBranch1LatLong: '11.0168° N, 76.9558° E',
  contactBranch1MarkerX: 62.5,
  contactBranch1MarkerY: 41.2,
  contactBranch2Title: 'Chennai Innovation Lab',
  contactBranch2Address: 'Prestige Polygon, 471, Anna Salai, Nandanam, Chennai, Tamil Nadu, 600035',
  contactBranch2MapLink: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3886.8202353139366!2d80.2437637!3d13.0452332!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ba859af2f973b7f%3A0x2fe26c6d48c8b417!2sChennai%2C%20Tamil%20Nadu!5e0!3m2!1sen!2sin!4v1684343423452!5m2!1sen!2sin',
  contactBranch2LatLong: '13.0452° N, 80.2438° E',
  contactBranch2MarkerX: 68.2,
  contactBranch2MarkerY: 34.8,
  contactBranch3Title: 'Bengaluru R&D Hub',
  contactBranch3Address: 'WeWork Galaxy, 43, Residency Road, Bengaluru, Karnataka, 560025',
  contactBranch3MapLink: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3887.9256910168453!2d77.6087422!3d12.9718445!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ba859af2f973b7f%3A0x2fe26c6d48c8b417!2sBengaluru%2C%20Karnataka!5e0!3m2!1sen!2sin!4v1684343423452!5m2!1sen!2sin',
  contactBranch3LatLong: '12.9718° N, 77.5946° E',
  contactBranch3MarkerX: 59.4,
  contactBranch3MarkerY: 43.6,
  contactSupportTitle: 'Dedicated Pipelines',
  contactSupportDescription: 'Whether you want a corporate briefing, look for internship validation, or experience a network event, we have a pipeline ready.',
  contactSupportItem1Title: 'Request standard project exploration / demo',
  contactSupportItem1Desc: 'Map out a secure proof of concept with our architects. Average turnaround is 24 hours.',
  contactSupportItem1Link: 'mailto:projects@ibacustech.com',
  contactSupportItem2Title: 'Apply for internship & research cohorts',
  contactSupportItem2Desc: 'Get structural hands-on engineering training inside our labs. Submit technical profile.',
  contactSupportItem2Link: 'mailto:careers@ibacustech.com',
  contactSupportItem3Title: 'Corporate operations / SLA support line',
  contactSupportItem3Desc: 'For active production service degradation support.',
  contactSupportItem3Status: '+91 94437 20267',
  contactFaqTitle: 'Frequently Answered Inquiries',
  contactFaqDescription: 'A direct compilation of architectural, structural, and onboarding paradigms for rapid assessment.',
  contactFaq1Question: 'What standard engagement parameters do you require?',
  contactFaq1Answer: 'We operate through discovery sprints to understand scope constraints, deliverables, and SLAs prior to standard contract commitment.',
  contactFaq2Question: 'Can your teams work within hybrid operational timezones?',
  contactFaq2Answer: 'Yes. Our staff coordinate globally using redundant asynchronous channels and overlap sync blocks tailored to our partners.',
  contactFaq3Question: 'How secure is the client-side master sandbox interface?',
  contactFaq3Answer: 'All access endpoints use military-grade HTTPS/TLS standards, coupled with modern role-based audit telemetry to map modifications.',
  contactBranches: [
    {
      id: "branch-1779360156441",
      title: "Coimbatore",
      address: "IBT, Coimbatore,Tamil Nadu",
      latLong: "11.0168° N, 76.9558° E",
      mapLink: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3916.3175853245404!2d76.9587422!3d11.0168445!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ba859af2f973b7f%3A0x2fe26c6d48c8b417!2sCoimbatore%2C%20Tamil%20Nadu!5e0!3m2!1sen!2sin!4v1684343423452!5m2!1sen!2sin&someLongParam=longValue123&anotherParam=anotherLongValue456",
      markerX: 50,
      markerY: 50
    },
    {
      id: "branch-1781012363509",
      title: "ERODE",
      address: "IBT",
      latLong: "11.0168° N, 76.9558° E",
      mapLink: "",
      markerX: 50,
      markerY: 50
    }
  ],
  adminNotificationEmail: '',
  aboutWhoTitle: 'Who Are We?',
  aboutWhoDescription: 'We are a digital and branding company...',
  aboutWhoSecondaryDescription: 'Cum sociis...',
  aboutWhoFeatures: [],
  aboutWhoImages: [],
  aboutProcessBadge: 'Our Process',
  aboutProcessTitle: 'We bring...',
  aboutProcessFeatures: [
    {
      desc: "Nulla vitae elit libero pharetra augue dapibus.",
      icon: "bg-pale-primary text-primary",
      title: "Collect Ideas"
    },
    {
      desc: "Vivamus sagittis lacus vel augue laoreet.",
      icon: "bg-pale-green text-green",
      title: "Data Analysis"
    },
    {
      desc: "Cras mattis consectetur purus sit amet.",
      icon: "bg-pale-yellow text-yellow",
      title: "Finalize Product"
    }
  ],
  aboutProcessImage: '',
  aboutMissionTitle: '',
  aboutMissionDesc: '',
  aboutVisionTitle: '',
  aboutVisionDesc: '',
  aboutMissionCards: [],
  aboutContactBadge: '',
  aboutContactTitle: '',
  aboutContactImage: '',
  homeVideoUrl: '',
  homeVideoEnabled: false,
  smtpHost: '',
};

async function main() {
  const dbSettings = await prisma.setting.findMany();
  const currentMap = new Map(dbSettings.map((item) => [item.key, item.value]));

  // Mock form state values (assume form defaults + whatever is in DB)
  const formValues: Record<string, any> = {};
  for (const key of Object.keys(DEFAULT_VALUES)) {
    const dbKey = SETTINGS_KEYS[key as keyof typeof SETTINGS_KEYS];
    if (dbKey && currentMap.has(dbKey)) {
      formValues[key] = currentMap.get(dbKey);
    } else {
      formValues[key] = DEFAULT_VALUES[key];
    }
  }

  // Explicitly add ERODE branch with empty mapLink to match screenshot case
  formValues.contactBranches = DEFAULT_VALUES.contactBranches;

  console.log("Validating EVERY key that saveSettings will submit:");
  for (const [formKey, valueInForm] of Object.entries(formValues)) {
    const dbKey = SETTINGS_KEYS[formKey as keyof typeof SETTINGS_KEYS];
    if (!dbKey) continue;

    const schema = upsertSettingSchema;
    const payload = {
      key: dbKey,
      value: valueInForm
    };

    const parsed = schema.safeParse(payload);
    if (!parsed.success) {
      console.log(`❌ INVALID: key = ${dbKey}`);
      console.log(`   Value: ${JSON.stringify(valueInForm)}`);
      console.log(`   Issues: `, parsed.error.issues.map(i => i.message));
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
