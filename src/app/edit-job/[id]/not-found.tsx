import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function EditJobNotFound() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-md mx-auto text-center">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          Job Not Found
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          The job you&apos;re trying to edit doesn&apos;t exist or you don&apos;t have permission to edit it.
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/my-jobs">
            <Button>Go to My Jobs</Button>
          </Link>
          <Link href="/">
            <Button variant="outline">Go Home</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
