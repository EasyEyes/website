import javascript
import glossaryKeys

predicate parameterReader(CallExpr call) {
  exists(PropAccess access |
    exists(call.getArgument(0)) and call.getCallee() = access and
    access.getBase().(Identifier).getName() = ["paramReader", "reader", "ParamReader"] and
    access.getPropertyName() = ["read", "readMatching", "has"]
  )
}

// Resolve the parameter name stored on a directly accessed glossary entry.
predicate glossaryNameArgument(Expr argument, string key) {
  exists(PropAccess nameAccess, PropAccess entryAccess, CallExpr getter |
    argument = nameAccess and nameAccess.getPropertyName() = "name" and
    nameAccess.getBase() = entryAccess and key = entryAccess.getPropertyName() and
    entryAccess.getBase() = getter and
    getter.getCallee().(Identifier).getName() = "getGlossary" and
    glossaryKey(key)
  )
}
