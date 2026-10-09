/**
 * @name Historical glossary references
 * @description Finds exact glossary references in source before and after candidate deletions.
 * @kind table
 * @id easyeyes/glossary-history
 */
import javascript
import glossaryKeys
from AstNode reference, string key
where glossaryKey(key) and (
  exists(StringLiteral literal | reference = literal and literal.getValue() = key)
  or exists(Identifier identifier | reference = identifier and identifier.getName() = key)
  or exists(Property property | reference = property and property.getName() = key)
  or exists(PropAccess access | reference = access and access.getPropertyName() = key)
)
select key, reference.getFile().getRelativePath(), reference.getLocation().getStartLine()
