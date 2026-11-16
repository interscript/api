// Worker-bundle stub for onnxruntime-node.
//
// interscript's plane session probes for a node ONNX backend by
// dynamically importing "onnxruntime-node"; that package's binding.js
// template-requires native .node binaries, which no bundler can carry
// into a Worker. The `alias` entry in wrangler.jsonc redirects the
// specifier here so wrangler's bundler never traverses the native
// binary. The probe catches this module's evaluation failure and
// selects a worker-compatible backend instead — the node backend is
// unreachable in workerd by construction.
throw new Error(
  "[@interscript/api-worker] onnxruntime-node is unavailable in the worker runtime; plane models use the worker-compatible ONNX backends",
)
