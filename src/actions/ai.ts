"use server"

import { GoogleGenerativeAI } from "@google/generative-ai"

// Define a safe fallback if key is missing or mock string
const apiKey = process.env.GEMINI_API_KEY || "mock_api_key"

export async function extractTagsFromImageBase64(base64Data: string, mimeType: string): Promise<string[]> {
  try {
    if (apiKey === "mock_api_key" || apiKey === "mock_gemini_key") {
      // Mock Response for testing environments without real keys
      return ["모터", "3D 프린터 출력물", "조립 테스트"]
    }

    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

    const prompt = "이 제조업/로봇공학 관련 이미지를 분석하고 가장 핵심적인 공학적 기술 태그(예: CNC, 회로도, 3D프린터, 모터, 센서, 프레임 등)를 단어로만 3~5개 콤마로 구분해서 반환해. 추가 설명 없이 콤마로 구분된 문자열만 반환해."
    
    // Remove the data URI part if the client sends it
    const dataParts = base64Data.split(',')
    const cleanBase64 = dataParts.length > 1 ? dataParts[1] : base64Data

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: cleanBase64,
          mimeType
        }
      }
    ])
    
    const text = result.response.text()
    return text.split(',').map(t => t.trim()).filter(Boolean)
  } catch (error) {
    console.error("Gemini API Error:", error)
    return ["분석 실패"]
  }
}
