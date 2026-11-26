L='/home/claude/logo/svg'
K=4.0  # px per mm
W,H=148*K,210*K
G='linear-gradient(160deg,#394050 0%,#4A5266 45%,#5E6880 100%)'
def coil(h):
    pitch=8.47*K; n=int((h-6*K)/pitch); top=(h-(n-1)*pitch)/2
    out=[]
    for i in range(n):
        y=top+i*pitch
        for dy in (-1.6*K,1.6*K):
            yy=y+dy
            out.append(f'<rect x="{6*K}" y="{yy-1.1*K}" width="{2.2*K}" height="{2.2*K}" rx="{0.5*K}" fill="#1c2029"/>')
            out.append(f'<path d="M{7.1*K},{yy} C{-3*K},{yy-5.5*K} {-9*K},{yy-1*K} {-6.5*K},{yy+1.4*K}" stroke="url(#met)" stroke-width="{1.15*K}" fill="none" stroke-linecap="round"/>')
            out.append(f'<path d="M{-6.5*K},{yy+1.4*K} C{-4*K},{yy+3.2*K} {2*K},{yy+2.2*K} {7.1*K},{yy+0.2*K}" stroke="url(#met2)" stroke-width="{1.0*K}" fill="none" stroke-linecap="round" opacity=".9"/>')
    return ''.join(out)
def nb(x,y,rot,front,z):
    flip='scaleX(-1)' if not front else ''
    logo=f'<img src="file://{L}/relink-horizontal-tagline-on-dark.svg" style="position:absolute;left:{29*K}px;width:{90*K}px;top:{95*K}px">' if front else ''
    pages=''.join(f'<div style="position:absolute;left:{(2+i*0.6)*K}px;top:{(1+i*0.7)*K}px;width:{W}px;height:{H}px;background:#f4f3ef;border-radius:{1.2*K}px;box-shadow:0 0 0 1px rgba(0,0,0,.05)"></div>' for i in (3,2,1))
    return f'''<div style="position:absolute;left:{x}px;top:{y}px;width:{W}px;height:{H}px;transform:rotate({rot}deg) {flip};z-index:{z}">
<div style="position:absolute;left:{3*K}px;top:{5*K}px;width:{W}px;height:{H}px;border-radius:{2*K}px;box-shadow:0 30px 60px rgba(30,30,40,.35),0 8px 18px rgba(30,30,40,.25)"></div>
{pages}
<div style="position:absolute;left:0;top:0;width:{W}px;height:{H}px;background:{G};border-radius:{1.5*K}px;overflow:hidden">
<div style="position:absolute;inset:0;background:linear-gradient(120deg,rgba(255,255,255,.10) 0%,rgba(255,255,255,0) 35%,rgba(0,0,0,0) 70%,rgba(0,0,0,.12) 100%)"></div>
{logo}</div>
<svg style="position:absolute;left:{-12*K}px;top:0;overflow:visible" width="{20*K}" height="{H}" viewBox="{-12*K} 0 {20*K} {H}">
<defs><linearGradient id="met" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e9ebef"/><stop offset=".45" stop-color="#8d929c"/><stop offset="1" stop-color="#3a3e46"/></linearGradient>
<linearGradient id="met2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6b707a"/><stop offset="1" stop-color="#c9ccd2"/></linearGradient></defs>
{coil(H)}</svg></div>'''
html=f'''<!doctype html><html><head><meta charset="utf-8"><style>*{{margin:0;padding:0}}
body{{width:1600px;height:1200px;overflow:hidden;background:radial-gradient(120% 90% at 40% 30%,#f3f2ef 0%,#e3e1dc 70%,#d6d3cd 100%);position:relative}}
.noise{{position:absolute;inset:0;opacity:.05;background-image:repeating-linear-gradient(0deg,#000 0 1px,transparent 1px 3px)}}
</style></head><body><div class="noise"></div>
{nb(900,170,6,False,1)}
{nb(250,120,-5,True,2)}
</body></html>'''
open('mock.html','w').write(html)
