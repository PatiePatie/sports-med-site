from pathlib import Path
import re
import sys

ROOT = Path(__file__).resolve().parent.parent
NATIVE = ROOT / 'ib-sehs-native.js'
DATA = ROOT / 'ib-sehs-data.js'
EXPECTED_PAGES = list(range(1, 30))

native_text = NATIVE.read_text(encoding='utf-8')
data_text = DATA.read_text(encoding='utf-8')
native_records = re.findall(r"\{code:'([^']+)',page:(\d+),theme:'([^']+)'", native_text)
topic_codes = re.findall(r"\{code:'([^']+)',theme:'([^']+)'", data_text)
question_codes = re.findall(r"\{code:'([^']+)',cmd:'", data_text)
expected_codes = [code for code, _ in topic_codes]

errors = []
if len(native_records) != 29:
    errors.append(f'native records: expected 29, found {len(native_records)}')
if [int(page) for _, page, _ in native_records] != EXPECTED_PAGES:
    errors.append('native pages are not exactly 1 through 29')
if len(set(code for code, _, _ in native_records)) != 29:
    errors.append('native codes are not unique')
if [code for code, _, _ in native_records] != expected_codes:
    errors.append('native codes do not match ib-sehs-data.js topic codes')
if len(question_codes) != 29 or set(question_codes) != set(expected_codes):
    errors.append('quiz question codes do not cover the 29 topic codes')
if 'record.source={page:record.page,asset:' not in native_text:
    errors.append('source page assignment is missing')
if 'sourceText' not in native_text and 'record.source' not in native_text:
    errors.append('no source reference field is present')
record_chunks = re.split(r"(?=\{code:')", native_text)
for record in record_chunks[1:]:
    code = re.search(r"\{code:'([^']+)'", record).group(1)
    if 'title:nb(' not in record or 'guidingQuestion:nb(' not in record or 'intro:nb(' not in record or 'sections:[' not in record:
        errors.append(f'{code}: required native fields are incomplete')
    if 'quickCheck:' not in record or 'examFocus:' not in record:
        errors.append(f'{code}: exam focus or quick check is missing')
    if not re.search(r"'" + re.escape(code) + r"':\[", native_text):
        errors.append(f'{code}: key links are missing')
    if record.count('nb(') < 8 or re.search(r"nb\(''\s*,", record):
        errors.append(f'{code}: native content is empty or too thin')

if errors:
    print('FAIL')
    for error in errors:
        print(error)
    sys.exit(1)

print('PASS: 29 native records, 29 matching codes, non-empty structured content, and source page references')
