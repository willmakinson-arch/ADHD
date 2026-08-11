// Seed dataset of UK ADHD assessment providers.
// No paid API — this is a maintained local dataset. Update these entries
// periodically by hand (or later crowd-source updates) as provider
// availability/waiting times change.
//
// lat/lng are approximate head-office / regional-hub coordinates used
// only for "distance from you" sorting, not exact clinic addresses.

export type ClinicType = 'nhs_right_to_choose' | 'private' | 'nhs_direct';

export interface Clinic {
  id: string;
  name: string;
  type: ClinicType;
  regionsCovered: string; // human-readable coverage description
  lat: number;
  lng: number;
  typicalWaitMonths: string; // free text, e.g. "8-14"
  priceFrom: string | null; // null for free NHS routes
  notes: string;
  website: string;
  rtcEligible: boolean;
}

export const CLINICS: Clinic[] = [
  {
    id: 'adhd360',
    name: 'ADHD 360',
    type: 'private',
    regionsCovered: 'England (RTC) + UK-wide private (online)',
    lat: 53.5511,
    lng: -0.6553, // Lincoln, UK
    typicalWaitMonths: '6-12',
    priceFrom: '£495',
    notes:
      'Offers both Right to Choose (NHS-funded, needs GP referral) and fully private routes. Has its own screening tool.',
    website: 'https://www.adhd-360.com',
    rtcEligible: true,
  },
  {
    id: 'psychiatry-uk',
    name: 'Psychiatry-UK',
    type: 'private',
    regionsCovered: 'England (RTC) + UK-wide private (online)',
    lat: 53.4084,
    lng: -2.9916, // Liverpool, UK
    typicalWaitMonths: '12-18',
    priceFrom: '£600',
    notes:
      'Large RTC provider; demand-driven waits vary a lot by ICB. Also runs an autism assessment service.',
    website: 'https://psychiatry-uk.com',
    rtcEligible: true,
  },
  {
    id: 'clinical-partners',
    name: 'Clinical Partners',
    type: 'private',
    regionsCovered: 'England (RTC) + UK-wide private (online)',
    lat: 51.4545,
    lng: -2.5879, // Bristol, UK
    typicalWaitMonths: 'varies — some ICBs paused',
    priceFrom: '£600',
    notes:
      'Some ICBs (e.g. Birmingham & Solihull) have paused new RTC bookings with this provider — check current status before applying.',
    website: 'https://www.clinical-partners.co.uk',
    rtcEligible: true,
  },
  {
    id: 'innovate-adhd',
    name: 'Innovate ADHD',
    type: 'private',
    regionsCovered: 'England (RTC) + UK-wide private (online)',
    lat: 52.4862,
    lng: -1.8904, // Birmingham, UK
    typicalWaitMonths: '6-12',
    priceFrom: '£495',
    notes:
      'Accepts transfers from existing NHS waiting lists via RTC redirection — you do not need to start over.',
    website: 'https://innovateadhd.com',
    rtcEligible: true,
  },
  {
    id: 'nhs-standard',
    name: 'Your local NHS Neurodevelopmental / Adult ADHD Service',
    type: 'nhs_direct',
    regionsCovered: 'Local to your ICB — via GP referral',
    lat: 52.4862,
    lng: -1.8904,
    typicalWaitMonths: '12-96+ (varies hugely by area)',
    priceFrom: null,
    notes:
      'Fully NHS-funded standard route. Ask your GP for current local waiting times — these vary enormously by ICB.',
    website: 'https://www.nhs.uk/conditions/attention-deficit-hyperactivity-disorder-adhd/',
    rtcEligible: false,
  },
];
