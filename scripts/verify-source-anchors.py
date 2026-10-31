"""Verify static citation fragments against captured HTML element ids; fetch only with --capture."""
import argparse
import hashlib
from html.parser import HTMLParser
import json
from pathlib import Path
from urllib.request import urlopen
from urllib.parse import unquote, urldefrag

ROOT = Path(__file__).resolve().parent.parent
CAPTURE = ROOT / 'docs/examples/citations/anchor-capture.json'
PAGES = (
    'https://www.greedyadventures.com/experiences/sea-view-skydiving',
    'https://www.greedyadventures.com/cancellations',
)


class ElementIds(HTMLParser):
    def __init__(self):
        super().__init__()
        self.ids = set()

    def handle_starttag(self, tag, attrs):
        for name, value in attrs:
            if name == 'id' and value:
                self.ids.add(value)


parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--capture', action='store_true', help='Fetch exactly the two public pages again')
args = parser.parse_args()
if args.capture:
    pages = []
    for url in PAGES:
        with urlopen(url, timeout=30) as response:
            html = response.read()
            ids = ElementIds()
            ids.feed(html.decode('utf-8'))
            pages.append(dict(url=url, status=response.status, htmlSha256=hashlib.sha256(html).hexdigest(), elementIds=sorted(ids.ids)))
    CAPTURE.parent.mkdir(parents=True, exist_ok=True)
    CAPTURE.write_text(json.dumps(dict(checkedAt='2026-10-31', pages=pages), indent=2)+'\n', encoding='utf-8')
capture = json.loads(CAPTURE.read_text(encoding='utf-8'))
ids_by_page = {page['url']: set(page['elementIds']) for page in capture['pages']}
count = 0
for path in sorted((ROOT / 'data/knowledge').glob('*.json')):
    source = json.loads(path.read_text(encoding='utf-8'))
    page, fragment = urldefrag(source['url'])
    if page not in ids_by_page:
        raise ValueError(f'Uncaptured page: {path.name}')
    if fragment and unquote(fragment) not in ids_by_page[page]:
        raise ValueError(f'Unverified anchor: {path.name}: {fragment}; replace with plain page URL')
    count += 1
print(f'Verified {count} source URLs against element ids from {len(ids_by_page)} captured pages (offline check).')
for page in capture['pages']:
    print(f"{page['url']}: HTTP {page['status']}; ids={','.join(page['elementIds'])}")
