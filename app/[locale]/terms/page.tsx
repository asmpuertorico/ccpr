"use client";

import { notFound } from "next/navigation";
import { supportedLocales } from "@/lib/i18n/locales";
import type { SupportedLocale } from "@/lib/i18n/locales";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Container from "@/components/Container";

// Import dictionaries
import { en } from "@/lib/i18n/dictionaries/en";
import { es } from "@/lib/i18n/dictionaries/es";

export default function TermsOfUsePage({ params }: { params: { locale: string } }) {
  const locale = params.locale as SupportedLocale;
  if (!supportedLocales.includes(locale)) notFound();
  const dict = locale === "es" ? es : en;

  return (
    <>
      <Navbar locale={locale} dict={dict} alwaysSolid={true} />
      <main className="pt-20">
        <Container>
          <div className="py-12 max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">{dict.terms.title}</h1>
              <p className="text-gray-600 text-lg">
                {dict.terms.lastUpdated} {new Date().toLocaleDateString(locale === 'es' ? 'es-ES' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>

            {/* Introduction */}
            <div className="prose prose-lg max-w-none">
              <div className="mb-8 p-6 bg-gray-50 rounded-lg">
                <p className="text-gray-700 leading-relaxed">
                  Please read the following Terms and Conditions of Use carefully before using this website. Your use of this website is expressly conditioned on your acceptance of these terms and conditions without any modifications. Your use of this website constitutes your acceptance of all the terms and conditions set forth herein. If you do not agree with any part of the following terms and conditions, you should not use this website.
                </p>
              </div>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Definitions</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Any use herein of the terms "PRCC's website" or "website" refers to all publicly accessible web pages that are identified with and under the control of PRCC. Terms "PRCC," "us," "our," "we," and any variation thereof refer to the Puerto Rico Convention Center and may include independent contractors who operate portions of the PRCC website on PRCC's behalf.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Intellectual Property Ownership Notice</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Unless otherwise noted, this website and all of the materials contained herein, including the HTML code, source code, and any other code used to generate any portion of this website, are the copyrighted property of PRCC, its affiliated companies, suppliers, or of third parties who have licensed PRCC to use their property. None of the content, data, or any portion thereof, found on this website may be reproduced, republished, distributed, sold, transferred, displayed, shared, reposted, modified or otherwise used in any way or for any purpose without the express written permission of PRCC provided, however, that users may reproduce a single copy of any webpage for their personal, non-commercial, entertainment, information, or use.
                </p>
                <p className="text-gray-700 leading-relaxed mb-4">
                  In addition, the trademarks, logos, and service marks displayed on this website (collectively the "Trademarks") are registered and common law trademarks of PRCC and/or third party service providers. Nothing contained on this website should be construed as granting, by implication, estoppel, or otherwise, any license or right to use any of the Trademarks without the written permission of PRCC and/or the appropriate third party service providers. PRCC actively protects its rights to the content of the PRCC website and its trademarks to the fullest extent of the law.
                </p>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Requests regarding use of the content of this website for any purpose other than personal, non-commercial use should be directed to <a href="mailto:info@centro-de-convenciones-4fa3fc.ingress-erytho.easywp.com" className="text-[#10a0c6] hover:underline">info@centro-de-convenciones-4fa3fc.ingress-erytho.easywp.com</a>
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Representations and Warranties of the User</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  You represent and warrant that no materials of any kind submitted by you to the PRCC website will (1) violate, plagiarize, or infringe upon the rights of any third party, including copyright, trademark, privacy or other personal or proprietary rights; or (2) contain libelous, pornographic or otherwise unlawful material. Your further warrant that you have the right to grant to PRCC all rights that you grant to it under this agreement.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">No Unlawful or Prohibited Use</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  As a condition of your use of this website, you agree that you will not use this website for any purpose that is unlawful or prohibited by these Terms and Conditions of Use. Actions that you agree not to take include, but are not limited to:
                </p>
                <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                  <li>Taking or attempting to take any action that grants you access to the website to an extent greater than authorized by PRCC</li>
                  <li>Taking or attempting to take any action that results in an unauthorized modification, addition, or deletion to the website</li>
                  <li>Taking or attempting to take any action that violates the security of the website</li>
                  <li>Taking or attempting to take any action that would impose an unreasonable or excessively large load on the website's infrastructure</li>
                  <li>Knowingly providing false or misleading information to PRCC</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Personal and Non-Commercial Use Limitation</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  This website is strictly for your personal and non-commercial use. In the absence of PRCC's express prior written consent, you may not modify, copy, transmit, distribute, display, publish, or reproduce this website or any part thereof for any purpose other than your own personal and non-commercial use.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">{dict.terms.privacyPolicyTitle}</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  {dict.terms.privacyPolicyText}
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Children</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  PRCC believes that it is extremely important to protect children's personal information. As a result, no one under the age of 13 is allowed to use any features of this website that result in our actively collecting personal information. By using any such features, you represent that you are 13 years old or older.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Links to Third Party Websites</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  This website contains hypertext links to other websites that are maintained by and under the control of third parties (the "Linked Websites"). PRCC is not responsible for, and makes no representation or warranty regarding, the content or accuracy of any of the Linked Websites. The inclusion of a link does not mean that PRCC endorses, has reviewed, or approves of the Linked Website or the individuals and/or organizations responsible for the Linked Website.
                </p>
                <p className="text-gray-700 leading-relaxed mb-4">
                  These hypertext links are provided as a convenience only, and PRCC is not responsible for any content that can be accessed through a hypertext link. If you access a Linked Website, you do so at your own risk. Any questions that you have about one of the Linked Websites should be directed to the individuals and/or organizations responsible for that website.
                </p>
                <p className="text-gray-700 leading-relaxed mb-4">
                  The Internet is a distributed network of millions of computers. Although we attempt to verify all links on a regular basis, there is a possibility that the particular server that you are attempting to link to is not currently operational.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Bookmarking and Linking to Our Website</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Individuals may, for personal, non-commercial use only, bookmark or point to any page within PRCC's website. Other users/websites MAY:
                </p>
                <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                  <li>Include a link to PRCC's website by pointing to the website's home page at www.prconvention.com</li>
                  <li>Link to PRCC's major sub-category pages, provided that it is made clear that the information is being provided by PRCC</li>
                </ul>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Unless otherwise negotiated directly with PRCC, other users/websites MAY NOT without PRCC's express written consent:
                </p>
                <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                  <li>Point or link from a website directly to content within PRCC's website other than by pointing or linking to www.prconvention.com or one of the major sub-category pages as provided above</li>
                  <li>Copy, modify, or display PRCC's name, logo, text, or graphic images in any way</li>
                  <li>Redeliver any of the pages/text/images/content of PRCC's website using "framing" technology</li>
                </ul>
                <p className="text-gray-700 leading-relaxed mb-4">
                  PRCC reserves the right to reject or terminate any links to the content of the website at any time for any reason.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Disclaimer of Warranty and Limitation of Liability</h2>
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
                  <p className="text-sm text-yellow-800 font-medium uppercase tracking-wide mb-2">Important Legal Notice</p>
                  <p className="text-gray-700 leading-relaxed text-sm">
                    YOU EXPRESSLY AGREE THAT USE OF THE SITE IS AT YOUR OWN RISK. NEITHER PRCC OR ANY OF ITS EMPLOYEES, AGENTS, CONTENT PROVIDERS, CONTRACTORS, LICENSEES OR LICENSORS, MAKES ANY REPRESENTATION OR WARRANTY OF ANY KIND REGARDING THE RESULTS THAT MAY BE OBTAINED FROM THE USE OF THE WEBSITE OR REGARDING THE SUITABILITY, RELIABILITY, AVAILABILITY, TIMELINESS, LACK OF VIRUSES OR OTHER HARMFUL COMPONENTS, AND ACCURACY OF THE INFORMATION, PRODUCTS, SERVICES, RELATED GRAPHICS, AND ALL OTHER CONTENT FOUND ON THIS WEBSITE.
                  </p>
                </div>
                <p className="text-gray-700 leading-relaxed mb-4">
                  ALL SUCH INFORMATION, PRODUCT, SERVICES, RELATED GRAPHICS, AND ALL OTHER CONTENT FOUND ON THIS WEBSITE IS PROVIDED 'AS IS' AND PRCC SPECIFICALLY DISCLAIMS ANY EXPRESS OR IMPLIED WARRANTIES AND CONDITIONS WITH REGARD TO SUCH INFORMATION, PRODUCT, SERVICES, RELATED GRAPHICS, AND ALL OTHER CONTENT FOUND ON THIS WEBSITE, INCLUDING WITHOUT LIMITATION WARRANTIES OF ACCURACY, TITLE, FITNESS FOR A PARTICULAR PURPOSE, WARRANTIES OF MERCHANTABILITY OR WARRANTIES AGAINST INFRINGEMENT.
                </p>
                <p className="text-gray-700 leading-relaxed mb-4">
                  The information on this website was supplied by the organizations and corporations indicated herein. PRCC is not responsible for errors, omissions, and information which may no longer be applicable because of the passage of time. All prices, dates, and times provided through this website are subject to change.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Transfer of Rights</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  PRCC may at any time transfer its rights and obligations under this agreement to any PRCC affiliate, subsidiary or business unit, or any of their affiliated companies or divisions.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Amendments to These Terms and Conditions of Use</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  From time to time, it may be necessary for PRCC to amend these Terms and Conditions of Use. You are responsible for regularly reviewing these Terms and Conditions of Use so that you will be aware of any changes. Please note that your continued use of this website means that you accept the amendments to these Terms and Conditions of Use.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Governing Law</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  This agreement and its performance are governed by and construed in accordance with the laws of the Commonwealth of Puerto Rico and the United States of America without regard to any conflicts of law provisions. You hereby agree to submit to the exclusive jurisdiction of the state and federal courts located in the Commonwealth of Puerto Rico, for all disputes and issues regarding your use of this website and your compliance with these Terms and Conditions of Use.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Restriction on Use Based on Location</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Use of this website is unauthorized in any jurisdiction that does not give effect to all provisions of these Terms and Conditions of Use. If, however, despite the exclusions contained in this agreement, PRCC should be found liable for any loss or damage which arises out of or is in any way connected with any of the functions or uses of this website, PRCC's liability shall not exceed the amount of any subscription fees and/or service charges, if any, paid by claimant to PRCC for the services and/or data with respect to which liability is found.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Accessing the Website in Countries Other Than the United States</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  PRCC makes no claims regarding the legality of viewing or downloading the content of this website in any country other than the United States. Anyone who accesses this website in a country other than the United States does so at his or her own risk.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Violation of These Terms and Conditions of Use</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  If PRCC determines that you have violated any provision of these Terms and Conditions of Use, PRCC has the right, in its sole discretion, to pursue any and all of its legal remedies.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Indemnification</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  You agree to defend, indemnify, and hold harmless PRCC, and its officers, directors, employees, and agents from and against any and all claims arising from your use of the website.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Severability</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  If any provision of these Terms and Conditions of Use is held to be invalid or unenforceable, the validity and enforceability of the other provisions of these Terms and Conditions of Use will remain unaffected.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Headings</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  The headings in these Terms and Conditions of Use are included solely for convenience and will not limit or otherwise affect these Terms and Conditions of Use.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Entire Agreement</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  These Terms and Conditions of Use and any other policies and/or guidelines referred to herein constitute the entire agreement between you and PRCC regarding this website, and supersede all other prior or concurrent oral or written letters, agreements, or understandings related to this website.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Contact Us</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  If you have any questions or comments, we can be contacted by:
                </p>
                <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                  <li>Email: <a href="mailto:info@centro-de-convenciones-4fa3fc.ingress-erytho.easywp.com" className="text-[#10a0c6] hover:underline">info@centro-de-convenciones-4fa3fc.ingress-erytho.easywp.com</a></li>
                  <li>Telephone: <a href="tel:+17876417722" className="text-[#10a0c6] hover:underline">(787) 641-7722</a></li>
                  <li>Postal Mail: Puerto Rico Convention Bureau, Inc. on behalf of the Puerto Rico Convention Center, 100 Convention Boulevard, San Juan, Puerto Rico</li>
                </ul>
              </section>
            </div>

            {/* Contact Section */}
            <div className="mt-12 bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Need Help?</h3>
              <p className="text-gray-600 mb-4">
                {dict.terms.contactText}
              </p>
              <button
                onClick={() => window.dispatchEvent(new CustomEvent('open-chat-modal'))}
                className="inline-flex items-center justify-center gap-2 bg-black text-white px-6 py-3 rounded-full hover:bg-gray-800 transition-colors font-semibold"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                </svg>
                Contact Us
              </button>
            </div>
          </div>
        </Container>
      </main>
      <Footer locale={locale} dict={dict} />
    </>
  );
}
