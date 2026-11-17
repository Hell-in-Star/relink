F='/home/claude/hell-in-star/relink/assets/source/шрифти'; L='/home/claude/logo/svg'; P='/home/claude/logo/png2'; O='/home/claude/sm/out'
css=f"""@font-face{{font-family:G;font-weight:500;src:url('file://{F}/geologica/Geologica-Medium.ttf')}}
@font-face{{font-family:O;font-weight:300;src:url('file://{F}/onest/Onest-Light.ttf')}}
@font-face{{font-family:O;font-weight:400;src:url('file://{F}/onest/Onest-Regular.ttf')}}
@font-face{{font-family:O;font-weight:500;src:url('file://{F}/onest/Onest-Medium.ttf')}}
*{{margin:0;padding:0;box-sizing:border-box}} body{{background:#F4F3F1}}
.m{{width:600px;height:330px;background:#fff;border-radius:12px;overflow:hidden;position:relative;font-family:O;color:#1d2230;border:1px solid #E1E1E4}}
.cov{{width:100%;display:block}}
.av{{position:absolute;border:4px solid #fff;background:#394050}}
.nm{{font-family:G;font-weight:500;font-size:20px}}
.sub{{font-size:12.5px;color:#5a6070;line-height:1.45}}
.mut{{font-size:11.5px;color:#8a8f9b}}
.btn{{display:inline-block;font-family:O;font-weight:500;font-size:12px;padding:6px 16px;border-radius:999px;border:1px solid #C9CCD3;color:#394050;margin-right:6px}}
.btn.p{{background:#394050;color:#fff;border-color:#394050}}
.grid{{display:grid;grid-template-columns:repeat(3,1fr);gap:3px}}
.t{{aspect-ratio:4/5;position:relative;overflow:hidden;font-family:G;font-weight:500}}
.t.d{{background:linear-gradient(150deg,#394050,#5E6880);color:#fff}} .t.l{{background:linear-gradient(150deg,#F4F3F1,#DCDDE2);color:#394050}}
.t.a{{background:linear-gradient(150deg,#DEA102,#ECC668);color:#394050}}
.t img{{position:absolute;left:9px;top:9px;width:48px}}
.t div{{position:absolute;left:9px;bottom:10px;right:9px;font-size:12px;line-height:1.2}}
.t small{{display:block;font-family:O;font-weight:400;font-size:9px;letter-spacing:.12em;text-transform:uppercase;opacity:.8;margin-bottom:4px}}
"""
av=f'file://{P}/relink-avatar-graphite-400.png'
li=f'''<div class="m"><img class="cov" src="file://{O}/linkedin-company-dark.png">
<img class="av" src="{av}" style="left:22px;top:62px;width:96px;height:96px;border-radius:8px">
<div style="position:absolute;left:24px;top:172px;right:24px">
<div class="nm">ReLink</div>
<div class="sub" style="margin-top:4px">Рекрутинг для Defence, виробництва та суміжних сфер</div>
<div class="mut" style="margin-top:4px">Кадрові послуги та рекрутинг · Київ · re-link.com.ua</div>
<div style="margin-top:14px"><span class="btn p">+ Стежити</span><span class="btn">Вакансії</span><span class="btn">Сайт</span></div></div></div>'''
fb=f'''<div class="m"><img class="cov" src="file://{O}/facebook-dark.png" style="height:200px;object-fit:cover">
<img class="av" src="{av}" style="left:22px;top:140px;width:116px;height:116px;border-radius:50%">
<div style="position:absolute;left:152px;top:210px;right:20px">
<div class="nm">ReLink</div>
<div class="mut" style="margin-top:3px">Рекрутингова агенція · Defence / MilTech / виробництво</div>
<div style="margin-top:14px"><span class="btn p">Написати</span><span class="btn">Подобається</span></div></div></div>'''
tiles=[('d','Defence','Інженери, конструктори, тестувальники'),('l','Production','Виробництво і якість'),('a','Вакансія тижня','Інженер-конструктор БпЛА'),
       ('l','Sales','B2B-продажі в оборонці'),('d','Back office','Фінанси, HR, закупівлі'),('d','ReLink','Знаходимо людей, що створюють результат')]
def tile(c,k,t):
    lg={'l':'on-light','a':'mono-graphite','d':'on-dark'}[c]
    return f'<div class="t {c}"><img src="file://{L}/relink-horizontal-{lg}.svg"><div><small>{k}</small>{t}</div></div>'
ig=f'''<div class="m" style="padding:16px 18px">
<div style="display:flex;flex-direction:column;gap:12px;align-items:flex-start;margin-top:30px">
<img src="{av}" style="width:80px;height:80px;border-radius:50%">
<div style="width:150px"><div class="nm" style="font-size:16px">re.link</div><div class="sub" style="margin-top:2px">Рекрутинг для Defence і виробництва<br><span class="mut">re-link.com.ua</span></div></div></div>
<div class="grid" style="margin-top:12px;width:300px;position:absolute;right:18px;top:16px">{''.join(tile(*x) for x in tiles)}</div></div>'''
ig=ig  # grid on right side to fit height
th=f'''<div class="m" style="padding:20px 24px">
<div style="display:flex;justify-content:space-between;align-items:center"><div><div class="nm">ReLink</div><div class="mut" style="margin-top:2px">re.link</div></div>
<img src="{av}" style="width:62px;height:62px;border-radius:50%"></div>
<div class="sub" style="margin-top:10px">Рекрутинг для Defence, виробництва та суміжних сфер · re-link.com.ua</div>
<div style="border-top:1px solid #ECECEF;margin-top:14px;padding-top:14px;display:flex;gap:12px">
<img src="{av}" style="width:34px;height:34px;border-radius:50%">
<div style="flex:1"><div style="font-size:13px"><b style="font-family:G;font-weight:500">re.link</b> <span class="mut">· 2 год</span></div>
<div style="font-size:13.5px;line-height:1.5;margin-top:3px">Кандидат з ідеальним резюме і кандидат, який закриє задачу, — часто різні люди. Розповідаємо, як ми це перевіряємо на першій розмові 👇</div>
<div class="mut" style="margin-top:8px">♡ 24 &nbsp;&nbsp; 💬 6 &nbsp;&nbsp; ↻ 3</div></div></div></div>'''
for n,b in [('mock-linkedin',li),('mock-facebook',fb),('mock-instagram',ig),('mock-threads',th)]:
    open(f'{n}.html','w').write(f'<!doctype html><meta charset=utf-8><style>{css}</style>{b}')
