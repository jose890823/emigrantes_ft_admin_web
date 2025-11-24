# ANALISIS COMPARATIVO: PDF REQUISITOS vs IMPLEMENTACION ACTUAL

**Fecha:** 2024-11-24
**Documento fuente:** `requisitos/Instrucciones_Integracion_Web_EmigrantesFT.pdf`

---

## RESUMEN EJECUTIVO

| Categoria | Requerido (PDF) | Estado Actual |
|-----------|-----------------|---------------|
| **Registro** | 4 campos | IMPLEMENTADO |
| **Planes** | 3 planes con precios especificos | Solo 1 plan ($29) |
| **Stripe Checkout** | Pago inicial + suscripcion | NO IMPLEMENTADO |
| **Stripe Webhooks** | 3 eventos obligatorios | NO IMPLEMENTADO |
| **DocuSign** | Firma de contratos | NO IMPLEMENTADO |
| **RON (Notarizacion)** | Integracion con proveedor | NO IMPLEMENTADO |
| **Panel Cliente** | 6 funcionalidades | Parcial (3 de 6) |
| **Base de Datos** | 7 tablas | Parcial (5 de 7) |

---

## 1. FLUJO GENERAL DEL SISTEMA (segun PDF)

1. Registro del cliente (nombre, correo, telefono, contrasena)
2. Seleccion del plan (Basico, Estandar, Premium)
3. Redireccion a Stripe Checkout (pago inicial unico o 3 cuotas + suscripcion mensual)
4. Webhook de Stripe activa cuenta y desbloquea contrato
5. Firma del contrato con DocuSign (Contrato Marco + Anexo segun plan)
6. Integracion RON opcional (boton "Notarizar POA")
7. Panel del cliente con todas las funcionalidades

---

## 2. PLANES Y PRECIOS

### REQUERIDO (PDF):

| Plan | Mensual | Pago Inicial | Fraccionado (3 meses) |
|------|---------|--------------|----------------------|
| **Basico** | $14/mes | $129 | $43 x 3 |
| **Estandar** | $24/mes | $199 | $66.33 x 3 |
| **Premium** | $39/mes | $299 | $99.66 x 3 |

### IMPLEMENTADO:

| Plan | Mensual | Pago Inicial | Fraccionado |
|------|---------|--------------|-------------|
| **Estandar** | $29/mes | NO existe | NO existe |

### PENDIENTE:
- [ ] Crear Plan Basico ($14/mes)
- [ ] Crear Plan Premium ($39/mes)
- [ ] Ajustar precio Estandar a $24/mes
- [ ] Implementar pagos iniciales ($129, $199, $299)
- [ ] Implementar pago fraccionado en 3 cuotas

---

## 3. INTEGRACION STRIPE

### REQUERIDO:
- Stripe Checkout Sessions
- Webhook `payment_intent.succeeded`
- Webhook `checkout.session.completed`
- Webhook `invoice.payment_succeeded`

### IMPLEMENTADO:
- SDK de Stripe integrado en backend
- Metodos basicos (crear customer, crear suscripcion, etc.)

### PENDIENTE:
- [ ] Crear endpoint `/payments/stripe/webhook`
- [ ] Handler para `payment_intent.succeeded`
- [ ] Handler para `checkout.session.completed`
- [ ] Handler para `invoice.payment_succeeded`
- [ ] Logica de activacion automatica de cuenta
- [ ] Asignacion automatica de plan
- [ ] Desbloqueo de contrato correspondiente

---

## 4. INTEGRACION DOCUSIGN

### REQUERIDO:
- Plantilla Contrato Marco
- Anexo A (Basico), B (Estandar), C (Premium)
- API Envelopes/Templates
- Webhook firma completada
- Guardar PDF firmado en panel cliente
- Enviar copia por email

### Variables automaticas:
- Nombre del cliente
- Correo
- Plan seleccionado
- ID del cliente
- Fecha

### IMPLEMENTADO:
- NADA

### PENDIENTE:
- [ ] Crear modulo DocuSign en backend
- [ ] Configurar plantillas en DocuSign Dashboard
- [ ] Implementar envio de envelope tras pago exitoso
- [ ] Webhook para confirmar firma
- [ ] Almacenar PDF firmado
- [ ] Enviar copia por email

---

## 5. RON (NOTARIZACION REMOTA)

### OPCIONES RECOMENDADAS (PDF):
- BlueNotary
- Notarize.com
- DocuSign Notary

### REQUERIDO:
- Boton "Notarizar POA" en panel cliente
- Envio automatizado del PDF del POA
- Retorno del documento notarizado
- Guardado en panel del cliente

### IMPLEMENTADO:
- Estado `NOTARIZED` en POA (solo marcador manual por admin)

### PENDIENTE:
- [ ] Elegir proveedor RON
- [ ] Crear modulo de notarizacion
- [ ] Boton "Notarizar POA" en panel cliente
- [ ] Integracion API del proveedor
- [ ] Webhook de notarizacion completada
- [ ] Almacenamiento automatico

---

## 6. PANEL DEL CLIENTE

### REQUERIDO:
| Funcionalidad | Estado |
|--------------|--------|
| Ver contrato firmado | PARCIAL (ve docs POA, no contrato DocuSign) |
| Ver POA notarizado | PARCIAL (ve estado, no documento real) |
| Subir fotos/numeros de serie de bienes | NO EXISTE |
| Iniciar activacion por deportacion | NO (solo admin puede) |
| Programa Adelanto de Fondos | NO EXISTE |
| Fondo de Emergencia FT | NO EXISTE |

### PENDIENTE:
- [ ] Integracion DocuSign para ver contrato firmado
- [ ] Modulo de bienes declarados (fotos, numeros de serie, comprobantes)
- [ ] Permitir cliente iniciar activacion
- [ ] Modulo Adelanto de Fondos
- [ ] Modulo Fondo de Emergencia

---

## 7. BASE DE DATOS

### REQUERIDO vs IMPLEMENTADO:

| Tabla Requerida | Estado | Tabla Actual |
|-----------------|--------|--------------|
| Clientes | EXISTE | `users` |
| Planes | PARCIAL | Solo enum en `subscription` |
| Pagos (Stripe) | EXISTE | `payments` |
| Contratos firmados | PARCIAL | `poa_documents` (sin firma digital) |
| Documentos notarizados | PARCIAL | Campo en `poas` |
| **Bienes declarados** | NO EXISTE | - |
| **Activaciones de contrato** | PARCIAL | Campo en `poas` |

### PENDIENTE:
- [ ] Crear entidad `Plan` con los 3 planes
- [ ] Crear entidad `DeclaredAsset` (bienes declarados)
- [ ] Crear entidad `ContractActivation` (activaciones)
- [ ] Crear entidad `SignedContract` (contratos DocuSign)
- [ ] Crear entidad `NotarizedDocument` (documentos RON)

---

## 8. LISTA DE TAREAS POR PRIORIDAD

### PRIORIDAD CRITICA (Bloquea flujo principal)

1. **Stripe Webhooks** (1-2 dias)
   - Endpoint `/payments/stripe/webhook`
   - Handlers para los 3 eventos
   - Activacion automatica de cuenta

2. **Sistema de 3 Planes** (1 dia)
   - Entidad Plan en BD
   - Crear productos en Stripe Dashboard
   - Ajustar precios segun PDF

3. **Stripe Checkout Flow** (1-2 dias)
   - Pagina seleccion de planes en frontend
   - Redireccion a Stripe Checkout
   - Paginas success/cancel

### PRIORIDAD ALTA

4. **DocuSign Integration** (3-5 dias)
   - Modulo backend
   - Plantillas en DocuSign
   - Envio automatico tras pago
   - Webhook firma
   - Almacenamiento PDF

5. **Modulo Bienes Declarados** (2-3 dias)
   - Entidad DeclaredAsset
   - CRUD backend
   - UI panel cliente

### PRIORIDAD MEDIA

6. **RON Integration** (3-5 dias)
   - Seleccionar proveedor
   - Modulo backend
   - Boton en panel cliente
   - Webhook notarizacion

7. **Activacion por Cliente** (1-2 dias)
   - Formulario emergencia/deportacion
   - Notificaciones a admins

### PRIORIDAD BAJA

8. **Programa Adelanto de Fondos** (TBD)
   - Definir reglas de negocio primero

9. **Fondo de Emergencia FT** (TBD)
   - Definir reglas de negocio primero

---

## 9. ENTREGABLES SEGUN PDF

| Entregable | Estado |
|------------|--------|
| Sitio web funcional | IMPLEMENTADO |
| Integracion Stripe Checkout + Webhooks | PENDIENTE |
| Integracion DocuSign completa | PENDIENTE |
| Integracion opcional RON | PENDIENTE |
| Panel privado del cliente | PARCIAL |
| Area administrativa | IMPLEMENTADO |
| Alojamiento de PDFs | IMPLEMENTADO (S3) |
| Seguridad y cifrado SSL | PENDIENTE (produccion) |

---

## 10. SUSCRIPCIONES EXTERNAS NECESARIAS

| Servicio | Estado |
|----------|--------|
| Stripe (cuenta gratuita) | CONFIGURAR |
| DocuSign (plan Standard o Business Pro) | CONTRATAR |
| Servicio RON (pago por notarizacion) | ELEGIR Y CONTRATAR |
| Hosting con SSL | CONFIGURAR |
| Dominio propio | CONFIGURAR |

---

**Ultima actualizacion:** 2024-11-24
