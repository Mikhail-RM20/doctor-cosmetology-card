import requests, zipfile, io, os, shutil

FONTS = [
    # (название в API, стили, имя итогового файла без .woff2)
    ("cormorant-garamond", "500,600,700,500italic,600italic", "cormorant-garamond"),
    ("great-vibes", "regular", "great-vibes"),
    ("marck-script", "regular", "marck-script"),
    ("montserrat", "400,500,600", "montserrat"),
]

os.makedirs("fonts", exist_ok=True)

for font_id, variants, name in FONTS:
    url = (f"https://gwfh.mranftl.com/api/fonts/{font_id}"
           f"?download=zip&subsets=latin,cyrillic&formats=woff2&variants={variants}")
    print(f"Скачиваю {font_id}...")
    r = requests.get(url, timeout=60)
    r.raise_for_status()
    with zipfile.ZipFile(io.BytesIO(r.content)) as z:
        for f in z.namelist():
            if f.endswith(".woff2"):
                data = z.read(f)
                out = os.path.join("fonts", os.path.basename(f))
                with open(out, "wb") as fh:
                    fh.write(data)
                print("  ->", out)

print("Готово! Все шрифты в папке fonts/")