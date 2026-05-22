import json
import pandas as pd

# ============================================
# CARGAR JSON
# ============================================

with open('/var/www/analytics_audio/clientes.json') as f:
    clientes = json.load(f)

with open('/var/www/analytics_audio/servicios.json') as f:
    servicios = json.load(f)

with open('/var/www/analytics_audio/pedidos.json') as f:
    pedidos = json.load(f)

with open('/var/www/analytics_audio/pagos.json') as f:
    pagos = json.load(f)

# ============================================
# NORMALIZAR PEDIDOS
# ============================================

filas = []

for pedido in pedidos:

    servicios_txt = []

    if isinstance(pedido["servicios_seleccionados"], list):
        for s in pedido["servicios_seleccionados"]:
            servicios_txt.append(s["nombre"])

    pagos_relacionados = [
        p for p in pagos if p["id_pedido"] == pedido["id"]
    ]

    if len(pagos_relacionados) == 0:

        filas.append({
            "pedido_id": pedido["id"],
            "cliente": pedido["nombre_cliente"],
            "email": pedido["email_cliente"],
            "servicios": ", ".join(servicios_txt),
            "total_pedido": pedido["precio_total"],
            "estado_pedido": pedido["estado_pedido"],
            "fecha_pedido": pedido["fecha"],
            "metodo_pago": "SIN_PAGO",
            "estado_pago": "SIN_PAGO",
            "valor_pago": 0
        })

    else:

        for pago in pagos_relacionados:

            filas.append({
                "pedido_id": pedido["id"],
                "cliente": pedido["nombre_cliente"],
                "email": pedido["email_cliente"],
                "servicios": ", ".join(servicios_txt),
                "total_pedido": pedido["precio_total"],
                "estado_pedido": pedido["estado_pedido"],
                "fecha_pedido": pedido["fecha"],
                "metodo_pago": pago["metodo_pago"],
                "estado_pago": pago["estado"],
                "valor_pago": pago["total_pago"]
            })

# ============================================
# DATAFRAME
# ============================================

df = pd.DataFrame(filas)

# ============================================
# EXPORTAR CSV
# ============================================

salida = "/var/www/analytics_audio/dataset_audio_maestro.csv"

df.to_csv(salida, index=False)

print("\n===================================")
print(" DATASET MAESTRO GENERADO")
print("===================================")
print(df.head())
print("\nTotal registros:", len(df))
print("\nArchivo:", salida)
