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
}

// Starting prices are indicative and must be checked with the provider before booking.
// Coordinates represent a clinic or service hub and are used only for approximate sorting.
export const PRIVATE_CLINICS: PrivateClinic[] = [
  { id: 'adhd360-private', name: 'ADHD 360', location: 'Lincolnshire / online UK-wide', lat: 53.2307, lng: -0.5406, priceFrom: 'From £950', appointmentType: 'Online specialist assessment', ages: 'Adults and children', notes: 'ADHD-specialist assessment and treatment packages. Check the full cost of titration, medication and reviews.', website: 'https://www.adhd-360.com/pathway-choice/' },
  { id: 'psychiatry-uk-private', name: 'Psychiatry-UK', location: 'Online UK-wide', lat: 52.4862, lng: -1.8904, priceFrom: 'From £950', appointmentType: 'Online consultant psychiatrist', ages: 'Adults', notes: 'Assessment report and treatment plan included. Medication titration is a separate cost.', website: 'https://psychiatry-uk.com/private-adult-adhd-service/' },
  { id: 'berkeley', name: 'Berkeley Psychiatrists', location: 'London / online UK-wide', lat: 51.5204, lng: -0.1477, priceFrom: 'Online from £745', appointmentType: 'Online or Harley Street', ages: 'Adults and children', notes: 'Assessments are conducted by doctors. In-person and child assessment prices are higher.', website: 'https://www.berkeleypsychiatrists.co.uk/fees' },
  { id: 'clinical-partners-private', name: 'Clinical Partners', location: 'Clinics across the UK / online', lat: 51.4545, lng: -2.5879, priceFrom: 'Ask provider', appointmentType: 'Online and in-person', ages: 'Adults and children', notes: 'National private mental-health provider offering ADHD assessment and diagnosis. Confirm current price before booking.', website: 'https://www.clinical-partners.co.uk/for-adults/adhd-clinic' },
  { id: 'adhd-centre', name: 'The ADHD Centre', location: 'London and Manchester / online', lat: 51.5155, lng: -0.1420, priceFrom: 'Check current fees', appointmentType: 'Online and in-person', ages: 'Adults and children', notes: 'Specialist ADHD clinic with assessment, therapy and treatment services.', website: 'https://www.adhdcentre.co.uk/' },
  { id: 'oxford-adhd', name: 'Oxford ADHD & Autism Centre', location: 'Oxford', lat: 51.7520, lng: -1.2577, priceFrom: 'Check current fees', appointmentType: 'Specialist clinic', ages: 'Adults and children', notes: 'Specialist neurodevelopmental assessment service. Ask about availability and the complete care pathway.', website: 'https://www.oxfordadhdcentre.co.uk/' },
  { id: 'harley-therapy', name: 'Harley Therapy', location: 'London / online', lat: 51.5174, lng: -0.1469, priceFrom: 'Check current fees', appointmentType: 'Online and in-person', ages: 'Adults', notes: 'Private psychiatry service with clinicians offering adult ADHD assessment.', website: 'https://www.harleytherapy.co.uk/adhd-assessment.htm' },
  { id: 'mind-clinic', name: 'The Mind Clinic', location: 'London / online', lat: 51.5074, lng: -0.1278, priceFrom: 'Check current fees', appointmentType: 'Online and in-person', ages: 'Adults', notes: 'Private psychiatric assessment service. Confirm clinician credentials, treatment costs and shared-care arrangements.', website: 'https://themindclinic.co.uk/' },
];
