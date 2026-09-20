#!/usr/bin/env python3
"""Regenerate Expo icons; requires resvg-js and ImageMagick 7 on PATH."""

from pathlib import Path
import subprocess
import tempfile
import xml.etree.ElementTree as ET

HERE = Path(__file__).resolve().parent
ASSETS = HERE.parent
NS = '{http://www.w3.org/2000/svg}'


def paths(root):
    return '\n'.join(ET.tostring(p, encoding='unicode').strip() for p in root if p.tag == NS + 'path')


def svg(body, viewbox='0 0 108 108'):
    return f'<svg xmlns="http://www.w3.org/2000/svg" width="108" height="108" viewBox="{viewbox}">{body}</svg>'


def render(body, destination, size):
    with tempfile.TemporaryDirectory() as directory:
        source = Path(directory) / 'render.svg'
        source.write_text(body)
        raster = Path(directory) / 'render.png'
        subprocess.run(['resvg-js', '--no-system-font', '--fit-width', str(size * 4),
                        str(source), str(raster)], check=True, capture_output=True)
        subprocess.run(['magick', str(raster), '-resize', f'{size}x{size}',
                        '-strip', f'PNG32:{destination}'], check=True)


def main():
    foreground = ET.parse(HERE / 'foreground.svg').getroot()
    background = foreground.attrib['data-background']
    mark = paths(foreground)
    mono = paths(ET.parse(HERE / 'monochrome.svg').getroot())
    full = svg(f'<path fill="{background}" d="M0 0H108V108H0Z"/>' + mark, '18 18 72 72')
    (HERE / 'icon.svg').write_text(full + '\n')
    render(full, HERE / 'play-store.png', 512)
    render(full, ASSETS / 'icon.png', 1024)
    render(svg(mark), ASSETS / 'adaptive-icon.png', 1024)
    render(svg(mono), HERE / 'monochrome.png', 1024)
    tiles = []
    for row in range(2):
        for column, mask in enumerate(['<circle cx="54" cy="54" r="36"/>',
                                      '<rect x="18" y="18" width="72" height="72" rx="18"/>',
                                      '<rect x="18" y="18" width="72" height="72" rx="4"/>']):
            index = row * 3 + column
            fill = background if row == 0 else '#D3E7EF'
            art = mark if row == 0 else mono.replace('#FFFFFF', '#243F50')
            tiles.append(f'<svg x="{column * 120}" y="{row * 120}" width="120" height="120" viewBox="0 0 108 108">'
                         f'<defs><clipPath id="m{index}">{mask}</clipPath></defs>'
                         f'<g clip-path="url(#m{index})"><path fill="{fill}" d="M0 0H108V108H0Z"/>{art}</g></svg>')
    preview = '<svg xmlns="http://www.w3.org/2000/svg" width="360" height="240" viewBox="0 0 360 240"><path fill="#101722" d="M0 0H360V240H0Z"/>' + ''.join(tiles) + '</svg>'
    render(preview, HERE / 'preview.png', 1200)
    print('Generated Gotak icons. Run Expo prebuild to refresh native resources.')


if __name__ == '__main__':
    main()
