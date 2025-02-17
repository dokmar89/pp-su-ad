// src/app/layout.tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Admin Panel',
  description: 'Správa aplikace',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="flex h-screen">
          {/* Sidebar */}
          <aside className="bg-gray-800 text-white w-64">
            <div className="p-4">
              <h1 className="text-xl font-bold">Admin Panel</h1>
            </div>
            <nav>
              <ul>
                <li>
                  <a href="/registrations" className="block p-2 hover:bg-gray-700">Registrace</a>
                </li>
                {/* Další odkazy */}
              </ul>
            </nav>
          </aside>

          {/* Main content */}
          <main className="flex-1 p-4">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}