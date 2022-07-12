import { PropsWithChildren } from 'react'
import styled from 'styled-components'

const PaddingContainerBase = styled.div<{
  $top?: number
  $left?: number
  $right?: number
  $bottom?: number
  $all?: number
}>`
  padding-top: ${({ theme, $all, $top }) => {
    const top = $top || $all || 0
    return theme.unit * top + 'px;'
  }}
  padding-left: ${({ theme, $all, $left }) => {
    const left = $left || $all || 0
    return theme.unit * left + 'px;'
  }}
  padding-right: ${({ theme, $all, $right }) => {
    const right = $right || $all || 0
    return theme.unit * right + 'px;'
  }}
  padding-bottom: ${({ theme, $all, $bottom }) => {
    const bottom = $bottom || $all || 0
    return theme.unit * bottom + 'px;'
  }}
`

PaddingContainerBase.displayName = 'PaddingContainerBase'

export function PaddingContainer({
  top,
  left,
  right,
  bottom,
  all,
  children,
}: PropsWithChildren<{
  top?: number
  left?: number
  right?: number
  bottom?: number
  all?: number
}>) {
  return (
    <PaddingContainerBase
      $top={top}
      $left={left}
      $right={right}
      $bottom={bottom}
      $all={all}
    >
      {children}
    </PaddingContainerBase>
  )
}
