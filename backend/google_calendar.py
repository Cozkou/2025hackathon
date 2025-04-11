from dotenv import load_dotenv
from portia import Config, Portia, PortiaToolRegistry
from portia.cli import CLIExecutionHooks

def find_free_time_in_calendar():
    load_dotenv(override=True)

    print("""
    📅 This tool will check your Google Calendar and list your free time between events.
    """)

    # Input details
    date = input("Enter the date to check (YYYY-MM-DD):\n")
    start_time = input("Enter the start time (e.g., 09:00):\n")
    end_time = input("Enter the end time (e.g., 18:00):\n")

    constraints = []

    def build_task():
        return f"""
Please help me with the following:
- Access my Google Calendar
- Find and return all free time slots (gaps between scheduled events) on {date}, between {start_time} and {end_time}
- Present the free time slots in the format "HH:MM - HH:MM"
{f"- Additional constraints: {''.join(constraints)}" if constraints else ""}
"""

    print("\n🔄 Generating a plan to check your free time...")

    my_config = Config.from_default()
    portia = Portia(
        config=my_config,
        tools=PortiaToolRegistry(my_config),
        execution_hooks=CLIExecutionHooks(),  # This will handle OAuth prompts
    )

    plan = portia.plan(build_task())
    print("\n📝 Here are the steps in the generated plan:")
    for step in plan.steps:
        print(step.model_dump_json(indent=2))

    # Allow user to iterate on the plan
    while True:
        user_input = input("Are you happy with the plan? (y/n):\n").strip().lower()
        if user_input == "y":
            break
        elif user_input == "n":
            guidance = input("🔧 Add more guidance for the planner:\n")
            constraints.append(guidance)
            plan = portia.plan(build_task())
            print("\n📝 Updated steps in the plan:")
            for step in plan.steps:
                print(step.model_dump_json(indent=2))
        else:
            print("Please enter 'y' or 'n'.")

    # Run the plan
    print("\n🚀 Executing the plan to retrieve your free time slots...")
    plan_run = portia.run_plan(plan)

    print(f"\n✅ Free time slots found:\n{plan_run.model_dump_json(indent=2)}")


if __name__ == "__main__":
    find_free_time_in_calendar()
