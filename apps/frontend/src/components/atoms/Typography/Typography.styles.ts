import styled from 'styled-components'

export const Title = styled.h1`
  font-family: 'Anton', sans-serif;
  font-size: 4rem;
  font-weight: 400;
  letter-spacing: 0.1em;
  margin-bottom: 0.5rem;
  color: #FF1D44;
  text-transform: uppercase;

  @media (max-width: 600px) {
    font-size: 2.5rem;
  }
`

export const Subtitle = styled.p`
  font-family: 'Hanken Grotesk', sans-serif;
  color: #8899aa;
  font-size: 1rem;
  margin-bottom: 3rem;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  font-weight: 500;

  @media (max-width: 600px) {
    font-size: 0.85rem;
    margin-bottom: 2rem;
  }
`

export const LabelL = styled.p`
  font-family: 'Hanken Grotesk', sans-serif;
  font-size: 1.25rem;
  font-weight: 600;
  color: #fff;
`

export const LabelM = styled.p`
  font-family: 'Hanken Grotesk', sans-serif;
  font-size: 1rem;
  font-weight: 600;
  color: #fff;
`

export const LabelS = styled.p`
  font-family: 'Hanken Grotesk', sans-serif;
  font-size: 0.875rem;
  font-weight: 600;
  color: #fff;
`

export const BodyL = styled.p`
  font-family: 'Hanken Grotesk', sans-serif;
  font-size: 1.25rem;
  font-weight: 400;
  color: #fff;
  line-height: 1.5;
`

export const BodyM = styled.p`
  font-family: 'Hanken Grotesk', sans-serif;
  font-size: 1rem;
  font-weight: 400;
  color: #fff;
  line-height: 1.5;
`

export const BodyS = styled.p`
  font-family: 'Hanken Grotesk', sans-serif;
  font-size: 0.875rem;
  font-weight: 400;
  color: #fff;
  line-height: 1.5;
`

export const Caption = styled.p`
  font-family: 'Hanken Grotesk', sans-serif;
  font-size: 0.75rem;
  font-weight: 400;
  color: #667788;
  line-height: 1.4;
`
