const clean = (value, max = 1000) =>
  String(value ?? "").trim().slice(0, max);

const escapeHtml = (value) =>
  clean(value, 5000).replace(
    /[&<>"']/g,
    (char) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[char]
  );

const sendJson = (res, status, body) => {
  res.status(status).json(body);
};

const money = (amount) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(Number(amount) || 0);

const formatDate = (date) => {
  if (!date) return "Wedding date to be chosen";

  try {
    return new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
      timeZone: "UTC",
    }).format(new Date(`${date}T12:00:00Z`));
  } catch {
    return date;
  }
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return sendJson(res, 405, {
      ok: false,
      error: "Method not allowed",
    });
  }

  const body = req.body || {};

  const firstName = clean(body.firstName, 80);
  const partnerName = clean(body.partnerName, 80);
  const email = clean(body.email, 180);
  const phone = clean(body.phone, 80);
  const tourDate = clean(body.tourDate, 40);
  const tourTime = clean(body.tourTime, 40);
  const message = clean(body.message, 4000);

  if (!firstName || !email || !phone || !tourDate || !tourTime) {
    return sendJson(res, 400, {
      ok: false,
      error: "Please complete all required tour fields.",
    });
  }

  const resendKey = process.env.RESEND_API_KEY;
  const notificationEmail = process.env.LEAD_NOTIFICATION_EMAIL;

  if (!resendKey || !notificationEmail) {
    return sendJson(res, 503, {
      ok: false,
      error:
        "The live demo email automation has not been connected in Vercel yet.",
    });
  }

  const wedding = body.wedding || {};

  const coupleNames = [firstName, partnerName]
    .filter(Boolean)
    .join(" + ");

  const leadId = `WL-${Date.now().toString(36).toUpperCase()}`;

  const weddingDate = formatDate(wedding.date);
  const guests = clean(wedding.guestCount, 50);
  const ceremony = clean(wedding.ceremony, 100);
  const experience = clean(wedding.package, 100);
  const investment = money(wedding.investment);

  const html = `
    <div style="
      max-width:680px;
      margin:0 auto;
      font-family:Arial,sans-serif;
      color:#223126;
      line-height:1.5;
    ">

      <p style="
        text-transform:uppercase;
        letter-spacing:.14em;
        font-size:12px;
      ">
        Willow Lily Live Demo
      </p>

      <h1 style="
        font-family:Georgia,serif;
        font-weight:400;
        font-size:32px;
      ">
        New private tour request
      </h1>

      <h2 style="
        font-family:Georgia,serif;
        font-weight:400;
      ">
        ${escapeHtml(coupleNames)}
      </h2>

      <p>
        <strong>Private tour:</strong>
        ${escapeHtml(formatDate(tourDate))}
        · ${escapeHtml(tourTime)}
      </p>

      <p>
        <strong>Email:</strong>
        ${escapeHtml(email)}
        <br>

        <strong>Phone:</strong>
        ${escapeHtml(phone)}
      </p>

      <h2 style="
        font-family:Georgia,serif;
        font-weight:400;
        margin-top:32px;
      ">
        Wedding information captured automatically
      </h2>

      <table
        cellpadding="8"
        cellspacing="0"
        style="
          width:100%;
          border-collapse:collapse;
        "
      >

        <tr>
          <td style="border-top:1px solid #ddd;">
            <strong>Wedding date</strong>
          </td>
          <td style="border-top:1px solid #ddd;">
            ${escapeHtml(weddingDate)}
          </td>
        </tr>

        <tr>
          <td style="border-top:1px solid #ddd;">
            <strong>Guest count</strong>
          </td>
          <td style="border-top:1px solid #ddd;">
            ${escapeHtml(guests)}
          </td>
        </tr>

        <tr>
          <td style="border-top:1px solid #ddd;">
            <strong>Ceremony</strong>
          </td>
          <td style="border-top:1px solid #ddd;">
            ${escapeHtml(ceremony)}
          </td>
        </tr>

        <tr>
          <td style="border-top:1px solid #ddd;">
            <strong>Experience</strong>
          </td>
          <td style="border-top:1px solid #ddd;">
            ${escapeHtml(experience)}
          </td>
        </tr>

        <tr>
          <td style="border-top:1px solid #ddd;">
            <strong>Estimated investment</strong>
          </td>
          <td style="border-top:1px solid #ddd;">
            ${escapeHtml(investment)}
          </td>
        </tr>

      </table>

      ${
        message
          ? `
        <h2 style="
          font-family:Georgia,serif;
          font-weight:400;
          margin-top:32px;
        ">
          Couple's notes
        </h2>

        <p>
          ${escapeHtml(message)}
        </p>
      `
          : ""
      }

      <hr style="
        margin:32px 0;
        border:0;
        border-top:1px solid #ddd;
      ">

      <p style="
        font-size:12px;
        color:#687068;
      ">
        A. Halliwell Studio portfolio demonstration.
        Willow Lily Inn & Estate is fictional.
        This email demonstrates how a venue can receive
        a qualified inquiry with the couple's wedding
        information already organized.
      </p>

    </div>
  `;

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",

      headers: {
        Authorization: `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        from:
          process.env.DEMO_FROM_EMAIL ||
          "Willow Lily Demo <onboarding@resend.dev>",

        to: [notificationEmail],

        reply_to: email,

        subject:
          `Willow Lily Tour Request — ` +
          `${coupleNames} — ` +
          `${formatDate(tourDate)}`,

        html,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();

      console.error(
        "Resend error:",
        response.status,
        errorText
      );

      return sendJson(res, 502, {
        ok: false,
        error:
          "The tour request was received, but the demo email could not be delivered.",
      });
    }

    return sendJson(res, 200, {
      ok: true,
      leadId,
      message: "Private tour request sent.",
    });
  } catch (error) {
    console.error("Tour request error:", error);

    return sendJson(res, 500, {
      ok: false,
      error: "The tour request could not be processed.",
    });
  }
}
