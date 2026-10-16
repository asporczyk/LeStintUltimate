import styled from 'styled-components'

const IconMask = styled.span<{ $src: string; $size: string }>`
  display: inline-block;
  flex-shrink: 0;
  width: ${({ $size }) => $size};
  height: ${({ $size }) => $size};
  background-color: currentColor;
  mask: url("${({ $src }) => $src}") center / contain no-repeat;
`

interface IconProps {
  src: string
  size?: string
}

// SVG file drawn in the current text color, so it follows hover states and the theme.
export function Icon({ src, size = '1.125rem' }: IconProps) {
  return <IconMask aria-hidden="true" $src={src} $size={size} />
}
