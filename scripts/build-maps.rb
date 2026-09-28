#!/usr/bin/env ruby
# Superseded: the bundled corpus is built by scripts/build-maps.mjs
# from the interscript-ts ISC converter — the same pipeline that
# produces the interscript/maps release artifact. The Ruby JsonIR
# compiler serialises a different JSON shape and must not be used for
# the corpus.

warn "error: ruby scripts/build-maps.rb is superseded; use:"
warn "  node scripts/build-maps.mjs <interscript-maps-dir> <interscript-ts-dir>"
exit 1
