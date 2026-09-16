const json = (res, status, body) => {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(body));
};

const clean = (v, n = 500) =>
  String(v ?? "").trim().slice(0, n);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return json(res, 405, {
      error: "Method not allowed",
    });
  }

  const key = process.env.STRIPE_SECRET_KEY;

  if (!key) {
    return json(res, 503, {
      error: "Stripe test mode is not configured yet.",
    });
  }

  if (!key.startsWith("sk_test_")) {
    return json(res, 503, {
      error:
        "For this portfolio demo, STRIPE_SECRET_KEY must be a Stripe TEST key.",
    });
  }

  let body = req.body;

  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch {
      return json(res, 400, {
        error: "Invalid request",
      });
    }
  }

  body = body || {};

  const amount = Math.round(Number(body.amount) || 0);

  if (amount < 50 || amount > 1000000) {
    return json(res, 400, {
      error: "Invalid demonstration deposit amount.",
    });
  }

  const origin =
    `${req.headers["x-forwarded-proto"] || "https"}://` +
    req.headers.host;

  const params = new URLSearchParams();

  params.set("mode", "payment");

  params.set(
    "success_url",
    `${origin}/deposit-success?session_id={CHECKOUT_SESSION_ID}`
  );

  params.set(
    "cancel_url",
    `${origin}/proposal#deposit`
  );

  params.set(
    "line_items[0][quantity]",
    "1"
  );

  params.set(
    "line_items[0][price_data][currency]",
    "usd"
  );

  params.set(
    "line_items[0][price_data][unit_amount]",
    String(amount * 100)
  );

  params.set(
    "line_items[0][price_data][product_data][name]",
    "Willow Lily booking deposit — DEMO"
  );

  params.set(
    "line_items[0][price_data][product_data][description]",
    `Stripe test mode · ${
      clean(body.names || "Demo couple", 120)
    } · ${
      clean(body.wedding?.date || "wedding date", 80)
    }`
  );

  params.set(
    "metadata[portfolio_demo]",
    "true"
  );

  params.set(
    "metadata[wedding_date]",
    clean(body.wedding?.date || "", 80)
  );

  const response = await fetch(
    "https://api.stripe.com/v1/checkout/sessions",
    {
      method: "POST",

      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type":
          "application/x-www-form-urlencoded",
      },

      body: params,
    }
  );

  const data = await response
    .json()
    .catch(() => ({}));

  if (!response.ok) {
    console.error(
      "Stripe",
      response.status,
      data
    );

    return json(res, 502, {
      error:
        data?.error?.message ||
        "Stripe test checkout could not be created.",
    });
  }

  return json(res, 200, {
    ok: true,
    url: data.url,
  });
}
