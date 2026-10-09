/**
 * @name Glossary parameter references
 * @description Finds published parameter literals, property accesses, and unresolved reader calls.
 * @kind table
 * @id easyeyes/glossary-parameter-references
 */
import javascript
import glossaryKeys

import glossaryReaders

from Expr reference, string key, string matchKind
where
  (
    exists(StringLiteral literal |
      reference = literal and glossaryKey(key) and key = literal.getValue() and
      (
        exists(CallExpr call |
          parameterReader(call) and call.getArgument(0) = literal and
          matchKind = "readerLiteral"
        )
        or
        not exists(CallExpr call | parameterReader(call) and call.getArgument(0) = literal) and
        matchKind = "stringLiteral"
      )
    )
    or
    exists(PropAccess access |
      reference = access and glossaryKey(key) and key = access.getPropertyName() and
      access.getBase().(Identifier).getName() = "glossary" and matchKind = "glossaryProperty"
    )
    or
    exists(CallExpr call |
      parameterReader(call) and reference = call and
      glossaryNameArgument(call.getArgument(0), key) and matchKind = "readerGlossaryName"
    )
    or
    exists(CallExpr call |
      parameterReader(call) and reference = call and key = "" and
      not call.getArgument(0) instanceof StringLiteral and
      not exists(string resolvedKey | glossaryNameArgument(call.getArgument(0), resolvedKey)) and matchKind = "unresolvedReader"
    )
  )
select key, reference.getFile().getRelativePath(), reference.getLocation().getStartLine(), matchKind
