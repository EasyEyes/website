/**
 * @name Glossary names in source declarations and properties
 * @description Finds exact glossary names as identifiers, object fields, and property accesses without requiring runtime reachability.
 * @kind table
 * @id easyeyes/glossary-source-names
 */
import javascript
import glossaryKeys
from AstNode reference, string key, string kind
where glossaryKey(key) and (
  exists(Identifier identifier |
    reference = identifier and identifier.getName() = key and
    not exists(Property property | property.getNameExpr() = identifier) and
    not exists(DotExpr access | access.getProperty() = identifier) and kind = "sourceIdentifier"
  )
  or exists(Property property |
    reference = property and property.getName() = key and kind = "sourceDefinition"
  )
  or exists(PropAccess access |
    reference = access and access.getPropertyName() = key and kind = "sourceProperty"
  )
)
select key, reference.getFile().getRelativePath(), reference.getLocation().getStartLine(), kind
