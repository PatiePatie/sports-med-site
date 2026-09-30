# -*- coding: utf-8 -*-
"""Push files through the Git Data API, because git push does not work on this
network (RPC errors / hangs).

    python3 tools/push.py <branch> <commit message> <file> [file ...]

Needs `gh` authenticated with repo scope. Set SM_REPO to target a fork.
Paths are pushed as basenames, so run it from the directory holding them."""
import base64, hashlib, json, os, subprocess, sys

REPO = os.environ.get("SM_REPO", 'PatiePatie/sports-med-site')
branch, message, files = sys.argv[1], sys.argv[2], sys.argv[3:]


def api(method, path, body=None):
    cmd = ['gh', 'api', '-X', method, path]
    if body is not None:
        cmd += ['--input', '-']
    r = subprocess.run(cmd, input=json.dumps(body) if body is not None else None,
                       capture_output=True, text=True)
    if r.returncode:
        print('API FAIL', method, path, r.stderr[:300])
        sys.exit(1)
    return json.loads(r.stdout) if r.stdout.strip() else {}


main = api('GET', '/repos/%s/commits/main' % REPO)
base = main['sha']
print('main', base[:8])
entries = []
for f in files:
    data = open(f, 'rb').read()
    # git blob sha = sha1(b"blob %d\0" % len + data)
    sha = hashlib.sha1(b'blob ' + str(len(data)).encode() + b'\x00' + data).hexdigest()
    r = api('POST', '/repos/%s/git/blobs' % REPO,
            {'content': base64.b64encode(data).decode(), 'encoding': 'base64'})
    if r['sha'] != sha:
        print('SHA MISMATCH', f, r['sha'], sha)
        sys.exit(1)
    entries.append({'path': os.path.basename(f), 'mode': '100644', 'type': 'blob', 'sha': sha})
    print('blob', f, len(data), sha[:8])
tree = api('POST', '/repos/%s/git/trees' % REPO, {'base_tree': main['commit']['tree']['sha'], 'tree': entries})
commit = api('POST', '/repos/%s/git/commits' % REPO, {'message': message, 'tree': tree['sha'], 'parents': [base]})
try:
    api('POST', '/repos/%s/git/refs' % REPO, {'ref': 'refs/heads/' + branch, 'sha': commit['sha']})
except SystemExit:
    api('PATCH', '/repos/%s/git/refs/heads/%s' % (REPO, branch), {'sha': commit['sha'], 'force': True})
print('commit', commit['sha'][:8], '->', branch)
cmp = api('GET', '/repos/%s/compare/main...%s' % (REPO, branch))
print('PR files:', [(f['filename'], f['additions'], f['deletions']) for f in cmp['files']])
