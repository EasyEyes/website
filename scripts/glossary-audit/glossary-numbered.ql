/**
 * @name Numbered glossary family reads
 * @description Maps two-digit parameter constructions in 1..99 loops to @@ definitions and traces them to readers.
 * @kind path-problem
 * @problem.severity recommendation
 * @id easyeyes/glossary-numbered-family
 */
import javascript
import glossaryKeys
import glossaryReaders

predicate numberedConstruction(TemplateLiteral template, string key) {
  exists(CallExpr formatter, ForStmt loop, string index |
    key = template.getElement(0).(TemplateElement).getValue() + "@@" and glossaryKey(key) and
    formatter = template.getElement(1) and template.getNumElement() = 2 and
    formatter.getCallee().(Identifier).getName() = "fillNumberLength" and
    formatter.getArgument(1).(NumberLiteral).getValue() = "2" and
    index = formatter.getArgument(0).(Identifier).getName() and
    template.getParent*() = loop.getBody() and
    loop.getTest().(LEExpr).getLeftOperand().(Identifier).getName() = index and
    loop.getTest().(LEExpr).getRightOperand().(NumberLiteral).getValue() = "99" and
    loop.getUpdate().(IncExpr).getOperand().(Identifier).getName() = index and
    loop.getInit().(DeclStmt).getADecl().getBindingPattern().(Identifier).getName() = index and
    loop.getInit().(DeclStmt).getADecl().getInit().(NumberLiteral).getValue() = "1"
  )
}
module NumberedConfig implements DataFlow::ConfigSig {
  predicate isSource(DataFlow::Node source) {
    exists(string key | numberedConstruction(source.asExpr(), key))
  }
  predicate isSink(DataFlow::Node sink) {
    exists(CallExpr call | parameterReader(call) and sink.asExpr() = call.getArgument(0))
  }
}
module NumberedFlow = DataFlow::Global<NumberedConfig>;
import NumberedFlow::PathGraph
from NumberedFlow::PathNode source, NumberedFlow::PathNode sink, string key, CallExpr call
where NumberedFlow::flowPath(source, sink) and numberedConstruction(source.getNode().asExpr(), key) and
  parameterReader(call) and call.getArgument(0) = sink.getNode().asExpr()
select call, source, sink, "Glossary parameter: " + key
