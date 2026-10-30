"""
Intake & Conversational Interview Agent.
Dynamically interviews the user in natural language using Gemini LLM.
Afield of hardcoded templates: understands natural student text, extracts
background, target role, available hours, and budget, and asks personalized follow-ups.
"""

import json
import logging
from typing import Dict, Any, List, Optional
from intelligence.llm.gemini_client import gemini_client

logger = logging.getLogger(__name__)

INTAKE_SYSTEM_PROMPT = """
You are Pathwise AI Career Intake Assistant, an intelligent career mentor helping learners and professionals navigate any career path or transition (Business & Management, Engineering, Data & AI, Product, Design, Operations, Finance, and more).
Your job is to have a direct, minimal conversation with learners and professionals to collect the information needed to generate their custom career roadmap.

To generate a complete, verified roadmap, Pathwise needs 4 essential dimensions:
1. candidate_background: Current background, degree, or experience level (e.g., "MBA", "BSc Computer Science", "Fresher", "QA with 2 yrs", "AI Engineer", "Networking Engineer").
2. target_role: The career path or domain they want to pursue. Pathwise supports ALL domains:
   - Business & Management: "Business Manager", "Operations Manager", "Product Manager", "Business Analyst", "Strategy Consultant", "Project Manager"
   - Tech & Engineering: "Full-Stack Developer", "Machine Learning Engineer", "AI Engineer", "Data Engineer", "DevOps Engineer", "Cloud Architect", "Network Engineer", "Cybersecurity Analyst"
   - Design: "UI/UX Designer", "Product Designer"
   - Finance & Analytics: "Financial Analyst", "Data Scientist"
3. weekly_hours: Weekly hours available for study.
   CRITICAL: MUST BE NULL unless the user explicitly stated their hours or daily time. NEVER assume 10 hours or any default.
4. budget: Course budget preference. Use "INR" (₹) by default for Indian market or 0 for 100% free courses.

CAREER TRANSITIONS & PIVOTS (CRITICAL):
- When a user states both their current background and their target goal (e.g., "ai engineer wants to learn networking" or "im a networking engineer, i want to learn ai/ml"):
  * candidate_background: their CURRENT profession/education ("AI Engineer", "Network Engineer")
  * target_role: the domain or skill they WANT TO LEARN ("Network Engineer", "Machine Learning Engineer", "AI Engineer")
  * NEVER confuse their current background with their target goal! If an AI Engineer wants to learn networking, their target_role is "Network Engineer" (or "Networking"), NOT Machine Learning Engineer!
  * If an engineer says "im a networking engineer, i want to learn ai/ml", their target_role is "Machine Learning Engineer", and their candidate_background is "Network Engineer". DO NOT ask what career path they are targeting!
- DO NOT RE-ASK FOR INFORMATION ALREADY GIVEN in the conversation transcript! Look at all previous turns! If weekly_hours was already provided in a previous turn (e.g., "3 hours"), DO NOT ask for hours again!
- If target_role, candidate_background, and weekly_hours are known, set is_complete: true and output a final ready message like "Ready to generate your verified {target_role} roadmap."

CONVERSATION RULES:
1. MINIMAL & TO THE POINT: Keep your assistant_message strictly concise (maximum 1-2 short sentences). No fluff, no cheerleading.
2. ONLY MISSING DETAILS: Ask only what is actually missing.
3. COMPLETION: Only set is_complete to true once target_role is determined AND weekly_hours is explicitly stated by the user.
4. Return your response STRICTLY as valid JSON matching this schema:
{
  "background": "string or null",
  "target_role": "string or null",
  "weekly_hours": number or null,
  "budget": number or null,
  "currency": "INR",
  "is_complete": boolean,
  "assistant_message": "Minimal, 1-2 sentence direct response"
}
"""


class IntakeAgent:
    def __init__(self, llm_client=None):
        self.llm_client = llm_client or gemini_client

    async def chat_intake(
        self,
        messages: List[Dict[str, str]],
        current_constraints: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Processes conversation history, extracts constraints dynamically,
        and generates a conversational follow-up or completion message.
        """
        # Format conversation history
        conv_history = []
        for m in messages:
            role = "User" if m.get("sender") == "user" or m.get("role") == "user" else "Assistant"
            conv_history.append(f"{role}: {m.get('text') or m.get('content')}")

        conv_text = "\n".join(conv_history)

        # Sanitize known constraints: do not pass 0 or empty values as known
        clean_constraints = {}
        if current_constraints:
            for k, v in current_constraints.items():
                if v is not None and v != "" and v != 0:
                    clean_constraints[k] = v
                elif k == "budget" and v == 0 and ("free" in conv_text.lower() or "$0" in conv_text.lower()):
                    clean_constraints[k] = 0

        prompt = f"""
Existing Constraints Known So Far (empty if none):
{json.dumps(clean_constraints, indent=2)}

Full Conversation Transcript:
{conv_text}

Analyze the user's latest statement and the complete transcript. Extract all dimensions and write your conversational assistant_message in JSON format.
"""
        try:
            raw_response = await self.llm_client.generate(
                prompt=prompt,
                system_prompt=INTAKE_SYSTEM_PROMPT,
                json_mode=True,
                temperature=0.3
            )
            # Parse JSON
            parsed = json.loads(raw_response.strip())
            return parsed
        except Exception as e:
            logger.error(f"IntakeAgent Gemini call failed: {e}")
            import re
            
            # Combine ALL user messages across the whole transcript so chain-of-thought is never lost
            all_user_turns = [
                (m.get("text") or m.get("content", "")).strip()
                for m in messages
                if m.get("sender") == "user" or m.get("role") == "user"
            ]
            full_user_context = " \n ".join(all_user_turns).lower()
            last_lower = (all_user_turns[-1] if all_user_turns else "").lower()

            # 1. Inherit previously known constraints
            target_role = clean_constraints.get("target_role")
            background = clean_constraints.get("background")
            weekly_hours = clean_constraints.get("weekly_hours")
            budget = clean_constraints.get("budget")

            # 2. Extract Target Role from transcript
            # Handle career pivots & transitions: "X wants to learn Y", "targeting Y", "learn Y"
            pivot_match = re.search(r'(?:wants?\s+to\s+learn|looking\s+to\s+learn|transition\s+to|interested\s+in|aiming\s+for|study|pursue)\s+([a-z0-9\/\-_\s]+)', full_user_context)
            pivot_goal = pivot_match.group(1).strip() if pivot_match else ""

            if any(k in pivot_goal for k in ["network", "networking", "cisco", "ccna"]):
                target_role = "Network Engineer"
            elif any(k in pivot_goal for k in ["ai/ml", "ai and ml", "ai & ml", "machine learning", "ml"]):
                target_role = "Machine Learning Engineer"
            elif any(k in pivot_goal for k in ["cyber", "security", "infosec", "soc"]):
                target_role = "Cybersecurity Analyst"
            elif any(k in pivot_goal for k in ["full stack", "full-stack", "web dev", "frontend", "backend"]):
                target_role = "Full-Stack Developer"
            elif any(k in pivot_goal for k in ["data engineer", "etl", "spark", "pipeline"]):
                target_role = "Data Engineer"
            elif any(k in pivot_goal for k in ["business", "management", "operations"]):
                target_role = "Business Manager"

            if not target_role:
                if re.search(r'\b(business\s*management|business\s*manager)\b', full_user_context):
                    target_role = "Business Manager"
                elif re.search(r'\b(operations\s*manager|operations)\b', full_user_context):
                    target_role = "Operations Manager"
                elif re.search(r'\b(network\s*engineer|networking)\b', full_user_context):
                    target_role = "Network Engineer"
                elif re.search(r'\b(machine\s*learning|ai\s*engineer|ai\/ml|artificial\s*intelligence)\b', full_user_context):
                    target_role = "Machine Learning Engineer"
                elif re.search(r'\b(product\s*manager|pm)\b', full_user_context):
                    target_role = "Product Manager"
                elif re.search(r'\b(data\s*engineer)\b', full_user_context):
                    target_role = "Data Engineer"
                elif re.search(r'\b(full\s*stack|web\s*dev)\b', full_user_context):
                    target_role = "Full-Stack Developer"
                elif re.search(r'\b(cybersecurity|security\s*analyst)\b', full_user_context):
                    target_role = "Cybersecurity Analyst"

            # 3. Extract Candidate Background from transcript
            if not background:
                if re.search(r'\b(?:im an?|i am an?|background in|working as an?)\s+([a-z\s]+?)(?:,|\.|\s+and|\s+who|\s+wants|\n|$)', full_user_context):
                    bg_match = re.search(r'\b(?:im an?|i am an?|background in|working as an?)\s+([a-z\s]+?)(?:,|\.|\s+and|\s+who|\s+wants|\n|$)', full_user_context)
                    background = bg_match.group(1).strip().title()
                elif "ai engineer" in full_user_context and target_role != "AI Engineer":
                    background = "AI Engineer"
                elif "networking engineer" in full_user_context and target_role != "Network Engineer":
                    background = "Network Engineer"
                elif "mba" in full_user_context:
                    background = "MBA"
                elif "bsc in maths" in full_user_context or "math" in full_user_context:
                    background = "BSc Mathematics"
                elif any(k in full_user_context for k in ["b.tech", "btech", "cs", "computer science"]):
                    background = "Computer Science Student"
                elif any(k in full_user_context for k in ["bba", "b.com", "bcom"]):
                    background = "Business Student"
                elif any(k in last_lower for k in ["fresher", "student", "graduate"]):
                    background = last_lower.title()

            # 4. Extract Weekly Hours across all turns
            if not weekly_hours:
                # E.g. "3 and paid", "3 hours", "2 hrs every day", "10 hrs"
                daily_match = re.search(r'\b(\d+)\s*(?:hrs?|hours?)\s*(?:every\s*day|daily|a\s*day)\b', full_user_context)
                if daily_match:
                    weekly_hours = int(daily_match.group(1)) * 7
                else:
                    hrs_match = re.search(r'\b(\d+)\s*(?:and\s+paid|hours?|hrs?|per\s*week|weekly|\/wk)?\b', full_user_context)
                    # Check numbers in specific contexts like "3 and paid is okay"
                    specific_num = re.search(r'\b(\d+)\s+(?:and\s+paid|hrs|hours)', full_user_context)
                    if specific_num:
                        weekly_hours = int(specific_num.group(1))
                    elif hrs_match and int(hrs_match.group(1)) in range(1, 80):
                        weekly_hours = int(hrs_match.group(1))

            # 5. Extract Budget preference
            if budget is None:
                if any(w in full_user_context for w in ["free", "0", "₹0", "$0", "zero"]):
                    budget = 0
                elif "paid is okay" in full_user_context or "paid" in full_user_context:
                    budget = 5000

            # 6. Formulate progressive, non-repeating message
            is_complete = bool(target_role and weekly_hours)
            if is_complete:
                msg = f"Ready to generate your personalized {target_role} learning roadmap."
            elif not target_role:
                msg = "What career path or domain are you aiming to learn?"
            elif not weekly_hours:
                msg = f"Pursuing {target_role} is a great goal. How many hours per week can you study, and do you prefer free courses (₹0)?"
            elif not background:
                msg = f"Could you please share your educational background or experience so I can tailor your {target_role} roadmap?"
            else:
                msg = f"Ready to generate your personalized {target_role} learning roadmap."

            return {
                "background": background,
                "target_role": target_role,
                "weekly_hours": weekly_hours,
                "budget": budget,
                "currency": "INR",
                "is_complete": is_complete,
                "assistant_message": msg
            }


intake_agent = IntakeAgent()

