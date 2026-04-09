import { PageMargin } from '@/components/PageMargin'
import styles from './NoWarranty.module.css'

export const NoWarranty = () => (
  <PageMargin>
    <div className={styles.warningBox}>
      Note: <strong className={styles.strongWarning}>This is pre-release software.</strong> While we
      believe it to be correct to the best of our knowledge, we make no warraties about accuracy,
      quality or fitness for any purpose. Please use with discretion. If you would like to report
      bugs please do so by adding an issue at
      https://github.com/OpenReferralUK/oruk-standard-and-website/issues if you have permissions or by
      emailing us. Thanks! - ORUK team
    </div>
  </PageMargin>
)
