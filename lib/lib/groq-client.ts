import Groq from 'groq-sdk';

let groqInstance: Groq | null = null;

function getGroq(): Groq {
  if (!groqInstance) {
    groqInstance = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });
  }
  return groqInstance;
}

export interface RecommendationRequest {
  productId: string;
  productName: string;
  productCategory: string;
  productPrice: number;
  availableProducts: Array<{
    id: string;
    name: string;
    category: string;
    price: number;
  }>;
}

export async function getAIRecommendations(
  request: RecommendationRequest
): Promise<string[]> {
  try {
    const prompt = `
You are an AI recommendation engine for an e-commerce store.

Current Product:
- ID: ${request.productId}
- Name: ${request.productName}
- Category: ${request.productCategory}
- Price: $${request.productPrice}

Available Products:
${request.availableProducts.map(p => `- ${p.id}: ${p.name} (${p.category}) - $${p.price}`).join('\n')}

Task: Recommend 3 products that would be good upsells or cross-sells for the current product.
Consider:
1. Complementary products (accessories, add-ons)
2. Higher-value alternatives (upsells)
3. Related products in same/similar category

Return ONLY product IDs as a JSON array, nothing else.
Example: ["prod_002", "prod_005", "prod_008"]
`;

    const groq = getGroq();
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are a helpful e-commerce recommendation assistant. Always respond with valid JSON arrays of product IDs.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.7,
      max_tokens: 100,
    });

    const response = completion.choices[0]?.message?.content || '[]';
    const productIds = JSON.parse(response.trim());

    return productIds;
  } catch (error) {
    console.error('Groq AI error:', error);
    return [];
  }
}

export default getGroq();
