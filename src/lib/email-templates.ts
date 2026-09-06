export interface BaseEmailProps {
  siteUrl?: string;
  siteName?: string;
}

export interface WelcomeEmailProps extends BaseEmailProps {
  name: string;
}

export interface ProjectSubmittedEmailProps extends BaseEmailProps {
  creatorName: string;
  projectName: string;
}

export interface ProjectApprovedEmailProps extends BaseEmailProps {
  creatorName: string;
  projectName: string;
  projectSlug: string;
}

export interface PaymentReceiptEmailProps extends BaseEmailProps {
  userName: string;
  productName: string;
  amountCents: number;
  currency: string;
  orderId: string;
  date?: string;
}

const DEFAULT_APP_URL = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || "https://launchhub.dev";

function getEmailLayout(content: string, siteName = "LaunchHub", siteUrl = DEFAULT_APP_URL) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${siteName}</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #F8F7F4;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      color: #17150F;
      -webkit-font-smoothing: antialiased;
    }
    .wrapper {
      width: 100%;
      table-layout: fixed;
      background-color: #F8F7F4;
      padding: 40px 0 60px 0;
    }
    .main-table {
      max-width: 580px;
      margin: 0 auto;
      background-color: #FFFFFF;
      border-radius: 20px;
      border: 1px solid #E7E4DB;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
    }
    .header {
      padding: 32px 40px 24px 40px;
      border-bottom: 1px solid #F1EFEA;
      text-align: left;
    }
    .brand {
      font-size: 22px;
      font-weight: 800;
      letter-spacing: -0.5px;
      color: #17150F;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }
    .brand-accent {
      color: #E4572E;
    }
    .content {
      padding: 36px 40px 40px 40px;
    }
    .h1 {
      font-size: 24px;
      font-weight: 800;
      line-height: 1.25;
      color: #17150F;
      margin: 0 0 16px 0;
      letter-spacing: -0.5px;
    }
    .text {
      font-size: 15px;
      line-height: 1.6;
      color: #4A463D;
      margin: 0 0 20px 0;
    }
    .button-container {
      margin: 30px 0;
    }
    .btn-primary {
      display: inline-block;
      background-color: #E4572E;
      color: #FFFFFF !important;
      font-size: 14px;
      font-weight: 700;
      text-decoration: none;
      padding: 14px 28px;
      border-radius: 12px;
      text-align: center;
    }
    .card-box {
      background-color: #FBFBF9;
      border: 1px solid #EDEAE3;
      border-radius: 14px;
      padding: 20px;
      margin: 24px 0;
    }
    .info-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      font-size: 14px;
      border-bottom: 1px dashed #E5E1D8;
    }
    .info-row:last-child {
      border-bottom: none;
      padding-bottom: 0;
    }
    .info-label {
      color: #716C61;
      font-weight: 500;
    }
    .info-value {
      color: #17150F;
      font-weight: 700;
    }
    .footer {
      padding: 28px 40px 32px 40px;
      background-color: #FAFAF7;
      border-top: 1px solid #EFECE5;
      text-align: center;
      font-size: 12px;
      color: #8C877B;
      line-height: 1.6;
    }
    .footer a {
      color: #E4572E;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <table class="main-table" cellpadding="0" cellspacing="0" width="100%">
      <!-- Header -->
      <tr>
        <td class="header">
          <a href="${siteUrl}" class="brand">
            🚀 ${siteName.replace("Hub", "")}<span class="brand-accent">Hub</span>
          </a>
        </td>
      </tr>
      <!-- Body -->
      <tr>
        <td class="content">
          ${content}
        </td>
      </tr>
      <!-- Footer -->
      <tr>
        <td class="footer">
          <p style="margin: 0 0 8px 0;">
            You received this email because you have an account or activity on 
            <a href="${siteUrl}"><strong>${siteName}</strong></a>.
          </p>
          <p style="margin: 0;">
            © ${new Date().getFullYear()} ${siteName}. All rights reserved.
          </p>
        </td>
      </tr>
    </table>
  </div>
</body>
</html>
  `;
}

/**
 * 1. Template: Welcome Email
 */
export function renderWelcomeEmail({ name, siteUrl = DEFAULT_APP_URL, siteName = "LaunchHub" }: WelcomeEmailProps) {
  const content = `
    <h1 class="h1">Welcome to ${siteName}, ${name}! 🚀</h1>
    <p class="text">
      We are thrilled to have you in our community of indie builders, entrepreneurs, and tech enthusiasts.
    </p>
    <p class="text">
      Here is what you can do right now on ${siteName}:
    </p>
    <div class="card-box">
      <p style="margin: 0 0 12px 0; font-size: 14px; font-weight: 600; color: #17150F;">
        ✨ <strong>Discover Daily Products</strong> — Upvote your favorite AI tools, SaaS apps, and indie projects.
      </p>
      <p style="margin: 0 0 12px 0; font-size: 14px; font-weight: 600; color: #17150F;">
        🚀 <strong>Launch Your Project</strong> — Share your startup with thousands of early adopters and get real feedback.
      </p>
      <p style="margin: 0; font-size: 14px; font-weight: 600; color: #17150F;">
        🏆 <strong>Compete in the Rankings</strong> — Reach the top spots of the Day, Week, and Month leaderboards.
      </p>
    </div>
    <div class="button-container">
      <a href="${siteUrl}/explore" class="btn-primary">
        Explore Trending Projects
      </a>
    </div>
    <p class="text" style="font-size: 13px; color: #716C61;">
      Need any assistance or have questions about launching? Reply directly to this email or visit our help center.
    </p>
  `;

  return {
    subject: `Welcome to ${siteName}, ${name}! 🚀`,
    html: getEmailLayout(content, siteName, siteUrl),
    text: `Welcome to ${siteName}, ${name}!\n\nWe are thrilled to have you in our community. Explore projects or launch your own today at: ${siteUrl}/explore`,
  };
}

/**
 * 2. Template: Project Submitted (Under Review)
 */
export function renderProjectSubmittedEmail({
  creatorName,
  projectName,
  siteUrl = DEFAULT_APP_URL,
  siteName = "LaunchHub",
}: ProjectSubmittedEmailProps) {
  const content = `
    <h1 class="h1">Your project is in review ⏳</h1>
    <p class="text">
      Hi ${creatorName}, thank you for submitting <strong>${projectName}</strong> to ${siteName}!
    </p>
    <p class="text">
      Our moderation team has received your submission and is reviewing it to verify that everything matches our community quality standards.
    </p>
    <div class="card-box">
      <div class="info-row">
        <span class="info-label">Project:</span>
        <span class="info-value">${projectName}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Status:</span>
        <span class="info-value" style="color: #D97706;">Pending Review</span>
      </div>
      <div class="info-row">
        <span class="info-label">Estimated Time:</span>
        <span class="info-value">Within 24 hours</span>
      </div>
    </div>
    <p class="text">
      <strong>What happens next?</strong><br>
      As soon as your project is approved, you will receive an email notification and it will be immediately published to the live feed and rankings.
    </p>
    <div class="button-container">
      <a href="${siteUrl}/dashboard/projects" class="btn-primary">
        View in Dashboard
      </a>
    </div>
    <p class="text" style="font-size: 13px; color: #716C61;">
      Pro-tip: While waiting, prepare your launch post on X (Twitter), LinkedIn, and with your subscribers so you can get initial votes the moment you go live!
    </p>
  `;

  return {
    subject: `Project Received: "${projectName}" is under review ⏳`,
    html: getEmailLayout(content, siteName, siteUrl),
    text: `Hi ${creatorName},\n\nThank you for submitting "${projectName}" to ${siteName}. Your project is currently in the review queue and will be published once approved.\n\nTrack your submission: ${siteUrl}/dashboard/projects`,
  };
}

/**
 * 3. Template: Project Approved (Now Live)
 */
export function renderProjectApprovedEmail({
  creatorName,
  projectName,
  projectSlug,
  siteUrl = DEFAULT_APP_URL,
  siteName = "LaunchHub",
}: ProjectApprovedEmailProps) {
  const projectLink = `${siteUrl}/project/${projectSlug}`;

  const content = `
    <h1 class="h1">🎉 "${projectName}" is now LIVE!</h1>
    <p class="text">
      Awesome news, ${creatorName}! Your project <strong>${projectName}</strong> has been approved by our team and is officially published on ${siteName}.
    </p>
    <div class="card-box" style="border-left: 4px solid #10B981;">
      <p style="margin: 0 0 8px 0; font-size: 14px; font-weight: 700; color: #065F46;">
        ✅ Live on Today's Leaderboard
      </p>
      <p style="margin: 0; font-size: 13px; color: #4A463D;">
        Your product is now eligible to receive community upvotes, reviews, and traffic.
      </p>
    </div>
    <div class="button-container">
      <a href="${projectLink}" class="btn-primary">
        View Your Live Project
      </a>
    </div>
    <p class="text">
      <strong>How to maximize your launch day:</strong>
    </p>
    <ul style="color: #4A463D; font-size: 14px; line-height: 1.8; margin: 0 0 24px 0; padding-left: 20px;">
      <li>Share your project link with friends, colleagues, and followers.</li>
      <li>Post on social media using the direct URL: <a href="${projectLink}" style="color: #E4572E;">${projectLink}</a></li>
      <li>Engage with commenters on your project page to boost activity.</li>
    </ul>
    <p class="text" style="font-size: 13px; color: #716C61;">
      Best of luck with your launch! We are rooting for you.
    </p>
  `;

  return {
    subject: `🎉 Your project "${projectName}" is now LIVE on ${siteName}!`,
    html: getEmailLayout(content, siteName, siteUrl),
    text: `Congratulations ${creatorName}!\n\nYour project "${projectName}" has been approved and is now live on ${siteName}.\n\nView it here: ${projectLink}\n\nShare your link with your network to collect votes today!`,
  };
}

/**
 * 4. Template: Payment Receipt
 */
export function renderPaymentReceiptEmail({
  userName,
  productName,
  amountCents,
  currency,
  orderId,
  date = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
  siteUrl = DEFAULT_APP_URL,
  siteName = "LaunchHub",
}: PaymentReceiptEmailProps) {
  const formattedAmount = `${(amountCents / 100).toFixed(2)} ${currency.toUpperCase()}`;

  const content = `
    <h1 class="h1">Payment Confirmed — Thank you! 🧾</h1>
    <p class="text">
      Hi ${userName}, we received your payment. Your purchase of <strong>${productName}</strong> is complete and your benefits have been activated.
    </p>
    <div class="card-box">
      <div class="info-row">
        <span class="info-label">Item / Plan:</span>
        <span class="info-value">${productName}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Order Reference:</span>
        <span class="info-value" style="font-family: monospace; font-size: 13px;">${orderId}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Date:</span>
        <span class="info-value">${date}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Total Paid:</span>
        <span class="info-value" style="color: #10B981; font-size: 16px;">${formattedAmount}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Status:</span>
        <span class="info-value" style="color: #10B981;">PAID & ACTIVE</span>
      </div>
    </div>
    <div class="button-container">
      <a href="${siteUrl}/dashboard/projects" class="btn-primary">
        Go to Dashboard
      </a>
    </div>
    <p class="text" style="font-size: 13px; color: #716C61;">
      Keep this email as your official receipt. If you have any billing inquiries, please reply directly with your Order Reference.
    </p>
  `;

  return {
    subject: `Payment Receipt: ${productName} (${formattedAmount}) — ${siteName}`,
    html: getEmailLayout(content, siteName, siteUrl),
    text: `Hi ${userName},\n\nYour payment of ${formattedAmount} for ${productName} has been confirmed.\nOrder ID: ${orderId}\nDate: ${date}\n\nAccess your benefits: ${siteUrl}/dashboard/projects`,
  };
}
