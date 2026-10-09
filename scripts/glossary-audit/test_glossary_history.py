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

class CheckpointTests(unittest.TestCase):
    def run_history(self, old_head, current_head, checked, ancestor=True):
        import json
        import glossary_history as module
        from unittest.mock import patch
        evidence = {"repository": "threshold", "commit": "c" * 40,
                    "path": "components/file.js", "previousCommit": "d" * 40,
                    "removedAt": "2026-01-01T00:00:00Z", "previousReferences": [{"line": 1}]}
        state = module.history_state.checkpoint({
            "repositories": {"threshold": {"head": old_head, "completeHistory": True}},
            "keys": {"oldKey": {"removalsByRepository": {"threshold": [evidence]}}},
        }, checked)
        state['revision'] = 'revision-1'
        with tempfile.TemporaryDirectory() as temporary:
            script = Path(temporary) / 'glossary_history.py'
            destination = script.parent / 'glossary-report.json'
            destination.write_text(json.dumps({"unused": {key: {} for key in checked | {'oldKey'}},
                                               "repositories": {"threshold": {"commit": current_head}}}))
            with patch.object(module, '__file__', str(script)), \
                 patch.dict(module.os.environ, {"CATALOG_USAGE_REPORT_URL": "https://example.com", "CATALOG_USAGE_REPORT_SECRET": "secret"}), \
                 patch.object(module.history_state, 'load', return_value=state), \
                 patch.object(module.history_state, 'save') as save, \
                 patch.object(module.run, 'REPOSITORIES', [('threshold', Path(temporary), 'main', ['components'])]), \
                 patch.object(module.history, 'history_repository', return_value=(Path(temporary), {})) as clone, \
                 patch.object(module.history, 'command', return_value=b'' if ancestor else None), \
                 patch.object(module, 'candidates', return_value={}) as scan:
                module.main()
                return clone.call_count, scan.call_args_list, json.loads(destination.read_text()), save.call_args

    def test_same_head_reuses_even_negative_results_without_git_scan(self):
        head = 'a' * 40
        clone, scans, report, saved = self.run_history(head, head, {'oldKey', 'neverRemoved'})
        self.assertEqual(clone, 0)
        self.assertFalse(scans)
        self.assertTrue(report['unused']['oldKey']['removalEvidence'])
        self.assertEqual(saved.args[1], 'revision-1')
        self.assertIn('neverRemoved', saved.args[0]['checkedKeys'])

    def test_changed_head_scans_only_new_commits_for_checked_keys(self):
        old, new = 'a' * 40, 'b' * 40
        clone, scans, report, _ = self.run_history(old, new, {'oldKey'})
        self.assertEqual(clone, 1)
        self.assertEqual(scans[0].args[4], set())
        self.assertEqual(scans[1].args[2], f'{old}..{new}')
        self.assertEqual(scans[1].args[4], {'oldKey'})
        self.assertTrue(report['unused']['oldKey']['removalEvidence'])

    def test_rewritten_history_rescans_full_history(self):
        _, scans, report, _ = self.run_history('a' * 40, 'b' * 40, {'oldKey'}, ancestor=False)
        self.assertEqual(len(scans), 1)
        self.assertEqual(scans[0].args[2], 'b' * 40)
        self.assertEqual(scans[0].args[4], {'oldKey'})
        self.assertFalse(report['unused']['oldKey']['removalEvidence'])

    def test_newly_unused_key_requires_full_history_even_at_same_head(self):
        import glossary_history as module
        from unittest.mock import patch
        # The checkpoint only covers the old key; changing the current key list must scan the new key.
        def add_key_state(state):
            state['checkedKeys'] = ['oldKey']
            return state
        checkpoint = module.history_state.checkpoint
        with patch.object(module.history_state, 'checkpoint', side_effect=lambda *args, **kwargs: add_key_state(checkpoint(*args, **kwargs))):
            _, scans, _, _ = self.run_history('a' * 40, 'a' * 40, {'oldKey', 'newKey'})
        self.assertEqual(scans[0].args[4], {'newKey'})
        self.assertEqual(scans[0].args[2], 'a' * 40)

    def test_git_range_excludes_removals_before_checkpoint(self):
        import subprocess
        from glossary_history import candidates
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            def git(*args):
                return subprocess.check_output(['git', '-C', str(root), *args]).decode().strip()
            git('init', '-q')
            git('config', 'user.email', 'fixture@example.com')
            git('config', 'user.name', 'Fixture')
            source = root / 'components/file.js'
            source.parent.mkdir()
            source.write_text('reader.read("oldKey");\nreader.read("newKey");\n')
            git('add', '.')
            git('commit', '-qm', 'Add references')
            source.write_text('reader.read("newKey");\n')
            git('commit', '-qam', 'Remove old key')
            prior = git('rev-parse', 'HEAD')
            source.write_text('const other = 1;\n')
            git('commit', '-qam', 'Remove new key')
            head = git('rev-parse', 'HEAD')
            events = candidates(root, {}, f'{prior}..{head}', ['components'], {'oldKey', 'newKey'})
            self.assertEqual({item[2] for item in events}, {'newKey'})
            all_events = candidates(root, {}, head, ['components'], {'oldKey', 'newKey'})
            self.assertEqual({item[2] for item in all_events}, {'oldKey', 'newKey'})

    def test_checkpoint_transport_uses_glossary_endpoint_and_existing_secret(self):
        import io
        import json
        import history_state
        from unittest.mock import patch
        with patch.dict(history_state.os.environ, {
            'CATALOG_USAGE_REPORT_URL': 'https://existing.example/.netlify/functions/catalog-usage-report',
            'CATALOG_USAGE_REPORT_SECRET': 'existing-secret',
        }), patch.object(history_state.urllib.request, 'urlopen', return_value=io.BytesIO(b'{"state":null}')) as exchange:
            self.assertIsNone(history_state.load())
        request = exchange.call_args.args[0]
        self.assertEqual(request.full_url, 'https://existing.example/.netlify/functions/glossary-audit?action=history-state')
        self.assertEqual(request.get_header('Authorization'), 'Bearer existing-secret')
        self.assertEqual(json.loads(request.data), {'operation': 'read'})
