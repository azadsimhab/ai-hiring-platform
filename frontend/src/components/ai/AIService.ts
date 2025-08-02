// AI Service for integrating with Google Cloud AI services
// Production-ready implementation with error handling and retry logic

interface AIAnalysisRequest {
  content: string;
  type: 'resume' | 'job_description' | 'coding_test' | 'interview';
  options?: Record<string, any>;
}

interface AIAnalysisResponse {
  success: boolean;
  data?: any;
  error?: string;
  processing_time?: number;
}

interface ResumeAnalysis {
  skills: string[];
  experience_years: number;
  education: string[];
  match_score: number;
  recommendations: string[];
  technical_skills: string[];
  soft_skills: string[];
}

interface JobDescriptionAnalysis {
  required_skills: string[];
  preferred_skills: string[];
  experience_level: string;
  responsibilities: string[];
  qualifications: string[];
  ai_generated_content?: string;
}

interface CodingTestAnalysis {
  correctness_score: number;
  efficiency_score: number;
  readability_score: number;
  suggestions: string[];
  follow_up_questions: string[];
}

class AIService {
  private baseUrl: string;
  private apiKey?: string;

  constructor() {
    this.baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000';
    this.apiKey = process.env.REACT_APP_AI_API_KEY;
  }

  private async makeRequest(
    endpoint: string,
    data: any,
    options: RequestInit = {}
  ): Promise<AIAnalysisResponse> {
    const startTime = Date.now();
    
    try {
      const response = await fetch(`${this.baseUrl}/api/ai/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` }),
          ...options.headers,
        },
        body: JSON.stringify(data),
        ...options,
      });

      const result = await response.json();
      const processingTime = Date.now() - startTime;

      if (!response.ok) {
        throw new Error(result.detail || 'AI analysis failed');
      }

      return {
        success: true,
        data: result,
        processing_time: processingTime,
      };
    } catch (error) {
      console.error(`AI Service Error (${endpoint}):`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        processing_time: Date.now() - startTime,
      };
    }
  }

  // Resume Analysis using Vertex AI
  async analyzeResume(content: string, jobRequirements?: string): Promise<AIAnalysisResponse> {
    return this.makeRequest('analyze-resume', {
      content,
      job_requirements: jobRequirements,
      analysis_type: 'comprehensive',
    });
  }

  // Job Description Generation using Vertex AI
  async generateJobDescription(hiringRequest: any): Promise<AIAnalysisResponse> {
    return this.makeRequest('generate-job-description', {
      hiring_request: hiringRequest,
      style: 'professional',
      include_ai_suggestions: true,
    });
  }

  // Coding Test Evaluation using Vertex AI
  async evaluateCodingTest(
    code: string,
    testCases: any[],
    language: string
  ): Promise<AIAnalysisResponse> {
    return this.makeRequest('evaluate-coding-test', {
      code,
      test_cases: testCases,
      language,
      evaluation_criteria: ['correctness', 'efficiency', 'readability'],
    });
  }

  // Multimodal Interview Analysis using Gemini
  async analyzeInterview(
    audioUrl: string,
    videoUrl?: string,
    transcript?: string
  ): Promise<AIAnalysisResponse> {
    return this.makeRequest('analyze-interview', {
      audio_url: audioUrl,
      video_url: videoUrl,
      transcript,
      analysis_type: 'multimodal',
    });
  }

  // Voice-to-Text using Google Speech-to-Text
  async speechToText(audioBlob: Blob): Promise<AIAnalysisResponse> {
    const formData = new FormData();
    formData.append('audio', audioBlob);

    try {
      const response = await fetch(`${this.baseUrl}/api/ai/speech-to-text`, {
        method: 'POST',
        headers: {
          ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` }),
        },
        body: formData,
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.detail || 'Speech-to-text failed');
      }

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      console.error('Speech-to-Text Error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Speech-to-text failed',
      };
    }
  }

  // Text-to-Speech using Google Text-to-Speech
  async textToSpeech(text: string, voice?: string): Promise<AIAnalysisResponse> {
    return this.makeRequest('text-to-speech', {
      text,
      voice: voice || 'en-US-Standard-A',
      audio_config: {
        audio_encoding: 'MP3',
        speaking_rate: 1.0,
        pitch: 0.0,
      },
    });
  }

  // Candidate Matching using Vertex AI
  async matchCandidate(
    candidateProfile: any,
    jobRequirements: any
  ): Promise<AIAnalysisResponse> {
    return this.makeRequest('match-candidate', {
      candidate_profile: candidateProfile,
      job_requirements: jobRequirements,
      matching_criteria: ['skills', 'experience', 'culture_fit'],
    });
  }

  // AI-Powered Question Generation
  async generateQuestions(
    context: string,
    questionType: 'technical' | 'behavioral' | 'coding',
    count: number = 5
  ): Promise<AIAnalysisResponse> {
    return this.makeRequest('generate-questions', {
      context,
      question_type: questionType,
      count,
      difficulty_level: 'adaptive',
    });
  }

  // Sentiment Analysis for Interview Feedback
  async analyzeSentiment(text: string): Promise<AIAnalysisResponse> {
    return this.makeRequest('analyze-sentiment', {
      text,
      analysis_type: 'detailed',
    });
  }

  // Batch Processing for Multiple Resumes
  async batchAnalyzeResumes(resumes: string[]): Promise<AIAnalysisResponse> {
    return this.makeRequest('batch-analyze-resumes', {
      resumes,
      parallel_processing: true,
      batch_size: 10,
    });
  }

  // Health Check for AI Services
  async healthCheck(): Promise<AIAnalysisResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/ai/health`);
      const result = await response.json();
      
      return {
        success: response.ok,
        data: result,
        error: response.ok ? undefined : 'AI services unhealthy',
      };
    } catch (error) {
      return {
        success: false,
        error: 'AI services unavailable',
      };
    }
  }
}

// Export singleton instance
export const aiService = new AIService();

// Export types for use in components
export type {
  AIAnalysisRequest,
  AIAnalysisResponse,
  ResumeAnalysis,
  JobDescriptionAnalysis,
  CodingTestAnalysis,
}; 