"""Generate the explicitly demo-labelled PDF from captured package text, without fetching media."""
import json
import sys
from pathlib import Path
from xml.sax.saxutils import escape
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, KeepTogether

font_path = Path(sys.argv[1])
pdfmetrics.registerFont(TTFont('BrochureBody', str(font_path)))
if 0x0e3f not in pdfmetrics.getFont('BrochureBody').face.charToGlyph:
    raise ValueError('The brochure font must contain the Thai baht glyph')
body = ParagraphStyle('Body', fontName='BrochureBody', fontSize=10, leading=14, spaceAfter=4)
title = ParagraphStyle('Title', parent=body, fontSize=20, leading=25, textColor=colors.HexColor('#123B52'), spaceAfter=10)
heading = ParagraphStyle('Heading', parent=body, fontSize=15, leading=19, spaceAfter=5)
output = Path('public/demo/brochure.pdf')
output.parent.mkdir(parents=True, exist_ok=True)
story = [Paragraph('DEMO MATERIAL', title), Paragraph('Sea View Skydiving — package facts', heading), Paragraph('Generated sample brochure — not an official website PDF.', body), Paragraph('Website capture: 2026-10-31. Package wording below is reproduced from the public page.', body), Spacer(1, 10)]
for name in ('eco', 'deluxe', 'vip'):
    source = json.loads(Path(f'data/knowledge/{name}.json').read_text(encoding='utf-8'))
    lines = source['text'].splitlines()
    block = [Paragraph(escape(lines[0]), heading)]
    block += [Paragraph(escape(line), body) for line in lines[1:]]
    block.append(Spacer(1, 10))
    story.append(KeepTogether(block))
story += [Paragraph('Source', heading), Paragraph('https://www.greedyadventures.com/experiences/sea-view-skydiving#options', body), Paragraph('The different taglines and identical listed inclusions are retained as captured. This demo brochure does not reconcile or add package benefits.', body)]
SimpleDocTemplate(str(output), title='DEMO MATERIAL — Sea View Skydiving package facts', author='Prototype generated demo material', leftMargin=40, rightMargin=40, topMargin=35, bottomMargin=35).build(story)
print('Generated public/demo/brochure.pdf from the three real package records; demo label retained.')
