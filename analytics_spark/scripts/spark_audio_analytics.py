from pyspark import SparkContext
import json
import csv
from io import StringIO
import shutil
import os

sc = SparkContext(appName="AudioAnalyticsRDD_CSVParser")
sc.setLogLevel("ERROR")

print("\n======================================")
print(" ANALISIS DISTRIBUIDO - DIEGO AUDIO ")
print("======================================")

ruta = "/var/www/analytics_audio/dataset_audio_bigdata_10000.csv"
rdd = sc.textFile(ruta)

header = rdd.first()
datos = rdd.filter(lambda x: x != header)

print("\n[1] Dataset cargado correctamente")
print("Total registros:", datos.count())

def parse_csv_line(linea):
    try:
        return next(csv.reader(StringIO(linea)))
    except Exception:
        return []

columnas = datos.map(parse_csv_line).filter(lambda x: len(x) >= 10)

print("\n[2] Ejemplo de fila parseada correctamente:")
print(columnas.first())

def obtener_metodo_y_valor(x):
    try:
        metodo = x[7]
        valor = float(x[9])
        return (metodo, valor)
    except Exception:
        return ("ERROR", 0)

ingresos_metodo = columnas.map(obtener_metodo_y_valor).reduceByKey(lambda a, b: a + b)

print("\n======================================")
print(" INGRESOS POR METODO DE PAGO ")
print("======================================")
for item in ingresos_metodo.collect():
    print(item)

def extraer_servicios(x):
    try:
        servicios = x[3].split(",")
        return [(s.strip(), 1) for s in servicios if s.strip()]
    except Exception:
        return []

servicios_rdd = columnas.flatMap(extraer_servicios)
top_servicios = servicios_rdd.reduceByKey(lambda a, b: a + b)
top_servicios_ordenado = top_servicios.sortBy(lambda x: x[1], ascending=False)

print("\n======================================")
print(" TOP SERVICIOS LIMPIO ")
print("======================================")
for item in top_servicios_ordenado.take(10):
    print(item)

rechazados_acc = sc.accumulator(0)

def contar_rechazados(x):
    try:
        estado = x[8]
        if estado == "rechazado":
            rechazados_acc.add(1)
    except Exception:
        pass

columnas.foreach(contar_rechazados)

print("\n======================================")
print(" PAGOS RECHAZADOS ")
print("======================================")
print("Total rechazados:", rechazados_acc.value)

catalogo = [
    "Grabacion de voz",
    "Mezcla de instrumental",
    "Mezcla de voz",
    "Mastering",
    "Produccion musical",
    "nuevo servicio"
]

broadcast_catalogo = sc.broadcast(catalogo)

print("\n======================================")
print(" BROADCAST ACTIVO ")
print("======================================")
print(broadcast_catalogo.value)

def obtener_cliente_valor(x):
    try:
        cliente = x[1]
        valor = float(x[9])
        return (cliente, valor)
    except Exception:
        return ("ERROR", 0)

clientes_top = columnas.map(obtener_cliente_valor).reduceByKey(lambda a, b: a + b)
clientes_top_ordenado = clientes_top.sortBy(lambda x: x[1], ascending=False)

print("\n======================================")
print(" TOP CLIENTES ")
print("======================================")
for item in clientes_top_ordenado.take(10):
    print(item)

resultado_final = {
    "total_registros_procesados": datos.count(),
    "ingresos_por_metodo": ingresos_metodo.collect(),
    "top_servicios": top_servicios_ordenado.take(10),
    "pagos_rechazados": rechazados_acc.value,
    "top_clientes": clientes_top_ordenado.take(10)
}

salida_json = "/var/www/analytics_audio/resultados_analytics.json"

with open(salida_json, "w") as f:
    json.dump(resultado_final, f, indent=4, ensure_ascii=False)

print("\n======================================")
print(" RESULTADOS EXPORTADOS ")
print("======================================")
print("Archivo:", salida_json)

salida_rdd = "/var/www/analytics_audio/top_servicios_rdd"

if os.path.exists(salida_rdd):
    shutil.rmtree(salida_rdd)

top_servicios_ordenado.saveAsTextFile(salida_rdd)

print("\n======================================")
print(" PROCESO FINALIZADO ")
print("======================================")

sc.stop()
