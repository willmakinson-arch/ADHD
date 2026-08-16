// Seed dataset of UK ADHD assessment providers.
// No paid API — this is a maintained local dataset. Provider availability,
// waiting information and pathway rules can change quickly, so the app must
// point users back to current primary sources before they act.
//
// lat/lng are approximate head-office / regional-hub coordinates used
// only for "distance from you" sorting, not exact clinic addresses.

export type ClinicType = 'nhs_right_to_choose' | 'private' | 'nhs_direct';

export interface Clinic {
  id: string;
  name: string;
  type: ClinicType;
  regionsCovered: string;
  lat: number;
  lng: number;
  typicalWaitMonths: string;
  priceFrom: string | null;
  notes: string;
  website: string;
  rtcEligible: boolean;
  sourceLabel?: string;
  sourceUrl?: string;
  sourceCheckedOn?: string;
  sourceDataNote?: string;
}

export const CLINICS: Clinic[] = [
  {
    id: 'adhd360',
    name: 'ADHD 360',
    type: 'private',
    regionsCovered: 'England (RTC) + UK-wide private (online)',
    lat: 53.5511,
    lng: -0.6553,
    typicalWaitMonths: 'Varies by ICB — use the provider’s current regional wait table',
    priceFrom: 'Check current private pricing',
    notes:
      'Offers an NHS-funded Right to Choose route in England as well as private care. Current RTC waiting times and requirements differ by ICB, so check the provider’s live regional information before referral.',
    website: 'https://www.adhd-360.com/right-to-choose/',
    rtcEligible: true,
    sourceLabel: 'ADHD360 official RTC wait-times and ICB requirements',
    sourceUrl: 'https://www.adhd-360.com/right-to-choose/wait-times-and-icb-allowances/',
    sourceCheckedOn: '16 Aug 2026',
    sourceDataNote: 'Official source checked by Different Minds. The provider publishes ICB-specific estimates and requirements that can change.',
  },
  {
    id: 'psychiatry-uk',
    name: 'Psychiatry-UK',
    type: 'private',
    regionsCovered: 'England (RTC) + UK-wide private (online)',
    lat: 53.4084,
    lng: -2.9916,
    typicalWaitMonths: 'Varies — check the provider’s current RTC service updates',
    priceFrom: 'Check current private pricing',
    notes:
      'Provides an online Right to Choose pathway for eligible referrals in England and a separate private adult ADHD service. RTC service changes can be affected by local NHS commissioning arrangements.',
    website: 'https://psychiatry-uk.com/right-to-choose/',
    rtcEligible: true,
    sourceLabel: 'Psychiatry-UK official Right to Choose service updates',
    sourceUrl: 'https://psychiatry-uk.com/right-to-choose-service-updates/',
    sourceCheckedOn: '16 Aug 2026',
    sourceDataNote: 'Official source checked by Different Minds. Re-open it before referral because service updates and waiting arrangements can change.',
  },
  {
    id: 'clinical-partners',
    name: 'Clinical Partners',
    type: 'private',
    regionsCovered: 'England (RTC) + UK-wide private (online)',
    lat: 51.4545,
    lng: -2.5879,
    typicalWaitMonths: 'Varies by ICB — check current RTC wait and booking updates',
    priceFrom: 'Check current private pricing',
    notes:
      'Provides NHS Right to Choose ADHD assessment services in England alongside private care. Referral acceptance, booking availability and medication/titration arrangements can differ by ICB.',
    website: 'https://www.clinical-partners.co.uk/nhs-right-to-choose-assessments-and-medication/',
    rtcEligible: true,
    sourceLabel: 'Clinical Partners official RTC wait-times and updates',
    sourceUrl: 'https://www.clinical-partners.co.uk/nhs-right-to-choose-assessments-and-medication/nhs-right-to-choose-wait-times-and-updates/',
    sourceCheckedOn: '16 Aug 2026',
    sourceDataNote: 'Official source checked by Different Minds. The provider publishes ICB-specific updates, so the current area entry should be checked before referral.',
  },
  {
    id: 'innovate-adhd',
    name: 'Innovate ADHD',
    type: 'private',
    regionsCovered: 'England (RTC) + UK-wide private (online)',
    lat: 52.4862,
    lng: -1.8904,
    typicalWaitMonths: 'Current RTC wait not verified in this review',
    priceFrom: 'Check current private pricing',
    notes:
      'ADHD assessment provider with private services and information about NHS-funded routes. Different Minds has not independently re-verified its current RTC acceptance and waiting position in this review.',
    website: 'https://innovateadhd.com',
    rtcEligible: true,
    sourceLabel: 'Innovate ADHD provider website',
    sourceUrl: 'https://innovateadhd.com',
    sourceCheckedOn: 'RTC status needs re-checking',
    sourceDataNote: 'Do not rely on stored RTC acceptance or waiting information. Confirm the current NHS-funded pathway directly with the provider and GP before changing an existing referral.',
  },
  {
    id: 'nhs-standard',
    name: 'Your local NHS Neurodevelopmental / Adult ADHD Service',
    type: 'nhs_direct',
    regionsCovered: 'Local NHS pathway — via GP / local referral process',
    lat: 52.4862,
    lng: -1.8904,
    typicalWaitMonths: 'Varies by local NHS service — ask for current local information',
    priceFrom: null,
    notes:
      'Standard NHS-funded local route. Waiting times, referral criteria and service names vary by area. Ask the GP or receiving service for the current local pathway.',
    website: 'https://www.nhs.uk/conditions/attention-deficit-hyperactivity-disorder-adhd/',
    rtcEligible: false,
    sourceLabel: 'NHS England patient choice guidance',
    sourceUrl: 'https://www.england.nhs.uk/long-read/patient-choice-guidance/',
    sourceCheckedOn: '16 Aug 2026',
    sourceDataNote: 'NHS England guidance explains patient choice in England but does not provide a single national ADHD waiting time. Local service information still needs checking.',
  },
];
