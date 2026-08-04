import type {Metadata} from 'next';
import './globals.css'; // Global styles

export const metadata: Metadata = {
  title: 'My Google AI Studio App',
  description: 'My Google AI Studio App',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" style={{height: '100%', margin: 0}}>
      <body suppressHydrationWarning style={{margin: 0, height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden'}}>
        {children}
      </body>
    </html>
  );
}
