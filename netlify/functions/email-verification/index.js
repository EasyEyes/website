const { MailtrapClient } = require("mailtrap");

const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

exports.handler = async (event) => {
  // Handle preflight requests
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers,
      body: "",
    };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  // Parse the endpoint from the path
  const endpoint = event.path.replace(
    "/.netlify/functions/email-verification/",
    "",
  );

  try {
    if (endpoint === "send") {
      return await handleSendEmail(event);
    } else if (endpoint === "verify") {
      return await handleVerifyCode(event);
    } else {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: "Endpoint not found" }),
      };
    }
  } catch (error) {
    console.error("Function error:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: "Internal server error",
        details: error.message,
      }),
    };
  }
};

async function handleSendEmail(event) {
  const {
    authorEmails,
    verificationCode,
    experimentName,
    emailSubjectTemplate,
    emailMessageTemplate,
    language,
  } = JSON.parse(event.body);

  if (!authorEmails || !verificationCode || !experimentName) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({
        error:
          "Missing required fields: authorEmails, verificationCode, experimentName",
      }),
    };
  }

  // Basic email validation for semicolon-separated emails
  const emails = authorEmails
    .split(";")
    .map((email) => email.trim())
    .filter((email) => email.length > 0);
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  for (const email of emails) {
    if (!emailRegex.test(email)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: `Invalid email format: ${email}` }),
      };
    }
  }

  // Check for required environment variables
  if (!process.env.MAILTRAP_TOKEN) {
    console.error("Missing MAILTRAP_TOKEN environment variable");
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "Email service configuration error" }),
    };
  }

  try {
    // Initialize MailTrap
    const mailtrap = new MailtrapClient({
      token: process.env.MAILTRAP_TOKEN,
    });

    // Use RC_ phrase templates passed from frontend
    // Replace placeholders: EEE = experimentName, 123456 = verificationCode
    // Handle potential undefined/empty templates
    const safeEmailSubjectTemplate =
      emailSubjectTemplate ||
      "EEE — Verify authorship for microphone calibration";
    const safeEmailMessageTemplate =
      emailMessageTemplate ||
      "To calibrate microphones, please copy and paste the following code into the EEE web page:\n123456";

    const emailSubject = safeEmailSubjectTemplate.replace(
      /EEE/g,
      experimentName,
    );
    const emailTextBody = safeEmailMessageTemplate
      .replace(/EEE/g, experimentName)
      .replace(/123456/g, verificationCode);

    // Create HTML version from the text body (escape HTML to prevent injection)
    const escapeHtml = (text) =>
      text.replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/&/g, "&amp;");
    const emailHtmlBody = `
      <div style="font-family: Arial, sans-serif; font-size:16px; color:#333; line-height: 1.5;">
        <p>${escapeHtml(emailTextBody.split("\n")[0])}</p>
        <div style="font-size:24px; font-weight:bold; margin:20px 0; padding:15px; background:#f8f9fa; border:2px solid #dee2e6; border-radius:8px; text-align:center; color:#000; font-family: 'Courier New', monospace;">
          ${verificationCode}
        </div>
      </div>
    `;

    // Send to all emails (semicolon-separated as specified)
    // "Most email programs accept several semicolon-separated email addresses, so we don't need to parse the _authorEmails string"
    // However, Mailtrap API requires individual email objects, so we parse but send to all
    const toEmails = emails.map((email) => ({ email: email.trim() }));

    // Send email
    const response = await mailtrap.send({
      from: {
        name: "EasyEyes",
        email: process.env.EMAIL_FROM || "noreply@easyeyes.app",
      },
      to: toEmails,
      subject: emailSubject,
      text: emailTextBody,
      html: emailHtmlBody,
      category: "microphone_verification",
    });

    console.log("[Mailtrap] Email sent successfully:", response);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: "Verification email sent successfully",
        messageId: response.message_ids?.[0] || "unknown",
        emailsSent: emails.length,
      }),
    };
  } catch (error) {
    console.error("Mailtrap error:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: "Failed to send verification email",
        details: error.message,
      }),
    };
  }
}

async function handleVerifyCode(event) {
  // For stateless verification (client-side verification as implemented in threshold.js)
  const { code, sessionId } = JSON.parse(event.body || "{}");

  // Basic validation
  if (!code || !/^\d{6}$/.test(code)) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: "Invalid verification code format" }),
    };
  }

  // For now, return success (actual verification happens client-side)
  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      success: true,
      message: "Code format validated",
    }),
  };
}
