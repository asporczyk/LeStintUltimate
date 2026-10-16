import styled from 'styled-components'

export const Title = styled.h1`
  font-family: ${({ theme }) => theme.fonts.anton};
  font-size: clamp(2.5rem, 8vw, 4.5rem);
  font-weight: 400;
  line-height: 1.05;
  letter-spacing: 0.06em;
  color: ${({ theme }) => theme.colors.primary};
  text-transform: uppercase;
`

export const Subtitle = styled.p`
  font-family: ${({ theme }) => theme.fonts.hanken};
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 0.9375rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  font-weight: 600;

  @media (max-width: 600px) {
    font-size: 0.8125rem;
  }
`

export const LabelL = styled.p`
  font-family: ${({ theme }) => theme.fonts.hanken};
  font-size: 1.25rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
`

export const LabelM = styled.p`
  font-family: ${({ theme }) => theme.fonts.hanken};
  font-size: 1rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
`

export const LabelS = styled.p`
  font-family: ${({ theme }) => theme.fonts.hanken};
  font-size: 0.875rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
`

export const BodyL = styled.p`
  font-family: ${({ theme }) => theme.fonts.hanken};
  font-size: 1.25rem;
  color: ${({ theme }) => theme.colors.text};
  line-height: 1.5;
`

export const BodyM = styled.p`
  font-family: ${({ theme }) => theme.fonts.hanken};
  font-size: 1rem;
  color: ${({ theme }) => theme.colors.text};
  line-height: 1.5;
`

export const BodyS = styled.p`
  font-family: ${({ theme }) => theme.fonts.hanken};
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.text};
  line-height: 1.5;
`

export const Caption = styled.p`
  font-family: ${({ theme }) => theme.fonts.hanken};
  font-size: 0.8125rem;
  color: ${({ theme }) => theme.colors.textMuted};
  line-height: 1.4;
`
