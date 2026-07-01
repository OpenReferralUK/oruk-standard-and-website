import { ServicesTable } from './_components/ServicesTable'
import { ServiceRepository } from '@/repositories/service-repository'
import { PageMargin } from '@/components/PageMargin'
import { NamedMarkdownPage } from '@/components/NamedMarkdownPage'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'ORUK directory'
}

interface PageProps {
  searchParams: Promise<{
    page?: string
    sort?: string
    direction?: string
  }>
}

export default async function Page(props: PageProps) {
  const searchParams = await props.searchParams
  // server-side: fetch services directly from the database via repository
  const currentPage = searchParams.page ? parseInt(searchParams.page) : 1

  const repo = new ServiceRepository()
  const activeServices = await repo.find({ active: true })

  // Map services into the shape expected by ServicesTable
  const serviceData = activeServices.map(s => ({
    name: { value: s.name, url: s.serviceUrl },
    publisher: { value: s.publisher, url: s.publisherUrl },
    comment: { value: s.description },
    developer: { value: s.developer, url: s.developerUrl },
    lastTested: { value: s.lastTested, url: `/developers/dashboard/${s.id}` }
  })) 
  
  return (
    <>
      <NamedMarkdownPage
        autoMenu={false}
        name='directory'
        noMargin={undefined}
        markdownRaw={undefined}
      />
      <PageMargin>
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
            Service Directory
          </h2>
          <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
            Browse and search through registered ORUK services. Click on any service name or
            publisher to view more details.
          </p>
        </div>
        <ServicesTable services={serviceData} currentPage={currentPage} itemsPerPage={10} />
      </PageMargin>
    </>
  )
}
