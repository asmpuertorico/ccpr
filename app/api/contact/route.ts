import { NextRequest, NextResponse } from "next/server";

type ContactFormData = {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
};

function generateEmailHTML(formData: ContactFormData, baseUrl: string = 'https://prconvention.com') {
  const COLORS = {
    dark: '#000000',
    lightBg: '#f6f4f1',
    grayText: '#525252',
    neutralLight: '#f5f5f5',
    neutralDark: '#404040',
  };

  const businessName = 'Puerto Rico Convention Center';
  const businessWebsite = 'https://prconvention.com';
  const senderName = formData.name;
  const senderEmail = formData.email;
  const subject = formData.subject;
  
  // Logo URL - same as universal template
  const logoUrl = "https://ugnyocjdcpdlneirkfiq.supabase.co/storage/v1/object/public/brand-assets/logos/link%20logo%20no%20icon.png";
  
  // Format the content with contact information
  const content = `
<strong>Contact Information:</strong><br />
Name: ${formData.name}<br />
Email: ${formData.email}${formData.phone ? `<br />Phone: ${formData.phone}` : ''}<br /><br />
<strong>Subject:</strong> ${formData.subject}<br /><br />
<strong>Message:</strong><br />
${formData.message.replace(/\n/g, '<br />')}
  `.trim();

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: ${COLORS.lightBg}; font-family: Inter, 'Helvetica Neue', Arial, sans-serif;">
  <div style="max-width: 600px; background-color: ${COLORS.lightBg}; border-radius: 12px; margin: 0 auto; padding-top: 40px; padding-bottom: 40px;">
    
    <!-- Logo Header -->
    <div style="padding: 48px 32px 16px 32px;">
      <img
        src="${logoUrl}"
        alt="${businessName} Logo"
        style="height: 24px; width: auto; display: block;"
        width="auto"
        height="24"
      />
    </div>

    <!-- Title -->
    <div style="padding: 0 32px 24px 32px;">
      <h1 style="color: ${COLORS.grayText}; font-size: 28px; line-height: 1.3; margin: 0; font-weight: 300; letter-spacing: -0.02em; text-align: left;">
        ${subject}
      </h1>
    </div>

    <!-- Main Content Area -->
    <div style="padding: 16px 32px 40px 32px;">
      
      <!-- Business Branding -->
      <p style="font-size: 14px; color: ${COLORS.grayText}; line-height: 1.6; margin-bottom: 24px; margin-top: 0; text-align: center; font-weight: 500;">
        From ${businessName}
      </p>

      <!-- Main Content Section -->
      <div style="margin-bottom: 32px; background-color: ${COLORS.neutralLight}; padding: 24px; border-radius: 8px; border-left: 4px solid ${COLORS.neutralDark};">
        <div style="font-size: 16px; color: #404040; line-height: 1.5; margin: 0;">
          ${content}
        </div>
      </div>

      <!-- Sender Information -->
      <div style="margin-bottom: 32px;">
        <p style="font-size: 16px; color: ${COLORS.grayText}; line-height: 1.6; font-weight: 600; margin: 0;">
          Best regards,<br />
          ${senderName}<br />
          <span style="font-size: 14px; color: ${COLORS.grayText}; font-weight: 400;">
            ${senderEmail}
          </span>
          <br />
          <a href="${businessWebsite}" style="font-size: 14px; color: ${COLORS.dark}; text-decoration: underline;">
            ${businessWebsite}
          </a>
        </p>
      </div>
    </div>
    
    <!-- Separator Line -->
    <div style="padding: 0 32px; margin-bottom: 40px;">
      <div style="background-color: #e5e7eb; height: 1px; width: 400px; margin: 0 auto;"></div>
    </div>

    <!-- Footer -->
    <div style="padding: 16px 32px 48px 32px; text-align: center; font-size: 12px; color: ${COLORS.grayText};">
      <p style="font-size: 12px; color: ${COLORS.grayText}; margin: 0;">
        © 2025 ${businessName}. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

export async function POST(req: NextRequest) {
  try {
    const body: ContactFormData = await req.json();

    // Validate required fields
    if (!body.name || !body.email || !body.subject || !body.message) {
      return NextResponse.json(
        { message: "All required fields must be filled" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        { message: "Invalid email format" },
        { status: 400 }
      );
    }

    // Get base URL for logo image
    const baseUrl = req.nextUrl.origin || 
      process.env.NEXT_PUBLIC_SITE_URL || 
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://prconvention.com");

    // Prepare email content
    const emailSubject = body.subject;
    const emailHTML = generateEmailHTML(body, baseUrl);
    const emailText = `
New contact form submission from ${body.name}

Contact Information:
- Name: ${body.name}
- Email: ${body.email}
${body.phone ? `- Phone: ${body.phone}` : ""}

Subject: ${body.subject}

Message:
${body.message}

---
This email was sent from the Puerto Rico Convention Center contact form.
    `.trim();

    // Send email using Resend (if configured) or fallback to console log
    const recipientEmail = "mcolon@prconvention.com";
    
    if (process.env.RESEND_API_KEY) {
      // Use Resend if API key is configured
      try {
        // Use onboarding@resend.dev as default (no domain verification needed)
        // Or use RESEND_FROM_EMAIL if a verified domain is configured
        const fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
        
        const resendResponse = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${process.env.RESEND_API_KEY}`,
          },
          body: JSON.stringify({
            from: fromEmail,
            to: recipientEmail,
            reply_to: body.email,
            subject: emailSubject,
            html: emailHTML,
            text: emailText,
          }),
        });

        const responseData = await resendResponse.json();

        if (!resendResponse.ok) {
          console.error("Resend API error:", responseData);
          throw new Error(responseData.message || "Failed to send email via Resend");
        }

        console.log("Email sent successfully via Resend:", responseData.id);
        return NextResponse.json({ 
          message: "Contact form submitted successfully",
          success: true 
        });
      } catch (resendError) {
        console.error("Resend error:", resendError);
        // In production, we should fail if email service fails
        if (process.env.NODE_ENV === "production") {
          return NextResponse.json(
            { message: "Failed to send email. Please try again later or contact us directly." },
            { status: 500 }
          );
        }
        // In development, fall through to console log
      }
    }

    // Fallback: Log to console and return success (for development)
    // In production, you should configure an email service
    console.log("=== CONTACT FORM SUBMISSION ===");
    console.log("To:", recipientEmail);
    console.log("Subject:", emailSubject);
    console.log("Text Body:", emailText);
    console.log("==============================");

    // For development/testing, we'll return success even without email service
    // In production, you should configure RESEND_API_KEY or another email service
    if (process.env.NODE_ENV === "production" && !process.env.RESEND_API_KEY) {
      console.warn("WARNING: No email service configured in production!");
    }

    return NextResponse.json({ 
      message: "Contact form submitted successfully",
      success: true 
    });
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json(
      { message: "Failed to submit contact form. Please try again later." },
      { status: 500 }
    );
  }
}

