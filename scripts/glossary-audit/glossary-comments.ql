/**
 * @name Source comments for supplementary glossary evidence
 * @description Extracts comments; the Python runner matches exact parameter names without counting usage.
 * @kind table
 * @id easyeyes/glossary-comments
 */
import javascript
from Comment comment
select comment.getFile().getRelativePath(), comment.getLocation().getStartLine(), comment.getText()
