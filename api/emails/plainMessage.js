module.exports = (title, message, url) => `
  <html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width" initial-scale="1" />
  </head>
  <body>
    <table role="presentation" aria-hidden="true" cellspacing="0" cellpadding="0" border="0" align="center">
      <tr>
        <td>
          <p>
            <img src="https://res.cloudinary.com/nest-iris/image/upload/v1620570816/logo/nest-iris-logo.png" alt="JS Console" style="margin-top: 24px; margin-bottom: 24px; max-width: 180px;"/>
          </p>
        </td>
      </tr>
      <tr>
        <td>
          <h3>${title}</h3>
        </td>
      </tr>
      <tr>
        <td>
          <p>${message}</p>
        </td>
      </tr>
      <tr>
        <td>
          <p>Sent from <a href="https://jsconsole.ml" style="text-decoration: none; color: #333">JS Console</a> Apartment Association</p>
        </td>
      </tr>
    </table>
  </body>
  </html>
`;
