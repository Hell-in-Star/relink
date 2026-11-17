F='/home/claude/hell-in-star/relink/assets/source/шрифти'; L='/home/claude/logo/svg'
CSS=f"""@font-face{{font-family:G;font-weight:500;src:url('file://{F}/geologica/Geologica-Medium.ttf')}}
@font-face{{font-family:O;font-weight:300;src:url('file://{F}/onest/Onest-Light.ttf')}}
@font-face{{font-family:O;font-weight:400;src:url('file://{F}/onest/Onest-Regular.ttf')}}
*{{margin:0;padding:0;box-sizing:border-box}} body{{margin:0}}
.c{{position:relative;overflow:hidden}}
.dark{{background:linear-gradient(115deg,#394050 0%,#4A5266 60%,#5E6880 100%);color:#fff}}
.light{{background:linear-gradient(115deg,#F4F3F1 0%,#EBEAE8 55%,#DCDDE2 100%);color:#394050}}
.a{{position:absolute}} .h{{font-family:G;font-weight:500;letter-spacing:.01em;line-height:1.22}}
.h b{{font-weight:500;background:linear-gradient(90deg,#DEA102,#ECC668);-webkit-background-clip:text;color:transparent}}
.s{{font-family:G;font-weight:500;text-transform:uppercase;letter-spacing:.14em;white-space:nowrap}}
.dark .s{{color:#E0E6F2}} .light .s{{color:#394050}} .s i{{font-style:normal;color:#DEA102;padding:0 .35em}}
.u{{font-family:O;font-weight:400;letter-spacing:.12em;text-transform:uppercase}} .dark .u{{color:#C6D0E2}} .light .u{{color:#707787}}
.ic{{opacity:.10}} .light .ic{{opacity:.14}}
"""
SEG='Defence<i>·</i>Production<i>·</i>Sales<i>·</i>Back office'
H='Знаходимо <b>людей</b>, що створюють результат'
H2='Знаходимо <b>людей</b>,<br>що створюють результат'
def ic(t,l,w):
    return f'''<svg class="a" style="left:{l}px;top:{t}px;width:{w}px;height:{w}px" viewBox="0 0 100 100"><defs><linearGradient id="g{l}" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#DEA102"/><stop offset="1" stop-color="#ECC668"/></linearGradient></defs>
<g fill="none" stroke="url(#g{l})" stroke-linecap="round"><path d="M8 44 A42 42 0 0 1 84 26" stroke-width=".9" opacity=".55"/><path d="M92 56 A42 42 0 0 1 16 74" stroke-width=".9" opacity=".55"/><path d="M2 50 A48 48 0 0 1 50 2" stroke-width=".35" opacity=".35"/><path d="M98 50 A48 48 0 0 1 50 98" stroke-width=".35" opacity=".35"/></g></svg>'''
def logo(th,l,t,w): return f'<img class="a" style="left:{l}px;top:{t}px;width:{w}px" src="file://{L}/relink-horizontal-on-{th}.svg">'
def li_company(th): return 1128,191,f'''{ic(-80,1020,300)}
<div class="a h" style="left:290px;top:50px;font-size:31px;white-space:nowrap">{H}</div>
<div class="a s" style="left:292px;top:108px;font-size:13.5px">{SEG}</div>'''
def li_personal(th): return 1584,396,f'''{ic(-170,1300,560)}
{logo(th,700,58,230)}
<div class="a h" style="left:700px;top:150px;font-size:52px">{H2}</div>
<div class="a s" style="left:702px;top:300px;font-size:19px">{SEG}</div>
<div class="a u" style="left:702px;top:338px;font-size:16px">re-link.com.ua</div>'''
def fb(th): return 851,315,f'''{ic(-110,700,330)}
<div class="a h" style="left:0;width:851px;text-align:center;top:80px;font-size:38px">{H2}</div>
<div class="a s" style="left:0;width:851px;text-align:center;top:186px;font-size:14.5px">{SEG}</div>
<div class="a u" style="left:0;width:851px;text-align:center;top:220px;font-size:13px">re-link.com.ua</div>'''
items={'linkedin-company':li_company,'linkedin-personal':li_personal,'facebook':fb}
import json; meta={}
for n,f in items.items():
    for th in ['dark','light']:
        w,h,body=f(th)
        open(f'{n}-{th}.html','w').write(f'<!doctype html><meta charset=utf-8><style>{CSS}</style><div class="c {th}" style="width:{w}px;height:{h}px">{body}</div>')
        meta[f'{n}-{th}']=(w,h)
json.dump(meta,open('meta.json','w'))
