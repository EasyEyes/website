import tempfile
import unittest
from pathlib import Path
from glossary_history import key_pattern, verified


class HistoryTests(unittest.TestCase):
    def test_exact_key_boundary(self):
        self.assertIsNone(key_pattern(['_online2PayCurrency']).search('_online2PayCurrencyCode'))
        self.assertIsNotNone(key_pattern(['_online2PayCurrency']).search('"_online2PayCurrency"'))

    def test_verified_removal_requires_source_before_and_absence_after(self):
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            before = root / 'abc/before/components/file.js'
            before.parent.mkdir(parents=True)
            before.write_text('reader.read("fontMaxPxShrinkage");\n')
            after = root / 'abc/after/components/file.js'
            after.parent.mkdir(parents=True)
            after.write_text('const other = 1;\n')
            events = {('abc', '2026-01-01T00:00:00Z', 'fontMaxPxShrinkage'): {'components/file.js'}}
            rows = [('fontMaxPxShrinkage', 'abc/before/components/file.js', '1')]
            evidence = verified('threshold', events, rows, root)
            self.assertEqual(evidence['fontMaxPxShrinkage'][0]['previousReferences'][0]['line'], 1)
            self.assertFalse(verified('threshold', events, [], root))
            after.write_text('// fontMaxPxShrinkage\n')
            self.assertFalse(verified('threshold', events, rows, root))
