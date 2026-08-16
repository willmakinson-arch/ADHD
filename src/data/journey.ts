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

export type JourneyAction =
  | { type: 'tab'; label: string; tab: 'RTC' | 'Private' | 'Letter' | 'Home' }
  | { type: 'more'; label: string; page: 'progress' | 'appointments' | 'prep' }
  | { type: 'url'; label: string; url: string };

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
  primary: JourneyAction;
  secondary?: JourneyAction;
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
    sourceUrl: 'https://www.england.nhs.uk/long-read/patient-choice-guidance/',
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
    sourceLabel: 'Department of Health Northern Ireland — ADHD needs assessment',
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

function sourceFor(nation: HomeNation) {
  return NATIONS.find(item => item.id === nation) ?? NATIONS[0];
}

export function getJourneyPlan(nation: HomeNation, stage: JourneyStage): JourneyPlan {
  const source = sourceFor(nation);
  const isEngland = nation === 'england';

  if (stage === 'exploring') {
    return {
      eyebrow: 'START HERE',
      title: 'Turn “I do not know what to do” into one clear next step.',
      summary: 'Different Minds helps you prepare for a sensible first conversation without trying to diagnose you.',
      points: [
        'Write down genuine examples of what is affecting everyday life, work, study or relationships.',
        'Include relevant childhood history if you have it, but do not panic if you cannot remember everything.',
        'Speak to a GP or appropriate healthcare professional about your concerns and possible next steps.',
      ],
      primary: { type: 'url', label: `Read official guidance for ${source.label}`, url: source.sourceUrl },
      secondary: { type: 'more', label: 'Start my journey timeline', page: 'progress' },
      caution: 'Different Minds does not diagnose ADHD and is not a substitute for clinical assessment.',
    };
  }

  if (stage === 'ready_for_gp') {
    if (isEngland) {
      return {
        eyebrow: 'YOUR ROUTE TODAY',
        title: 'Compare NHS patient-choice and private routes before your GP appointment.',
        summary: 'In England, legal patient choice can apply to some first elective mental-health referrals, including some remotely delivered ADHD assessment services, when the rules and clinical requirements are met.',
        points: [
          'Check the current local NHS pathway and waiting information.',
          'Compare clinically appropriate NHS patient-choice providers rather than relying on a single list.',
          'If considering private care, check assessment, titration, prescribing and shared-care arrangements before paying.',
        ],
        primary: { type: 'tab', label: 'Compare Right to Choose clinics', tab: 'RTC' },
        secondary: { type: 'url', label: 'Read NHS patient choice guidance', url: source.sourceUrl },
        caution: 'Choice rights have conditions and exceptions. Your referrer remains responsible for clinical appropriateness.',
      };
    }

    return {
      eyebrow: 'YOUR ROUTE TODAY',
      title: `Prepare for the ADHD pathway used in ${source.label}.`,
      summary: 'Different Minds keeps UK nations separate so England-specific Right to Choose guidance is not shown as a UK-wide route.',
      points: [
        'Prepare examples of how your difficulties affect everyday life.',
        'Ask your GP or local service how referrals are handled in your health-board or trust area.',
        'If considering private care, ask what follow-up and prescribing arrangements may be accepted locally before paying.',
      ],
      primary: { type: 'url', label: `Open official ${source.label} guidance`, url: source.sourceUrl },
      secondary: { type: 'more', label: 'Start my journey timeline', page: 'progress' },
      caution: 'Local referral arrangements can vary. Confirm the current pathway with your GP or local NHS service.',
    };
  }

  if (stage === 'waiting') {
    return {
      eyebrow: 'WHILE YOU WAIT',
      title: 'Keep your referral visible and know what you can check next.',
      summary: 'Waiting is not the same as doing nothing. Keep the few details that matter together so you do not have to reconstruct them later.',
      points: [
        'Keep the referral date, provider or service name and any reference number in one place.',
        'Ask the receiving service for current waiting information rather than relying on an old estimate.',
        isEngland
          ? 'If this is an eligible first elective referral, ask your GP whether NHS patient choice is relevant to your circumstances.'
          : `Use the current ${source.label} route for local referral questions.`,
      ],
      primary: { type: 'more', label: 'Open my referral timeline', page: 'progress' },
      secondary: { type: 'url', label: `Open official ${source.label} guidance`, url: source.sourceUrl },
      caution: 'Do not cancel an existing referral until a replacement route is confirmed.',
    };
  }

  if (stage === 'rtc') {
    if (!isEngland) {
      return {
        eyebrow: 'IMPORTANT',
        title: 'Right to Choose is not the UK-wide pathway.',
        summary: `The England patient-choice pathway used by the Different Minds RTC tools does not apply in the same way in ${source.label}.`,
        points: [
          `Use the current NHS pathway for ${source.label}.`,
          'Do not cancel an existing referral because of advice intended for another UK nation.',
          'Different Minds keeps nation-specific routes separate as the app expands.',
        ],
        primary: { type: 'url', label: `Open official ${source.label} guidance`, url: source.sourceUrl },
        caution: 'The RTC letter builder is intentionally presented as an England pathway.',
      };
    }

    return {
      eyebrow: 'ENGLAND — PATIENT CHOICE',
      title: 'Understand the rules first, then prepare your GP request.',
      summary: 'Different Minds can help prepare a request for discussion with your GP, but it does not decide clinical eligibility or submit a referral automatically.',
      points: [
        'Choose a provider that is clinically appropriate for the service you need.',
        'Confirm the provider currently holds the relevant qualifying NHS contract before relying on the route.',
        'Review every generated request yourself before you send or hand it to your GP.',
      ],
      primary: { type: 'tab', label: 'Build my GP request', tab: 'Letter' },
      secondary: { type: 'url', label: 'Read NHS patient choice guidance', url: source.sourceUrl },
      caution: 'Urgent, emergency and crisis treatment and several other circumstances are outside the legal right to choose.',
    };
  }

  if (stage === 'private') {
    return {
      eyebrow: 'BEFORE YOU PAY',
      title: 'Compare more than the assessment price.',
      summary: 'A lower headline fee can become expensive if follow-up, titration, prescriptions or shared-care arrangements are unclear.',
      points: [
        'Check the assessment fee and exactly what it includes.',
        'Ask who provides medication titration and what follow-up may cost.',
        'Ask your GP or local NHS service about shared-care or recognition arrangements before assuming NHS prescribing will follow a private diagnosis.',
      ],
      primary: { type: 'tab', label: 'Compare private clinics', tab: 'Private' },
      secondary: { type: 'url', label: `Open official ${source.label} guidance`, url: source.sourceUrl },
      caution: 'Provider prices, waits and prescribing arrangements change. Verify them directly before making a financial decision.',
    };
  }

  if (stage === 'assessment_booked') {
    return {
      eyebrow: 'GET READY',
      title: 'Prepare once, then let the appointment be the appointment.',
      summary: 'Different Minds helps organise practical information without coaching you toward a particular diagnosis.',
      points: [
        'Confirm the date, time, location or video link and any forms the provider asked you to complete.',
        'Gather relevant medical, medication, school, work or childhood information that you genuinely have available.',
        'Write down questions you want to remember about the assessment process and what happens afterwards.',
      ],
      primary: { type: 'more', label: 'Open assessment preparation', page: 'prep' },
      secondary: { type: 'more', label: 'Add my appointment', page: 'appointments' },
      caution: 'Answer assessment questions honestly in your own words. Different Minds should never tell you what to say to obtain a diagnosis.',
    };
  }

  if (stage === 'diagnosed') {
    return {
      eyebrow: 'AFTER DIAGNOSIS',
      title: 'Make the next steps easier to understand.',
      summary: 'Treatment and support are individual. Different Minds organises practical follow-up rather than replacing your specialist.',
      points: [
        'Keep your diagnosis letter, treatment plan and follow-up dates together.',
        'Discuss medication, non-medication options and monitoring with your specialist based on your own circumstances.',
        'Consider workplace or study adjustments if ADHD substantially affects you.',
      ],
      primary: { type: 'more', label: 'Track follow-up appointments', page: 'appointments' },
      secondary: { type: 'url', label: `Open official ${source.label} guidance`, url: source.sourceUrl },
      caution: 'Do not start, stop or change prescribed medication based on app guidance.',
    };
  }

  return {
    eyebrow: 'WORK & SUPPORT',
    title: 'Turn support questions into practical next actions.',
    summary: 'Different Minds is being expanded to cover workplace adjustments, Access to Work and benefits guidance with evidence-linked information.',
    points: [
      'Write down the specific barriers you experience rather than only the diagnosis label.',
      'Think about practical adjustments such as environment, instructions, scheduling, equipment or support.',
      'Keep evidence and correspondence together so you do not have to reconstruct your story every time.',
    ],
    primary: { type: 'url', label: `Open official ${source.label} ADHD guidance`, url: source.sourceUrl },
    secondary: { type: 'more', label: 'Open my journey timeline', page: 'progress' },
    caution: 'Benefits and employment rights depend on individual circumstances. Dedicated modules will only be added with authoritative sources.',
  };
}
