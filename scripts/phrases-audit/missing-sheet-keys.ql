/**
 * @name Phrase references missing from the International Phrases sheet
 * @description Finds direct phrase references whose keys are absent from the generated sheet key set.
 * @kind table
 * @id easyeyes/missing-international-phrase-keys
 */

import javascript
import missingSheetKeys

from Expr reference, string key, string matchKind
where missingSheetPhraseReference(reference, key, matchKind)
select key, reference.getFile().getRelativePath(), reference.getLocation().getStartLine(), matchKind
