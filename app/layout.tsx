import type { Metadata } from "next";
import Script from "next/script";
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

        {/* Osano Privacy Script */}
        <Script 
          src="https://cmp.osano.com/AzyhRbU0mpbR52aP8/49374e12-2d3e-4423-bf87-dcabc8268e3e/osano.js"
          strategy="afterInteractive"
        />
        
        <Script id="osano-config" strategy="afterInteractive">
          {`
            // Osano configuration to position privacy button on the left
            window.osanoConfig = window.osanoConfig || {};
            window.osanoConfig.floatingIconPosition = 'bottom-left';
            
            // Additional CSS to ensure proper positioning
            (function() {
              var style = document.createElement('style');
              style.textContent = \`
                /* Position Osano privacy button on the left */
                .osano-cm-widget {
                  left: 20px !important;
                  right: auto !important;
                  z-index: 1000 !important;
                }
                
                /* Ensure it doesn't conflict with chat widget */
                .osano-cm-dialog {
                  z-index: 1001 !important;
                }
                
                /* Mobile adjustments */
                @media (max-width: 768px) {
                  .osano-cm-widget {
                    left: 16px !important;
                    bottom: 80px !important; /* Avoid mobile navigation if any */
                  }
                }
              \`;
              document.head.appendChild(style);
            })();
          `}
        </Script>
      </head>
      <body className="bg-white text-ink antialiased font-sans">
        {children}
      </body>
    </html>
  );
}
