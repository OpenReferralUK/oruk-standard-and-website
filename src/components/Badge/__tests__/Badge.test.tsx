import { render, screen } from '@testing-library/react'
import { Badge, BadgeInPath, BadgeRequired, BadgeUnique } from '../Badge'

describe('Badge', () => {
  it('should render badge with label', () => {
    render(<Badge label='test' colour='black' background='white' />)
    expect(screen.getByText('test')).toBeInTheDocument()
  })

  it('should apply custom colours', () => {
    const { container } = render(<Badge label='custom' colour='red' background='blue' />)
    const badge = container.firstChild
    expect(badge).toHaveStyle({
      color: 'rgb(255, 0, 0)',
      backgroundColor: 'rgb(0, 0, 255)'
    })
  })
})

describe('BadgeRequired', () => {
  it('should render required badge with correct styling', () => {
    render(<BadgeRequired />)
    const badge = screen.getByText('required')
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveStyle({
      color: 'rgb(0, 0, 0)',
      backgroundColor: 'rgb(254, 205, 211)'
    })
  })
})

describe('BadgeUnique', () => {
  it('should render unique badge with correct styling', () => {
    render(<BadgeUnique />)
    const badge = screen.getByText('unique')
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveStyle({
      color: 'rgb(0, 0, 0)',
      backgroundColor: 'rgb(233, 213, 255)'
    })
  })
})

describe('BadgeInPath', () => {
  it('should render in path badge with correct styling', () => {
    render(<BadgeInPath />)
    const badge = screen.getByText('in path')
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveStyle({
      color: 'rgb(0, 0, 0)',
      backgroundColor: 'rgb(191, 219, 254)'
    })
  })
})
