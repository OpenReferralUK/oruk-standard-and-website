'use client'
// @ts-nocheck Form validation requires dynamic field handling
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import styles from './ValidatorForm.module.css'
import { Button } from '@/components/Button'
import { isHttpUrl } from '@/utilities/isHttpUrl'

interface ValidatorFormProps {
  initialUrl?: string
  initialSchemaBearerToken?: string
}

export default function ValidatorForm({
  initialUrl = '',
  initialSchemaBearerToken = ''
}: ValidatorFormProps) {
  const [url, setUrl] = useState(initialUrl)
  const [error, setError] = useState('')
  const router = useRouter()

  // Sync state with prop changes
  useEffect(() => {
    setUrl(initialUrl)
  }, [initialUrl])

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')

    // Validate URL
    if (!url || !url.trim()) {
      setError('Please enter a URL')
      return
    }

    if (!isHttpUrl(url)) {
      setError('Please enter a valid http or https URL')
      return
    }

    // Redirect to URL with query parameter for bookmarkable results
    // Add timestamp to force re-validation even if URL is the same
    const params = new URLSearchParams({ url })
    const timestamp = Date.now()
    params.set('t', `${timestamp}`)

    if (initialSchemaBearerToken) {
      params.set('schemaBearerToken', initialSchemaBearerToken)
    }

    router.push(`/developers/validator?${params.toString()}`)
  }

  const handleReset = () => {
    setUrl('')
    setError('')
    router.push('/developers/validator')
  }

  return (
    <div className='w-full max-w-4xl mx-auto space-y-6'>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor='base-url' className={styles.label}>
            URL
            <input
              id='base-url'
              type='url'
              name='baseUrl'
              value={url}
              onChange={e => setUrl(e.target.value)}
              placeholder='Enter URL to check'
              required
            />
          </label>
        </div>

        <span className={styles.example}>
          The <strong>base URL</strong> the ORUK data service e.g. <br />
          https://example.com/my-oruk-feed
        </span>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <Button type='submit'>Validate</Button>
          <Button type='button' onClick={handleReset}>
            Reset
          </Button>
        </div>
      </form>

      {error && (
        <div className='p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg'>
          <h3 className='text-sm font-semibold text-red-800 dark:text-red-400 mb-1'>Error</h3>
          <p className='text-sm text-red-700 dark:text-red-300'>{error}</p>
        </div>
      )}
    </div>
  )
}
