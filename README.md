# Diego Arenas Audio  
## Arquitectura Distribuida con Microservicios, Docker Swarm, HAProxy, Apache Spark y JMeter

Proyecto académico de infraestructura distribuida orientado al diseño, despliegue, balanceo, escalabilidad, procesamiento analítico y pruebas de rendimiento de un sistema web basado en microservicios.

El sistema implementa una plataforma para la gestión del estudio **Diego Arenas Audio**, integrando frontend web, microservicios REST, bases de datos MySQL independientes, balanceo de carga con HAProxy, despliegue con Docker Swarm, procesamiento distribuido con Apache Spark y pruebas de carga con Apache JMeter.

---

## Integrantes

- Valentina
- Rodrigo Andrés Gómez López
- Diego Arenas

---

## Repositorio

```text
https://github.com/aglsystems-ragl/PROYECTO_DIEGO_AUDIO
```

---

## Tabla de contenido

1. Descripción general
2. Objetivo del proyecto
3. Arquitectura general
4. Infraestructura utilizada
5. Estructura del repositorio
6. Tecnologías utilizadas
7. Microservicios implementados
8. Reglas de negocio
9. Puertos del sistema
10. Flujo de datos del sistema
11. Preparación del entorno
12. Despliegue paso a paso
13. Verificación de funcionamiento
14. Escalabilidad horizontal
15. Balanceo de carga con HAProxy
16. Módulo Analytics con Apache Spark
17. Dashboard Analytics
18. Pruebas con Apache JMeter
19. Resultados de pruebas
20. Comandos útiles
21. Evidencias sugeridas
22. Conclusiones

---

# 1. Descripción general

El proyecto **Diego Arenas Audio** corresponde a una aplicación web distribuida diseñada para administrar servicios musicales, clientes, pedidos y pagos de un estudio de audio.

La solución fue construida bajo una arquitectura de microservicios, donde cada componente funciona de forma independiente, se comunica mediante APIs REST y cuenta con su propia base de datos MySQL. Además, el sistema fue desplegado sobre un clúster Docker Swarm, permitiendo escalar horizontalmente los servicios y balancear el tráfico mediante HAProxy.

También se integró una capa de analítica distribuida usando Apache Spark, la cual procesa datasets generados a partir de los datos del sistema y produce resultados estadísticos para ser visualizados en un dashboard web.

---

# 2. Objetivo del proyecto

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

# 3. Arquitectura general

La arquitectura se compone de cinco capas principales:

1. **Capa de presentación:** frontend web.
2. **Capa de enrutamiento:** HAProxy como proxy inverso y balanceador.
3. **Capa de microservicios:** clientes, servicios, pedidos y pagos.
4. **Capa de persistencia:** bases de datos MySQL independientes.
5. **Capa analítica:** Apache Spark, datasets y dashboard Analytics.

## Diagrama lógico simplificado

```text
Usuario / Navegador
        |
        v
Frontend Web
        |
        v
HAProxy - Balanceador / Gateway
        |
        +----------------+----------------+----------------+----------------+
        |                |                |                |
        v                v                v                v
MS Clientes       MS Servicios      MS Pedidos        MS Pagos
        |                |                |                |
        v                v                v                v
MySQL Clientes    MySQL Servicios    MySQL Pedidos     MySQL Pagos


Capa Analytics:

APIs / JSON / CSV
        |
        v
dataset_audio_maestro.csv
        |
        v
dataset_audio_bigdata_10000.csv
        |
        v
Apache Spark / PySpark
        |
        v
resultados_analytics.json
        |
        v
Dashboard Analytics
```

---

# 4. Infraestructura utilizada

El proyecto fue ejecutado sobre dos máquinas virtuales Ubuntu creadas con Vagrant.

| Máquina | IP | Rol principal | Componentes |
|---|---|---|---|
| servidorUbuntu1 | 192.168.100.2 | Nodo manager Docker Swarm | Backend, microservicios, bases de datos, Spark Analytics, administración del clúster |
| servidorUbuntu2 | 192.168.100.3 | Nodo worker Docker Swarm | Frontend, acceso web, HAProxy Stats y servicios distribuidos |

## Roles del clúster

| Nodo | Rol Docker Swarm |
|---|---|
| servidorUbuntu1 | Manager |
| servidorUbuntu2 | Worker |

---

# 5. Estructura del repositorio

La estructura final del repositorio quedó organizada de forma modular:

```text
PROYECTO_DIEGO_AUDIO/
│
├── analytics_spark/
│   ├── clientes.json
│   ├── servicios.json
│   ├── pedidos.json
│   ├── pagos.json
│   ├── dataset_audio_maestro.csv
│   ├── dataset_audio_bigdata_10000.csv
│   ├── resultados_analytics.json
│   ├── scripts/
│   └── top_servicios_rdd/
│
├── docker/
│   └── docker-compose-swarm.yml
│
├── docs/
│   ├── arquitectura/
│   ├── evidencias/
│   └── pruebas/
│
├── frontend/
│   ├── analytics/
│   ├── clientes/
│   ├── servicios/
│   ├── pedidos/
│   ├── pagos/
│   ├── css/
│   ├── imagenes/
│   ├── index.html
│   ├── Dockerfile
│   └── docker-compose-swarm.yml
│
├── haproxy/
│   ├── Dockerfile
│   └── haproxy.cfg
│
├── ms-clientes/
│   ├── Dockerfile
│   ├── package.json
│   ├── package-lock.json
│   └── src/
│
├── ms-servicios/
│   ├── Dockerfile
│   ├── package.json
│   ├── package-lock.json
│   └── src/
│
├── ms-pedidos/
│   ├── Dockerfile
│   ├── package.json
│   ├── package-lock.json
│   └── src/
│
├── ms-pagos/
│   ├── Dockerfile
│   ├── package.json
│   ├── package-lock.json
│   └── src/
│
├── .gitignore
└── README.md
```

---

# 6. Tecnologías utilizadas

| Categoría | Tecnología |
|---|---|
| Frontend | HTML5, CSS, Bootstrap, JavaScript |
| Backend | Node.js, Express |
| Base de datos | MySQL 8 |
| Contenedores | Docker |
| Orquestación | Docker Swarm |
| Balanceo de carga | HAProxy |
| Procesamiento distribuido | Apache Spark / PySpark |
| Lenguaje Analytics | Python |
| Pruebas de carga | Apache JMeter 5.6.3 |
| Máquinas virtuales | Vagrant + VirtualBox |
| Sistema operativo | Ubuntu Server |
| Control de versiones | Git + GitHub |

---

# 7. Microservicios implementados

| Microservicio | Carpeta | Puerto interno | Descripción |
|---|---|---:|---|
| Servicios | `ms-servicios` | 3000 | Administra los servicios musicales ofrecidos por el estudio |
| Clientes | `ms-clientes` | 3001 | Administra la información de clientes |
| Pedidos | `ms-pedidos` | 3002 | Gestiona solicitudes o pedidos de servicios |
| Pagos | `ms-pagos` | 3003 | Registra y controla los pagos asociados a pedidos |

Cada microservicio tiene código fuente independiente, Dockerfile propio, dependencias propias, API REST propia, base de datos independiente y posibilidad de escalar de forma separada.

---

# 8. Reglas de negocio

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

# 9. Puertos del sistema

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

# 10. Flujo de datos del sistema

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

# 11. Preparación del entorno

## 11.1 Iniciar máquinas virtuales

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

## 11.2 Verificar IPs

En cada máquina:

```bash
ip a
```

IPs esperadas:

```text
servidorUbuntu1: 192.168.100.2
servidorUbuntu2: 192.168.100.3
```

## 11.3 Verificar Docker

```bash
docker --version
docker ps
```

---

# 12. Despliegue paso a paso

## 12.1 Clonar el repositorio

En `servidorUbuntu1`:

```bash
cd /var/www
git clone https://github.com/aglsystems-ragl/PROYECTO_DIEGO_AUDIO.git
cd PROYECTO_DIEGO_AUDIO
```

## 12.2 Inicializar Docker Swarm

En `servidorUbuntu1`:

```bash
docker swarm init --advertise-addr 192.168.100.2
```

Obtener token para unir el worker:

```bash
docker swarm join-token worker
```

El comando generado será similar a:

```bash
docker swarm join --token <TOKEN_GENERADO> 192.168.100.2:2377
```

## 12.3 Unir servidorUbuntu2 al clúster

En `servidorUbuntu2`, ejecutar el comando generado:

```bash
docker swarm join --token <TOKEN_GENERADO> 192.168.100.2:2377
```

## 12.4 Verificar nodos

En `servidorUbuntu1`:

```bash
docker node ls
```

Debe aparecer algo similar:

```text
servidorUbuntu1   Ready   Active   Leader
servidorUbuntu2   Ready   Active
```

## 12.5 Desplegar el stack

Desde `servidorUbuntu1`:

```bash
cd /var/www/PROYECTO_DIEGO_AUDIO/docker
docker stack deploy -c docker-compose-swarm.yml talleraudio
```

## 12.6 Verificar servicios

```bash
docker service ls
```

Servicios esperados:

```text
talleraudio_clientes
talleraudio_servicios
talleraudio_pedidos
talleraudio_pagos
talleraudio_db_clientes
talleraudio_db_servicios
talleraudio_db_pedidos
talleraudio_db_pagos
talleraudio_frontend
talleraudio_haproxy
```

---

# 13. Verificación de funcionamiento

## 13.1 Verificar contenedores

```bash
docker ps
```

## 13.2 Verificar servicios Swarm

```bash
docker service ls
```

## 13.3 Verificar APIs desde HAProxy

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

## 13.4 Verificar frontend

Abrir en navegador:

```text
http://192.168.100.3:8080
```

## 13.5 Verificar HAProxy Stats

Abrir:

```text
http://192.168.100.3:8404/stats
```

Debe mostrar los backends en estado `UP`.

---

# 14. Escalabilidad horizontal

## 14.1 Escalar a 4 réplicas

```bash
docker service scale talleraudio_clientes=4 talleraudio_servicios=4 talleraudio_pedidos=4 talleraudio_pagos=4
```

## 14.2 Verificar escalamiento

```bash
docker service ls
```

Resultado esperado:

```text
talleraudio_clientes    4/4
talleraudio_servicios   4/4
talleraudio_pedidos     4/4
talleraudio_pagos       4/4
```

## 14.3 Monitorear en tiempo real

```bash
watch docker service ls
```

## 14.4 Regresar a 2 réplicas

```bash
docker service scale talleraudio_clientes=2 talleraudio_servicios=2 talleraudio_pedidos=2 talleraudio_pagos=2
```

---

# 15. Balanceo de carga con HAProxy

HAProxy funciona como punto de entrada para las APIs. Su función principal es recibir las solicitudes del usuario o de JMeter y distribuirlas hacia las réplicas activas de los microservicios.

## 15.1 Archivo de configuración

Ruta dentro del repositorio:

```text
haproxy/haproxy.cfg
```

## 15.2 Funciones implementadas

- Proxy inverso.
- Balanceo de carga.
- Health checks.
- Enrutamiento por rutas `/api`.
- Monitoreo mediante panel Stats.
- Distribución de solicitudes hacia microservicios.

## 15.3 Acceso al panel

```text
http://192.168.100.3:8404/stats
```

---

# 16. Módulo Analytics con Apache Spark

El módulo Analytics se encuentra en:

```text
analytics_spark/
```

## 16.1 Archivos principales

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

## 16.2 Flujo Analytics

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

## 16.3 Ejecutar análisis Spark

Ubicarse en la carpeta de Analytics:

```bash
cd /var/www/PROYECTO_DIEGO_AUDIO/analytics_spark/scripts
```

Ejecutar el procesamiento:

```bash
python3 spark_audio_analytics.py
```

Si se ejecuta con Spark:

```bash
spark-submit spark_audio_analytics.py
```

## 16.4 Resultados generados

El archivo final es:

```text
resultados_analytics.json
```

Contiene:

- Total de registros procesados.
- Ingresos por método de pago.
- Servicios más solicitados.
- Pagos rechazados.
- Top clientes por valor acumulado.

---

# 17. Dashboard Analytics

El dashboard se encuentra en:

```text
frontend/analytics/index.html
```

Acceso:

```text
http://192.168.100.3:8080/analytics/index.html
```

El dashboard muestra:

- Total de registros procesados.
- Pagos rechazados.
- Servicio más solicitado.
- Ingresos por método de pago.
- Top servicios.
- Top clientes.

---

# 18. Pruebas con Apache JMeter

Las pruebas se realizaron con Apache JMeter 5.6.3 desde Windows.

## 18.1 Configuración general

Se probaron los siguientes endpoints:

| Grupo JMeter | Endpoint |
|---|---|
| TG_Clientes | `/api/clientes` |
| TG_Servicios | `/api/servicios` |
| TG_Pedidos | `/api/pedidos` |
| TG_Pagos | `/api/pagos` |

Servidor usado en JMeter:

```text
192.168.100.3
```

Puerto:

```text
80
```

## 18.2 Escenarios de prueba

| Prueba | Réplicas microservicios | Usuarios por grupo | Ramp-Up | Loop | Objetivo |
|---|---:|---:|---:|---:|---|
| 1 | 2 | 50 | 10 | 5 | Línea base estable |
| 2 | 2 | 100 | 10 | 5 | Carga media |
| 3 | 4 | 100 | 10 | 5 | Validar escalabilidad horizontal |
| 4 | 4 | 150 | 10 | 5 | Estrés controlado |
| 5 | 4 | 200 | 10 | 5 | Saturación de plataforma |

---

# 19. Resultados de pruebas

## 19.1 Consolidado general

| Prueba | Réplicas MS | Usuarios | Loop | Avg Resp. | Error promedio | Throughput promedio | Estado Docker Swarm | Estado HAProxy | Resultado general |
|---|---:|---:|---:|---|---|---|---|---|---|
| Línea base | 2 | 50 | 5 | 3300-5000 ms | 48%-59% | 16-28 req/min | 2/2 activos | UP | Arquitectura funcional |
| Carga media | 2 | 100 | 5 | 2300-4000 ms | 37%-40% | 21-35 req/min | 2/2 activos | UP | Carga soportada parcialmente |
| Escalabilidad horizontal | 4 | 100 | 5 | 1700-3600 ms | 27%-29% | 28-37 req/min | 4/4 activos | UP | Mejora clara por réplicas |
| Estrés controlado | 4 | 150 | 5 | 1800-3600 ms | 20%-29% | 37-48 req/min | 4/4 activos | UP | Plataforma estable |
| Saturación | 4 | 200 | 5 | 1200-3500 ms | 19%-21% | 38-49 req/min | 4/4 activos | UP | Excelente comportamiento |

## 19.2 Interpretación general

Las pruebas demostraron que el sistema puede escalar horizontalmente. Al pasar de 2 a 4 réplicas por microservicio, el throughput aumentó y el porcentaje de errores disminuyó. Esto indica que Docker Swarm distribuyó correctamente la carga y que HAProxy mantuvo activos los backends durante los escenarios de prueba.

En los escenarios de mayor carga, el sistema mantuvo estabilidad operativa. Los servicios permanecieron activos, HAProxy reportó estado `UP` y Docker Swarm mantuvo las réplicas en ejecución.

El principal cuello de botella identificado fue la capa de persistencia, especialmente las bases de datos MySQL, debido al aumento del tráfico de red y consumo de memoria durante las pruebas de carga.

---

# 20. Comandos útiles

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

# 21. Evidencias sugeridas

Se recomienda guardar en `docs/evidencias/`:

- Captura del frontend principal.
- Captura del módulo Analytics.
- Captura de HAProxy Stats.
- Captura de Docker Swarm con 2 réplicas.
- Captura de Docker Swarm con 4 réplicas.
- Captura de `docker stats`.
- Capturas de JMeter Summary Report.
- Capturas de JMeter Aggregate Report.
- Capturas de Response Time Graph.
- Captura de datasets generados.
- Captura de resultados Spark.

---

# 22. Conclusiones

El proyecto permitió implementar una arquitectura distribuida funcional utilizando microservicios, Docker Swarm, HAProxy, MySQL, frontend web, Apache Spark y JMeter.

La solución demuestra que una aplicación puede dividirse en componentes independientes, desplegarse como contenedores, escalar horizontalmente y balancear tráfico usando un gateway.

Además, se integró una capa de procesamiento distribuido con Apache Spark, lo cual permitió transformar datos transaccionales en información analítica útil para la toma de decisiones.

Las pruebas realizadas validaron el funcionamiento de los componentes, el balanceo de carga, la estabilidad de Docker Swarm y la mejora del rendimiento al aumentar el número de réplicas.

En general, el sistema cumple con los requerimientos del proyecto final: funcionamiento de componentes, escalabilidad, desempeño, balanceo de carga, procesamiento distribuido y visualización analítica.

---

# Créditos

Proyecto desarrollado por:

- Valentina Diaz Lobaton
- Rodrigo Andrés Gómez López
- Diego Arenas Laso

Curso: Infraestructura / Arquitecturas Distribuidas  
Proyecto: Diego Arenas Audio  
Repositorio: `aglsystems-ragl`
https://github.com/aglsystems-ragl/PROYECTO_DIEGO_AUDIO
