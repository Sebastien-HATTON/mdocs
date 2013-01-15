require.config({
  "baseUrl": '/',
  "paths": {
    "jquery":     "components/jquery/jquery",
    "jkey":       "components/jKey/jquery.jkey",
    "jeditable":  "components/jquery.jeditable/index",
    "jaderuntime":"components/jam-jade-runtime/jade.runtime",
    "showdown":   "components/showdown/src/showdown",
    "reqwest":    "components/reqwest/reqwest",
    "ace":        "components/ace/lib/ace",
    "pilot":      "components/pilot/lib/pilot",
    "text":       "components/text/text",
    "bootstrap":  "components/bootstrap/docs/assets/js/bootstrap",
    "share":      "sharejs/share",
    "share-ace":  "sharejs/share-ace",
    "bcsocket":   "sharejs/bcsocket"
  },
  "shim": {
    "bootstrap": ["jquery"],
    "jkey":      ["jquery"],
    "jeditable": ["jquery"],
    "share": {
      deps: ["jquery", "bcsocket"],
      exports: "sharejs"
    },
    "share-ace": ["share", 'ace/ace', 'ace/range']
  }
});