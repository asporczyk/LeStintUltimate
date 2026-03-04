import styled from 'styled-components'

export const TextButton = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  font-family: 'Hanken Grotesk', sans-serif;
  font-weight: 600;
  letter-spacing: 0.15em;
  padding: 1rem 3rem;
  font-size: 1rem;
  background: ${({ $variant }) => $variant === 'secondary' ? 'transparent' : '#FF1D44'};
  color: ${({ $variant }) => $variant === 'secondary' ? '#FF1D44' : '#fff'};
  border: ${({ $variant }) => $variant === 'secondary' ? '1px solid #FF1D44' : 'none'};
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    background: ${({ $variant }) => $variant === 'secondary' ? '#FF1D44' : '#ff3355'};
    color: #fff;
    box-shadow: 0 0 30px rgba(255, 29, 68, 0.5);
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  @media (max-width: 600px) {
    padding: 1rem 1.25rem;
  }
`
