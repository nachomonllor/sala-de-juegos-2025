"""
Concatena el proyecto Angular en uno o varios .txt para compartirlo.

- Quita comentarios (TS, SCSS/CSS, HTML y JSON con comentarios) sin tocar textos ni URLs.
- Oculta claves secretas de Supabase (service_role / sb_secret_...).
- Si el resultado supera MAX_KB_POR_PARTE, lo divide en varias partes.

Uso (desde la raíz del proyecto):  python unificar.py
"""
import base64
import json
import os
import re
from datetime import datetime

# ---------------------------------------------------------------- configuración
NOMBRE_SALIDA = "proyecto_angular"           # genera proyecto_angular.txt o proyecto_angular_parte1.txt, ...
MAX_KB_POR_PARTE = 120                       # 0 = sin dividir (el concatenado viejo de 132 KB sí se pudo adjuntar)
QUITAR_COMENTARIOS = True

EXTENSIONES_PERMITIDAS = {".ts", ".html", ".css", ".scss", ".json"}
IGNORAR_CARPETAS = {"node_modules", ".git", ".angular", "dist", ".vscode", ".firebase"}
IGNORAR_ARCHIVOS = {"package-lock.json"}
IGNORAR_SUFIJOS = (".spec.ts",)
MAX_BYTES_JSON_DATOS = 20_000                # .json de assets/public más grandes se recortan

PATRON_JWT = re.compile(r"eyJ[A-Za-z0-9_-]+\.eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+")


# ---------------------------------------------------------------- comentarios
def quitar_comentarios_codigo(texto, permitir_linea=True, detectar_regex=True):
    """
    Quita // y /* */ respetando strings '...', "...", `...` (con ${...}) y
    expresiones regulares /.../ de JavaScript. Sirve para .ts, .scss, .css y .json.
    """
    salida = []
    i, n = 0, len(texto)
    pila_template = []            # profundidad de llaves dentro de cada ${ } abierto
    ultimo_significativo = ""     # último carácter de código no blanco (para distinguir / de división y de regex)

    while i < n:
        c = texto[i]
        sig = texto[i + 1] if i + 1 < n else ""

        # Comentario de bloque
        if c == "/" and sig == "*":
            fin = texto.find("*/", i + 2)
            fin = n if fin == -1 else fin + 2
            # conservar los saltos de línea para no pegar código de líneas distintas
            if "\n" in texto[i:fin]:
                salida.append("\n")
            i = fin
            continue

        # Comentario de línea
        if permitir_linea and c == "/" and sig == "/":
            fin = texto.find("\n", i)
            i = n if fin == -1 else fin
            continue

        # Strings con comillas simples o dobles
        if c in ("'", '"'):
            j = i + 1
            while j < n and texto[j] != c and texto[j] != "\n":
                j += 2 if texto[j] == "\\" else 1
            salida.append(texto[i:j + 1])
            i = j + 1
            ultimo_significativo = c
            continue

        # Template literal (incluye el regreso desde un ${ ... })
        if c == "`" or (c == "}" and pila_template and pila_template[-1] == 0):
            if c == "}":
                pila_template.pop()
            j = i + 1
            while j < n:
                if texto[j] == "\\":
                    j += 2
                    continue
                if texto[j] == "`":
                    j += 1
                    break
                if texto[j] == "$" and j + 1 < n and texto[j + 1] == "{":
                    pila_template.append(0)
                    j += 2
                    break
                j += 1
            salida.append(texto[i:j])
            i = j
            ultimo_significativo = "`"
            continue

        if pila_template:
            if c == "{":
                pila_template[-1] += 1
            elif c == "}":
                pila_template[-1] -= 1

        # Expresión regular de JavaScript: / después de ( , = : [ ! & | ? { } ; + - * % < > ~ ^ o al comienzo
        if detectar_regex and c == "/" and (ultimo_significativo == "" or ultimo_significativo in "(,=:[!&|?{};+-*%<>~^"):
            j, en_clase = i + 1, False
            while j < n and texto[j] != "\n":
                if texto[j] == "\\":
                    j += 2
                    continue
                if texto[j] == "[":
                    en_clase = True
                elif texto[j] == "]":
                    en_clase = False
                elif texto[j] == "/" and not en_clase:
                    break
                j += 1
            if j < n and texto[j] == "/":
                j += 1
                while j < n and texto[j].isalpha():   # flags g, i, m, ...
                    j += 1
                salida.append(texto[i:j])
                i = j
                ultimo_significativo = "/"
                continue

        salida.append(c)
        if not c.isspace():
            ultimo_significativo = c
        i += 1

    return "".join(salida)


def quitar_comentarios_html(texto):
    return re.sub(r"<!--.*?-->", "", texto, flags=re.S)


def compactar(texto):
    """Quita espacios al final de cada línea y deja como máximo una línea en blanco seguida."""
    lineas = [l.rstrip() for l in texto.splitlines()]
    texto = "\n".join(lineas)
    return re.sub(r"\n{3,}", "\n\n", texto).strip("\n") + "\n"


def limpiar(contenido, ext):
    if not QUITAR_COMENTARIOS:
        return contenido
    if ext == ".html":
        contenido = quitar_comentarios_html(contenido)
    elif ext == ".css":
        contenido = quitar_comentarios_codigo(contenido, permitir_linea=False, detectar_regex=False)
    elif ext in (".scss", ".json"):
        contenido = quitar_comentarios_codigo(contenido, detectar_regex=False)
    elif ext == ".ts":
        contenido = quitar_comentarios_codigo(contenido)
    return compactar(contenido)


# ---------------------------------------------------------------- claves
def rol_del_jwt(token):
    try:
        payload = token.split(".")[1]
        payload += "=" * (-len(payload) % 4)
        return json.loads(base64.urlsafe_b64decode(payload)).get("role")
    except Exception:
        return None


def ocultar_claves_peligrosas(texto, ruta):
    def reemplazar(m):
        if rol_del_jwt(m.group(0)) == "service_role":
            print(f"  ⚠ Se ocultó una clave service_role en {ruta}")
            return "<CLAVE_SERVICE_ROLE_OCULTADA>"
        return m.group(0)

    texto = PATRON_JWT.sub(reemplazar, texto)
    return re.sub(r"sb_secret_[A-Za-z0-9_-]+", "<CLAVE_SECRETA_OCULTADA>", texto)


def es_json_de_datos(ruta):
    partes = os.path.normpath(ruta).split(os.sep)
    return "assets" in partes or "public" in partes


# ---------------------------------------------------------------- principal
def leer_bloques():
    """Devuelve una lista de (ruta, texto_del_bloque) con encabezado incluido."""
    bloques = []
    for raiz, carpetas, archivos in os.walk("."):
        carpetas[:] = sorted(c for c in carpetas if c not in IGNORAR_CARPETAS)
        for archivo in sorted(archivos):
            if archivo in IGNORAR_ARCHIVOS or archivo.startswith(NOMBRE_SALIDA) or archivo.endswith(IGNORAR_SUFIJOS):
                continue
            _, ext = os.path.splitext(archivo)
            if ext not in EXTENSIONES_PERMITIDAS:
                continue

            ruta = os.path.join(raiz, archivo)
            print(f"Agregando: {ruta}")
            try:
                with open(ruta, "r", encoding="utf-8") as origen:
                    contenido = origen.read()
            except Exception as e:
                contenido = f"[ERROR AL LEER EL ARCHIVO: {e}]\n"
                print(f"  No se pudo leer: {ruta}")
            else:
                if ext == ".json" and es_json_de_datos(ruta) and len(contenido) > MAX_BYTES_JSON_DATOS:
                    contenido = (contenido[:MAX_BYTES_JSON_DATOS]
                                 + f"\n... [RECORTADO: el archivo completo tiene {len(contenido):,} caracteres]\n")
                else:
                    contenido = limpiar(contenido, ext)
                contenido = ocultar_claves_peligrosas(contenido, ruta)

            bloque = "\n" + "=" * 80 + f"\nARCHIVO: {ruta}\n" + "=" * 80 + "\n\n" + contenido
            bloques.append((ruta, bloque))
    return bloques


def escribir(bloques):
    encabezado = f"# Proyecto concatenado el {datetime.now():%Y-%m-%d %H:%M} · raíz: {os.path.abspath('.')}\n"
    limite = MAX_KB_POR_PARTE * 1024

    partes, actual = [], encabezado
    for _, bloque in bloques:
        if limite and len(actual.encode("utf-8")) + len(bloque.encode("utf-8")) > limite and actual != encabezado:
            partes.append(actual)
            actual = encabezado
        actual += bloque
    partes.append(actual)

    nombres = []
    for k, texto in enumerate(partes, 1):
        nombre = f"{NOMBRE_SALIDA}.txt" if len(partes) == 1 else f"{NOMBRE_SALIDA}_parte{k}.txt"
        if len(partes) > 1:
            texto = texto.replace(encabezado, encabezado + f"# Parte {k} de {len(partes)}\n", 1)
        with open(nombre, "w", encoding="utf-8") as f:
            f.write(texto)
        nombres.append((nombre, len(texto.encode("utf-8"))))
    return nombres


if __name__ == "__main__":
    print("Iniciando la lectura del proyecto...")
    bloques = leer_bloques()
    resultado = escribir(bloques)
    print(f"\n¡Listo! Se procesaron {len(bloques)} archivos.")
    for nombre, tam in resultado:
        print(f"  {nombre}: {tam / 1024:.0f} KB")
