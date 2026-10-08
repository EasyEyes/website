/**
 * @name Historical international phrase references
 * @description Finds candidate unused phrase keys in historical source snapshots.
 * @kind table
 * @id easyeyes/historical-international-phrase-references
 */

import javascript
import historicalCandidates

from Expr reference, string key
where
  historicalCandidateKey(key) and
  (
    exists(StringLiteral literal | reference = literal and key = literal.getValue())
    or
    exists(PropAccess access |
      reference = access and
      (
        access.getBase().(Identifier).getName() = "phrases" or
        access.getBase().(PropAccess).getPropertyName() = "phrases"
      ) and
      key = access.getPropertyName()
    )
  )
select key, reference.getFile().getRelativePath(), reference.getLocation().getStartLine()
