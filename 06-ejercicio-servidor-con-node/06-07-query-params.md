8639# 06-07 — Filtrar usuarios con query params

## En una línea

Cómo hacer que la API entienda los filtros que vienen pegados a la dirección, después del signo de pregunta.

---

## Por qué importa

Hoy `/users` devuelve los 10 usuarios siempre. Con una base de 50.000, mandar todo en cada
pedido es inviable: tarda, consume datos y el que lo recibe igual solo quiere ver 20.

Pero hay algo más urgente que el rendimiento: **tu API ya está rota**. Probamos
`GET /users?name=maria` y devolvió **404**. Cualquier filtro la tumba.

Antes esto se resolvía partiendo el string a mano (`req.url.split('?')`) y armando los pares
clave-valor uno por uno. Funcionaba hasta que aparecía un acento, un espacio o un `&` dentro
de un valor. Node trae herramientas que hacen ese trabajo bien.

---

## Conceptos

### 1. Pathname y query string son dos cosas distintas

En criollo: la dirección tiene dos partes separadas por `?`. Antes del `?` está **qué recurso
querés** (el pathname). Después están los **filtros** que le aplicás.

Analogía: el pathname es el formulario que pedís, F.931. La query string son los filtros que
le cargás encima — período, CUIT, tipo de liquidación. Cambiar los filtros no cambia el
formulario que estás pidiendo, sigue siendo el F.931.

```
/users?limit=2&offset=10
└──┬─┘ └────────┬───────┘
pathname    query string
```

**Ejemplo mínimo:**

```js
const direccion = '/facturas?mes=07'
// pathname  → '/facturas'
// query     → 'mes=07'
```

**Error típico:** comparar la URL entera. `req.url === '/users'` da `false` apenas hay un
filtro, porque `req.url` vale `'/users?limit=2'`. Ese es exactamente el 404 que te apareció.

---

### 2. El constructor `URL`

En criollo: le pasás una dirección y te la devuelve desarmada en piezas, sin que tengas que
cortar strings vos.

```js
const u = new URL('http://localhost:2211/facturas?mes=07')

u.pathname                    // '/facturas'
u.searchParams.get('mes')     // '07'
```

**El detalle que rompe:** `URL` exige una dirección **completa**, con protocolo y host.
Pero `req.url` llega **relativo**: solo `/users?limit=2`. Por eso hace falta un segundo
argumento que diga cuál es la base.

```js
new URL(req.url, `http://${req.headers.host}`)
```

`req.headers.host` es el host que mandó el cliente (`localhost:2211`). Se usa solo para
completar la dirección; después lo descartás.

**Error típico:** `new URL(req.url)` a secas → `TypeError: Invalid URL`. Te va a pasar.

---

### 3. `searchParams`

En criollo: una cajita con todos los filtros. Le pedís uno por nombre y te lo da.

```js
const searchParams = new URLSearchParams('mes=07&tipo=A')

searchParams.get('mes')     // '07'
searchParams.get('tipo')    // 'A'
searchParams.get('cuit')    // null  ← no vino
```

Lo importante: cuando el parámetro **no vino**, `.get()` devuelve `null`, no `undefined`.

**Error típico:** hacer `if (searchParams.limit)` como si fuera un objeto común. No es un
objeto común: hay que usar `.get('limit')`.

---

### 4. Todo llega como string. Siempre.

Este es el concepto crítico de la clase. Aunque pidas `/users?limit=2`, al servidor le llega
`"2"` entre comillas. Texto, no número.

```js
const limit = searchParams.get('limit')   // '2'

limit + 1        // '21'   ← concatenó, no sumó
limit * 2        // 4      ← acá sí convirtió solo
typeof limit     // 'string'
```

Es el mismo comportamiento que ya conocés de las variables de entorno: `process.env.PORT`
también es string.

**Error típico:** el más traicionero de todos, porque **no tira error**. `.slice()` con
strings puede devolver un array que parece razonable, y descubrís el bug tres semanas después
con datos reales.

---

### 5. Convertir y validar

Convertir es `Number()`. Validar es preguntar si el resultado sirve.

```js
Number('2')      // 2       ✓
Number('dos')    // NaN     ✗
Number('')       // 0       ← ojo con este
Number(null)     // 0       ← y con este
```

`NaN` significa "not a number": el resultado de intentar convertir algo que no se puede.
Se pregunta con `Number.isNaN(valor)`, nunca con `valor === NaN` — esa comparación siempre
da `false`, es una rareza histórica del lenguaje.

Y mirá los dos últimos casos: `Number(null)` da **0**. Si el parámetro no vino, `.get()`
devuelve `null`, y si lo convertís sin fijarte, te queda un `limit` de 0. Resultado: array
vacío. Ninguna excepción, ningún aviso.

Es el mismo tipo de trampa que el `!age` de ayer, cuando `age: 0` se comportaba como si no
hubiera venido. En JavaScript el cero, el string vacío y el `null` se disfrazan de "nada".

**Error típico:** convertir antes de comprobar si el parámetro existe.

---

## Cómo se aplica a tu ejercicio

El mapa, no la solución.

**Paso 1 — desarmar la dirección.** En `server.js`, línea 15, hoy tenés:

```js
const { url, method } = req
```

Ahí necesitás sacar dos cosas de `req`: el `method` como hasta ahora, y de la url el
`pathname` y los `searchParams` usando el constructor `URL` con su base.

**Paso 2 — arreglar el routing.** Las cuatro comparaciones (`url === '/users'`,
`url === '/health'`, etc.) tienen que pasar a comparar contra el **pathname**. Con eso solo,
el 404 desaparece y `/users?loquesea` vuelve a responder 200 con todo. Probá hasta acá antes
de seguir.

**Paso 3 — leer los cinco parámetros** dentro del `if` del GET `/users`: `name`, `minAge`,
`maxAge`, `limit`, `offset`.

**Paso 4 — aplicarlos en cadena, y el orden importa.**

1. Primero **filtrar** por `name` (`.filter()` + `.toLowerCase()` + `.includes()`).
2. Después filtrar por edad (`minAge` / `maxAge`, también con `.filter()`).
3. **Al final** paginar con `.slice(offset, offset + limit)`.

Pensá por qué ese orden y no al revés: si cortás primero y filtrás después, ¿sobre qué
conjunto estás contando las páginas?

**Paso 5 — cada filtro es opcional.** Si el parámetro no vino, ese paso no se aplica y el
resultado pasa de largo al siguiente. La estructura natural es una variable que arranca
valiendo el array completo y se va reasignando.

**Ojo:** no toques el array `users` original. `.filter()` y `.slice()` devuelven arrays
nuevos y no modifican el de origen — eso está bien. Lo que no podés hacer es un `.sort()` o
un `.splice()`, que sí lo pisan.

---

## Preguntas de control

1. ¿Por qué `new URL(req.url)` tira error y hace falta pasarle un segundo argumento?

2. Si el pedido es `GET /users` sin ningún filtro, ¿qué devuelve
   `searchParams.get('limit')`? ¿Y qué pasa si a ese resultado le aplicás `Number()` sin
   revisarlo antes?

3. Si primero paginás y después filtrás por nombre, ¿qué le devolvés al cliente que pidió
   `?name=a&limit=2`? ¿En qué se diferencia de hacerlo en el orden correcto?

---

## Para el glosario

- **Pathname** — la parte de la dirección que dice qué recurso querés, antes del `?`.
- **Query string** — los filtros que van después del `?`, en pares `clave=valor` separados
  por `&`.
- **Query param** — cada uno de esos pares. Siempre llega como string.
- **NaN** — "not a number". El resultado de una conversión numérica que falló. Se detecta con
  `Number.isNaN()`, nunca con `===`.
- **Paginación** — devolver los resultados de a bloques en vez de todos juntos, con `limit`
  (cuántos) y `offset` (desde dónde).
