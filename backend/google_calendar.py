from dotenv import load_dotenv
from portia import Config, Portia, PortiaToolRegistry
from portia.cli import CLIExecutionHooks

def find_free_time_in_calendar(date: str, start_time: str, end_time: str, constraints: list[str] = []):

    load_dotenv(override=True)

    def build_task():
        return f"""
Please help me with the following:
- Access my Google Calendar
- Find and return all free time slots between events on {date}, from {start_time} to {end_time}
- Present the result as clearly formatted time blocks (e.g. "HH:MM - HH:MM")
{f"- Additional constraints: {''.join(constraints)}" if constraints else ""}
"""

    config = Config.from_default()
    portia = Portia(
        config=config,
        tools=PortiaToolRegistry(config),
        execution_hooks=CLIExecutionHooks(),  # This handles OAuth if needed
    )

    plan = portia.plan(build_task())
    plan_run = portia.run_plan(plan)

    return plan_run.final_output