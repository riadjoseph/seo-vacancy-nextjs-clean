'use client'

import Link from 'next/link'
import { ArrowLeft, AlertTriangle } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

export default function AuthCodeErrorPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <Link href="/" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800">
          <ArrowLeft className="h-4 w-4" />
          Back to Jobs
        </Link>
      </div>

      <div className="max-w-md mx-auto">
        <Card className="p-8">
          <CardHeader>
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="h-6 w-6 text-red-500" />
              <h1 className="text-2xl font-bold text-red-700">Authentication Failed</h1>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-gray-700">
                There was a problem signing you in. This could be due to:
              </p>

              <ul className="list-disc list-inside space-y-2 text-sm text-gray-600">
                <li>The authentication link has expired</li>
                <li>The link has already been used</li>
                <li>There was a temporary issue with the authentication service</li>
              </ul>

              <div className="pt-4 space-y-3">
                <Link
                  href="/auth/signin"
                  className="block w-full bg-blue-600 text-white text-center py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Try Again
                </Link>

                <Link
                  href="/auth/magic-link"
                  className="block w-full bg-gray-100 text-gray-700 text-center py-2 px-4 rounded-md hover:bg-gray-200 transition-colors"
                >
                  Use Magic Link Instead
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}