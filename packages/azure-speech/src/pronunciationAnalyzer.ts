/**
 * AI-powered pronunciation analysis and drill generation
 * Uses GPT-4o to analyze Azure Speech data and suggest targeted practice
 */

interface PhonemeAnalysis {
  phoneme: string;
  word: string;
  accuracy: number;
  position: string; // beginning, middle, end
}

interface DrillSuggestion {
  focus: string;
  explanation: string;
  exercises: string[];
  tips: string[];
}

export async function analyzeProblematicSounds(azureResponse: any): Promise<DrillSuggestion | null> {
  try {
    // Extract problematic phonemes (below 80% accuracy)
    const problematicSounds = extractProblematicPhonemes(azureResponse);
    
    if (problematicSounds.length === 0) {
      return null; // No issues found
    }

    // Generate AI-powered drill suggestions
    const drillSuggestion = await generateDrillSuggestions(problematicSounds, azureResponse);
    
    return drillSuggestion;
    
  } catch (error) {
    console.error('Failed to analyze pronunciation:', error);
    return null;
  }
}

function extractProblematicPhonemes(azureResponse: any): PhonemeAnalysis[] {
  const problematic: PhonemeAnalysis[] = [];
  
  if (!azureResponse.NBest || !azureResponse.NBest[0] || !azureResponse.NBest[0].Words) {
    return problematic;
  }
  
  azureResponse.NBest[0].Words.forEach((word: any) => {
    if (word.Phonemes) {
      word.Phonemes.forEach((phoneme: any, index: number) => {
        if (phoneme.AccuracyScore < 80) { // Threshold for "needs improvement"
          let position = 'middle';
          if (index === 0) position = 'beginning';
          if (index === word.Phonemes.length - 1) position = 'end';
          
          problematic.push({
            phoneme: phoneme.Phoneme,
            word: word.Word,
            accuracy: phoneme.AccuracyScore,
            position
          });
        }
      });
    }
  });
  
  return problematic;
}

async function generateDrillSuggestions(problematicSounds: PhonemeAnalysis[], azureResponse: any): Promise<DrillSuggestion> {
  const originalText = azureResponse.DisplayText || '';
  const language = extractLanguageFromResponse(azureResponse);
  
  // Prepare prompt for GPT-4o
  const prompt = `As a pronunciation coach, analyze these problematic sounds and create a targeted follow-up drill:

**Original phrase**: "${originalText}"
**Language**: ${language}

**Problematic sounds**:
${problematicSounds.map(p => `- /${p.phoneme}/ in "${p.word}" (${p.accuracy}% accuracy, ${p.position} of word)`).join('\n')}

Please provide:
1. **Focus**: What specific sound(s) to work on
2. **Explanation**: Why this sound is challenging and what's likely going wrong
3. **Exercises**: 4-5 specific practice phrases focusing on these problem sounds
4. **Tips**: 2-3 concrete pronunciation tips (tongue/lip position, breath control, etc.)

Keep exercises at similar difficulty level to the original phrase. Make them practical and engaging.

Response format (JSON):
{
  "focus": "brief description",
  "explanation": "why this is challenging",
  "exercises": ["phrase 1", "phrase 2", "phrase 3", "phrase 4"],
  "tips": ["tip 1", "tip 2", "tip 3"]
}`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are an expert pronunciation coach who creates targeted drills based on speech analysis data. Always respond with valid JSON.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 800
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    // Parse JSON response
    const suggestion = JSON.parse(content);
    
    return {
      focus: suggestion.focus || 'Sound practice',
      explanation: suggestion.explanation || 'Focus on problematic sounds',
      exercises: suggestion.exercises || [],
      tips: suggestion.tips || []
    };
    
  } catch (error) {
    console.error('Failed to generate AI drill suggestions:', error);
    
    // Fallback to rule-based suggestions
    return generateFallbackSuggestions(problematicSounds);
  }
}

function extractLanguageFromResponse(azureResponse: any): string {
  // Extract language from response or default to English
  return 'English (US)'; // Could be enhanced to detect from Azure response
}

function generateFallbackSuggestions(problematicSounds: PhonemeAnalysis[]): DrillSuggestion {
  const uniquePhonemes = [...new Set(problematicSounds.map(p => p.phoneme))];
  
  return {
    focus: `Practice ${uniquePhonemes.map(p => `/${p}/`).join(', ')} sounds`,
    explanation: `These sounds scored below 80% accuracy and need focused practice.`,
    exercises: [
      'Try repeating the original phrase slowly',
      'Practice each word individually', 
      'Focus on mouth position for problem sounds',
      'Record and compare with native speaker'
    ],
    tips: [
      'Slow down and emphasize problem sounds',
      'Use a mirror to check mouth position',
      'Practice with exaggerated movements first'
    ]
  };
}

/**
 * Check if we should offer drill suggestions based on the results
 */
export function shouldOfferDrillSuggestions(azureScore: any): boolean {
  if (!azureScore || !azureScore.json) return false;
  
  // Offer drills if overall pronunciation is below 85% or if we have problematic phonemes
  if (azureScore.pronunciation < 85) return true;
  
  const problematic = extractProblematicPhonemes(azureScore.json);
  return problematic.length > 0;
}