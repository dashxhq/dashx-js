import filters from 'styles/primitives/filters'
import iconography from 'styles/primitives/iconography'
import screens from 'styles/primitives/screens'
import shadows from 'styles/primitives/shadows'
import spaces from 'styles/primitives/spaces'
import transitions from 'styles/primitives/transitions'
import typography from 'styles/primitives/typography'
import zIndices from 'styles/primitives/zIndices'
import { colorVars } from 'styles/primitives/colors'

const theme = {
  colors: colorVars,
  filters,
  iconography,
  screens,
  shadows,
  spaces,
  transitions,
  typography,
  zIndices
}

export default theme

export type Theme = typeof theme
export * from 'styles/primitives/colors'
export * from 'styles/primitives/filters'
export * from 'styles/primitives/iconography'
export * from 'styles/primitives/palette'
export * from 'styles/primitives/screens'
export * from 'styles/primitives/shadows'
export * from 'styles/primitives/spaces'
export * from 'styles/primitives/transitions'
export * from 'styles/primitives/typography'
