const { getIntrinsics } = require('../lib/intrinsics.js')
module.exports = {
  getIntrinsics: () => {
    try {
      return getIntrinsics()
    } catch (err) {
      const subErrMsg = err.stack || err.message || err
      throw new Error(`Cytoplasm failed to gather intrinsics. Please specify a "primordials" option to the Membrane constructor, apply core-js polyfills, or use node v12 or higher.\n${subErrMsg}`)
    }
  }
}