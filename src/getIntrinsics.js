const { getIntrinsics } = require('ses/src/intrinsics.js')
module.exports = {
  getIntrinsics: () => {
    try {
      return getIntrinsics()
    } catch (err) {
      throw new Error(`Cytoplasm failed to gather intrinsics. Please specify a "primordials" option to the Membrane constructor, apply core-js polyfills, or use node v12 or higher.\n${err.stack}`)
    }
  }
}