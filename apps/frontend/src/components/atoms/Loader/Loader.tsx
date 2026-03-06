import styled, { keyframes } from 'styled-components'

const spin = keyframes`
  to { transform: rotate(360deg); }
`

const LoaderWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 32px;
`

const Spinner = styled.div`
  width: 32px;
  height: 32px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #FF1D44;
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
`

export function Loader() {
  return (
    <LoaderWrapper>
      <Spinner />
    </LoaderWrapper>
  )
}
