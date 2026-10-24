"""Original geometric release icon, based on existing D3 pine/parchment/bronze tokens.
Optional build-time authoring tool; Pillow is not a game/runtime dependency.
Usage: python3 tools/generate-demo-icons.py /absolute/new-output-directory
Refuses to overwrite any output.
"""
from pathlib import Path
import sys
from PIL import Image, ImageDraw
out=Path(sys.argv[1]);(out/'icons').mkdir(parents=True,exist_ok=True)
svg='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><rect width="128" height="128" rx="26" fill="#243b34"/><path d="M20 54 64 80 64 100 20 74Z" fill="#657955"/><path d="M64 80 108 54 108 74 64 100Z" fill="#b88c4a"/><path d="M20 54 64 28 108 54 64 80Z" fill="#ece5d4"/><path d="M56 57 64 33 72 57Z" fill="#365349"/><path d="M64 33V66" stroke="#243b34" stroke-width="3"/><circle cx="64" cy="20" r="3" fill="#d8af6e"/></svg>\n'
with (out/'icon.svg').open('x') as f:f.write(svg)
def icon(size):
 scale=size*4/128
 im=Image.new('RGBA',(size*4,size*4),(0,0,0,0));d=ImageDraw.Draw(im)
 def pts(p):return [(int(x*scale),int(y*scale)) for x,y in p]
 d.rounded_rectangle([0,0,size*4-1,size*4-1],radius=int(26*scale),fill='#243b34')
 for points,color in [([(20,54),(64,80),(64,100),(20,74)],'#657955'),([(64,80),(108,54),(108,74),(64,100)],'#b88c4a'),([(20,54),(64,28),(108,54),(64,80)],'#ece5d4'),([(56,57),(64,33),(72,57)],'#365349')]:
  d.polygon(pts(points),fill=color)
 d.line(pts([(64,33),(64,66)]),fill='#243b34',width=max(1,int(3*scale)))
 d.ellipse([int(61*scale),int(17*scale),int(67*scale),int(23*scale)],fill='#d8af6e')
 return im.resize((size,size),Image.Resampling.LANCZOS)
for size in [192,512]:
 with (out/'icons'/('icon-'+str(size)+'.png')).open('xb') as f:icon(size).save(f,format='PNG')
with (out/'favicon.ico').open('xb') as f:icon(48).save(f,format='ICO',sizes=[(16,16),(32,32),(48,48)])
print(str(out))
