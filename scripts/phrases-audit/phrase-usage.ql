/**
 * @name International phrase references
 * @description Finds phrase keys supplied by the generated phraseKeys.qll file.
 * @kind table
 * @id easyeyes/international-phrase-references
 */

import javascript
import phraseKeys

from Expr reference, string key, string matchKind
where
  phraseKey(key) and
  (
    exists(StringLiteral literal |
      reference = literal and key = literal.getValue() and matchKind = "stringLiteral"
    )
    or
    exists(PropAccess access |
      reference = access and
      (
        access.getBase().(Identifier).getName() = "phrases" or
        access.getBase().(PropAccess).getPropertyName() = "phrases"
      ) and
      key = access.getPropertyName() and
      matchKind = "propertyAccess"
    )
  )
select key, reference.getFile().getRelativePath(), reference.getLocation().getStartLine(), matchKind
