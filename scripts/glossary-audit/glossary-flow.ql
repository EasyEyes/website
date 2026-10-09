/**
 * @name Glossary parameter flow to reader
 * @description Tracks known glossary names through variables and helper calls into reader arguments.
 * @kind path-problem
 * @problem.severity recommendation
 * @id easyeyes/glossary-parameter-flow
 */
import javascript
import glossaryKeys
import glossaryReaders

module GlossaryFlowConfig implements DataFlow::ConfigSig {
  predicate isSource(DataFlow::Node source) {
    exists(string key |
      glossaryKey(key) and
      (
        source.asExpr().(StringLiteral).getValue() = key or
        glossaryNameArgument(source.asExpr(), key)
      )
    )
  }

  predicate isSink(DataFlow::Node sink) {
    exists(CallExpr call |
      parameterReader(call) and sink.asExpr() = call.getArgument(0) and
      not call.getArgument(0) instanceof StringLiteral and
      not exists(string key | glossaryNameArgument(call.getArgument(0), key))
    )
  }
}

module GlossaryFlow = DataFlow::Global<GlossaryFlowConfig>;
import GlossaryFlow::PathGraph

from GlossaryFlow::PathNode source, GlossaryFlow::PathNode sink, string key, CallExpr call
where
  GlossaryFlow::flowPath(source, sink) and glossaryKey(key) and
  parameterReader(call) and call.getArgument(0) = sink.getNode().asExpr() and
  (
    source.getNode().asExpr().(StringLiteral).getValue() = key or
    glossaryNameArgument(source.getNode().asExpr(), key)
  )
select call, source, sink, "Glossary parameter: " + key
