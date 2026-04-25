"""
Voice Assistant route – processes spoken text through Gemini to extract medicine info.
"""
from fastapi import APIRouter
from pydantic import BaseModel
from services.gemini_service import get_text_model

router = APIRouter(prefix="/voice", tags=["Voice Assistant"])


class VoiceQuery(BaseModel):
    text: str


@router.post("/process")
async def process_voice_input(query: VoiceQuery):
    """
    Takes raw spoken text, sends it to Gemini to extract medicine name
    and return a simple explanation.
    """
    spoken_text = query.text.strip()
    if not spoken_text:
        return {"success": False, "error": "No text provided."}

    model = get_text_model()

    prompt = f"""
You are a helpful medical assistant. The user spoke the following text using voice input:

"{spoken_text}"

Your task:
1. Extract the medicine/tablet name from the spoken text. The user may have said something like "tell me about paracetamol" or just "paracetamol" or "what is crocin used for". Extract ONLY the medicine name.
2. If you can identify a medicine name, provide a brief, simple explanation about that medicine.

Respond in this exact JSON format (no markdown, no code blocks, just raw JSON):
{{
    "success": true,
    "medicine_found": true,
    "medicine_name": "Name of the medicine",
    "explanation": "A simple 3-4 sentence explanation covering: what the medicine is, what it is used for, common dosage, and key side effects/precautions. Keep it very simple and easy to understand for elderly people."
}}

If no medicine name could be identified from the text, respond:
{{
    "success": true,
    "medicine_found": false,
    "medicine_name": null,
    "explanation": "I could not identify a medicine name from what you said. Please try again and say the name of the medicine clearly."
}}
"""

    try:
        response = await model.generate_content_async(prompt)
        result_text = response.text.strip()

        # Clean up markdown code blocks if Gemini returns them
        if result_text.startswith("```"):
            result_text = result_text.split("\n", 1)[1]  # remove first line
        if result_text.endswith("```"):
            result_text = result_text.rsplit("```", 1)[0]

        import json
        data = json.loads(result_text)
        return data

    except Exception as e:
        return {
            "success": False,
            "error": f"Error processing your request: {str(e)}"
        }
