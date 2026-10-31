"""Build this small static capture from the two manually fetched HTML files, without network access."""
from html.parser import HTMLParser
from pathlib import Path
import hashlib
import json
import re


class Node:
    def __init__(self, tag='', attrs=(), parent=None):
        self.tag, self.attrs, self.parent = tag, dict(attrs), parent
        self.children = []

    def text(self):
        return ''.join(child if isinstance(child, str) else child.text() for child in self.children)

    def nodes(self):
        yield self
        for child in self.children:
            if isinstance(child, Node):
                yield from child.nodes()


class Parser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.root = Node()
        self.stack = [self.root]

    def handle_starttag(self, tag, attrs):
        node = Node(tag, attrs, self.stack[-1])
        self.stack[-1].children.append(node)
        if tag not in ('area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr'):
            self.stack.append(node)

    def handle_endtag(self, tag):
        for index in range(len(self.stack)-1, 0, -1):
            if self.stack[index].tag == tag:
                self.stack = self.stack[:index]
                break

    def handle_startendtag(self, tag, attrs):
        self.handle_starttag(tag, attrs)
        self.handle_endtag(tag)

    def handle_data(self, data):
        self.stack[-1].children.append(data)


def clean(text):
    return re.sub(r'\s+', ' ', text).strip()


def source_lines(lines, included_section=False):
    result = []
    if included_section:
        result.append('Included')
    for line in lines:
        line = re.sub(r'^[+•●▪◦‣⁃]+\s*', '', line).strip()
        if line.startswith('Included:'):
            if 'Included' not in result:
                result.append('Included')
            line = line.removeprefix('Included:').strip()
        if line:
            result.append(line)
    return result


roots = {}
hashes = {}
for name in ('experience', 'cancellations'):
    raw = Path(f'.next/real-capture/{name}.html').read_bytes()
    hashes[name] = hashlib.sha256(raw).hexdigest()
    parser = Parser()
    parser.feed(raw.decode('utf-8'))
    roots[name] = parser.root

base = 'https://www.greedyadventures.com/experiences/sea-view-skydiving'
policy = 'https://www.greedyadventures.com/cancellations'
sources = []


def add(name, title, url, lines):
    record = dict(title=title, url=url, capturedAt='2026-10-31', text='\n'.join(source_lines(lines, name == 'included')), isDemo=False)
    path = Path('data/knowledge') / f'{name}.json'
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(record, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')
    sources.append(dict(file=path.as_posix(), title=title, url=url))


root = roots['experience']
for package in ('ECO', 'DELUXE', 'VIP'):
    heading = next(n for n in root.nodes() if n.tag == 'h3' and n.text() == package)
    card = heading
    while card.tag != 'li':
        card = card.parent
    lines = []
    for node in card.nodes():
        if node.tag in ('h3', 'p') or (node.tag == 'li' and node is not card):
            text = clean(node.text())
            if '฿' in text:
                text = ' '.join(clean(c if isinstance(c, str) else c.text()) for c in node.children if clean(c if isinstance(c, str) else c.text()))
            if text:
                lines.append(text)
    add(package.lower(), package, base+'#options', lines)

nodes = list(root.nodes())


def list_after(heading):
    index = next(i for i, n in enumerate(nodes) if n.tag == 'h3' and clean(n.text()) == heading)
    ul = next(n for n in nodes[index+1:] if n.tag == 'ul')
    return [clean(n.text()) for n in ul.children if isinstance(n, Node) and n.tag == 'li']


add('included', "What's included", base+'#details', list_after("What's included"))
day = next(n for n in root.nodes() if n.attrs.get('id') == 'the-day')
plan = [clean(n.text()) for n in day.nodes() if n.tag in ('p', 'h3') and clean(n.text())]
add('plan', 'The plan', base+'#the-day', plan)
day_facts = [clean(n.text()) for n in day.nodes() if n.tag == 'li' and not any(c.tag == 'h3' for c in n.nodes())]
add('jump-facts', 'Jump facts: altitude, freefall, canopy, instructor and time', base+'#details', day_facts+list_after('Highlights'))
add('location', 'Location and operator', base+'#details', ['Where you jump']+list_after('Where you jump')+['Operated by']+list_after('Operated by'))
for name, question in [('faq-location', 'Where does the activity take place?'), ('faq-package', 'Which package should I choose?'), ('faq-pickup', 'Is Bangkok pickup available?')]:
    index = next(i for i, n in enumerate(nodes) if n.tag == 'h3' and clean(n.text()) == question)
    paragraph = next(n for n in nodes[index+1:] if n.tag == 'p')
    add(name, question, base+'#faqs', [question, clean(paragraph.text())])

sections = {}
current = None
content = roots['cancellations']
for node in content.nodes():
    if node.tag == 'h2':
        current = clean(node.text())
        sections[current] = []
    elif node.tag == 'p' and current:
        sections[current].append(clean(node.text()))
for name, heading in [('weather', 'If the weather stops the activity'), ('cancel', 'If you cancel'), ('no-show', 'If you do not turn up'), ('insurance', 'Travel insurance')]:
    add(name, heading, policy+'#page-content', sections[heading])
refunds = []
for heading in ('If the activity is stopped part-way', 'If we or the operator cancel', 'How refunds are paid'):
    refunds.extend([heading]+sections[heading])
add('refunds', 'Refunds', policy+'#page-content', refunds)

poster = next(n.attrs.get('poster') for n in root.nodes() if n.tag == 'video' and n.attrs.get('src') == '/greedy/films/sea-view-studio-hero.mp4')
record = dict(capturedAt='2026-10-31', pages=[base, policy], htmlSha256=hashes, sources=sources, posterUrl='https://www.greedyadventures.com'+poster, note='Only requested logical sections retained. Text extracted from the two fetched pages; no contradiction reconciliation.')
Path('docs/examples/real-knowledge/source-capture.json').write_text(json.dumps(record, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')
print(f'Built {len(sources)} real source sections; observed poster URL retained.')
