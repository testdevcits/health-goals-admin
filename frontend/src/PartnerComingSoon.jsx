import React from 'react';
import {Building2,Clock3} from 'lucide-react';

export default function PartnerComingSoon(){
 return <section className="partner-coming-soon-wrap" aria-label="Partner management coming soon">
  <article className="partner-coming-soon-card">
   <span className="partner-coming-soon-icon"><Building2 size={24}/></span>
   <span className="partner-coming-soon-label"><Clock3 size={13}/> COMING SOON</span>
   <h2>Partner workspace is on its way</h2>
   <p>We’re preparing the partner management tools. This area will be available here soon.</p>
  </article>
 </section>;
}
