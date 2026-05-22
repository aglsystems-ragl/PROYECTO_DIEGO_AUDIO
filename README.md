# 🎵 Diego Arenas Audio — Plataforma Distribuida de Gestión Musical 🎵

> Sistema de gestión integral para un estudio de producción musical, construido sobre una arquitectura de microservicios distribuidos con Docker Swarm, balanceo de carga con HAProxy y análisis Big Data con Apache Spark.

---
## Integrantes

- Valentina Diaz lobaton
- Rodrigo Andrés Gómez López
- Diego Arenas Laso

---

## Repositorio

```
https://github.com/aglsystems-ragl/PROYECTO_DIEGO_AUDIO

```

---

##  Tabla de contenido

- [Descripción general](#-descripción-general)
- [Arquitectura del sistema](#-arquitectura-del-sistema)
- [Estructura del repositorio](#-estructura-del-repositorio)
- [Tecnologías utilizadas](#-tecnologías-utilizadas)
- [Requisitos previos](#-requisitos-previos)
- [Configuración de infraestructura](#-configuración-de-infraestructura)
- [Despliegue con Docker Swarm](#-despliegue-con-docker-swarm)
- [Microservicios](#-microservicios)
- [Módulo de análisis distribuido (Spark)](#-módulo-de-análisis-distribuido-spark)
- [Enrutamiento HAProxy](#-enrutamiento-haproxy)
- [Bases de datos](#-bases-de-datos)
- [Escalabilidad y pruebas](#-escalabilidad-y-pruebas)
- [Autores](#-autores)

---

##  Descripción general

**Diego Arenas Audio** es una plataforma de gestión interna para un estudio de producción musical independiente. El sistema permite administrar clientes, catálogo de servicios, pedidos y pagos, todo desde una interfaz web unificada. Adicionalmente, incorpora un módulo de analítica distribuida que procesa grandes volúmenes de datos históricos y expone los resultados en un dashboard interactivo.

El proyecto fue concebido como una evolución de un sistema CRUD básico hacia una **plataforma distribuida completa**, implementando principios de microservicios, contenedores, orquestación, balanceo de carga y Big Data.

### Funcionalidades principales

- Registro y gestión de clientes del estudio
- Administración del catálogo de servicios musicales (mezcla y masterización)
- Gestión completa del ciclo de vida de pedidos
- Registro de pagos con generación de comprobantes PDF
- Dashboard analítico con insights generados por Apache Spark
- Balanceo de carga automático entre réplicas de microservicios
- Escalado horizontal en caliente sin interrupciones de servicio

---
# Objetivo del proyecto

## Objetivo general

Implementar una arquitectura distribuida basada en microservicios, contenedores Docker, balanceo de carga, escalabilidad horizontal y procesamiento distribuido de datos, validando su funcionamiento mediante pruebas de rendimiento, carga y estrés.

## Objetivos específicos

- Desarrollar microservicios REST independientes.
- Contenerizar cada microservicio con Docker.
- Desplegar la solución usando Docker Swarm.
- Configurar HAProxy como balanceador y gateway.
- Implementar bases de datos MySQL independientes por microservicio.
- Integrar un frontend web para la interacción del usuario.
- Crear un módulo de analítica distribuida con Apache Spark.
- Generar datasets maestro y Big Data.
- Visualizar resultados en un dashboard Analytics.
- Ejecutar pruebas de funcionamiento, escalabilidad y desempeño con JMeter.
- Documentar la arquitectura, comandos, configuración y resultados.

---

##  Arquitectura del sistema

La arquitectura se despliega sobre dos máquinas virtuales Ubuntu configuradas como clúster Docker Swarm.

```
                         Internet
                             │
                    raglsystems.com.co
                             │
              ┌──────────────▼──────────────┐
              │     servidorUbuntu1          │
              │     IP: 192.168.100.2        │
              │     Rol: Swarm Manager       │
              │                              │
              │  ┌────────────────────────┐  │
              │  │  HAProxy :80 / :8404   │  │
              │  └────────────────────────┘  │
              │  ┌────────────────────────┐  │
              │  │   MySQL (4 bases)      │  │
              │  └────────────────────────┘  │
              │  ┌────────────────────────┐  │
              │  │   Apache Spark         │  │
              │  │   Analytics Module     │  │
              │  └────────────────────────┘  │
              └──────────────────────────────┘
                             │
                    red overlay (Swarm)
                             │
              ┌──────────────▼──────────────┐
              │     servidorUbuntu2          │
              │     IP: 192.168.100.3        │
              │     Rol: Swarm Worker        │
              │                              │
              │  ┌────────────────────────┐  │
              │  │  Frontend Nginx :8080  │  │
              │  └────────────────────────┘  │
              │  ┌──────┐ ┌──────┐           │
              │  │ :3001│ │ :3000│           │
              │  │Clien.│ │Serv. │  (×2 répl)│
              │  └──────┘ └──────┘           │
              │  ┌──────┐ ┌──────┐           │
              │  │ :3002│ │ :3003│           │
              │  │Pedid.│ │Pagos │           │
              │  └──────┘ └──────┘           │
              └──────────────────────────────┘
```

---

##  Estructura del repositorio

```
PROYECTO_DIEGO_AUDIO/
│
├── analytics_spark/              # Módulo de procesamiento Big Data
│   ├── generar_dataset.py        # Unifica datos de APIs en CSV maestro
│   ├── generar_bigdata.py        # Genera 10.000 registros para análisis
│   ├── spark_audio_analytics.py  # Job PySpark: RDD + MapReduce + Broadcast
│   └── resultados_analytics.json # Resultados exportados por Spark
│
├── docker/                       # Configuración general de orquestación
│   └── docker-compose-swarm.yml  # Stack completo para Docker Swarm
│
├── frontend/                     # Interfaz web del sistema
│   ├── Dockerfile
│   └── /front_audio_docker/      # HTML, CSS, JS, Bootstrap + Analytics
│
├── haproxy/                      # Balanceador de carga
│   ├── Dockerfile
│   └── haproxy.cfg               # ACLs, backends, stats
│
├── ms-clientes/                  # Microservicio de clientes (Node.js)
│   ├── Dockerfile
│   ├── index.js
│   └── package.json
│
├── ms-pagos/                     # Microservicio de pagos y PDF (Node.js)
│   ├── Dockerfile
│   ├── index.js
│   └── package.json
│
├── ms-pedidos/                   # Microservicio de pedidos (Node.js)
│   ├── Dockerfile
│   ├── index.js
│   └── package.json
│
├── ms-servicios/                 # Microservicio de catálogo (Node.js)
│   ├── Dockerfile
│   ├── index.js
│   └── package.json
│
├── .gitignore
└── README.md
```

---

##  Tecnologías utilizadas

| Categoría | Tecnología | Versión | Propósito |
|-----------|------------|---------|-----------|
| Contenedores | Docker | 24+ | Empaquetado de todos los servicios |
| Orquestación | Docker Swarm | built-in | Clúster multi-nodo + escalado |
| Balanceo | HAProxy | 2.9 | Gateway, enrutamiento y stats |
| Frontend | Nginx | Alpine | Servidor web y dashboard |
| Backend | Node.js + Express | 18 LTS | Microservicios REST |
| Base de datos | MySQL | 8.0 | Persistencia por microservicio |
| Big Data | Apache Spark / PySpark | 4.1.2 | Procesamiento distribuido |
| Virtualización | VirtualBox + Vagrant | - | Infraestructura local |
| Registro | Docker Hub | - | Imágenes: `aglsystems/*` |
| Pruebas de carga | Apache JMeter | - | Escalabilidad y desempeño |

---
# Microservicios implementados

| Microservicio | Carpeta | Puerto interno | Descripción |
|---|---|---:|---|
| Servicios | `ms-servicios` | 3000 | Administra los servicios musicales ofrecidos por el estudio |
| Clientes | `ms-clientes` | 3001 | Administra la información de clientes |
| Pedidos | `ms-pedidos` | 3002 | Gestiona solicitudes o pedidos de servicios |
| Pagos | `ms-pagos` | 3003 | Registra y controla los pagos asociados a pedidos |

Cada microservicio tiene código fuente independiente, Dockerfile propio, dependencias propias, API REST propia, base de datos independiente y posibilidad de escalar de forma separada.

---
# Reglas de negocio

Las principales reglas de negocio implementadas fueron:

- Un pedido puede tener múltiples intentos de pago.
- Solo puede existir un pago exitoso final para confirmar un pedido.
- Si ya existe un pago en estado pagado para un pedido, no se permiten más pagos nuevos sobre ese mismo pedido.
- Si el usuario desea comprar nuevamente el mismo servicio, debe crear un nuevo pedido.
- Un pago rechazado o cancelado no cierra el pedido.
- Cada intento de pago crea un nuevo registro en la tabla de pagos.
- El pedido guarda el estado general del negocio.
- El pago guarda el detalle transaccional.
- Un pedido confirmado no se puede editar.
- Un pedido con historial de pagos no debe eliminarse para conservar trazabilidad.
- El backend valida siempre las reglas críticas antes de registrar pagos o modificar pedidos.
- El sistema conserva y expone la trazabilidad de intentos de pago.
- El último intento de pago se identifica por ID descendente.
- El primer pago exitoso cierra el ciclo de cobro del pedido.
- La recompra no es un nuevo pago, sino un nuevo pedido.
- Aunque el frontend ayuda visualmente, el backend es quien impone la regla.

---
# Puertos del sistema

| Componente | Puerto | Descripción |
|---|---:|---|
| Frontend | 8080 | Acceso al micrositio web |
| HAProxy Gateway | 80 | Entrada principal hacia las APIs |
| HAProxy Stats | 8404 | Panel de monitoreo de HAProxy |
| MS Servicios | 3000 | API de servicios |
| MS Clientes | 3001 | API de clientes |
| MS Pedidos | 3002 | API de pedidos |
| MS Pagos | 3003 | API de pagos |
| MySQL Clientes | 3307 | Base de datos de clientes |
| MySQL Servicios | 3308 | Base de datos de servicios |
| MySQL Pedidos | 3309 | Base de datos de pedidos |
| MySQL Pagos | 3310 | Base de datos de pagos |

---
# Flujo de datos del sistema

## Flujo transaccional

```text
Usuario
  -> Frontend Web
  -> HAProxy
  -> Microservicio correspondiente
  -> Base de datos MySQL
  -> Respuesta al frontend
```

## Flujo analítico

```text
APIs / datos exportados
  -> JSON de clientes, servicios, pedidos y pagos
  -> dataset_audio_maestro.csv
  -> dataset_audio_bigdata_10000.csv
  -> spark_audio_analytics.py
  -> resultados_analytics.json
  -> Dashboard Analytics
```

---

##  Requisitos previos

Antes de desplegar el sistema, asegúrate de contar con:

- VirtualBox instalado (versión 6.1+)
- Vagrant instalado (versión 2.3+)
- Dos máquinas virtuales Ubuntu 22.04 configuradas con las IPs:
  - `192.168.100.2` → servidorUbuntu1
  - `192.168.100.3` → servidorUbuntu2
- Docker Engine instalado en ambos servidores
- Acceso a Docker Hub (para pull de imágenes `aglsystems/*`)
- Python 3 + PySpark 4.1.2 instalado en servidorUbuntu1 (para Spark)

---

# Preparación del entorno

## Iniciar máquinas virtuales

Desde Windows, en la carpeta donde está el archivo Vagrantfile:

```bash
vagrant up
```

Ingresar al servidor manager:

```bash
vagrant ssh servidorUbuntu1
```

Ingresar al servidor worker:

```bash
vagrant ssh servidorUbuntu2
```

Obtener privilegios root:

```bash
sudo -i
```

## Verificar IPs

En cada máquina:

```bash
ip a
```

IPs esperadas:

```text
servidorUbuntu1: 192.168.100.2
servidorUbuntu2: 192.168.100.3
```

## Verificar Docker

```bash
docker --version
docker ps
```

##  Configuración de infraestructura

### Inicializar el clúster Docker Swarm

En **servidorUbuntu1** (Manager):

```bash
docker swarm init --advertise-addr 192.168.100.2
```

Copia el token que genera el comando y ejecútalo en **servidorUbuntu2** (Worker):

```bash
docker swarm join --token <TOKEN> 192.168.100.2:2377
```

Verifica que ambos nodos estén activos:

```bash
docker node ls
```

---

##  Despliegue con Docker Swarm

Desde **servidorUbuntu1**, clona el repositorio y despliega el stack completo:

```bash
git clone https://github.com/aglsystems-ragl/PROYECTO_DIEGO_AUDIO.git
cd PROYECTO_DIEGO_AUDIO/docker

docker stack deploy -c docker-compose-swarm.yml talleraudio
```

Verifica que todos los servicios estén en ejecución:

```bash
docker stack services talleraudio
docker stack ps talleraudio
```

Accede al sistema desde el navegador:

```
http://raglsystems.com.co
http://192.168.100.2        ← si no tienes DNS configurado
```

Panel de estadísticas HAProxy:

```
http://raglsystems.com.co:8404/haproxy?stats
```

---

##  Microservicios

Cada microservicio corre de forma independiente con su propia lógica de negocio, base de datos y contenedor.

### Clientes — puerto 3001
```
Imagen:   aglsystems/clientes-ms:2.0
Réplicas: 2
Base:     diegoAudio_clientes_db
Función:  CRUD completo de clientes del estudio
```

### Servicios — puerto 3000
```
Imagen:   aglsystems/servicios-ms:2.0
Réplicas: 1
Base:     diegoAudio_db
Función:  Catálogo de servicios musicales (mezcla y masterización)
```

### Pedidos — puerto 3002
```
Imagen:   aglsystems/pedidos-ms:2.0
Réplicas: 1
Base:     diegoAudio_pedidos_db
Función:  Gestión del ciclo de vida de pedidos y lógica de negocio
```

### Pagos — puerto 3003
```
Imagen:   aglsystems/pagos-ms:2.0
Réplicas: 1
Base:     diegoAudio_pagos_db
Función:  Registro de transacciones y generación de comprobantes PDF
```

### Reglas de negocio clave (Pedidos y Pagos)

- Un pedido puede tener múltiples intentos de pago; solo uno puede ser exitoso.
- Al confirmar un pago, el pedido cambia automáticamente a estado `Confirmado`.
- Un pedido confirmado no puede editarse ni eliminarse si tiene historial de pagos.
- Las validaciones críticas viven en el backend, no en el frontend.
- Los triggers SQL entre bases fueron eliminados: la sincronización se gestiona desde el backend para respetar el desacoplamiento entre microservicios.

---

##  Módulo de análisis distribuido (Spark)

El módulo de analítica distribuida está ubicado en `analytics_spark/` y se ejecuta directamente en **servidorUbuntu1**.

### Cómo funciona

```
APIs REST de microservicios
         │
         ▼
   generar_dataset.py          ← unifica clientes, pedidos, pagos, servicios
         │
         ▼
  dataset_audio_maestro.csv
         │
         ▼
   generar_bigdata.py           ← amplifica a 10.000 registros para Big Data
         │
         ▼
  dataset_audio_bigdata_10000.csv
         │
         ▼
  spark_audio_analytics.py      ← Job PySpark: RDD + MapReduce + Broadcast + Accumulators
         │
         ▼
  resultados_analytics.json     ← consumido por el dashboard web
```

## Archivos principales

| Archivo | Descripción |
|---|---|
| `clientes.json` | Datos exportados del microservicio clientes |
| `servicios.json` | Datos exportados del microservicio servicios |
| `pedidos.json` | Datos exportados del microservicio pedidos |
| `pagos.json` | Datos exportados del microservicio pagos |
| `dataset_audio_maestro.csv` | Dataset maestro integrado |
| `dataset_audio_bigdata_10000.csv` | Dataset ampliado para procesamiento distribuido |
| `resultados_analytics.json` | Resultado final consumido por el dashboard |
| `scripts/` | Scripts de generación y procesamiento |
| `top_servicios_rdd/` | Resultado generado por RDD |

## Flujo Analytics

```text
1. Se consumen APIs reales.
2. Se exportan datos en JSON.
3. Se genera un dataset maestro.
4. Se amplía el dataset a 10.000 registros.
5. Spark procesa el CSV con RDD.
6. Se aplican operaciones tipo MapReduce.
7. Se usan acumuladores y broadcast.
8. Se exportan resultados a JSON.
9. El dashboard lee el JSON y muestra gráficas.
```


### Ejecutar el pipeline completo

```bash
cd /var/www/analytics_audio/scripts

# 1. Generar dataset maestro desde las APIs
python3 generar_dataset.py

# 2. Amplificar a volumen Big Data (10.000 registros)
python3 generar_bigdata.py

# 3. Ejecutar análisis distribuido con Spark
python3 spark_audio_analytics.py

# 4. Verificar resultados exportados
cat /var/www/analytics_audio/resultados_analytics.json
```

### Operaciones distribuidas implementadas

| Operación Spark | Uso en el proyecto |
|---|---|
| `SparkContext` + `textFile()` | Carga del dataset como RDD distribuido |
| `map()` + `flatMap()` | Parseo de registros CSV con `csv.reader` |
| `filter()` | Eliminación del encabezado y datos inválidos |
| `reduceByKey()` | Agrupación de ingresos por método de pago y conteo de servicios |
| `sortBy()` | Ranking de top servicios y top clientes |
| `broadcast` | Distribución eficiente del catálogo de servicios entre nodos |
| `accumulator` | Conteo distribuido de pagos rechazados |

### Insights generados

-  Ingresos totales por método de pago (Efectivo, Tarjeta, Nequi, Daviplata, Transferencia)
-  Top servicios más solicitados (Mezcla de voz, Mezcla instrumental, Mastering)
-  Top clientes por volumen económico acumulado
-  Cantidad total de pagos rechazados (mediante acumuladores)
-  Total de registros procesados de forma distribuida

### Dashboard Analytics

Los resultados se visualizan en:

```
http://raglsystems.com.co/analytics/index.html
```

El dashboard carga `resultados_analytics.json` y genera gráficos dinámicos de barras usando Chart.js.

---

##  Enrutamiento HAProxy

HAProxy actúa como punto de entrada único del sistema. Todas las peticiones entran por el puerto 80 y se distribuyen según la ruta.

| Ruta | Destino |
|------|---------|
| `/` | Frontend (Nginx) |
| `/api/clientes` | Microservicio clientes `:3001` |
| `/api/servicios` | Microservicio servicios `:3000` |
| `/api/pedidos` | Microservicio pedidos `:3002` |
| `/api/pagos` | Microservicio pagos `:3003` |
| `/facturas` | Microservicio pagos (PDF) `:3003` |
| `/analytics` | Dashboard Analytics |
| `/resultados_analytics.json` | Resultados Spark (JSON) |

El algoritmo de balanceo es **round-robin**. HAProxy detecta automáticamente backends caídos y redirige el tráfico hacia las réplicas disponibles.

---

# Verificación de funcionamiento

## Verificar contenedores

```bash
docker ps
```

## Verificar servicios Swarm

```bash
docker service ls
```

## Verificar APIs desde HAProxy

```bash
for ruta in clientes servicios pedidos pagos; do
  echo "Probando $ruta"
  curl -s -o /dev/null -w "HTTP %{http_code} | Tiempo %{time_total}s
" http://192.168.100.3/api/$ruta
done
```

Resultado esperado:

```text
HTTP 200
```

## Verificar frontend

Abrir en navegador:

```text
http://192.168.100.3:8080
```

## Verificar HAProxy Stats

Abrir:

```text
http://192.168.100.3:8404/stats
```

Debe mostrar los backends en estado `UP`.

---

## Bases de datos

Cada microservicio tiene su propia base de datos MySQL independiente, garantizando desacoplamiento total de datos.

| Base de datos | Microservicio | Descripción |
|---|---|---|
| `diegoAudio_clientes_db` | ms-clientes | Perfiles y datos de clientes |
| `diegoAudio_db` | ms-servicios | Catálogo de servicios musicales |
| `diegoAudio_pedidos_db` | ms-pedidos | Órdenes y estados de pedidos |
| `diegoAudio_pagos_db` | ms-pagos | Transacciones y comprobantes |

Los datos persisten mediante **volúmenes Docker**, sobreviviendo reinicios de contenedores.

---

##  Escalabilidad y pruebas

### Escalar un microservicio en caliente

```bash
# Escalar clientes a 4 réplicas
docker service scale talleraudio_clientes=4

# Verificar distribución de réplicas entre nodos
docker service ps talleraudio_clientes
```

HAProxy detecta las nuevas réplicas automáticamente y empieza a enviarles tráfico de inmediato sin necesidad de reiniciar.

### Pruebas de carga con JMeter

El plan de pruebas (`DiegoArenasAudio_LoadTest.jmx`) simula carga concurrente contra todos los endpoints:

- **Usuarios simulados:** 100 hilos
- **Ramp-up:** 10 segundos
- **Iteraciones por usuario:** 10
- **Endpoints evaluados:** `/api/clientes`, `/api/servicios`, `/api/pedidos`, `/api/pagos`

Se ejecutaron dos escenarios comparativos:
1. **Escenario base:** 2 réplicas de clientes y servicios
2. **Escenario escalado:** 4 réplicas de clientes y servicios

Los resultados (tiempo de respuesta, throughput, % de error) se comparan para demostrar la mejora de desempeño al escalar horizontalmente.

Servidor usado en JMeter:

```text
192.168.100.3
```

Puerto:

```text
80
```

## Escenarios de prueba

| Prueba | Réplicas microservicios | Usuarios por grupo | Ramp-Up | Loop | Objetivo |
|---|---:|---:|---:|---:|---|
| 1 | 2 | 50 | 10 | 5 | Línea base estable |
| 2 | 2 | 100 | 10 | 5 | Carga media |
| 3 | 4 | 100 | 10 | 5 | Validar escalabilidad horizontal |
| 4 | 4 | 150 | 10 | 5 | Estrés controlado |
| 5 | 4 | 200 | 10 | 5 | Saturación de plataforma |

---

### Recuperación automática ante fallos

```bash
# Simular caída de un contenedor
docker rm -f <id_contenedor>

# Docker Swarm lo reemplaza automáticamente en ~10 segundos
docker service ps talleraudio_clientes
```

---

# Resultados de pruebas

## Consolidado general

| Prueba | Réplicas MS | Usuarios | Loop | Avg Resp. | Error promedio | Throughput promedio | Estado Docker Swarm | Estado HAProxy | Resultado general |
|---|---:|---:|---:|---|---|---|---|---|---|
| Línea base | 2 | 50 | 5 | 3300-5000 ms | 48%-59% | 16-28 req/min | 2/2 activos | UP | Arquitectura funcional |
| Carga media | 2 | 100 | 5 | 2300-4000 ms | 37%-40% | 21-35 req/min | 2/2 activos | UP | Carga soportada parcialmente |
| Escalabilidad horizontal | 4 | 100 | 5 | 1700-3600 ms | 27%-29% | 28-37 req/min | 4/4 activos | UP | Mejora clara por réplicas |
| Estrés controlado | 4 | 150 | 5 | 1800-3600 ms | 20%-29% | 37-48 req/min | 4/4 activos | UP | Plataforma estable |
| Saturación | 4 | 200 | 5 | 1200-3500 ms | 19%-21% | 38-49 req/min | 4/4 activos | UP | Excelente comportamiento |

## Interpretación general

Las pruebas demostraron que el sistema puede escalar horizontalmente. Al pasar de 2 a 4 réplicas por microservicio, el throughput aumentó y el porcentaje de errores disminuyó. Esto indica que Docker Swarm distribuyó correctamente la carga y que HAProxy mantuvo activos los backends durante los escenarios de prueba.

En los escenarios de mayor carga, el sistema mantuvo estabilidad operativa. Los servicios permanecieron activos, HAProxy reportó estado `UP` y Docker Swarm mantuvo las réplicas en ejecución.

El principal cuello de botella identificado fue la capa de persistencia, especialmente las bases de datos MySQL, debido al aumento del tráfico de red y consumo de memoria durante las pruebas de carga.

---

# Comandos útiles

## Ver servicios

```bash
docker service ls
```

## Ver contenedores activos

```bash
docker ps
```

## Ver consumo de recursos

```bash
docker stats
```

## Ver logs de un servicio

```bash
docker service logs talleraudio_pedidos
```

## Ver tareas de un servicio

```bash
docker service ps talleraudio_pedidos
```

## Reiniciar forzadamente un servicio

```bash
docker service update --force talleraudio_pedidos
```

## Escalar servicios a 4 réplicas

```bash
docker service scale talleraudio_clientes=4 talleraudio_servicios=4 talleraudio_pedidos=4 talleraudio_pagos=4
```

## Escalar servicios a 2 réplicas

```bash
docker service scale talleraudio_clientes=2 talleraudio_servicios=2 talleraudio_pedidos=2 talleraudio_pagos=2
```

## Probar APIs

```bash
for ruta in clientes servicios pedidos pagos; do
  echo "Probando $ruta"
  curl -s -o /dev/null -w "HTTP %{http_code} | Tiempo %{time_total}s
" http://192.168.100.3/api/$ruta
done
```

---


# Conclusiones

El proyecto permitió implementar una arquitectura distribuida funcional utilizando microservicios, Docker Swarm, HAProxy, MySQL, frontend web, Apache Spark y JMeter.

La solución demuestra que una aplicación puede dividirse en componentes independientes, desplegarse como contenedores, escalar horizontalmente y balancear tráfico usando un gateway.

Además, se integró una capa de procesamiento distribuido con Apache Spark, lo cual permitió transformar datos transaccionales en información analítica útil para la toma de decisiones.

Las pruebas realizadas validaron el funcionamiento de los componentes, el balanceo de carga, la estabilidad de Docker Swarm y la mejora del rendimiento al aumentar el número de réplicas.

En general, el sistema cumple con los requerimientos del proyecto final: funcionamiento de componentes, escalabilidad, desempeño, balanceo de carga, procesamiento distribuido y visualización analítica.

---


## Autores

Proyecto desarrollado para el curso de **Redes e Infraestructura** — Universidad Autónoma de Occidente (UAO), 2026.

| Nombre | Contacto |
|--------|----------|
| Diego Fernando Arenas Lasso | diego_fer.arenas@uao.edu.co |
| Valentina Díaz Lobatón | valentina.diaz_l@uao.edu.co |
| Rodrigo Andrés Gómez Lopez | rodrigo_and.gomez@uao.edu.co |

---

> **Docente:** Oscar Mondragón  
> **Universidad:** Universidad Autónoma de Occidente — Cali, Colombia  
> **Docker Hub:** https://github.com/aglsystems-ragl/PROYECTO_DIEGO_AUDIO
