export type HomeNation = 'england' | 'scotland' | 'wales' | 'northern_ireland';

export type JourneyStage =
  | 'exploring'
  | 'ready_for_gp'
  | 'waiting'
  | 'rtc'
  | 'private'
  | 'assessment_booked'
  | 'diagnosed'
  | 'work_support';

export interface NationOption {
  id: HomeNation;
  label: string;
  shortLabel: string;
  rtcAvailable: boolean;
  sourceLabel: string;
  sourceUrl: string;
}

export interface JourneyStageOption {
  id: JourneyStage;
  label: string;
  shortLabel: string;
}

export interface JourneyPlan {
  eyebrow: string;
  title: string;
  summary: string;
  points: string[];
  nextActionLabel: string;
  nextActionTab?: 'Clinics' | 'RTC Wizard' | 'Progress' | 'Appointments';
  nextActionUrl?: string;
  secondaryActionLabel?: string;
  secondaryActionUrl?: string;
  caution?: string;
}

export const GUIDANCE_REVIEWED = '16 Aug 2026';

export const NATIONS: NationOption[] = [
  {
    id: 'england',
    label: 'England',
    shortLabel: 'England',
    rtcAvailable: true,
    sourceLabel: 'NHS England patient choice guidance',
    sourceUrl: 'https://www.nhs.uk/mental-health/social-care-and-your-rights/how-to-access-mental-health-services/',
  },
  {
    id: 'scotland',
    label: 'Scotland',
    shortLabel: 'Scotland',
    rtcAvailable: false,
    sourceLabel: 'NHS inform — ADHD in adults',
    sourceUrl: 'https://www.nhsinform.scot/illnesses-and-conditions/adhd/adhd-in-adults/',
  },
  {
    id: 'wales',
    label: 'Wales',
    shortLabel: 'Wales',
    rtcAvailable: false,
    sourceLabel: 'NHS 111 Wales — ADHD in adults',
    sourceUrl: 'https://111.wales.nhs.uk/encyclopaedia/a/article/adhdinadults/',
  },
  {
    id: 'northern_ireland',
    label: 'Northern Ireland',
    shortLabel: 'N. Ireland',
    rtcAvailable: false,
    sourceLabel: 'Department of Health NI — ADHD needs assessment',
    sourceUrl: 'https://www.health-ni.gov.uk/news/adhd-needs-assessment-report-published',
  },
];

export const JOURNEY_STAGES: JourneyStageOption[] = [
  { id: 'exploring', label: 'I think I may have ADHD', shortLabel: 'Exploring' },
  { id: 'ready_for_gp', label: 'I am ready to speak to my GP', shortLabel: 'Speak to GP' },
  { id: 'waiting', label: 'I am already on a waiting list', shortLabel: 'Waiting' },
  { id: 'rtc', label: 'I want to understand Right to Choose', shortLabel: 'Right to Choose' },
  { id: 'private', label: 'I am considering a private assessment', shortLabel: 'Private route' },
  { id: 'assessment_booked', label: 'My assessment is booked', shortLabel: 'Assessment booked' },
  { id: 'diagnosed', label: 'I have been diagnosed', shortLabel: 'Diagnosed' },
  { id: 'work_support', label: 'I need help at work or with support', shortLabel: 'Work & support' },
];

const nationSource = (nation: HomeNation) =>
  NATIONS.find((item) => item.id === nation) ?? NATIONS[0];

export function getJourneyPlan(nation: HomeNation, stage: JourneyStage): JourneyPlan {
  const source = nationSource(nation);
  const isEngland = nation === 'england';

  if (stage === 'exploring') {
    return {
      eyebrow: 'START HERE',
      title: 'Turn “I do not know what to do” into one clear next step.',
      summary:
        'Different Minds helps you prepare for a sensible first conversation without trying to diagnose you.',
      points: [
        'Write down examples of what is affecting everyday life, work, study or relationships.',
        'Include relevant history from childhood if you can remember it, but do not worry if you cannot.',
        'Speak to a GP or appropriate healthcare professional about your concerns and possible next steps.',
      ],
      nextActionLabel: `Read official guidance for ${source.label}`,
      nextActionUrl: source.sourceUrl,
      secondaryActionLabel: 'Browse assessment providers',
      secondaryActionUrl: isEngland
        ? 'https://www.nhs.uk/conditions/adhd-adults/'
        : source.sourceUrl,
      caution: 'Different Minds does not diagnose ADHD and is not a substitute for clinical assessment.',
    };
  }

  if (stage === 'ready_for_gp') {
    if (isEngland) {
      return {
        eyebrow: 'YOUR ROUTE TODAY',
        title: 'Compare NHS, patient-choice and private routes before your GP appointment.',
        summary:
          'For England, a first outpatient mental-health referral may include a legal right to choose a clinically appropriate provider when the NHS choice rules apply.',
        points: [
          'Check your local NHS pathway and current waiting information.',
          'Compare providers that may be available through NHS patient choice.',
          'Only consider private costs after checking assessment, prescribing, titration and shared-care implications.',
        ],
        nextActionLabel: 'Compare providers',
        nextActionTab: 'Clinics',
        secondaryActionLabel: 'Read NHS choice guidance',
        secondaryActionUrl: source.sourceUrl,
        caution:
          'Choice rights have conditions and exceptions. A provider must be clinically appropriate and meet the relevant NHS contract requirements.',
      };
    }

    return {
      eyebrow: 'YOUR ROUTE TODAY',
      title: `Prepare for the ADHD pathway used in ${source.label}.`,
      summary:
        'Right to Choose is an England pathway. Different Minds keeps the nations separate so you are not given the wrong route.',
      points: [
        'Prepare examples of how your difficulties affect everyday life.',
        'Ask your GP or local service how referrals are handled in your health-board or trust area.',
        'If considering private care, confirm what follow-up and prescribing arrangements may be accepted locally before paying.',
      ],
      nextActionLabel: `Open official ${source.label} guidance`,
      nextActionUrl: source.sourceUrl,
      caution: 'Local referral arrangements can vary. Confirm the current pathway with your GP or local NHS service.',
    };
  }

  if (stage === 'waiting') {
    return {
      eyebrow: 'WHILE YOU WAIT',
      title: 'Keep your referral visible and know what you can check next.',
      summary:
        'Waiting is not the same as doing nothing. Different Minds can help you keep the important details together and prepare for the next contact.',
      points: [
        'Keep the referral date, provider name and any reference number in one place.',
        'Ask the provider or referrer for current waiting information rather than relying on an old estimate.',
        isEngland
          ? 'If this is your first eligible outpatient referral, ask your GP whether NHS patient choice is relevant to your circumstances.'
          : `Use the official ${source.label} route for local waiting-list and referral questions.`,
      ],
      nextActionLabel: 'Open my referral timeline',
      nextActionTab: 'Progress',
      secondaryActionLabel: `Open official ${source.label} guidance`,
      secondaryActionUrl: source.sourceUrl,
      caution: 'Never cancel an existing referral until a replacement route is confirmed.',
    };
  }

  if (stage === 'rtc') {
    if (!isEngland) {
      return {
        eyebrow: 'IMPORTANT',
        title: 'Right to Choose is not the UK-wide route.',
        summary:
          `The NHS patient-choice framework used by the Different Minds RTC tool applies to England. You selected ${source.label}.`,
        points: [
          `Use the current NHS pathway for ${source.label}.`,
          'Do not pay or cancel an existing referral because of advice intended for another UK nation.',
          'Different Minds will keep nation-specific guidance separate as the app expands.',
        ],
        nextActionLabel: `Open official ${source.label} guidance`,
        nextActionUrl: source.sourceUrl,
        caution: 'The RTC letter builder is intentionally restricted to the England pathway.',
      };
    }

    return {
      eyebrow: 'ENGLAND — PATIENT CHOICE',
      title: 'Understand the rules first, then prepare your GP request.',
      summary:
        'Different Minds can prepare a request for discussion with your GP, but it does not automatically decide eligibility or submit a referral.',
      points: [
        'Choose a provider that is clinically appropriate for the service you need.',
        'Confirm the provider currently meets the NHS requirements for the service before asking for referral.',
        'Keep control: review the generated request yourself before you send or hand it to your GP.',
      ],
      nextActionLabel: 'Build my GP request',
      nextActionTab: 'RTC Wizard',
      secondaryActionLabel: 'Read NHS choice guidance',
      secondaryActionUrl: source.sourceUrl,
      caution: 'Urgent/crisis care and several other circumstances are outside the legal right to choose.',
    };
  }

  if (stage === 'private') {
    return {
      eyebrow: 'BEFORE YOU PAY',
      title: 'Compare more than the assessment price.',
      summary:
        'A lower headline assessment fee can become expensive if follow-up, titration, prescriptions or shared-care arrangements are unclear.',
      points: [
        'Check the assessment fee and exactly what it includes.',
        'Ask who provides medication titration and how much follow-up costs.',
        'Ask your GP/local NHS service about shared-care or recognition arrangements before assuming NHS prescribing will follow a private diagnosis.',
      ],
      nextActionLabel: 'Compare providers',
      nextActionTab: 'Clinics',
      secondaryActionLabel: `Open official ${source.label} guidance`,
      secondaryActionUrl: source.sourceUrl,
      caution: 'Provider prices, waits and prescribing arrangements change. Verify them directly before making a financial decision.',
    };
  }

  if (stage === 'assessment_booked') {
    return {
      eyebrow: 'GET READY',
      title: 'Prepare once, then let the appointment be the appointment.',
      summary:
        'Different Minds helps organise practical information without coaching you toward a particular diagnosis.',
      points: [
        'Confirm date, time, location/video link and any forms the provider asked you to complete.',
        'Gather relevant medical, medication, school/work and childhood history that you genuinely have available.',
        'Write down questions you want to ask about the assessment process and what happens afterwards.',
      ],
      nextActionLabel: 'Add assessment reminder',
      nextActionTab: 'Appointments',
      caution: 'Answer assessment questions honestly in your own words. The app should never tell you what to say to obtain a diagnosis.',
    };
  }

  if (stage === 'diagnosed') {
    return {
      eyebrow: 'AFTER DIAGNOSIS',
      title: 'Make the next steps easier to understand.',
      summary:
        'Treatment and support are individual. Different Minds will organise the questions and practical follow-up, not replace your specialist.',
      points: [
        'Keep your diagnosis letter, treatment plan and follow-up dates together.',
        'Discuss medication, non-medication options and monitoring with your specialist based on your own circumstances.',
        'Consider reasonable adjustments at work or study if ADHD substantially affects you.',
      ],
      nextActionLabel: 'Track follow-up appointments',
      nextActionTab: 'Appointments',
      secondaryActionLabel: `Open official ${source.label} guidance`,
      secondaryActionUrl: source.sourceUrl,
      caution: 'Do not start, stop or change prescribed medication based on app guidance.',
    };
  }

  return {
    eyebrow: 'WORK & SUPPORT',
    title: 'Turn support rights into practical next actions.',
    summary:
      'Different Minds is being expanded to cover workplace adjustments, Access to Work and benefits guidance in a clear, evidence-linked way.',
    points: [
      'Write down the specific barriers you experience rather than only the diagnosis label.',
      'Think in terms of practical adjustments: environment, instructions, scheduling, equipment or support.',
      'Keep evidence and correspondence together so you do not have to reconstruct the story every time.',
    ],
    nextActionLabel: `Open official ${source.label} ADHD guidance`,
    nextActionUrl: source.sourceUrl,
    caution: 'Benefits and employment rights depend on individual circumstances. Dedicated guidance will be added with authoritative sources.',
  };
}
