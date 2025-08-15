import type { Metadata } from "next";
import Script from "next/script";
import ChatModal from "@/components/ChatModal";
import IframeModal from "@/components/IframeModal";
import "./globals.css";

export const metadata: Metadata = {
  title: "Puerto Rico Convention Center",
  description: "Official site",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <Script id="linkai-config" strategy="afterInteractive">
          {`
            window.chatbotConfig = { 
              chatbotId: 'cme7jn41o0001d4q5q4gt76dn',
              apiUrl: 'https://dashboard.getlinkai.com'
            };
          `}
        </Script>
        <Script id="linkai-loader" strategy="afterInteractive">
          {`
            (function() {
              var script = document.createElement('script');
              script.src = window.chatbotConfig.apiUrl + '/chatbot.js?v=' + Date.now();
              script.onload = function() {};
              script.onerror = function() {
                fetch(window.chatbotConfig.apiUrl + '/chatbot.js')
                  .then(function(response) {
                    if (!response.ok) { throw new Error('HTTP ' + response.status + ': ' + response.statusText); }
                    return response.text();
                  })
                  .then(function(scriptContent) { eval(scriptContent); })
                  .catch(function() {});
              };
              document.head.appendChild(script);
            })();
          `}
        </Script>
      </head>
      <body className="bg-white text-ink antialiased font-sans">
        {children}
        <ChatModal />
        <IframeModal />
      </body>
    </html>
  );
}
