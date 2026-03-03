import styled from 'styled-components'

export const Landing = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(180deg, #000833 0%, #001244 50%, #000833 100%);
`

export const LandingContent = styled.div`
  text-align: center;
  padding: 2rem;
`

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

export const InputGroup = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;

  @media (max-width: 600px) {
    flex-wrap: wrap;
  }
`

export const AddIcon = styled.img`
  display: none;

  @media (max-width: 600px) {
    display: flex;
    align-items: center;
    justify-content: center;
  }
`

export const AddText = styled.span`
  @media (max-width: 600px) {
    display: none;
  }
`
