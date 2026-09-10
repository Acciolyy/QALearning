from typing import Dict, Any, Set

def get_deinstrumented_effective_source(topic_code: str, active_codes: Set[str]) -> Dict[str, Any]:
    """
    Retorna o código-fonte sob teste para a Trilha 06 (Caixa Branca).
    Garante que o código seja puramente algorítmico, compilado para o runtime
    da semente atual SEM conter nenhum identificador de bug ('WHT-...'),
    sem comentários de spoiler e sem condições artificiais como 'if (isBugActive)'.
    """
    if topic_code == "QA-WHT-011":
        # Cobertura de Branches em Regras de Desconto e Cupons
        has_defect = "WHT-BRN-001" in active_codes
        expired_block = (
            "    // Verificação de validade temporal do cupom\n"
            "    if (coupon.expired) {\n"
            "      return { valid: true, discountAmount: 0, status: 'APPLIED' };\n"
            "    }"
        ) if has_defect else (
            "    // Verificação de validade temporal do cupom\n"
            "    if (coupon.expired) {\n"
            "      return { valid: false, discountAmount: 0, status: 'EXPIRED' };\n"
            "    }"
        )

        code = f"""/**
 * PricingRulesEngine.js
 * Módulo de Regras de Negócio de Precificação e Descontos
 * @package VaultCommerce.Core
 */

function calculateDiscount(couponCode, subtotal) {{
  if (!couponCode || typeof couponCode !== 'string') {{
    return {{ valid: false, discountAmount: 0, status: 'EMPTY_CODE' }};
  }}

  const normalized = couponCode.trim().toUpperCase();
  const registeredCoupons = {{
    'VAULT10': {{ percentage: 0.10, minSubtotal: 100, expired: true }},
    'BLACKFRIDAY': {{ percentage: 0.25, minSubtotal: 300, expired: false }},
    'WELCOME': {{ percentage: 0.05, minSubtotal: 50, expired: false }}
  }};

  const coupon = registeredCoupons[normalized];
  if (!coupon) {{
    return {{ valid: false, discountAmount: 0, status: 'INVALID_COUPON' }};
  }}

{expired_block}

  if (subtotal < coupon.minSubtotal) {{
    return {{ valid: false, discountAmount: 0, status: 'BELOW_MINIMUM' }};
  }}

  const discount = subtotal * coupon.percentage;
  return {{ valid: true, discountAmount: discount, status: 'APPLIED' }};
}}

module.exports = {{ calculateDiscount }};
"""
        return {
            "file_name": "PricingRulesEngine.js",
            "function_name": "calculateDiscount",
            "language": "javascript",
            "code": code,
            "cyclomatic_complexity": 5,
            "decision_points": [10, 19, 23, 27],
            "total_branches": 6,
            "target_criterion": "Cobertura de Decisão / Ramo (Branch Coverage)"
        }

    elif topic_code == "QA-WHT-012":
        # Caminhos Independentes em Validação de Documentos
        has_defect = "WHT-PTH-001" in active_codes
        repeat_check = (
            "  // Validação de dígitos idênticos repetidos\n"
            "  let allSame = true;\n"
            "  for (let i = 1; i < 2; i++) {\n"
            "    if (clean[i] !== clean[0]) allSame = false;\n"
            "  }\n"
            "  if (allSame) return false;"
        ) if has_defect else (
            "  // Validação de dígitos idênticos repetidos\n"
            "  let allSame = true;\n"
            "  for (let i = 1; i < clean.length; i++) {\n"
            "    if (clean[i] !== clean[0]) allSame = false;\n"
            "  }\n"
            "  if (allSame) return false;"
        )

        code = f"""/**
 * DocumentValidator.js
 * Módulo de Validação Algorítmica de Documentos Cadastrais
 * @package VaultCommerce.Security
 */

function validateTaxId(taxId) {{
  if (!taxId || typeof taxId !== 'string') {{
    return {{ valid: false, reason: 'EMPTY_INPUT' }};
  }}

  // Higienização inicial de pontuação
  const clean = taxId.replace(/\\D/g, '');
  if (clean.length !== 11) {{
    return {{ valid: false, reason: 'INVALID_LENGTH' }};
  }}

{repeat_check}

  // Cálculo do primeiro dígito verificador
  let sum1 = 0;
  for (let i = 0; i < 9; i++) {{
    sum1 += parseInt(clean.charAt(i), 10) * (10 - i);
  }}
  let rev1 = 11 - (sum1 % 11);
  if (rev1 === 10 || rev1 === 11) rev1 = 0;
  if (rev1 !== parseInt(clean.charAt(9), 10)) {{
    return {{ valid: false, reason: 'CHECK_DIGIT_1_FAILED' }};
  }}

  // Cálculo do segundo dígito verificador
  let sum2 = 0;
  for (let i = 0; i < 10; i++) {{
    sum2 += parseInt(clean.charAt(i), 10) * (11 - i);
  }}
  let rev2 = 11 - (sum2 % 11);
  if (rev2 === 10 || rev2 === 11) rev2 = 0;
  if (rev2 !== parseInt(clean.charAt(10), 10)) {{
    return {{ valid: false, reason: 'CHECK_DIGIT_2_FAILED' }};
  }}

  return {{ valid: true, reason: 'DOCUMENT_VERIFIED' }};
}}

module.exports = {{ validateTaxId }};
"""
        return {
            "file_name": "DocumentValidator.js",
            "function_name": "validateTaxId",
            "language": "javascript",
            "code": code,
            "cyclomatic_complexity": 8,
            "decision_points": [9, 15, 20, 27, 34],
            "total_branches": 8,
            "target_criterion": "Caminhos Básicos Independentes (Grafo de Fluxo de Controle)"
        }

    elif topic_code == "QA-WHT-021":
        # Complexidade Ciclomática e Critério MC/DC em Fretes
        has_defect = "WHT-CYC-001" in active_codes
        predicate = (
            "  // Predicado composto com regra promocional\n"
            "  if (method === 'sedex' && (subtotal >= 300 || paymentMethod === 'pix')) {\n"
            "    return { rate: 0.00, waived: true, label: 'SEDEX_FREE_PROMO' };\n"
            "  }"
        ) if has_defect else (
            "  // Predicado composto com regra promocional\n"
            "  if (method === 'sedex' && subtotal >= 300 && paymentMethod === 'pix') {\n"
            "    return { rate: 0.00, waived: true, label: 'SEDEX_FREE_PROMO' };\n"
            "  }"
        )

        code = f"""/**
 * LogisticsEngine.js
 * Módulo de Cálculo de Tarifas de Envio e Isenções Promocionais
 * @package VaultCommerce.Logistics
 */

function calculateShippingRate(method, subtotal, paymentMethod) {{
  if (!method || subtotal <= 0) {{
    return {{ rate: 0.00, waived: false, label: 'INVALID_INPUT' }};
  }}

  const rates = {{
    'sedex': 35.00,
    'pac': 15.00,
    'express': 50.00
  }};

  const baseRate = rates[method.toLowerCase()];
  if (baseRate === undefined) {{
    return {{ rate: 0.00, waived: false, label: 'UNKNOWN_METHOD' }};
  }}

{predicate}

  return {{ rate: baseRate, waived: false, label: 'STANDARD_RATE' }};
}}

module.exports = {{ calculateShippingRate }};
"""
        return {
            "file_name": "LogisticsEngine.js",
            "function_name": "calculateShippingRate",
            "language": "javascript",
            "code": code,
            "cyclomatic_complexity": 5,
            "decision_points": [9, 17, 21],
            "total_branches": 5,
            "target_criterion": "Cobertura MC/DC (Modified Condition/Decision Coverage)"
        }

    elif topic_code == "QA-WHT-022":
        # Código Morto e Retornos Prematuros
        has_defect = "WHT-DED-001" in active_codes
        flow_block = (
            "  const validationResult = validateOrderPayload(orderData);\n"
            "  if (validationResult.valid) {\n"
            "    return { success: true, orderId: orderData.id }; // RETORNO PREMATURO QUE CAUSA CÓDIGO MORTO\n"
            "  }\n\n"
            "  // Rotina mandatória de auditoria de segurança pré-checkout\n"
            "  SecurityAuditLog.recordEvent('ORDER_VERIFIED', orderData.id);\n"
            "  return { success: true, orderId: orderData.id };"
        ) if has_defect else (
            "  const validationResult = validateOrderPayload(orderData);\n"
            "  if (!validationResult.valid) {\n"
            "    return { success: false, reason: validationResult.reason };\n"
            "  }\n\n"
            "  // Rotina mandatória de auditoria de segurança pré-checkout\n"
            "  SecurityAuditLog.recordEvent('ORDER_VERIFIED', orderData.id);\n"
            "  return { success: true, orderId: orderData.id };"
        )

        code = f"""/**
 * CheckoutOrchestrator.js
 * Orquestrador do Ciclo de Vida da Ordem de Pagamento
 * @package VaultCommerce.Checkout
 */

function processCheckoutSubmission(orderData) {{
  if (!orderData || !orderData.id) {{
    return {{ success: false, reason: 'PAYLOAD_NULL' }};
  }}

{flow_block}
}}

module.exports = {{ processCheckoutSubmission }};
"""
        return {
            "file_name": "CheckoutOrchestrator.js",
            "function_name": "processCheckoutSubmission",
            "language": "javascript",
            "code": code,
            "cyclomatic_complexity": 4,
            "decision_points": [9, 13],
            "total_branches": 4,
            "target_criterion": "Isolamento de Código Morto e Retornos Prematuros"
        }

    elif topic_code == "QA-WHT-031":
        # Teste de Mutação em Faturamento
        has_defect = "WHT-MUT-001" in active_codes
        tax_formula = (
            "  // Fórmula de alíquota tributária estadual\n"
            "  const taxAmount = (taxableSubtotal / 0.17);"
        ) if has_defect else (
            "  // Fórmula de alíquota tributária estadual\n"
            "  const taxAmount = (taxableSubtotal * 0.17);"
        )

        code = f"""/**
 * BillingCalculator.js
 * Cálculo de Tributos e Totalização Financeira de Pedidos
 * @package VaultCommerce.Billing
 */

function calculateOrderTaxesAndTotals(cartItems, shippingRate, discountRate) {{
  let subtotal = 0;
  for (const item of cartItems) {{
    if (item.price && item.qty) {{
      subtotal += item.price * item.qty;
    }}
  }}

  const discountVal = subtotal * (discountRate || 0);
  const taxableSubtotal = Math.max(0, subtotal - discountVal);

{tax_formula}

  const grandTotal = taxableSubtotal + shippingRate + taxAmount;
  return {{
    subtotal: subtotal.toFixed(2),
    discount: discountVal.toFixed(2),
    taxes: taxAmount.toFixed(2),
    total: grandTotal.toFixed(2)
  }};
}}

module.exports = {{ calculateOrderTaxesAndTotals }};
"""
        return {
            "file_name": "BillingCalculator.js",
            "function_name": "calculateOrderTaxesAndTotals",
            "language": "javascript",
            "code": code,
            "cyclomatic_complexity": 4,
            "decision_points": [11, 12, 17],
            "total_branches": 4,
            "target_criterion": "Eliminação de Mutantes Algorítmicos (Mutation Testing)"
        }

    else: # QA-WHT-032 ou default
        # Auditoria Autônoma de Caixa Branca
        has_defect = "WHT-AUT-001" in active_codes
        catch_block = (
            "  } catch (error) {\n"
            "    // Tratamento incorreto: silencia falha de conexão\n"
            "    return { status: 'AUTHORIZED', transactionRef: 'FALLBACK_TOKEN' };\n"
            "  }"
        ) if has_defect else (
            "  } catch (error) {\n"
            "    return { status: 'GATEWAY_ERROR', transactionRef: null, message: error.message };\n"
            "  }"
        )

        code = f"""/**
 * GatewayIntegration.js
 * Camada de Autorização Criptográfica com o Provedor de Pagamento
 * @package VaultCommerce.Gateway
 */

async function authorizePaymentGateway(paymentPayload) {{
  if (!paymentPayload || !paymentPayload.amount || paymentPayload.amount <= 0) {{
    return {{ status: 'REJECTED_INVALID_AMOUNT', transactionRef: null }};
  }}

  try {{
    const response = await dispatchToAcquirer(paymentPayload);
    if (!response || response.statusCode !== 200) {{
      return {{ status: 'TRANSACTION_DECLINED', transactionRef: null }};
    }}
    return {{ status: 'AUTHORIZED', transactionRef: response.authCode }};
{catch_block}
}}

module.exports = {{ authorizePaymentGateway }};
"""
        return {
            "file_name": "GatewayIntegration.js",
            "function_name": "authorizePaymentGateway",
            "language": "javascript",
            "code": code,
            "cyclomatic_complexity": 5,
            "decision_points": [9, 14, 15],
            "total_branches": 5,
            "target_criterion": "Auditoria Estrutural Autônoma Pré-Merge"
        }
