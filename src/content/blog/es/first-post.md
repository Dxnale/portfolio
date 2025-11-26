
---
title: "Auditando Datos Sensibles: Una Guía Práctica con Cryptic"
description: "Aprende a detectar y validar la protección de PII (RUT, Emails, Tarjetas) en tus sistemas usando Cryptic."
pubDate: "2025-11-25"
updatedDate: "2025-11-25"
heroImage: "https://i.pinimg.com/1200x/4e/32/90/4e3290392ccafac9eec67f4c4cb7a5b9.jpg"
tags: ["security", "python", "open-source", "privacy", "pii"]
---

En mi experiencia construyendo sistemas para el sector financiero y salud, he aprendido una lección dolorosa: **los datos sensibles (PII) tienen la mala costumbre de aparecer donde menos se les espera**. Logs de aplicaciones, volcados de bases de datos "anonimizados" o simples archivos CSV de reportes suelen ser vectores de fuga de información masiva.

Recientemente, me encontré auditando un sistema legado y necesitaba una forma rápida, local y fiable de escanear miles de registros en busca de RUTs chilenos, correos electrónicos y tarjetas de crédito sin protección. Las expresiones regulares (Regex) manuales son propensas a errores y falsos positivos.

Por eso creé (y recomiendo usar) **Cryptic**. Es una librería en Python diseñada para detectar datos sensibles y verificar si están hasheados o expuestos en texto plano.

## ¿Como auditar un dataset usando esta herramienta?

Antes de tocar cualquier dato, necesitamos un entorno limpio. Soy un firme defensor de no contaminar el intérprete global de Python de tu sistema operativo.

El aislamiento de dependencias evita conflictos de versiones entre proyectos. Además, al trabajar con herramientas de seguridad, quieres asegurarte de que el código que ejecutas es exactamente el que esperas, sin interferencias externas.

Utilizamos `venv` (integrado en Python 3) para crear un directorio ligero que contiene una copia aislada de los binarios de Python y pip. Al "activarlo", modificamos temporalmente la variable `$PATH` de tu shell.

### Requisitos

-- Requiere Python 3.10 o superior.
-- Un entorno virtual creado y activado.
-- Si usas Windows, el comando de activación varía ligeramente (`Scripts\\activate`).
-- La librería `cryptic` instalada y lista para usar.

### Refs

-- [Python venv documentation](https://docs.python.org/3/library/venv.html)
-- [Cryptic GitHub Repository](https://github.com/Dxnale/cryptic)

### Pasos

Crea el entorno virtual en tu directorio de trabajo:
    
```bash
python3 -m venv venv
```
    
Activa el entorno:
    
```bash
source venv/bin/activate
```
    
Instala la librería desde PyPI:
    
```bash
pip install cryptic
```
    

> acá la version oneliner ;)
> 
> ```bash
> python3 -m venv venv && source venv/bin/activate && pip install cryptic
> ```
> 

---

### Análisis Exploratorio (CLI)

A menudo, solo necesito verificar rápidamente si una cadena específica es válida o si el algoritmo de detección está funcionando como espero. Para esto, la CLI es superior a escribir un script.

Esto para verificar falsos positivos rápidamente. Si ves un número que parece un RUT o una tarjeta de crédito en un log, quieres confirmar su validez matemática (Luhn, Módulo 11) antes de levantar una alerta de seguridad.

### ¿Como funciona?

La CLI invoca la clase `CrypticAnalyzer`, detecta el patrón mediante Regex optimizado y luego aplica algoritmos de validación de checksum. También verifica la entropía y patrones comunes de hashes (bcrypt, sha256) para determinar el estado de protección.

### Que quieremos con esto

-- Confirmar que la herramienta detecta correctamente un dato de prueba.
-- Entender la salida JSON/estructurada de la herramienta.

### Ejemplo

Ejecuta un análisis sobre un RUT chileno de prueba (ficticio pero matemáticamente válido):

```bash
cryptic analyze "12.345.678-5"

```

> Deberías ver una salida similar a esta:
> 
> 
> ```
> 🔒 12.345.678-5
>    Estado: Sin protección
>    Sensibilidad: Sensibilidad crítica
>    Confianza: 98.0%
> ```
> 
Prueba con un correo electrónico para verificar la detección de PII estándar:

```bash
cryptic analyze "admin@empresa.cl"
```

### Auditoría de Archivos por Lotes

Este es mi caso de uso principal. Tienes un CSV exportado (`dump.csv`) y necesitas saber qué columnas contienen datos sensibles en texto plano.

Revisar archivos línea por línea es inhumano e imposible a escala. El procesamiento por lotes automatiza la detección de patrones en grandes volúmenes de datos, y te permite generar reportes de cumplimiento (compliance).

### Notas

-- Asegúrate de tener permisos de lectura sobre el archivo.
-- El rendimiento dependerá del tamaño del archivo y la CPU de tu máquina.

### Pasos

Genera un archivo de datos de prueba (o usa tu propio CSV):
    
```bash
echo "id,email,password_hash\\n1,usuario@test.com,\\$2b\\$12\\$..." > usuarios_test.csv
```
    
Ejecuta el análisis por lotes y exporta el resultado:
    
```bash
cryptic batch usuarios_test.csv --output=auditoria_seguridad.json

```
    
Inspecciona el reporte generado:
    
```bash
cat auditoria_seguridad.json
```
    

> Acá un tip:
> Si quieres filtrar el JSON inmediatamente para ver solo los elementos "Sin protección" usando `jq` (una herramienta que recomiendo encarecidamente):
> 
> ```bash
> cryptic batch usuarios_test.csv --output=- | jq '.[] | select(.protection_status == "Sin protección")'
> 
> ```
> 

---

### Integración en Python

Para ingenieros de software, la meta final es la automatización. Yo suelo integrar esto en mis pipelines de CI/CD o en scripts de pre-commit para evitar que datos de prueba reales lleguen al repositorio.

El control preventivo es más barato que la corrección reactiva. Detectar PII *mientras* se procesan los datos permite anonimizarlos al vuelo.

### Steps

Crea un script simple de auditoría `audit.py`:

```python
from cryptic import CrypticAnalyzer

# Instancia el analizador
analyzer = CrypticAnalyzer()

# Datos simulados que podrían venir de una API
incoming_data = ["99.555.111-K", "no-sensible", "4111111111111111"]

results = analyzer.analyze_batch(incoming_data)

for result in results:
    if result.sensitivity_level.value == "critical" and result.protection_status.value == "unprotected":
        print(f"⚠️ ALERTA: Dato crítico expuesto detectado: {result.original_data}")
```

Ejecuta el script:
 
 ```bash
 python audit.py
 ```
 
---

### Debes tener en cuenta 🚨

Cuando usamos herramientas como `cryptic` en datos reales de producción, el riesgo no es la herramienta, sino lo que hacemos con el reporte.

**El Riesgo:**
Si generas un reporte (`auditoria.json`) que contiene explícitamente los datos sensibles encontrados ("Se encontró el RUT 12.345..."), acabas de crear un nuevo archivo con datos sensibles. Si subes ese reporte a un ticket de Jira, Slack o GitHub, **has provocado una brecha de datos**.

**Mitigación:**

-- Ejecuta estas auditorías en entornos volátiles (contenedores que se destruyen).
-- Nunca persistas los reportes completos sin cifrar.
-- Configura la herramienta (será posible en futuras versiones) para que el reporte solo diga "Fila 5: RUT detectado" en lugar de mostrar el valor del RUT.

**Limpieza de Emergencia:**
Si accidentalmente generaste un reporte con datos reales en tu disco:

Bórralo de forma segura (no solo `rm`):
 
 ```bash
 shred -u auditoria_seguridad.json
 
 ```
 
</details>


Si encuentras útil esta librería para tus auditorías de cumplimiento en Chile o en cualquier lugar, considera dejar una estrella en el repositorio. Ayuda a mantener el proyecto vivo.