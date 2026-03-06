import styled from 'styled-components'

export const IconTextButton = styled.button`
  font-family: 'Hanken Grotesk', sans-serif;
  font-weight: 600;
  letter-spacing: 0.15em;
  padding: 0.75rem 1.5rem;
  font-size: 0.875rem;
  background: transparent;
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: #fff;
  }

  &:active {
    transform: translateY(0);
  }
`
