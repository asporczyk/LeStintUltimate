import styled from 'styled-components'

export const RaceDetailsContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  background: linear-gradient(180deg, #000833 0%, #001244 50%, #000833 100%);
  padding: 2rem;
  gap: 0.5rem;
  position: relative;
`

export const PageTitle = styled.h1`
  font-family: 'Hanken Grotesk', sans-serif;
  font-size: 2rem;
  font-weight: 400;
  color: #fff;
  margin-bottom: 0.5rem;
  margin-left: 0;
  align-self: flex-start;
  margin-top: 3rem;
`

export const RaceInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  margin-left: 0;
  align-self: flex-start;
`

export const HeaderRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  max-width: 1000px;
  margin-top: 3rem;
`

export const HeaderLeft = styled.div`
  display: flex;
  flex-direction: column;
`

export const EditRaceButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  background: transparent;
  color: #667788;
  border: 1px solid #667788;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: 'Hanken Grotesk', sans-serif;
  font-size: 0.9rem;

  img {
    filter: invert(100%);
    width: 1.25rem;
    height: 1.25rem;
  }

  &:hover {
    color: #FF1D44;
    border-color: #FF1D44;

    img {
      filter: invert(36%) sepia(98%) saturate(1848%) hue-rotate(329deg) brightness(101%) contrast(101%);
    }
  }

  @media (max-width: 600px) {
    padding: 0.6rem 0.8rem;
    
    span {
      display: none;
    }
  }
`
