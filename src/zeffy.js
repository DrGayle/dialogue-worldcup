// Single source for the live Zeffy donation form URL. VITE_ZEFFY_URL can
// override it, but it defaults to the live form.
export const ZEFFY_URL =
  import.meta.env.VITE_ZEFFY_URL ??
  "https://www.zeffy.com/en-US/donation-form/you-give-learners-never-have-to-pay";
