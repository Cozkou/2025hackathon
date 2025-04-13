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
	Return results as JSON with start and end times in ISO format.
	{'Constraints: ' + ', '.join(constraints) if constraints else ''}
	"""

	try:
		portia = Portia(Config.from_default())
		plan = portia.plan(prompt)
		run_result = portia.run_plan(plan)
		run_data = run_result.model_dump()
		
		print("Full Portia response:", json.dumps(run_data, indent=2))  # Debug print
		
		# Extract availability from step outputs
		availability = []
		step_outputs = run_data.get("outputs", {}).get("step_outputs", {})
		
		# Try to get availability from $availability
		if "$availability" in step_outputs:
			availability_json = step_outputs["$availability"].get("value", "[]")
			try:
				availability = json.loads(availability_json)
				print("Parsed availability from $availability:", availability)
			except json.JSONDecodeError as e:
				print("Failed to parse $availability:", e)
		
		# If not found, try $formatted_availability
		if not availability and "$formatted_availability" in step_outputs:
			formatted_json = step_outputs["$formatted_availability"].get("value", "{}")
			try:
				parsed_json = json.loads(formatted_json)
				availability = parsed_json.get("availability", [])
				print("Parsed availability from $formatted_availability:", availability)
			except json.JSONDecodeError as e:
				print("Failed to parse $formatted_availability:", e)
		
		# If still not found, try final output
		if not availability:
			final_output = run_data.get("outputs", {}).get("final_output", {}).get("value", "{}")
			try:
				parsed_final = json.loads(final_output)
				availability = parsed_final.get("availability", [])
				print("Parsed availability from final_output:", availability)
			except json.JSONDecodeError as e:
				print("Failed to parse final_output:", e)
		
		print("Extracted raw availability:", availability)  # Debug print
		
		# Format the slots
		formatted_slots = []
		for slot in availability:
			if isinstance(slot, dict) and "start" in slot and "end" in slot:
				# Remove timezone info if present (frontend expects simple time)
				start = slot["start"].split("+")[0] if "+" in slot["start"] else slot["start"]
				end = slot["end"].split("+")[0] if "+" in slot["end"] else slot["end"]
				
				formatted_slots.append({
					"start": start,
					"end": end
				})
		
		print("Formatted slots:", formatted_slots)  # Debug print
		
		return json.dumps({
			"success": True,
			"date": date,
			"free_slots": formatted_slots,
			"full_response": {}  # Simplified to avoid large response
		}, indent=2)

	except Exception as e:
		print("Error in find_free_time_in_calendar:", str(e))  # Debug print
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
