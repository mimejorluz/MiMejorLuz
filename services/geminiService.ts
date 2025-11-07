import { GoogleGenAI, Type } from "@google/genai";
import type { InvoiceData, ComparativeAnalysis, HiringGuide, DayPriceAnalysis, Appliance, OptimalUsagePlan, PowerAnalysis } from '../types';
import { fmtNum } from "../utils/formatters";
import { hourES } from "../utils/date";

const model = 'gemini-2.5-flash';

// Helper to create a new AI client instance for each request
const getAIClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

// Schemas for structured data extraction
const invoiceDataSchema = {
    type: Type.OBJECT,
    properties: {
        provider: { type: Type.STRING, description: "Nombre de la comercializadora (e.g., Endesa, Iberdrola)." },
        tariff: { type: Type.STRING, description: "Nombre de la tarifa contratada (e.g., 2.0TD, PVPC)." },
        cups: { type: Type.STRING, description: "Código CUPS (ES seguido de 20-22 caracteres)." },
        billingPeriod: {
            type: Type.OBJECT,
            properties: {
                from: { type: Type.STRING, description: "Fecha de inicio del periodo de facturación (YYYY-MM-DD)." },
                to: { type: Type.STRING, description: "Fecha de fin del periodo de facturación (YYYY-MM-DD)." },
            },
        },
        invoiceNumber: { type: Type.STRING, description: "Número de la factura." },
        servicesAmountEur: { type: Type.NUMBER, description: "Importe de servicios adicionales o 'Otros conceptos'." },
        bonusSocialEur: { type: Type.NUMBER, description: "Descuento del Bono Social." },
        compensationTotalEur: { type: Type.NUMBER, description: "Total de compensación por excedentes solares." },
        virtualBatterySavingEur: { type: Type.NUMBER, description: "Ahorro por batería virtual." },
        contractedPower: {
            type: Type.OBJECT,
            properties: {
                p1: { type: Type.NUMBER, description: "Potencia contratada en periodo Punta (kW)." },
                p2: { type: Type.NUMBER, description: "Potencia contratada en periodo Llano/Valle (kW)." },
            },
        },
        consumptionByPeriodKwh: {
            type: Type.OBJECT,
            properties: {
                p1: { type: Type.NUMBER, description: "Consumo en kWh en periodo Punta." },
                p2: { type: Type.NUMBER, description: "Consumo en kWh en periodo Llano." },
                p3: { type: Type.NUMBER, description: "Consumo en kWh en periodo Valle." },
            },
        },
        energySummary: {
            type: Type.OBJECT,
            properties: {
                amountDueEur: { type: Type.NUMBER, description: "Importe total a pagar de la factura." },
                totalKwh: { type: Type.NUMBER, description: "Consumo total de energía en kWh." },
            },
        },
    },
};

const powerAnalysisSchema = {
    type: Type.OBJECT,
    properties: {
        currentPowerKw: { type: Type.NUMBER, description: "Potencia actual contratada por el usuario en kW." },
        recommendedPowerKw: { type: Type.NUMBER, description: "Potencia óptima recomendada en kW." },
        annualSavingsEur: { type: Type.NUMBER, description: "Ahorro anual estimado en euros al cambiar a la potencia recomendada." },
        analysisSummary: { type: Type.STRING, description: "Breve explicación de por qué se recomienda el cambio." },
    },
};

const comparativeAnalysisSchema = {
    type: Type.OBJECT,
    properties: {
        estimatedAnnualSavingEur: { type: Type.NUMBER, description: "Ahorro anual estimado al cambiar a la mejor tarifa recomendada." },
        bestTariffRecommendation: { type: Type.STRING, description: "Nombre de la mejor tarifa recomendada." },
        bestProviderRecommendation: { type: Type.STRING, description: "Nombre de la comercializadora de la mejor tarifa." },
        averageCostEur: { type: Type.NUMBER, description: "Coste medio mensual del usuario con su tarifa actual." },
        costSimulations: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    tariffName: { type: Type.STRING },
                    providerName: { type: Type.STRING },
                    averageMonthlyCostEur: { type: Type.NUMBER },
                    isGreen: { type: Type.BOOLEAN, description: "¿Es una tarifa de energía 100% renovable?" },
                    hasPermanence: { type: Type.BOOLEAN, description: "¿La tarifa tiene compromiso de permanencia?" },
                    priceType: { type: Type.STRING, description: "Tipo de precio: 'Fijo' o 'Indexado'." },
                },
            },
        },
        powerAnalysis: powerAnalysisSchema,
    },
};


const hiringGuideSchema = {
    type: Type.OBJECT,
    properties: {
        documentChecklist: { type: Type.ARRAY, items: { type: Type.STRING } },
        talkingPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
        watchOutFor: { type: Type.ARRAY, items: { type: Type.STRING } },
        hiringUrl: { type: Type.STRING },
    },
};

const dayPriceAnalysisSchema = {
    type: Type.OBJECT,
    properties: {
        date: { type: Type.STRING, description: "Fecha del análisis en formato YYYY-MM-DD." },
        points: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { time: { type: Type.STRING }, priceEurKWh: { type: Type.NUMBER } } } },
        averagePriceEurKWh: { type: Type.NUMBER },
        bestHour: { type: Type.OBJECT, properties: { time: { type: Type.STRING }, priceEurKWh: { type: Type.NUMBER } } },
        worstHour: { type: Type.OBJECT, properties: { time: { type: Type.STRING }, priceEurKWh: { type: Type.NUMBER } } },
        bestWindow: { type: Type.OBJECT, properties: { startTime: { type: Type.STRING }, endTime: { type: Type.STRING }, averagePriceEurKWh: { type: Type.NUMBER }, explanation: { type: Type.STRING } } },
        co2Analysis: { type: Type.STRING },
        actionableTips: { type: Type.ARRAY, items: { type: Type.STRING } },
    },
};

const optimalUsagePlanSchema = {
    type: Type.OBJECT,
    properties: {
        optimalSchedule: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    appliance: { type: Type.STRING },
                    recommendedTime: { type: Type.STRING }
                }
            }
        },
        estimatedCostEur: { type: Type.NUMBER },
        peakCostComparisonEur: { type: Type.NUMBER },
        savingsPercentage: { type: Type.NUMBER },
        summary: { type: Type.STRING }
    }
};

// Helper function to recursively normalize numeric strings in a JSON object
function normalizeNumbersInObject(obj: any): any {
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }

    if (Array.isArray(obj)) {
        return obj.map(normalizeNumbersInObject);
    }

    return Object.keys(obj).reduce((acc, key) => {
        const value = obj[key];
        if (typeof value === 'string') {
            // Check if it's a number-like string (e.g., "1.234,56" or "1234.56")
            if (/^[\d.,]+$/.test(value) && !isNaN(parseFloat(value.replace(/\./g, '').replace(',', '.')))) {
                acc[key] = parseFloat(value.replace(/\./g, '').replace(',', '.'));
            } else {
                acc[key] = value;
            }
        } else if (typeof value === 'object') {
            acc[key] = normalizeNumbersInObject(value);
        } else {
            acc[key] = value;
        }
        return acc;
    }, {} as any);
}


// Helper function to parse Gemini's JSON response robustly
async function generateAndParseJson<T>(prompt: string, schema: any, fallback: T): Promise<T> {
    const ai = getAIClient();
    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: schema,
            },
        });
        
        let jsonStr = response.text.trim();

        // Strip markdown fences
        if (jsonStr.startsWith('```json')) {
            jsonStr = jsonStr.substring(7, jsonStr.length - 3).trim();
        } else if (jsonStr.startsWith('`')) {
            jsonStr = jsonStr.replace(/^`+|`+$/g, '').trim();
        }
        
        // FIX: Remove trailing commas from arrays and objects before parsing
        jsonStr = jsonStr.replace(/,\s*([}\]])/g, '$1');

        let parsedJson;
        try {
            parsedJson = JSON.parse(jsonStr);
        } catch (e) {
            console.warn("Initial JSON.parse failed, attempting extraction.", { jsonStr, error: e });
            const firstBrace = jsonStr.indexOf('{');
            const firstBracket = jsonStr.indexOf('[');
            const lastBrace = jsonStr.lastIndexOf('}');
            const lastBracket = jsonStr.lastIndexOf(']');
            
            let start = -1;
            let end = -1;

            if (firstBrace !== -1 && lastBrace > firstBrace) {
                start = firstBrace;
                end = lastBrace;
            }
            if (firstBracket !== -1 && lastBracket > firstBracket) {
                // If a JSON array is the root, prefer it
                if (start === -1 || firstBracket < firstBrace) {
                    start = firstBracket;
                    end = lastBracket;
                }
            }
            
            if (start !== -1) {
                jsonStr = jsonStr.substring(start, end + 1);
                parsedJson = JSON.parse(jsonStr); // This might throw again, will be caught by outer catch
            } else {
                throw new Error("Could not find a valid JSON object or array in the string.");
            }
        }

        // Normalize numbers before returning
        return normalizeNumbersInObject(parsedJson) as T;

    } catch (e) {
        console.error("Critical error in generateAndParseJson, returning fallback object:", e);
        return fallback;
    }
}


// Local helper for robust number conversion
function normalizeNumericField(value: any, defaultValue: number = 0): number {
    if (typeof value === 'number' && !isNaN(value)) {
        return value;
    }
    if (typeof value === 'string') {
        const num = parseFloat(value.replace(',', '.'));
        return isNaN(num) ? defaultValue : num;
    }
    return defaultValue;
}


// Exported Service Functions

export async function parseInvoiceWithAI(text: string): Promise<Omit<InvoiceData, 'id' | 'rawText'>> {
    const prompt = `Extrae la siguiente información del texto de esta factura de electricidad. El texto está en español. Asegúrate de que las fechas estén en formato YYYY-MM-DD. Si un campo no está presente, omítelo. Texto de la factura:\n\n${text}`;
    return generateAndParseJson<Omit<InvoiceData, 'id' | 'rawText'>>(prompt, invoiceDataSchema, {
        billingPeriod: {},
        contractedPower: {},
        consumptionByPeriodKwh: {},
        energySummary: {},
    });
}

export async function fetchComparativeAnalysisWithAI(invoices: InvoiceData[]): Promise<ComparativeAnalysis> {
    const prompt = `Basado en los datos de estas facturas de un usuario en España, realiza un análisis integral y devuelve un JSON ESTRICTO, sin texto adicional.

1.  **Análisis Comparativo de Tarifas:** Recomienda la mejor tarifa y proporciona una simulación de costes con 2-3 tarifas alternativas. Para cada simulación, incluye si es energía 100% verde (isGreen), si tiene permanencia (hasPermanence) y el tipo de precio ('Fijo' o 'Indexado').
2.  **Análisis de Potencia Contratada:** Analiza la potencia contratada del usuario. Si consideras que está sobredimensionada, proporciona una recomendación para bajarla, estimando el ahorro anual. Si la potencia es correcta, puedes omitir este bloque.

Los datos de las facturas son: \n\n${JSON.stringify(invoices, null, 2)}`;
    
    const fallback: ComparativeAnalysis = {
        estimatedAnnualSavingEur: 0,
        bestTariffRecommendation: 'Indefinida',
        bestProviderRecommendation: '—',
        averageCostEur: 0,
        costSimulations: []
    };

    return generateAndParseJson<ComparativeAnalysis>(prompt, comparativeAnalysisSchema, fallback);
}

export async function fetchContextualExplanation(topic: string): Promise<string> {
    const ai = getAIClient();
    const prompt = `Explica de forma muy breve y directa el siguiente concepto del mercado eléctrico español, en un máximo de 3 frases. El objetivo es dar una definición rápida, como una ayuda contextual (tooltip). Sé claro, ve al grano, y usa Markdown (**negrita**) para resaltar los términos más importantes. El concepto es: "${topic}".`;
    const response = await ai.models.generateContent({
        model: model,
        contents: prompt,
    });
    return response.text;
}

export async function fetchHiringGuide(tariff: string, provider: string, cups: string): Promise<HiringGuide> {
    const prompt = `Genera una guía de contratación para un usuario en España que quiere cambiarse a la tarifa "${tariff}" con la comercializadora "${provider}". Su CUPS es ${cups}. La guía debe incluir una checklist de documentos, puntos clave para una llamada telefónica, aspectos a vigilar en el contrato y, si es posible, un enlace directo o genérico a la página de contratación de la comercializadora.`;
    return generateAndParseJson<HiringGuide>(prompt, hiringGuideSchema, {
        documentChecklist: [], talkingPoints: [], watchOutFor: []
    });
}

export async function fetchConsumptionTrendAnalysis(invoices: InvoiceData[]): Promise<string> {
    const ai = getAIClient();
    const prompt = `Analiza la evolución del consumo y coste de este usuario basándote en sus facturas. Proporciona un breve texto (2-3 frases) con una conclusión o insight clave. Por ejemplo, si el consumo está subiendo, bajando o si el coste por kWh está mejorando. Datos de facturas:\n\n${JSON.stringify(invoices, null, 2)}`;
    const response = await ai.models.generateContent({
        model: model,
        contents: prompt,
    });
    return response.text;
}

export async function fetchDayPriceAnalysisWithAI(date: string): Promise<DayPriceAnalysis> {
    // The model will use its internal knowledge to generate a plausible analysis for the given date.
    const prompt = `Actúa como un analista de datos experto en el mercado energético español, especializado en optimizar el consumo para usuarios residenciales. Tu objetivo es proporcionar un análisis horario detallado de los precios de la electricidad (PVPC) para una fecha específica y traducirlo en consejos claros y accionables para el ahorro.

**TAREA PRINCIPAL:**
Para la fecha solicitada (${date}), genera un análisis completo de los precios horarios del PVPC en España.

**INSTRUCCIONES ESTRICTAS DE SALIDA:**
1.  **FORMATO OBLIGATORIO:** Tu única salida debe ser un objeto JSON VÁLIDO que se adhiera estrictamente al schema que se te ha proporcionado.
2.  **SIN TEXTO ADICIONAL:** No incluyas NINGÚN texto, explicación, ni preámbulos fuera del propio objeto JSON. La respuesta debe ser el JSON puro.

**DETALLES PARA CADA CAMPO DEL JSON:**
-   **points**: Genera un array con 24 objetos (00:00 a 23:00). Cada objeto debe tener la hora en formato ISO 8601 y el precio en €/kWh con al menos 5 decimales para máxima precisión.
-   **bestHour / worstHour**: Identifica con precisión la hora exacta con el precio más bajo y más alto del día.
-   **bestWindow**: Calcula la 'mejor ventana de ahorro': el bloque de **dos horas consecutivas** cuyo precio medio sea el más bajo. En la explicación, menciona que es ideal para tareas de alto consumo.
-   **co2Analysis**: Redacta un 'Análisis de Sostenibilidad'. Explica la relación entre precios bajos y energía renovable. Ejemplo: "Las horas más baratas (xx:00-yy:00) suelen coincidir con alta producción de energía renovable (solar/eólica). Usar electricidad en esos momentos es más económico y ecológico."
-   **actionableTips**: Proporciona **tres consejos prácticos y específicos** para el día, con tono amigable. Vincula los consejos a las horas clave. Ejemplos:
    -   "**Programa tus electrodomésticos:** El mejor momento hoy es entre las [hora de inicio de bestWindow] y [hora de fin]. ¡Aprovecha el precio mínimo para lavadoras o lavavajillas!"
    -   "**Carga de vehículo eléctrico:** Si tienes, enchúfalo a partir de las [hora de bestHour]. ¡Es el punto de máximo ahorro del día!"
    -   "**Evita las horas punta:** El precio se dispara a las [hora de worstHour]. Intenta no usar aparatos de gran consumo como el horno en ese momento para no llevarte sorpresas."`;
    return generateAndParseJson<DayPriceAnalysis>(prompt, dayPriceAnalysisSchema, {
        date, points: [], averagePriceEurKWh: 0, bestHour: {time: '', priceEurKWh: 0}, worstHour: {time: '', priceEurKWh: 0}, bestWindow: {startTime: '', endTime: '', averagePriceEurKWh: 0, explanation: ''}, co2Analysis: '', actionableTips: []
    });
}

export async function fetchOptimalUsagePlan(appliances: Appliance[], prices: DayPriceAnalysis['points']): Promise<OptimalUsagePlan> {
    const prompt = `
Eres un asesor de eficiencia energética. Un usuario quiere saber cuál es el mejor momento para usar una serie de electrodomésticos hoy para minimizar su coste.

**Datos de Entrada:**
1.  **Electrodomésticos seleccionados:** ${appliances.join(', ')}
2.  **Precios de la electricidad (€/kWh) para hoy:** ${JSON.stringify(prices)}

**Tu Tarea:**
Crea un plan de consumo óptimo. Considera duraciones y consumos típicos para cada electrodoméstico (ej: Lavadora 2h, Horno 1h, Coche eléctrico 4-6h). No puedes programar usos que se solapen en el tiempo.

**INSTRUCCIONES ESTRICTAS DE SALIDA:**
1.  **FORMATO OBLIGATORIO:** Tu única salida debe ser un objeto JSON VÁLIDO y NADA MÁS. No incluyas texto, explicaciones, ni \`\`\`json markdown. La respuesta debe ser el JSON puro.
2.  **ESTRUCTURA DEL JSON:** El JSON debe seguir exactamente esta estructura:
    {
      "optimalSchedule": [
        { "appliance": "string", "recommendedTime": "string (HH:00)" }
      ],
      "estimatedCostEur": number,
      "peakCostComparisonEur": number,
      "savingsPercentage": number,
      "summary": "string"
    }
3.  **TIPOS DE DATOS:** Los campos \`estimatedCostEur\`, \`peakCostComparisonEur\`, y \`savingsPercentage\` deben ser de tipo numérico (number), no strings.

**EJEMPLO DE SALIDA VÁLIDA:**
{
  "optimalSchedule": [
    { "appliance": "Lavadora", "recommendedTime": "04:00" },
    { "appliance": "Coche eléctrico", "recommendedTime": "02:00" }
  ],
  "estimatedCostEur": 0.85,
  "peakCostComparisonEur": 2.30,
  "savingsPercentage": 63,
  "summary": "Usando tus electrodomésticos en las horas más baratas, el coste se reduce significativamente."
}`;

    const fallback: OptimalUsagePlan = {
        optimalSchedule: [],
        estimatedCostEur: 0.0,
        peakCostComparisonEur: 0.0,
        savingsPercentage: 0,
        summary: "No se pudo generar el plan de ahorro en este momento. Por favor, inténtalo de nuevo más tarde."
    };

    try {
        const rawPlan = await generateAndParseJson<any>(prompt, optimalUsagePlanSchema, fallback);

        const sanitizedPlan: OptimalUsagePlan = {
            optimalSchedule: Array.isArray(rawPlan.optimalSchedule) ? rawPlan.optimalSchedule : [],
            summary: typeof rawPlan.summary === 'string' ? rawPlan.summary : "Aquí tienes tu plan de ahorro personalizado.",
            estimatedCostEur: normalizeNumericField(rawPlan.estimatedCostEur, 0.0),
            peakCostComparisonEur: normalizeNumericField(rawPlan.peakCostComparisonEur, 0.0),
            savingsPercentage: normalizeNumericField(rawPlan.savingsPercentage, 0),
        };

        if (sanitizedPlan.optimalSchedule.length > 0 && sanitizedPlan.estimatedCostEur === 0 && sanitizedPlan.peakCostComparisonEur === 0) {
            sanitizedPlan.summary = "No se pudo calcular el coste exacto, pero sí las mejores horas para tu consumo.";
        }
        
        return sanitizedPlan;

    } catch (error) {
        console.error("Critical error in fetchOptimalUsagePlan, returning fallback object:", error);
        return fallback;
    }
}

export async function fetchSimulatorExplanation(plan: OptimalUsagePlan): Promise<string> {
    const ai = getAIClient();
    const prompt = `
Un usuario ha recibido el siguiente plan de ahorro del simulador de consumo para hoy.

**Datos del Plan:**
- **Electrodomésticos y horas óptimas:** ${plan.optimalSchedule.map(s => `${s.appliance} a las ${s.recommendedTime}`).join(', ')}
- **Coste estimado en horas óptimas:** ${plan.estimatedCostEur.toFixed(2)} €
- **Coste si se usaran en horas caras:** ${plan.peakCostComparisonEur.toFixed(2)} €
- **Ahorro porcentual:** ${plan.savingsPercentage}%

**Tu Tarea:**
Explica de forma muy breve y amigable (máximo 3-4 frases) de dónde salen esas cifras.
- Menciona que el coste estimado es por usar los aparatos en las horas más baratas del día.
- Explica que el coste "en horas caras" es una simulación de lo que costaría usar esos mismos aparatos en los momentos de precio más alto.
- El objetivo es que el usuario entienda el valor de planificar su consumo.
- Utiliza **negrita** para los importes y conceptos clave.
`;
    const response = await ai.models.generateContent({
        model: model,
        contents: prompt,
    });
    return response.text;
}

export async function fetchAITips(priceData: DayPriceAnalysis): Promise<string> {
    const ai = getAIClient();
    const prompt = `
Actúa como un experto en eficiencia energética en España. Genera 3 consejos prácticos y accionables para hoy, basándote en los datos de precios de la luz (PVPC) que te proporciono. Los consejos deben ser específicos para el día de hoy.

**Datos de precios para hoy (${priceData.date}):**
- **Hora más barata:** ${hourES(priceData.bestHour.time)} (${fmtNum(priceData.bestHour.priceEurKWh, '€/kWh', 5)})
- **Hora más cara:** ${hourES(priceData.worstHour.time)} (${fmtNum(priceData.worstHour.priceEurKWh, '€/kWh', 5)})
- **Mejor ventana de 2h:** de ${hourES(priceData.bestWindow.startTime)} a ${hourES(priceData.bestWindow.endTime)}
- **Precio medio del día:** ${fmtNum(priceData.averagePriceEurKWh, '€/kWh', 5)}

**Instrucciones:**
- Escribe 3 consejos claros y directos.
- Utiliza los datos de precios para que los consejos sean concretos (ej: "Aprovecha las ${hourES(priceData.bestHour.time)} para...").
- Formatea la respuesta en Markdown, usando ### para el título de cada consejo y **negrita** para resaltar.
- No añadas introducciones ni conclusiones, solo los 3 consejos.
`;
    
    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error("Error fetching AI tips:", error);
        throw new Error("No se pudieron generar los consejos desde la IA.");
    }
}

export async function fetchGenericAITips(): Promise<string> {
    const ai = getAIClient();
    const prompt = `Actúa como un experto en eficiencia energética en España. Genera una lista de 2 consejos prácticos y poco comunes para que un usuario residencial ahorre en su factura de la luz. Estructura la respuesta con un título corto y una breve explicación para cada consejo. Usa Markdown para formatear (### para títulos, - para listas, ** para negrita). No repitas consejos sobre programar lavadoras o evitar horas punta. Sé más original.`;
    
    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error("Error fetching generic AI tips:", error);
        throw new Error("No se pudieron generar más consejos en este momento.");
    }
}