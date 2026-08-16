import AsyncStorage from '@react-native-async-storage/async-storage';
import { CLINICS } from './clinics';
import { PRIVATE_CLINICS } from './privateClinics';

export type ProviderKind = 'rtc' | 'private' | 'nhs';

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

const rtcProviders: ProviderIntelligence[] = CLINICS
  .filter(item => item.rtcEligible)
  .map(item => ({
    id: `rtc:${item.id}`,
    name: item.name,
    kind: 'rtc',
    routeLabel: 'England NHS patient-choice / RTC route',
    coverage: item.regionsCovered,
    priceLabel: 'NHS-funded when an eligible NHS referral is accepted',
    waitLabel: `Stored estimate: ${item.typicalWaitMonths} months — re-check current wait`,
    appointmentType: item.regionsCovered.toLowerCase().includes('online') ? 'Online route shown in seed data' : 'Check delivery format',
    ages: 'Check current age criteria with provider',
    website: item.website,
    notes: item.notes,
    verificationLabel: 'Current provider status must be checked before referral',
    strengths: [
      'May provide an NHS-funded assessment route for eligible people registered with a GP in England.',
      'Can be compared separately from fully private care so cost and referral route are not confused.',
    ],
    verifyBeforeChoosing: [
      'Ask the provider whether it currently accepts the relevant NHS referral route for your circumstances and age group.',
      'Ask what happens after assessment, including treatment/titration if a diagnosis is made.',
      ...DEFAULT_VERIFY.slice(1),
    ],
  }));

const privateProviders: ProviderIntelligence[] = PRIVATE_CLINICS.map(item => ({
  id: `private:${item.id}`,
  name: item.name,
  kind: 'private',
  routeLabel: 'Private assessment route',
  coverage: item.location,
  priceLabel: `${item.priceFrom} — indicative only`,
  waitLabel: 'Current waiting time not verified in-app',
  appointmentType: item.appointmentType,
  ages: item.ages,
  website: item.website,
  notes: item.notes,
  verificationLabel: 'Price, availability and care pathway must be re-checked before booking',
  strengths: [
    item.onlineUkWide ? 'Online UK-wide option is shown in the current seed data.' : 'A physical clinic/service location is shown in the current seed data.',
    'Private route can be compared on total pathway questions, not assessment price alone.',
  ],
  verifyBeforeChoosing: DEFAULT_VERIFY,
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
    waitLabel: 'Ask your local service/GP for current waiting information',
    appointmentType: 'Local NHS pathway',
    ages: 'Eligibility varies by local service',
    website: item.website,
    notes: item.notes,
    verificationLabel: 'Local pathway and waiting information varies by area',
    strengths: ['Standard local NHS pathway.', 'No private assessment fee.'],
    verifyBeforeChoosing: [
      'Ask your GP which local service receives ADHD referrals for your age group.',
      'Ask for the current local waiting information and what happens while you wait.',
      'Keep any existing referral in place until another route is actually confirmed.',
    ],
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
