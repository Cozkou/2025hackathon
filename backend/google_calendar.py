from dotenv import load_dotenv
from portia import Config, Portia
import json
from datetime import datetime
import os

def find_free_time_in_calendar(date: str, start_time: str, end_time: str, constraints: list[str] = []):
	"""Use Portia AI to find free time slots in user's Google Calendar."""
	load_dotenv(override=True)

	if not os.getenv("PORTIA_API_KEY") and not os.getenv("PORTIA_TOKEN"):
		return json.dumps({
			"success": False,
			"error": "Missing Portia credentials",
			"free_slots": []
		}, indent=2)

	# Compose natural language prompt
	prompt = f"""
	Check my Google Calendar availability.
	Date: {date}
	Between: {start_time} and {end_time}.
	Return results as JSON with start and end times.
	{'Constraints: ' + ', '.join(constraints) if constraints else ''}
	"""

	try:
		portia = Portia(Config.from_default())
		plan = portia.plan(prompt)
		run_result = portia.run_plan(plan)
		run_data = run_result.model_dump()
		final_output = run_data.get("final_output", {})

		return json.dumps({
			"success": True,
			"date": date,
			"free_slots": final_output.get("free_slots", []),
			"full_response": final_output
		}, indent=2)

	except Exception as e:
		return json.dumps({
			"success": False,
			"error": str(e),
			"free_slots": []
		}, indent=2)

def create_event_in_calendar(start: str, end: str, summary: str = "Revision Event", description: str = ""):
	"""Use Portia AI to create an event in user's Google Calendar."""
	load_dotenv(override=True)

	if not os.getenv("PORTIA_API_KEY") and not os.getenv("PORTIA_TOKEN"):
		return {
			"success": False,
			"error": "Missing Portia credentials",
			"status": "Failed"
		}

	today = datetime.now().strftime("%Y-%m-%d")

	def format_time(t):
		return f"{today}T{t}:00" if 'T' not in t and ':' in t else t

	full_start = format_time(start)
	full_end = format_time(end)

	date = full_start.split('T')[0]
	start_time = full_start.split('T')[1][:5]
	end_time = full_end.split('T')[1][:5]

	prompt = f"""
	Create a new Google Calendar event.
	Title: {summary}
	Description: {description}
	Date: {date}
	Start: {start_time}
	End: {end_time}
	Return confirmation with event details.
	"""

	try:
		portia = Portia(Config.from_default())
		plan = portia.plan(prompt)
		run_result = portia.run_plan(plan)
		run_data = run_result.model_dump()
		final_output = run_data.get("final_output", {})

		return {
			"success": True,
			"start": full_start,
			"end": full_end,
			"summary": summary,
			"description": description,
			"status": "Created successfully",
			"result": final_output
		}

	except Exception as e:
		return {
			"success": False,
			"error": str(e),
			"start": full_start,
			"end": full_end,
			"summary": summary,
			"status": "Failed"
		}
