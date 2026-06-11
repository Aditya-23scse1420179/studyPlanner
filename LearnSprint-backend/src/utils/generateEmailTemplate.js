const generateEmailTemplate = (otp) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <title>Email Verification — LearnSprint</title>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }

        body {
          font-family: 'Inter', Helvetica, sans-serif;
          background-color: #f0f4ff;
          color: #1a1a2e;
          padding: 40px 20px;
          -webkit-text-size-adjust: 100%;
        }

        .wrapper { max-width: 560px; margin: 0 auto; width: 100%; }

        .masthead { text-align: center; margin-bottom: 28px; }

        .masthead .wordmark {
          display: inline-block;
          font-size: 26px;
          font-weight: 700;
          color: #4f46e5;
          letter-spacing: -0.5px;
        }

        .masthead .wordmark span { color: #1a1a2e; }

        .masthead .tagline {
          margin-top: 6px;
          font-size: 11px;
          letter-spacing: 3px;
          text-transform: uppercase;
          color: #94a3b8;
        }

        .card {
          background: #ffffff;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 24px rgba(79, 70, 229, 0.1);
        }

        .card-strip {
          height: 4px;
          background: linear-gradient(90deg, #4f46e5 0%, #7c3aed 50%, #4f46e5 100%);
        }

        .card-body { padding: 44px 48px 40px; }

        .headline {
          font-size: 28px;
          font-weight: 700;
          line-height: 1.25;
          color: #1a1a2e;
          margin-bottom: 14px;
        }

        .headline span { color: #4f46e5; }

        .intro {
          font-size: 15px;
          line-height: 1.7;
          color: #64748b;
          border-left: 3px solid #4f46e5;
          padding-left: 14px;
          margin-bottom: 36px;
        }

        .section-label {
          font-size: 10px;
          letter-spacing: 4px;
          text-transform: uppercase;
          color: #94a3b8;
          text-align: center;
          margin-bottom: 14px;
        }

        .code-wrapper { text-align: center; margin-bottom: 32px; }

        .code-box {
          display: inline-block;
          background: #f5f3ff;
          border: 1.5px solid #c4b5fd;
          border-radius: 8px;
          padding: 20px 44px 20px 52px;
          font-family: 'Courier New', Courier, monospace;
          font-size: 38px;
          font-weight: 700;
          letter-spacing: 10px;
          color: #4f46e5;
        }

        .expiry {
          display: flex;
          align-items: center;
          gap: 10px;
          background: #fffbeb;
          border: 1px solid #fde68a;
          border-radius: 8px;
          padding: 14px 18px;
          margin-bottom: 32px;
          font-size: 13px;
          color: #92400e;
        }

        .expiry-icon { font-size: 18px; flex-shrink: 0; }

        .rule { border: none; border-top: 1px solid #e2e8f0; margin-bottom: 22px; }

        .footer-note { font-size: 13px; color: #94a3b8; line-height: 1.7; }

        .email-footer {
          text-align: center;
          margin-top: 28px;
          font-size: 11px;
          color: #cbd5e1;
          letter-spacing: 0.5px;
          line-height: 1.8;
        }

        .email-footer a { color: #4f46e5; text-decoration: none; }

        @media only screen and (max-width: 600px) {
          .card-body { padding: 36px 32px 32px; }
          .headline { font-size: 24px; }
          .code-box { font-size: 32px; letter-spacing: 8px; padding: 18px 32px 18px 40px; }
        }

        @media only screen and (max-width: 480px) {
          body { padding: 20px 10px; }
          .card-body { padding: 28px 22px 26px; }
          .headline { font-size: 21px; }
          .code-box { font-size: 26px; letter-spacing: 6px; padding: 16px 24px 16px 30px; }
          .expiry { font-size: 12px; padding: 12px 14px; }
        }

        @media only screen and (max-width: 360px) {
          .card-body { padding: 22px 16px 20px; }
          .headline { font-size: 19px; }
          .code-box { font-size: 22px; letter-spacing: 4px; padding: 14px 18px; }
        }
      </style>
    </head>
    <body>
      <div class="wrapper">

        <div class="masthead">
          <div class="wordmark">Learn<span>Sprint</span></div>
          <div class="tagline">AI-Powered Study Planner</div>
        </div>

        <div class="card">
          <div class="card-strip"></div>
          <div class="card-body">

            <h1 class="headline">Verify your<br><span>email address.</span></h1>

            <p class="intro">
              You're one step away from unlocking your personalized AI study plan. Use the code below to confirm your email and start your learning sprint.
            </p>

            <div class="section-label">Your verification code</div>

            <div class="code-wrapper">
              <div class="code-box">${otp}</div>
            </div>

            <div class="expiry">
              <span class="expiry-icon">⏱</span>
              <span><strong>This code expires in 10 minutes.</strong> If it expires, you can request a new one from the sign-up page.</span>
            </div>

            <hr class="rule">

            <p class="footer-note">
              Didn't create an account? You can safely ignore this email — no account will be created without verification.
            </p>

          </div>
        </div>

        <div class="email-footer">
          <p>This is an automated message from LearnSprint. Please do not reply.</p>
          <p>&copy; ${new Date().getFullYear()} LearnSprint &nbsp;·&nbsp; <a href="#">Privacy Policy</a></p>
        </div>

      </div>
    </body>
    </html>
  `;
};

module.exports = generateEmailTemplate;