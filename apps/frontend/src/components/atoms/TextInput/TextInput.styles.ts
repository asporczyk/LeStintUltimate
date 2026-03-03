import styled from 'styled-components'

export const TextInput = styled.input`
  font-family: 'Hanken Grotesk', sans-serif;
  padding: 1rem 1.5rem;
  font-size: 1rem;
  border: 2px solid #334466;
  border-radius: 4px;
  background-color: rgba(0, 8, 51, 0.8);
  color: #fff;
  width: 320px;
  outline: none;
  transition: all 0.3s ease;

  &::placeholder {
    color: #556677;
  }

  &:focus {
    border-color: #FF1D44;
    box-shadow: 0 0 20px rgba(255, 29, 68, 0.3);
  }

  @media (max-width: 600px) {
    width: 100%;
    flex: 1;
  }
`
