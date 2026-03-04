import styled from 'styled-components'

export const IconButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background: transparent;
  color: #667788;
  border: 1px solid #667788;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  min-height: 3.25rem;

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

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  @media (max-width: 600px) {
    padding: 0.6rem 0.8rem;
    min-height: 2.8rem;
  }
`
