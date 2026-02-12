// src/services/cyberbullyingService.js
const API_URL = 'http://localhost:5000/api/detect';

export const detectCyberbullying = async (text) => {
  if (!text || text.trim().length < 3) {
    return {
      isToxic: false,
      score: 0,
      categories: [],
      warning: '',
      error: 'Text too short'
    };
  }

  try {
    console.log('🔍 Sending to API:', text.substring(0, 50) + '...');
    
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text: text.trim() })
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const result = await response.json();
    
    console.log('✅ API Response:', result);
    
    return {
      isToxic: result.isCyberbullying || false,
      score: result.score || 0,
      categories: result.categories || [],
      warning: result.warning || '',
      toxicWords: result.details?.toxicWords || [],
      textLength: result.details?.textLength || text.length,
      rawResult: result,
      success: true,
      model: 'Cyberbullying Detection API v1'
    };
    
  } catch (error) {
    console.error('❌ API Error:', error);
    
    // Fallback detection
    return fallbackDetection(text);
  }
};

// Fallback detection if API fails
const fallbackDetection = (text) => {
  const toxicWords = ['hate', 'stupid', 'idiot', 'kill', 'die', 'worthless', 'ugly'];
  const textLower = text.toLowerCase();
  
  let score = 0;
  const detectedWords = [];
  
  toxicWords.forEach(word => {
    if (textLower.includes(word)) {
      score += 0.3;
      detectedWords.push(word);
    }
  });
  
  const finalScore = Math.min(score, 1);
  const isToxic = finalScore > 0.5;
  
  return {
    isToxic,
    score: finalScore,
    categories: isToxic ? ['toxic'] : [],
    warning: isToxic ? `⚠️ Potential harmful content detected` : '',
    toxicWords: detectedWords,
    isFallback: true,
    success: true
  };
};

export const batchDetectCyberbullying = async (texts) => {
  try {
    const response = await fetch('http://localhost:5000/api/batch-detect', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ texts })
    });
    
    if (!response.ok) throw new Error('Batch detection failed');
    return await response.json();
  } catch (error) {
    console.error('Batch detection error:', error);
    return { results: texts.map(t => fallbackDetection(t)) };
  }
};

export default {
  detectCyberbullying,
  batchDetectCyberbullying
};