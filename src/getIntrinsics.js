import { getIntrinsics as getSesIntrinsics } from '../lib/intrinsics.cjs'

export const getIntrinsics = () => {
  try {
    return getSesIntrinsics()
  } catch (err) {
    const subErrMsg = err.stack || err.message || err
    throw new Error(`Cytoplasm failed to gather intrinsics. Please specify a "primordials" option to the Membrane constructor, apply core-js polyfills, or use node v12 or higher.\n${subErrMsg}`)
  }
}