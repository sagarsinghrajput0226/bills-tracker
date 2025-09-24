interface AzureOpenAIResponse {
  title: string;
  amount: string;
  description: string;
  category: string;
}

export class AzureOpenAIService {
  private endpoint: string;
  private apiKey: string;
  private deploymentName: string;

  constructor() {
    this.endpoint = import.meta.env.VITE_AZURE_OPENAI_ENDPOINT || '';
    this.apiKey = import.meta.env.VITE_AZURE_OPENAI_API_KEY || '';
    this.deploymentName = import.meta.env.VITE_AZURE_OPENAI_DEPLOYMENT_NAME || '';
  }

  private isConfigured(): boolean {
    return !!(this.endpoint && this.apiKey && this.deploymentName) &&
           this.endpoint !== 'YOUR_API_KEY' &&
           this.apiKey !== 'YOUR_API_KEY' &&
           this.deploymentName !== 'YOUR_API_KEY';
  }

  async extractBillDetails(imageFile: File): Promise<AzureOpenAIResponse> {
    if (!this.isConfigured()) {
      throw new Error('Azure OpenAI credentials not configured');
    }

    try {
      // Convert image to base64
      const base64Image = await this.fileToBase64(imageFile);
      
      const prompt = `Analyze this bill/receipt image and extract the following information in JSON format:
      {
        "title": "Brief title of the expense (e.g., restaurant name, store name, service type)",
        "amount": "Total amount as a number (extract only the final total, no currency symbols)",
        "description": "Brief description of items purchased or services",
        "category": "Choose from: Food & Dining, Transportation, Shopping, Entertainment, Bills & Utilities, Healthcare, Travel, Education, Business, Other"
      }
      
      Please analyze the image carefully and provide accurate extraction. If you cannot read certain details clearly, use reasonable defaults based on what you can see.`;

      const response = await fetch(`${this.endpoint}/openai/deployments/${this.deploymentName}/chat/completions?api-version=2024-02-15-preview`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': this.apiKey
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: prompt
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: `data:image/jpeg;base64,${base64Image}`
                  }
                }
              ]
            }
          ],
          max_tokens: 500,
          temperature: 0.1
        })
      });

      if (!response.ok) {
        throw new Error(`Azure OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;
      
      if (!content) {
        throw new Error('No content received from Azure OpenAI');
      }

      // Extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Could not parse JSON from Azure OpenAI response');
      }

      const extractedData = JSON.parse(jsonMatch[0]);
      
      return {
        title: extractedData.title || 'Expense',
        amount: extractedData.amount?.toString() || '0',
        description: extractedData.description || '',
        category: extractedData.category || 'Other'
      };

    } catch (error) {
      console.error('Azure OpenAI extraction failed:', error);
      throw error;
    }
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

export const azureOpenAIService = new AzureOpenAIService();
