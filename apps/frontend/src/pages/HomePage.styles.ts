import styled from 'styled-components'
import { Title } from 'components/atoms/Typography/Typography.styles'

export const Landing = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
`

export const TopBar = styled.header`
  display: flex;
  justify-content: flex-end;
  padding: 1rem 1.25rem;
`

export const LandingContent = styled.main`
  width: 100%;
  max-width: 640px;
  margin: 0 auto;
  padding: 4vh 1rem 4rem;
  display: flex;
  flex-direction: column;
`

export const Hero = styled.div`
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 2.5rem;
`

// Racing stripe under the title.
export const Stripe = styled.span`
  display: block;
  width: 4rem;
  height: 4px;
  background: ${({ theme }) => theme.colors.primary};
  transform: skewX(-24deg);
  margin-bottom: 0.25rem;
`

// Title with the version tag pinned to its bottom-right corner.
export const HeroTitle = styled(Title)`
  position: relative;
`

export const Version = styled.span`
  position: absolute;
  right: 0;
  bottom: 0;
  padding: 0.12em 0.4em;
  font-size: 0.32em;
  letter-spacing: 0.04em;
  line-height: 1;
  color: ${({ theme }) => theme.colors.onPrimary};
  background: ${({ theme }) => theme.colors.primary};
  border-radius: ${({ theme }) => theme.radius.sm};
  transform: translate(50%, 95%) skewX(-12deg);
`
