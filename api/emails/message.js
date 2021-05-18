module.exports = (title, message) => `
  <html>

  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width" initial-scale="1" />
    <style>
      *,
      *:after,
      *:before {
        -webkit-box-sizing: border-box;
        -moz-box-sizing: border-box;
        box-sizing: border-box;
      }

      * {
        -ms-text-size-adjust: 100%;
        -webkit-text-size-adjust: 100%;
      }

      html,
      body,
      .document {
        width: 100% !important;
        height: 100% !important;
        margin: 0;
        padding: 0;
      }

      body {
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        text-rendering: optimizeLegibility;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
        Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
        color: #232323;
      }

      div[style*="margin: 16px 0"] {
        margin: 0 !important;
      }

      table,
      td {
        mso-table-lspace: 0pt;
        mso-table-rspace: 0pt;
      }

      table {
        border-spacing: 0;
        border-collapse: collapse;
        table-layout: fixed;
        margin: 0 auto;
      }

      img {
        -ms-interpolation-mode: bicubic;
        max-width: 100%;
        border: 0;
      }

      *[x-apple-data-detectors] {
        color: inherit !important;
        text-decoration: none !important;
      }

      .x-gmail-data-detectors,
      .x-gmail-data-detectors *,
      .aBn {
        border-bottom: 0 !important;
        cursor: default !important;
      }

      .document {
        background: #f5f5f5;
      }

      .container {
        border-radius: 8px;
        background: #ffffff;
        margin-top: 32px;
        margin-bottom: 32px;
      }

      .btn {
        -webkit-transition: all 200ms ease;
        transition: all 200ms ease;
      }

      .btn:hover {
        background-color: dodgerblue;
      }

      @media screen and (max-width: 480px) {
        .container {
          width: 100%;
          margin: auto;
        }
        .stack {
          display: block;
          width: 100%;
          max-width: 100%;
        }
      }
    </style>
  </head>

  <body>
    <table role="presentation" aria-hidden="true" cellspacing="0" cellpadding="0" border="0" align="center" class="document">
      <tr>
        <td valign="top">
          <table role="presentation" aria-hidden="true" cellspacing="0" cellpadding="0" border="0" align="center" width="480px" class="container">
            <tr>
              <td style="padding: 32px">
                <table role="presentation" aria-hidden="true" cellspacing="0" cellpadding="0" border="0" align="center" width="100%">
                  <tr>
                    <td>
                      <a href="https://jsconsole.ml" target="_blank"><img
                            src="https://res.cloudinary.com/spendlogs/image/upload/v1578090007/branding/spendlogs-logo-green_ynjqex.png"
                            alt="JS Console"
                            style="display: block; margin-top: 24px; margin-bottom: 24px; margin-left: auto; margin-right: auto; max-width: 180px; "
                        /></a>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <h1 style="text-align: center; margin-bottom: 24px; margin-top: 0; font-size: 19px">
                        ${title}
                      </h1>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <p style="text-align: left; margin-top: 0px; margin-bottom: 24px; color: #666; font-size: 16px; line-height: 21px">
                        ${message}
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <p style="text-left: center; margin-top: 0px; margin-bottom: 24px; color: #666; font-size: 16px; line-height: 21px">
                        Thanks and regards,<br/> JS Console Team.
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <p style="text-align: center; margin-top: 0; margin-bottom: 12px; color: #999; font-size: 14px; line-height: 21px">
                        Sent with ❤️ from
                        <a href="https://jsconsole.ml" style="text-decoration: none; color: #333">JS Console</a
                          >
                        </p>
                        <p
                          style="text-align: center; margin-top: 0px; margin-bottom: 24px; color: #999; font-size: 14px; line-height: 21px"
                        >
                          For any support/feedback reach us at <br />
                          <a
                            href="mailto:nest-iris.app@gmail.com"
                            style="text-decoration: none; color: #333"
                            >nest-iris.app@gmail.com</a
                          >
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
  </html>
`;
