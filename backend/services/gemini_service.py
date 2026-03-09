import os
import json
import base64
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=GEMINI_API_KEY)


def get_vision_model():
    """Get a Gemini Vision model instance."""
    return genai.GenerativeModel("gemini-2.5-flash")


def get_text_model():
    """Get a Gemini Text model instance."""
    return genai.GenerativeModel("gemini-2.5-flash")


async def extract_prescription_data(image_bytes: bytes, mime_type: str = "image/jpeg") -> dict:
    """
    Extract medicine information from a prescription image using Gemini Vision API.

    Returns structured JSON with medicine details.
    """
    model = get_vision_model()

    prompt = """Analyze this prescription image carefully. Extract ALL medicines mentioned in the prescription.

For each medicine, provide the following information in a JSON format:

{
    "doctor_name": "extracted doctor name or null",
    "hospital_name": "extracted hospital/clinic name or null",
    "prescription_date": "extracted date or null",
    "medicines": [
        {
            "medicine_name": "exact medicine name",
            "manufacturer": "company/manufacturer name if visible",
            "composition": "active ingredients and their strengths",
            "usage": "what the medicine is used for",
            "dosage": "prescribed dosage",
            "frequency": "how often to take (e.g., twice daily)",
            "duration": "for how long to take",
            "side_effects": "common side effects",
            "precautions": "important precautions",
            "suitable_age_range": "age range this medicine is suitable for",
            "missed_dose_guidelines": "what to do if a dose is missed",
            "usage_instructions": "how to take the medicine (before/after food, etc.)",
            "medical_terms_explanation": {
                "term1": "simple explanation",
                "term2": "simple explanation"
            }
        }
    ]
}

IMPORTANT:
- Extract ALL medicines from the prescription
- If a field is not visible in the prescription, use your medical knowledge to fill it
- Explain all medical terms in simple English that seniors can understand
- Be accurate with medicine names and dosages
- Return ONLY valid JSON, no markdown formatting"""

    image_part = {
        "mime_type": mime_type,
        "data": image_bytes
    }

    try:
        response = model.generate_content([prompt, image_part])
        response_text = response.text.strip()

        # Clean up response - remove markdown code blocks if present
        if response_text.startswith("```"):
            response_text = response_text.split("\n", 1)[1]
        if response_text.endswith("```"):
            response_text = response_text.rsplit("```", 1)[0]
        if response_text.startswith("json"):
            response_text = response_text[4:]

        result = json.loads(response_text.strip())
        return {"success": True, "data": result}
    except json.JSONDecodeError as e:
        return {"success": False, "error": f"Failed to parse AI response: {str(e)}", "raw": response_text}
    except Exception as e:
        return {"success": False, "error": f"AI processing failed: {str(e)}"}


async def get_medicine_info(medicine_name: str) -> dict:
    """
    Get detailed information about a medicine using Gemini API.
    """
    model = get_text_model()

    prompt = f"""Provide detailed information about the medicine "{medicine_name}" in the following JSON format:

{{
    "medicine_name": "{medicine_name}",
    "manufacturer": "common manufacturer/company",
    "composition": "active ingredients with strengths",
    "usage": "what the medicine is used for, explained simply",
    "dosage": "standard dosage information",
    "side_effects": "common side effects listed clearly",
    "precautions": "important precautions and warnings",
    "suitable_age_range": "age range this medicine is suitable for",
    "missed_dose_guidelines": "what to do if a dose is missed",
    "usage_instructions": "how to take the medicine (before/after meals, with water, etc.)",
    "medical_terms_explanation": {{
        "term1": "simple explanation of any medical terms used above",
        "term2": "simple explanation"
    }},
    "category": "medicine category (e.g., antibiotic, painkiller)"
}}

IMPORTANT:
- Use simple language suitable for senior citizens
- Be medically accurate
- Return ONLY valid JSON, no markdown formatting"""

    try:
        response = model.generate_content(prompt)
        response_text = response.text.strip()

        if response_text.startswith("```"):
            response_text = response_text.split("\n", 1)[1]
        if response_text.endswith("```"):
            response_text = response_text.rsplit("```", 1)[0]
        if response_text.startswith("json"):
            response_text = response_text[4:]

        result = json.loads(response_text.strip())
        return {"success": True, "data": result}
    except json.JSONDecodeError as e:
        return {"success": False, "error": f"Failed to parse AI response: {str(e)}"}
    except Exception as e:
        return {"success": False, "error": f"AI processing failed: {str(e)}"}


async def identify_tablet_from_image(image_bytes: bytes, mime_type: str = "image/jpeg") -> dict:
    """
    Identify a tablet/pill from an image using Gemini Vision API.
    """
    model = get_vision_model()

    prompt = """Look at this image of a tablet/pill/medicine. Identify it and provide the following information:

{
    "identified_medicine": "name of the identified medicine",
    "confidence": "high/medium/low",
    "composition": "likely active ingredients",
    "visual_description": "description of the tablet (color, shape, markings)",
    "manufacturer": "likely manufacturer if identifiable",
    "usage": "what this medicine is typically used for",
    "category": "medicine category"
}

If you cannot identify the medicine with certainty, provide your best guess and set confidence to "low".
Return ONLY valid JSON, no markdown formatting."""

    image_part = {
        "mime_type": mime_type,
        "data": image_bytes
    }

    try:
        response = model.generate_content([prompt, image_part])
        response_text = response.text.strip()

        if response_text.startswith("```"):
            response_text = response_text.split("\n", 1)[1]
        if response_text.endswith("```"):
            response_text = response_text.rsplit("```", 1)[0]
        if response_text.startswith("json"):
            response_text = response_text[4:]

        result = json.loads(response_text.strip())
        return {"success": True, "data": result}
    except json.JSONDecodeError as e:
        return {"success": False, "error": f"Failed to parse AI response: {str(e)}"}
    except Exception as e:
        return {"success": False, "error": f"AI processing failed: {str(e)}"}


async def explain_medical_term(term: str) -> dict:
    """
    Explain a medical term in simple English using Gemini API.
    """
    model = get_text_model()

    prompt = f"""Explain the medical term "{term}" in simple English that a senior citizen can understand.

Provide the response in this JSON format:
{{
    "term": "{term}",
    "simple_explanation": "easy to understand explanation",
    "example": "a real-world example or analogy",
    "related_terms": ["related medical term 1", "related medical term 2"],
    "category": "what area of medicine this relates to"
}}

Return ONLY valid JSON, no markdown formatting."""

    try:
        response = model.generate_content(prompt)
        response_text = response.text.strip()

        if response_text.startswith("```"):
            response_text = response_text.split("\n", 1)[1]
        if response_text.endswith("```"):
            response_text = response_text.rsplit("```", 1)[0]
        if response_text.startswith("json"):
            response_text = response_text[4:]

        result = json.loads(response_text.strip())
        return {"success": True, "data": result}
    except json.JSONDecodeError as e:
        return {"success": False, "error": f"Failed to parse AI response: {str(e)}"}
    except Exception as e:
        return {"success": False, "error": f"AI processing failed: {str(e)}"}


async def compare_compositions(medicine1_composition: str, medicine2_composition: str) -> dict:
    """
    Compare two medicine compositions to check similarity using Gemini API.
    """
    model = get_text_model()

    prompt = f"""Compare the following two medicine compositions and determine if they are similar or equivalent:

Medicine 1 composition: {medicine1_composition}
Medicine 2 composition: {medicine2_composition}

Provide the response in this JSON format:
{{
    "are_similar": true/false,
    "similarity_score": 0-100,
    "explanation": "explanation of the comparison",
    "common_ingredients": ["list of common active ingredients"],
    "differences": ["list of differences"],
    "can_be_substitute": true/false,
    "substitution_notes": "any important notes about substitution"
}}

Return ONLY valid JSON, no markdown formatting."""

    try:
        response = model.generate_content(prompt)
        response_text = response.text.strip()

        if response_text.startswith("```"):
            response_text = response_text.split("\n", 1)[1]
        if response_text.endswith("```"):
            response_text = response_text.rsplit("```", 1)[0]
        if response_text.startswith("json"):
            response_text = response_text[4:]

        result = json.loads(response_text.strip())
        return {"success": True, "data": result}
    except json.JSONDecodeError as e:
        return {"success": False, "error": f"Failed to parse AI response: {str(e)}"}
    except Exception as e:
        return {"success": False, "error": f"AI processing failed: {str(e)}"}
