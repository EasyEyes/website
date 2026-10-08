/** Phrase references whose statically known key is absent from the exported sheet. */

import javascript
import sheetPhraseKeys

predicate missingSheetPhraseReference(Expr reference, string key, string matchKind) {
  (
    exists(CallExpr call, StringLiteral literal |
      call.getCallee().(Identifier).getName() = "readi18nPhrases" and
      literal = call.getArgument(0) and
      reference = literal and
      key = literal.getValue() and
      matchKind = "readerCall"
    )
    or
    exists(PropAccess access |
      reference = access and
      (
        access.getBase().(Identifier).getName() = "phrases" or
        access.getBase().(PropAccess).getPropertyName() = "phrases"
      ) and
      key = access.getPropertyName() and
      key.regexpMatch("^(EE|RC|T)_[A-Za-z0-9_'-]+$") and
      matchKind = "propertyAccess"
    )
  ) and
  not sheetPhraseKey(key)
}
