// Minimal stub of @shopify/react-native-skia for unit tests. The layout math in
// useTreeLayout does not touch Skia; only useEdgePaths builds Skia paths, and these
// no-ops are enough for it to run without the native module.
module.exports = {
  Skia: {
    Path: {
      Make: () => ({
        moveTo() {},
        lineTo() {},
        toSVGString: () => '',
      }),
    },
  },
}
