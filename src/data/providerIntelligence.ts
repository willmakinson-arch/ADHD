import AsyncStorage from '@react-native-async-storage/async-storage';
import { CLINICS } from './clinics';
import { PRIVATE_CLINICS } from './privateClinics';

export type ProviderKind = 'rtc' | 'private' | 'nhs';
export type ProviderSourceStatus = 'source_checked' | 'check_now' | 'local_route';

export interface ProviderIntelligence {
  id: string;
  name: string;
  kind: ProviderKind;
  routeLabel: string;
  coverage: string;
  priceLabel: string;
  waitLabel: string;
  appointmentType: string;
  ages: string;
  website: string;
  notes: string;
  verificationLabel: string;
  strengths: string[];
  verifyBeforeChoosing: string[];
  sourceStatus: ProviderSourceStatus;
  sourceLabel: string;
  sourceUrl: string;
  sourceCheckedOn: string;
  sourceNotice: string;
}

export const PROVIDER_COMPARE_KEY = 'different-minds:provider-compare:v1';
export const MAX_PROVIDER_COMPARE = 3;

const DEFAULT_VERIFY = [
  'Confirm the provider is currently accepting people through the route you intend to use.',
  'Confirm the current assessment wait directly with the provider.',
  'Ask exactly what the quoted assessment price includes and what costs extra.',
  'If medication may be relevant, ask who handles titration, prescribing and follow-up and what each stage costs.',
  'Do not assume your GP will take over prescribing after a private assessment. Ask your GP and provider about the current shared-care position before paying.',
];

function sourceStatusFromCheckedDate(value?: string): ProviderSourceStatus {
  return value && /\d{1,2} [A-Z][a-z]{2} 20\d{2}/.test(value) ? 'source_checked' : 'check_now';
}

const rtcProviders: ProviderIntelligence[] = CLINICS
  .filter(item => item.rtcEligible)
  .map(item => ({
    id: `rtc:${item.id}`,
    name: item.name,
    kind: 'rtc',
    routeLabel: 'England NHS patient-choice / RTC route',
    coverage: item.regionsCovered,
    priceLabel: 'NHS-funded when an eligible NHS referral is accepted',
    waitLabel: item.typicalWaitMonths,
    appointmentType: item.regionsCovered.toLowerCase().includes('online') ? 'Online route shown in provider information' : 'Check current delivery format',
    ages: 'Check current age and local eligibility criteria with the provider',
    website: item.website,
    notes: item.notes,
    verificationLabel: 'RTC acceptance, waiting information and ICB requirements can change. Re-open the current source before referral.',
    strengths: [
      'May provide an NHS-funded assessment route for eligible people registered with a GP in England.',
      'Can be compared separately from fully private care so cost and referral route are not confused.',
    ],
    verifyBeforeChoosing: [
      'Ask the provider whether it currently accepts the relevant NHS referral route for your circumstances and age group.',
      'Ask what happens after assessment, including treatment/titration if a diagnosis is made.',
      ...DEFAULT_VERIFY.slice(1),
    ],
    sourceStatus: sourceStatusFromCheckedDate(item.sourceCheckedOn),
    sourceLabel: item.sourceLabel ?? `${item.name} provider website`,
    sourceUrl: item.sourceUrl ?? item.website,
    sourceCheckedOn: item.sourceCheckedOn ?? 'Not checked in this review',
    sourceNotice: item.sourceDataNote ?? 'Different Minds has a provider link but has not independently re-checked the current RTC position in this review.',
  }));

const privateProviders: ProviderIntelligence[] = PRIVATE_CLINICS.map(item => ({
  id: `private:${item.id}`,
  name: item.name,
  kind: 'private',
  routeLabel: 'Private assessment route',
  coverage: item.location,
  priceLabel: `${item.priceFrom} — re-check before payment`,
  waitLabel: 'Current waiting time not guaranteed in-app — check the provider now',
  appointmentType: item.appointmentType,
  ages: item.ages,
  website: item.website,
  notes: item.notes,
  verificationLabel: 'Price, availability and the full care pathway must be re-checked before booking or paying.',
  strengths: [
    item.onlineUkWide ? 'Online UK-wide option is shown in the current provider record.' : 'A physical clinic/service location is shown in the current provider record.',
    'Private care is compared on the whole pathway, not the assessment price alone.',
  ],
  verifyBeforeChoosing: DEFAULT_VERIFY,
  sourceStatus: sourceStatusFromCheckedDate(item.sourceCheckedOn),
  sourceLabel: item.sourceLabel ?? `${item.name} provider website`,
  sourceUrl: item.sourceUrl ?? item.website,
  sourceCheckedOn: item.sourceCheckedOn ?? 'Not checked in this review',
  sourceNotice: item.sourceCheckedOn
    ? `Different Minds checked the linked primary provider source on ${item.sourceCheckedOn}. That is a review date, not a guarantee the information is still current.`
    : 'This provider record still needs a fresh primary-source review. Treat stored prices and service descriptions as prompts to verify, not quotes.',
}));

const nhsProviders: ProviderIntelligence[] = CLINICS
  .filter(item => item.type === 'nhs_direct')
  .map(item => ({
    id: `nhs:${item.id}`,
    name: item.name,
    kind: 'nhs',
    routeLabel: 'Local NHS route',
    coverage: item.regionsCovered,
    priceLabel: 'NHS-funded',
    waitLabel: item.typicalWaitMonths,
    appointmentType: 'Local NHS pathway',
    ages: 'Eligibility and service structure vary by local service',
    website: item.website,
    notes: item.notes,
    verificationLabel: 'Local pathway, referral criteria and waiting information vary by area.',
    strengths: ['Standard local NHS pathway.', 'No private assessment fee.'],
    verifyBeforeChoosing: [
      'Ask your GP which local service receives ADHD referrals for your age group.',
      'Ask for the current local waiting information and what happens while you wait.',
      'Keep any existing referral in place until another route is actually confirmed.',
    ],
    sourceStatus: 'local_route',
    sourceLabel: item.sourceLabel ?? 'NHS information',
    sourceUrl: item.sourceUrl ?? item.website,
    sourceCheckedOn: item.sourceCheckedOn ?? 'Check current local information',
    sourceNotice: item.sourceDataNote ?? 'National guidance cannot replace current information from your local receiving service.',
  }));

export const PROVIDER_INTELLIGENCE: ProviderIntelligence[] = [
  ...rtcProviders,
  ...privateProviders,
  ...nhsProviders,
];

export function findProviderIntelligence(id: string) {
  return PROVIDER_INTELLIGENCE.find(item => item.id === id);
}

export async function getComparedProviderIds(): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(PROVIDER_COMPARE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(item => typeof item === 'string').slice(0, MAX_PROVIDER_COMPARE);
  } catch {
    return [];
  }
}

export async function toggleComparedProvider(id: string): Promise<string[]> {
  const current = await getComparedProviderIds();
  const exists = current.includes(id);
  const next = exists
    ? current.filter(item => item !== id)
    : current.length >= MAX_PROVIDER_COMPARE
      ? current
      : [...current, id];
  try {
    await AsyncStorage.setItem(PROVIDER_COMPARE_KEY, JSON.stringify(next));
  } catch {
    // Comparison can still work in memory for the current action.
  }
  return next;
}

export async function clearComparedProviders() {
  try {
    await AsyncStorage.removeItem(PROVIDER_COMPARE_KEY);
  } catch {
    // Safe no-op when local storage is unavailable.
  }
}
