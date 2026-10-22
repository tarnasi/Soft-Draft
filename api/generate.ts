import { GoogleGenAI, Type } from '@google/genai';

export async function handleGenerate(req: any, res: any) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        error: 'کلید دسترسی هوش مصنوعی (GEMINI_API_KEY) یافت نشد. لطفاً آن را در بخش Environment Variables در Vercel تنظیم کنید.',
      });
    }

    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const {
      clientRequest,
      projectType,
      technicalPreferences,
      budgetDefault,
      deadlineDefault,
      proposalLanguage,
    } = body || {};

    if (!clientRequest || typeof clientRequest !== 'string' || !clientRequest.trim()) {
      return res.status(400).json({
        error: 'متن پیام یا نیازمندی اولیه کارفرما الزامی است.',
      });
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const isEnglish = proposalLanguage === 'en';

    const systemInstruction = `
You are ScopeDraft, an elite Technical Project Manager and Proposal Strategist for freelance developers and boutique software agencies.
Your mission is to transform vague, fragmented, or incomplete client requests into crystal-clear project scopes, structured deliverables, explicit boundaries, and a professional proposal draft.

CRITICAL INTEGRITY & ANTI-HALLUCINATION RULES:
1. NEVER invent, fabricate, or assume a budget, hourly rate, total fee, deadline date, client commitment, or unstated technical stack.
2. If the client did not explicitly provide a budget or deadline, do NOT invent one. Explicitly designate it as "${isEnglish ? 'Unspecified / Needs clarification from client' : 'نامشخص / نیازمند استعلام از کارفرما'}".
3. STRICTLY SEPARATE confirmed requirements (what the client explicitly asked for) from suggested additions (architectural recommendations, security best practices, optional enhancements).
4. If crucial business logic, user roles, integrations, or edge cases are missing from the request, identify them precisely as clarification questions.
5. In the proposal draft, use clear placeholders like "${isEnglish ? '[Project Fee: To be determined upon clarifying questions above]' : '[مبلغ و هزینه پروژه: پس از شفاف‌سازی سوالات فوق تعیین می‌گردد]'}" and "${isEnglish ? '[Timeline: To be confirmed after milestone sign-off]' : '[زمان‌بندی: پس از تایید فازهای اجرایی نهایی می‌شود]'}" whenever figures are not confirmed.
6. Target Language:
   - If proposalLanguage is "en", write all analyses and the proposal draft in professional, modern business English.
   - If proposalLanguage is "fa", write all analyses and the proposal draft in fluent, formal, professional Persian (فارسی محترمانه، شیوا و استاندارد تجاری).
7. Return strictly valid JSON conforming to the requested schema.
`;

    const userPrompt = `
Analyze the following client inquiry and project details:

---
CLIENT'S ORIGINAL REQUEST:
"""
${clientRequest.trim()}
"""

PROJECT TYPE: ${projectType || (isEnglish ? 'Software / Web Application' : 'وب‌سایت / اپلیکیشن وب')}
KNOWN TECHNICAL PREFERENCES / REQUIREMENTS: ${technicalPreferences?.trim() || (isEnglish ? 'None explicitly stated' : 'مورد خاصی ذکر نشده')}
STATED BUDGET: ${budgetDefault?.trim() ? budgetDefault.trim() : (isEnglish ? 'NOT SPECIFIED' : 'ذکر نشده است')}
STATED DEADLINE: ${deadlineDefault?.trim() ? deadlineDefault.trim() : (isEnglish ? 'NOT SPECIFIED' : 'ذکر نشده است')}
OUTPUT LANGUAGE: ${isEnglish ? 'English' : 'Persian (فارسی)'}
---

Generate the complete scope breakdown and professional proposal adhering strictly to all anti-hallucination rules.
`;

    // Attempt generation with retry and fallback across supported flash models
    const candidateModels = ['gemini-3.8-flash', 'gemini-3.1-flash-lite', 'gemini-flash-latest'];
    let lastError: Error | null = null;
    let responseText: string | undefined;

    for (const modelName of candidateModels) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: userPrompt,
          config: {
            systemInstruction,
            temperature: 0.15,
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                summary: {
                  type: Type.STRING,
                  description: 'A concise and objective technical summary of what the client actually communicated.',
                },
                missingInformation: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: 'Crucial missing information, undefined requirements, and specific clarification questions to ask before quoting.',
                },
                deliverables: {
                  type: Type.OBJECT,
                  properties: {
                    confirmed: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                      description: 'Explicitly requested features and items confirmed from client text.',
                    },
                    suggested: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                      description: 'Architectural best practices, optional enhancements, and recommended extras (clearly marked as suggestions).',
                    },
                  },
                  required: ['confirmed', 'suggested'],
                },
                milestones: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      phase: { type: Type.STRING, description: 'Phase or milestone title' },
                      deliverable: { type: Type.STRING, description: 'Tangible deliverable for this milestone' },
                      dependency: { type: Type.STRING, description: 'Prerequisite assets or approvals required from client' },
                      timelineStatus: { type: Type.STRING, description: 'Timeline estimate or status note' },
                    },
                    required: ['phase', 'deliverable', 'dependency', 'timelineStatus'],
                  },
                  description: 'Structured phases and logical delivery stages without fabricating delivery dates.',
                },
                assumptionsAndExclusions: {
                  type: Type.OBJECT,
                  properties: {
                    assumptions: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                      description: 'Explicit operational and architectural assumptions.',
                    },
                    exclusions: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                      description: 'Items explicitly excluded from this baseline scope to prevent scope creep.',
                    },
                    risks: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                      description: 'Identified technical, operational, or dependency risks.',
                    },
                  },
                  required: ['assumptions', 'exclusions', 'risks'],
                },
                proposalDraft: {
                  type: Type.STRING,
                  description: 'A complete, ready-to-customize professional proposal text including greeting, summary, scope overview, questions to answer, next steps, and transparent placeholder pricing if budget was unstated.',
                },
              },
              required: [
                'summary',
                'missingInformation',
                'deliverables',
                'milestones',
                'assumptionsAndExclusions',
                'proposalDraft',
              ],
            },
          },
        });

        if (response.text) {
          responseText = response.text;
          break;
        }
      } catch (err: unknown) {
        lastError = err instanceof Error ? err : new Error(String(err));
        console.warn(`Model ${modelName} failed or busy, trying next option...`, lastError.message);
        await new Promise((resolve) => setTimeout(resolve, 800));
      }
    }

    if (!responseText) {
      throw lastError || new Error('پاسخی از مدل هوش مصنوعی دریافت نشد.');
    }

    const data = JSON.parse(responseText);
    return res.json(data);
  } catch (err: unknown) {
    console.error('Error generating proposal:', err);
    const message = err instanceof Error ? err.message : 'خطای ناشناخته در پردازش پروپوزال';
    return res.status(500).json({ error: message });
  }
}

export default async function handler(req: any, res: any) {
  return handleGenerate(req, res);
}
