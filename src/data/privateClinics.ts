export interface PrivateClinic {
  id: string;
  name: string;
  location: string;
  lat: number;
  lng: number;
  priceFrom: string;
  appointmentType: string;
  ages: string;
  notes: string;
  website: string;
  onlineUkWide?: boolean;
  physicalClinic?: boolean;
  sourceLabel?: string;
  sourceUrl?: string;
  sourceCheckedOn?: string;
}

// Starting prices are indicative and must be checked with the provider before booking.
// A sourceCheckedOn date means Different Minds checked the linked primary provider page
// on that date; it does not guarantee the information remains current afterwards.
// Coordinates represent a clinic or service hub and are used only for approximate sorting.
export const PRIVATE_CLINICS: PrivateClinic[] = [
  {
    id: 'ready-health-standish',
    name: 'Ready Health',
    location: 'Standish, Wigan / online UK-wide',
    lat: 53.5864,
    lng: -2.6641,
    priceFrom: 'Adult online from £499',
    appointmentType: 'Online or face-to-face',
    ages: 'Adults and children aged 6+',
    notes: 'CQC-registered clinic offering ADHD assessment, reports, titration and coaching. Face-to-face assessments are at 22 High Street, Standish. Medication, titration and shared-care letters cost extra.',
    website: 'https://readyhealth.co.uk/services/mental-health-psychology/adhd-testing-diagnosis',
  },
  {
    id: 'adhd360-private',
    name: 'ADHD 360',
    location: 'Online UK-wide',
    lat: 53.2307,
    lng: -0.5406,
    priceFrom: 'Assessment only £950',
    appointmentType: 'Online specialist assessment',
    ages: 'Adults and children — check current package/age criteria',
    notes: 'Official pricing currently lists a £950 assessment-only option. Treatment, follow-up, prescription/medication and renewal costs can be separate depending on the pathway selected.',
    website: 'https://www.adhd-360.com/pricing/',
    onlineUkWide: true,
    physicalClinic: false,
    sourceLabel: 'ADHD360 official pricing',
    sourceUrl: 'https://www.adhd-360.com/pricing/',
    sourceCheckedOn: '16 Aug 2026',
  },
  {
    id: 'psychiatry-uk-private',
    name: 'Psychiatry-UK',
    location: 'Online UK-wide',
    lat: 52.4862,
    lng: -1.8904,
    priceFrom: 'Adult assessment £950',
    appointmentType: 'Online consultant psychiatrist',
    ages: 'Private adult ADHD service — 18+',
    notes: 'Official private adult ADHD pricing currently lists the initial assessment at £950. Optional medication titration and ongoing care are separate costs.',
    website: 'https://psychiatry-uk.com/fees/',
    onlineUkWide: true,
    physicalClinic: false,
    sourceLabel: 'Psychiatry-UK official fees',
    sourceUrl: 'https://psychiatry-uk.com/fees/',
    sourceCheckedOn: '16 Aug 2026',
  },
  {
    id: 'berkeley',
    name: 'Berkeley Psychiatrists',
    location: 'London / online UK-wide',
    lat: 51.5204,
    lng: -0.1477,
    priceFrom: 'Online from £745',
    appointmentType: 'Online or Harley Street',
    ages: 'Adults and children',
    notes: 'Assessments are conducted by doctors. In-person and child assessment prices are higher.',
    website: 'https://www.berkeleypsychiatrists.co.uk/fees',
  },
  {
    id: 'clinical-partners-private',
    name: 'Clinical Partners',
    location: 'Online UK-wide; ask about current in-person availability',
    lat: 51.4545,
    lng: -2.5879,
    priceFrom: 'Adult assessment £895',
    appointmentType: 'Online and selected in-person services',
    ages: 'Adults; child pathways are separate — check current service',
    notes: 'Official adult ADHD assessment information currently lists a private adult assessment at £895. Confirm current availability, medication/titration options and any additional costs before booking.',
    website: 'https://www.clinical-partners.co.uk/private-assessments-treatment-and-medication-for-adults/private-adhd-assessments-for-adults/',
    onlineUkWide: true,
    physicalClinic: false,
    sourceLabel: 'Clinical Partners official private adult ADHD assessment page',
    sourceUrl: 'https://www.clinical-partners.co.uk/private-assessments-treatment-and-medication-for-adults/private-adhd-assessments-for-adults/',
    sourceCheckedOn: '16 Aug 2026',
  },
  {
    id: 'adhd-centre-marylebone',
    name: 'The ADHD Centre',
    location: '85 Wimpole Street, Marylebone, London W1G 9RJ',
    lat: 51.5205,
    lng: -0.1472,
    priceFrom: 'Check current fees',
    appointmentType: 'In-person or online',
    ages: 'Adults and children',
    notes: 'Specialist ADHD assessment and treatment clinic. Confirm the full assessment, treatment and follow-up costs.',
    website: 'https://www.adhdcentre.co.uk/locations/london/',
  },
  {
    id: 'adhd-centre-belgravia',
    name: 'The ADHD Centre',
    location: '9 Eccleston Street, Belgravia, London SW1W 9LX',
    lat: 51.4946,
    lng: -0.1465,
    priceFrom: 'Check current fees',
    appointmentType: 'In-person or online',
    ages: 'Adults and children',
    notes: 'Specialist ADHD assessment and treatment clinic. Confirm the full assessment, treatment and follow-up costs.',
    website: 'https://www.adhdcentre.co.uk/locations/london/',
  },
  {
    id: 'adhd-centre-manchester',
    name: 'The ADHD Centre',
    location: 'Calderbank Medical Chambers, 599 Wilmslow Road, Manchester M20 3QD',
    lat: 53.4250,
    lng: -2.2310,
    priceFrom: 'From £1,095',
    appointmentType: 'In-person or online',
    ages: 'Adults and children',
    notes: 'Specialist ADHD assessment and treatment clinic. Confirm the full assessment, treatment and follow-up costs.',
    website: 'https://www.adhdcentre.co.uk/locations/manchester/',
  },
  {
    id: 'oxford-adhd',
    name: 'Oxford ADHD & Autism Centre',
    location: 'Oxford',
    lat: 51.7520,
    lng: -1.2577,
    priceFrom: 'Check current fees',
    appointmentType: 'Specialist clinic',
    ages: 'Adults and children',
    notes: 'Specialist neurodevelopmental assessment service. Ask about availability and the complete care pathway.',
    website: 'https://www.oxfordadhdcentre.co.uk/',
  },
  {
    id: 'harley-therapy',
    name: 'Harley Therapy',
    location: 'London / online',
    lat: 51.5174,
    lng: -0.1469,
    priceFrom: 'Check current fees',
    appointmentType: 'Online and in-person',
    ages: 'Adults',
    notes: 'Private psychiatry service with clinicians offering adult ADHD assessment.',
    website: 'https://www.harleytherapy.co.uk/adhd-assessment.htm',
  },
  {
    id: 'mind-clinic',
    name: 'The Mind Clinic',
    location: 'London / online',
    lat: 51.5074,
    lng: -0.1278,
    priceFrom: 'Check current fees',
    appointmentType: 'Online and in-person',
    ages: 'Adults',
    notes: 'Private psychiatric assessment service. Confirm clinician credentials, treatment costs and shared-care arrangements.',
    website: 'https://themindclinic.co.uk/',
  },
];
