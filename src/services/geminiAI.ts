interface GeminiAIResponse {
  title: string;
  amount: string;
  description: string;
  category: string;
}

export class GeminiAIService {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
    this.baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';
  }

  private isConfigured(): boolean {
    return !!(this.apiKey && this.apiKey !== 'YOUR_API_KEY');
  }

  async extractBillDetails(imageFile: File): Promise<GeminiAIResponse> {
    if (!this.isConfigured()) {
      throw new Error('Gemini API key not configured');
    }

    try {
      // Convert image to base64
      const base64Image = await this.fileToBase64(imageFile);
      
      const prompt = `Analyze this bill/receipt image and extract the following information. Respond with ONLY a valid JSON object in this exact format:
{
  "title": "Brief title of the expense (e.g., restaurant name, store name, service type)",
  "amount": "Total amount as a number without currency symbols (extract only the final total)",
  "description": "Brief description of items purchased or services rendered",
  "category": "Choose exactly one from: Food & Dining, Transportation, Shopping, Entertainment, Bills & Utilities, Healthcare, Travel, Education, Business, Other"
}

Important: 
- Return ONLY the JSON object, no additional text
- For amount, extract only numbers (e.g., "125.50" not "₹125.50")
- Choose the most appropriate category from the list provided
- If you cannot read certain details clearly, use reasonable defaults based on what you can see`;

      const requestBody = {
        contents: [{
          parts: [
            {
              text: prompt
            },
            {
              inline_data: {
                mime_type: imageFile.type,
                data: base64Image
              }
            }
          ]
        }],
        generationConfig: {
          temperature: 0.1,
          topK: 1,
          topP: 1,
          maxOutputTokens: 500,
        }
      };

      const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Gemini API error: ${response.status} - ${errorData}`);
      }

      const data = await response.json();
      
      if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
        throw new Error('No content received from Gemini API');
      }

      const content = data.candidates[0].content.parts[0].text;
      
      if (!content) {
        throw new Error('Empty response from Gemini API');
      }

      // Clean the response and extract JSON
      let cleanedContent = content.trim();
      
      // Remove any markdown code blocks if present
      cleanedContent = cleanedContent.replace(/```json\s*|\s*```/g, '');
      cleanedContent = cleanedContent.replace(/```\s*|\s*```/g, '');
      
      // Find JSON object in the response
      const jsonMatch = cleanedContent.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Could not parse JSON from Gemini response');
      }

      const extractedData = JSON.parse(jsonMatch[0]);
      
      // Validate and sanitize the extracted data
      return {
        title: extractedData.title || 'Expense',
        amount: extractedData.amount?.toString().replace(/[^\d.-]/g, '') || '0',
        description: extractedData.description || '',
        category: this.validateCategory(extractedData.category) || 'Other'
      };

    } catch (error) {
      console.error('Gemini AI extraction failed:', error);
      throw error;
    }
  }

  private validateCategory(category: string): string {
    const validCategories = [
      'Food & Dining',
      'Transportation', 
      'Shopping',
      'Entertainment',
      'Bills & Utilities',
      'Healthcare',
      'Travel',
      'Education',
      'Business',
      'Other'
    ];
    
    return validCategories.includes(category) ? category : 'Other';
  }

  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64 = reader.result as string;
        const base64Data = base64.split(',')[1];
        resolve(base64Data);
      };
      reader.onerror = (error) => reject(error);
    });
  }
}

export const geminiAIService = new GeminiAIService();
