import pandas as pd
import random
from datetime import datetime, timedelta

BASE = "/var/www/analytics_audio"

df_base = pd.read_csv(f"{BASE}/dataset_audio_maestro.csv")

clientes_extra = [
    "Laura Martínez", "Juan Gómez", "Camila Torres", "Andrés López",
    "Natalia Ramírez", "Carlos Méndez", "Sofía Herrera", "Felipe Castro",
    "Valentina Rojas", "Mateo Sánchez", "Daniela Pérez", "Oscar Mondragón"
]

metodos_pago = ["Nequi", "Transferencia bancaria", "Tarjeta", "Efectivo", "Daviplata"]
estados_pago = ["pagado", "rechazado", "pendiente"]
estados_pedido = ["Confirmado", "En proceso", "Rechazado"]

servicios_posibles = [
    "Grabacion de voz",
    "Mezcla de instrumental",
    "Mezcla de voz",
    "Mastering",
    "Produccion musical",
    "nuevo servicio"
]

filas = []

for i in range(10000):
    base = df_base.sample(1).iloc[0].to_dict()

    pedido_id = i + 1
    cliente = random.choice(clientes_extra + [base["cliente"]])
    email = cliente.lower().replace(" ", ".").replace("á", "a").replace("é", "e").replace("í", "i").replace("ó", "o").replace("ú", "u") + f"{i}@audio.com"

    cantidad_servicios = random.randint(1, 3)
    servicios = random.sample(servicios_posibles, cantidad_servicios)

    precios = {
        "Grabacion de voz": 50000,
        "Mezcla de instrumental": 70000,
        "Mezcla de voz": 80000,
        "Mastering": 90000,
        "Produccion musical": 120000,
        "nuevo servicio": 1000
    }

    total = sum(precios[s] for s in servicios)

    fecha_base = datetime(2026, 1, 1)
    fecha_pedido = fecha_base + timedelta(days=random.randint(0, 140), hours=random.randint(0, 23), minutes=random.randint(0, 59))

    estado_pago = random.choices(estados_pago, weights=[0.75, 0.15, 0.10])[0]

    if estado_pago == "pagado":
        estado_pedido = "Confirmado"
        valor_pago = total
    elif estado_pago == "rechazado":
        estado_pedido = "Rechazado"
        valor_pago = total
    else:
        estado_pedido = "En proceso"
        valor_pago = 0

    metodo_pago = random.choice(metodos_pago) if estado_pago != "SIN_PAGO" else "SIN_PAGO"

    filas.append({
        "pedido_id": pedido_id,
        "cliente": cliente,
        "email": email,
        "servicios": ", ".join(servicios),
        "total_pedido": total,
        "estado_pedido": estado_pedido,
        "fecha_pedido": fecha_pedido.isoformat(),
        "metodo_pago": metodo_pago,
        "estado_pago": estado_pago,
        "valor_pago": valor_pago
    })

df_big = pd.DataFrame(filas)
salida = f"{BASE}/dataset_audio_bigdata_10000.csv"
df_big.to_csv(salida, index=False)

print("Dataset Big Data generado correctamente")
print("Archivo:", salida)
print("Registros:", len(df_big))
print(df_big.head())
