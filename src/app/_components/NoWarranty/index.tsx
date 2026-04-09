import { PageMargin } from '@/components/PageMargin'

export const NoWarranty = () => (
  <PageMargin>
    <div
      style={{
        borderColor: 'var(--VersionedDocumentation-legacy-border-color)',
        background: 'var(--VersionedDocumentation-legacy-background)',
        color: 'var(--VersionedDocumentation-legacy-color)',
        padding: '2rem',
        fontWeight: '500',
        marginTop: '1rem'
      }}
    >
      Note:{' '}
      <strong
        style={{
          fontWeight: '900'
        }}
      >
        This is pre-release software.
      </strong>{' '}
      While we believe it to be correct to the best of our knowledge, we make no warraties about
      accuracy, quality or fitness for any purpose. Please use with discretion. If you would like to
      report bugs please do so by adding an issue at
      https://github.com/OpenReferralUK/oruk-standard-and-website/issues if you have permissions or by
      emailing us. Thanks! - ORUK team
    </div>
  </PageMargin>
)
